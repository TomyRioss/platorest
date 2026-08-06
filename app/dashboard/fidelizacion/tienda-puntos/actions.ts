"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supabaseAdmin, RESTAURANT_ASSETS_BUCKET } from "@/lib/supabase-admin";
import { assertOwnsBusiness } from "@/lib/tenant";
import { getPesosPerPoint } from "@/lib/loyalty";

type ActionResult = { ok: true } | { ok: false; error: string };

const PATH = "/dashboard/fidelizacion/tienda-puntos";

async function businessIdOfRewardCategory(categoryId: string) {
  const c = await prisma.rewardCategory.findUnique({ where: { id: categoryId }, select: { businessId: true } });
  return c?.businessId ?? null;
}

async function businessIdOfReward(rewardId: string) {
  const r = await prisma.reward.findUnique({ where: { id: rewardId }, select: { businessId: true } });
  return r?.businessId ?? null;
}

export async function createRewardCategory(businessId: string, name: string): Promise<ActionResult> {
  if (!name.trim()) return { ok: false, error: "Nombre requerido." };
  try {
    await assertOwnsBusiness(businessId);
    await prisma.rewardCategory.create({ data: { businessId, name: name.trim() } });
  } catch {
    return { ok: false, error: "Error al crear categoría." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function renameRewardCategory(categoryId: string, name: string): Promise<ActionResult> {
  if (!name.trim()) return { ok: false, error: "Nombre requerido." };
  try {
    const businessId = await businessIdOfRewardCategory(categoryId);
    if (!businessId) return { ok: false, error: "Categoría no encontrada." };
    await assertOwnsBusiness(businessId);
    await prisma.rewardCategory.update({ where: { id: categoryId }, data: { name: name.trim() } });
  } catch {
    return { ok: false, error: "No se pudo renombrar." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function reorderRewardCategories(categoryIds: string[]): Promise<ActionResult> {
  try {
    const categories = await prisma.rewardCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, businessId: true },
    });
    if (categories.length !== categoryIds.length) return { ok: false, error: "Categoría no encontrada." };
    const businessIds = new Set(categories.map((c) => c.businessId));
    if (businessIds.size !== 1) return { ok: false, error: "No autorizado." };
    await assertOwnsBusiness([...businessIds][0]);

    await prisma.$transaction(
      categoryIds.map((id, index) => prisma.rewardCategory.update({ where: { id }, data: { sortOrder: index } })),
    );
  } catch {
    return { ok: false, error: "No se pudo reordenar." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteRewardCategory(categoryId: string): Promise<ActionResult> {
  try {
    const category = await prisma.rewardCategory.findUnique({ where: { id: categoryId } });
    if (!category) return { ok: false, error: "Categoría no encontrada." };
    if (category.isFeatured) return { ok: false, error: "No se puede borrar la categoría destacada." };
    await assertOwnsBusiness(category.businessId);
    await prisma.rewardCategory.delete({ where: { id: categoryId } });
  } catch {
    return { ok: false, error: "No se pudo borrar (tiene premios asociados)." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export type RewardVariantInput = {
  id?: string;
  name: string;
  pointsCost: number;
  costPrice: number | null;
  packagingPrice: number | null;
  sku: string | null;
  isDefault: boolean;
};

export type SaveRewardInput = {
  rewardId?: string;
  businessId: string;
  categoryId: string;
  name: string;
  description: string;
  variants: RewardVariantInput[];
};

export type SaveRewardResult = { ok: true; rewardId: string } | { ok: false; error: string };

export async function saveReward(input: SaveRewardInput): Promise<SaveRewardResult> {
  if (!input.name.trim()) return { ok: false, error: "Nombre requerido." };
  if (input.variants.length === 0) return { ok: false, error: "Agregá al menos un costo en puntos." };
  for (const v of input.variants) {
    if (!Number.isInteger(v.pointsCost) || v.pointsCost < 0) {
      return { ok: false, error: "Costo en puntos inválido." };
    }
  }

  try {
    await assertOwnsBusiness(input.businessId);
    if (input.rewardId) {
      const existingBusinessId = await businessIdOfReward(input.rewardId);
      if (existingBusinessId !== input.businessId) return { ok: false, error: "No autorizado." };
    }

    const rewardId = await prisma.$transaction(async (tx) => {
      let id = input.rewardId;
      if (id) {
        await tx.reward.update({
          where: { id },
          data: { name: input.name.trim(), description: input.description.trim() || null, categoryId: input.categoryId },
        });
        const existing = await tx.rewardVariant.findMany({ where: { rewardId: id } });
        const keepIds = new Set(input.variants.filter((v) => v.id).map((v) => v.id));
        const toDelete = existing.filter((v) => !keepIds.has(v.id));
        if (toDelete.length > 0) {
          await tx.rewardVariant.deleteMany({ where: { id: { in: toDelete.map((v) => v.id) } } });
        }
      } else {
        const reward = await tx.reward.create({
          data: {
            businessId: input.businessId,
            categoryId: input.categoryId,
            name: input.name.trim(),
            description: input.description.trim() || null,
          },
        });
        id = reward.id;
      }

      for (const v of input.variants) {
        const data = {
          name: v.name.trim() || "Único",
          pointsCost: v.pointsCost,
          costPrice: v.costPrice,
          packagingPrice: v.packagingPrice,
          sku: v.sku,
          isDefault: v.isDefault,
        };
        if (v.id) {
          await tx.rewardVariant.update({ where: { id: v.id }, data });
        } else {
          await tx.rewardVariant.create({ data: { ...data, rewardId: id! } });
        }
      }

      return id!;
    });

    revalidatePath(PATH);
    return { ok: true, rewardId };
  } catch {
    return { ok: false, error: "No se pudo guardar el premio." };
  }
}

export async function toggleRewardActive(rewardId: string, active: boolean): Promise<ActionResult> {
  try {
    const businessId = await businessIdOfReward(rewardId);
    if (!businessId) return { ok: false, error: "Premio no encontrado." };
    await assertOwnsBusiness(businessId);
    await prisma.reward.update({ where: { id: rewardId }, data: { active } });
  } catch {
    return { ok: false, error: "Error al actualizar premio." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function duplicateReward(rewardId: string): Promise<ActionResult> {
  try {
    const reward = await prisma.reward.findUnique({ where: { id: rewardId }, include: { variants: true } });
    if (!reward) return { ok: false, error: "Premio no encontrado." };
    await assertOwnsBusiness(reward.businessId);
    await prisma.reward.create({
      data: {
        businessId: reward.businessId,
        categoryId: reward.categoryId,
        name: `${reward.name} (copia)`,
        description: reward.description,
        imageUrl: reward.imageUrl,
        active: reward.active,
        variants: {
          create: reward.variants.map((v) => ({
            name: v.name,
            pointsCost: v.pointsCost,
            costPrice: v.costPrice,
            packagingPrice: v.packagingPrice,
            sku: v.sku,
            isDefault: v.isDefault,
          })),
        },
      },
    });
  } catch {
    return { ok: false, error: "No se pudo duplicar el premio." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function moveRewardCategory(rewardId: string, categoryId: string): Promise<ActionResult> {
  try {
    const [rewardBusinessId, categoryBusinessId] = await Promise.all([
      businessIdOfReward(rewardId),
      businessIdOfRewardCategory(categoryId),
    ]);
    if (!rewardBusinessId || rewardBusinessId !== categoryBusinessId) return { ok: false, error: "No autorizado." };
    await assertOwnsBusiness(rewardBusinessId);
    await prisma.reward.update({ where: { id: rewardId }, data: { categoryId } });
  } catch {
    return { ok: false, error: "No se pudo mover el premio." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteReward(rewardId: string): Promise<ActionResult> {
  try {
    const businessId = await businessIdOfReward(rewardId);
    if (!businessId) return { ok: false, error: "Premio no encontrado." };
    await assertOwnsBusiness(businessId);
    await prisma.$transaction(async (tx) => {
      await tx.rewardVariant.deleteMany({ where: { rewardId } });
      await tx.reward.delete({ where: { id: rewardId } });
    });
  } catch {
    return { ok: false, error: "No se pudo borrar el premio." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadRewardImage(
  businessId: string,
  rewardId: string,
  dataUrl: string,
): Promise<UploadResult> {
  try {
    await assertOwnsBusiness(businessId);
    const rewardBusinessId = await businessIdOfReward(rewardId);
    if (rewardBusinessId !== businessId) return { ok: false, error: "No autorizado." };
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return { ok: false, error: "Imagen inválida." };
  const [, mimeType, base64] = match;
  const ext = mimeType.split("/")[1];
  const path = `${businessId}/rewards/${rewardId}-${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(RESTAURANT_ASSETS_BUCKET)
    .upload(path, Buffer.from(base64, "base64"), { contentType: mimeType, upsert: true });

  if (error) return { ok: false, error: "No se pudo subir la imagen." };

  const { data } = supabaseAdmin.storage.from(RESTAURANT_ASSETS_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function updateRewardImage(rewardId: string, imageUrl: string | null): Promise<ActionResult> {
  try {
    const businessId = await businessIdOfReward(rewardId);
    if (!businessId) return { ok: false, error: "Premio no encontrado." };
    await assertOwnsBusiness(businessId);
    await prisma.reward.update({ where: { id: rewardId }, data: { imageUrl } });
  } catch {
    return { ok: false, error: "No se pudo actualizar la imagen." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export type RewardModifierInput = { id?: string; name: string; pointsCost: number };
export type RewardModifierGroupInput = {
  id?: string;
  name: string;
  required: boolean;
  multiple: boolean;
  modifiers: RewardModifierInput[];
};

export async function saveRewardModifierGroup(
  businessId: string,
  rewardId: string,
  input: RewardModifierGroupInput,
): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Nombre requerido." };
  try {
    await assertOwnsBusiness(businessId);
    const rewardBusinessId = await businessIdOfReward(rewardId);
    if (rewardBusinessId !== businessId) return { ok: false, error: "No autorizado." };

    await prisma.$transaction(async (tx) => {
      let groupId = input.id;
      if (groupId) {
        await tx.rewardModifierGroup.update({
          where: { id: groupId },
          data: { name: input.name.trim(), required: input.required, multiple: input.multiple },
        });
        const existing = await tx.rewardModifier.findMany({ where: { rewardModifierGroupId: groupId } });
        const keepIds = new Set(input.modifiers.filter((m) => m.id).map((m) => m.id));
        const toDelete = existing.filter((m) => !keepIds.has(m.id));
        if (toDelete.length > 0) {
          await tx.rewardModifier.deleteMany({ where: { id: { in: toDelete.map((m) => m.id) } } });
        }
      } else {
        const count = await tx.rewardModifierGroup.count({ where: { rewardId } });
        const group = await tx.rewardModifierGroup.create({
          data: { rewardId, name: input.name.trim(), required: input.required, multiple: input.multiple, sortOrder: count },
        });
        groupId = group.id;
      }

      for (let i = 0; i < input.modifiers.length; i++) {
        const m = input.modifiers[i];
        const data = { name: m.name.trim() || "Opción", pointsCost: m.pointsCost, sortOrder: i };
        if (m.id) {
          await tx.rewardModifier.update({ where: { id: m.id }, data });
        } else {
          await tx.rewardModifier.create({ data: { ...data, rewardModifierGroupId: groupId! } });
        }
      }
    });
  } catch {
    return { ok: false, error: "No se pudo guardar el grupo de modificadores." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export type MenuProductOption = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  variants: { name: string; suggestedPoints: number; isDefault: boolean }[];
};

export async function listMenuProductsForImport(businessId: string): Promise<MenuProductOption[]> {
  await assertOwnsBusiness(businessId);
  const restaurant = await prisma.restaurant.findFirst({ where: { businessId }, orderBy: { createdAt: "asc" } });
  if (!restaurant) return [];

  const [products, pesosPerPoint] = await Promise.all([
    prisma.product.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { name: "asc" },
      include: { variants: true },
    }),
    getPesosPerPoint(businessId),
  ]);

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    variants: p.variants.map((v) => ({
      name: v.name,
      suggestedPoints: Math.floor(Number(v.price) / pesosPerPoint),
      isDefault: v.isDefault,
    })),
  }));
}

export async function deleteRewardModifierGroup(groupId: string): Promise<ActionResult> {
  try {
    const group = await prisma.rewardModifierGroup.findUnique({ where: { id: groupId }, include: { reward: true } });
    if (!group) return { ok: false, error: "Grupo no encontrado." };
    await assertOwnsBusiness(group.reward.businessId);
    await prisma.rewardModifierGroup.delete({ where: { id: groupId } });
  } catch {
    return { ok: false, error: "No se pudo borrar el grupo." };
  }
  revalidatePath(PATH);
  return { ok: true };
}
