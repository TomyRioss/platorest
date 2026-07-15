"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supabaseAdmin, RESTAURANT_ASSETS_BUCKET } from "@/lib/supabase-admin";
import { SocialPlatform } from "@prisma/client";
import { slugify } from "@/lib/slug";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateSocialLink(
  businessId: string,
  platform: SocialPlatform,
  url: string,
): Promise<ActionResult> {
  try {
    if (!url.trim()) {
      await prisma.socialLink.deleteMany({ where: { businessId, platform } });
    } else {
      await prisma.socialLink.upsert({
        where: { businessId_platform: { businessId, platform } },
        create: { businessId, platform, url: url.trim() },
        update: { url: url.trim() },
      });
    }
  } catch {
    return { ok: false, error: "No se pudo guardar la red social." };
  }
  revalidatePath("/dashboard/menu/diseno");
  return { ok: true };
}

export async function createCategory(
  restaurantId: string,
  name: string,
): Promise<ActionResult> {
  if (!name.trim()) return { ok: false, error: "Nombre requerido." };
  try {
    await prisma.category.create({ data: { restaurantId, name: name.trim() } });
  } catch {
    return { ok: false, error: "Error al crear categoría." };
  }
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

export async function reorderCategories(categoryIds: string[]): Promise<ActionResult> {
  try {
    await prisma.$transaction(
      categoryIds.map((id, index) =>
        prisma.category.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
  } catch {
    return { ok: false, error: "No se pudo reordenar." };
  }
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  try {
    await prisma.category.delete({ where: { id: categoryId } });
  } catch {
    return { ok: false, error: "No se pudo borrar (tiene productos asociados)." };
  }
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

export type VariantInput = {
  id?: string;
  name: string;
  price: number;
  costPrice: number | null;
  packagingPrice: number | null;
  sku: string | null;
  isDefault: boolean;
};

type SaveProductInput = {
  productId?: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  variants: VariantInput[];
};

export type SaveProductResult =
  | { ok: true; productId: string }
  | { ok: false; error: string };

export async function saveProduct(input: SaveProductInput): Promise<SaveProductResult> {
  if (!input.name.trim()) return { ok: false, error: "Nombre requerido." };
  if (input.variants.length === 0) return { ok: false, error: "Agregá al menos un precio." };
  for (const v of input.variants) {
    if (!Number.isFinite(v.price) || v.price < 0) {
      return { ok: false, error: "Precio inválido." };
    }
  }

  try {
    const productId = await prisma.$transaction(async (tx) => {
      let id = input.productId;
      if (id) {
        await tx.product.update({
          where: { id },
          data: { name: input.name.trim(), description: input.description.trim() || null },
        });
        const existing = await tx.productVariant.findMany({ where: { productId: id } });
        const keepIds = new Set(input.variants.filter((v) => v.id).map((v) => v.id));
        const toDelete = existing.filter((v) => !keepIds.has(v.id));
        if (toDelete.length > 0) {
          await tx.productVariant.deleteMany({ where: { id: { in: toDelete.map((v) => v.id) } } });
        }
      } else {
        const product = await tx.product.create({
          data: {
            restaurantId: input.restaurantId,
            categoryId: input.categoryId,
            name: input.name.trim(),
            description: input.description.trim() || null,
          },
        });
        id = product.id;
      }

      for (const v of input.variants) {
        const data = {
          name: v.name.trim() || "Único",
          price: v.price,
          costPrice: v.costPrice,
          packagingPrice: v.packagingPrice,
          sku: v.sku?.trim() || null,
          isDefault: v.isDefault,
        };
        if (v.id) {
          await tx.productVariant.update({ where: { id: v.id }, data });
        } else {
          await tx.productVariant.create({ data: { ...data, productId: id! } });
        }
      }

      return id!;
    });

    revalidatePath("/dashboard/menu");
    return { ok: true, productId };
  } catch {
    return { ok: false, error: "No se pudo guardar el producto." };
  }
}

export async function duplicateProduct(productId: string): Promise<ActionResult> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });
    if (!product) return { ok: false, error: "Producto no encontrado." };
    await prisma.product.create({
      data: {
        restaurantId: product.restaurantId,
        categoryId: product.categoryId,
        name: `${product.name} (copia)`,
        description: product.description,
        imageUrl: product.imageUrl,
        active: product.active,
        variants: {
          create: product.variants.map((v) => ({
            name: v.name,
            price: v.price,
            isDefault: v.isDefault,
          })),
        },
      },
    });
  } catch {
    return { ok: false, error: "No se pudo duplicar el producto." };
  }
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

export async function moveProductCategory(
  productId: string,
  categoryId: string,
): Promise<ActionResult> {
  try {
    await prisma.product.update({ where: { id: productId }, data: { categoryId } });
  } catch {
    return { ok: false, error: "No se pudo mover el producto." };
  }
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

export async function toggleProductActive(
  productId: string,
  active: boolean,
): Promise<ActionResult> {
  try {
    await prisma.product.update({ where: { id: productId }, data: { active } });
  } catch {
    return { ok: false, error: "Error al actualizar producto." };
  }
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadRestaurantAsset(
  restaurantId: string,
  kind: "logo" | "banner",
  dataUrl: string,
): Promise<UploadResult> {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return { ok: false, error: "Imagen inválida." };
  const [, mimeType, base64] = match;
  const ext = mimeType.split("/")[1];
  const path = `${restaurantId}/${kind}-${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(RESTAURANT_ASSETS_BUCKET)
    .upload(path, Buffer.from(base64, "base64"), { contentType: mimeType, upsert: true });

  if (error) return { ok: false, error: "No se pudo subir la imagen." };

  const { data } = supabaseAdmin.storage.from(RESTAURANT_ASSETS_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function updateRestaurant(
  restaurantId: string,
  data: {
    name?: string;
    logo?: string | null;
    banner?: string | null;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
  },
): Promise<ActionResult> {
  if (data.name !== undefined && !data.name.trim()) {
    return { ok: false, error: "Nombre requerido." };
  }
  try {
    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.logo !== undefined ? { logo: data.logo } : {}),
        ...(data.banner !== undefined ? { banner: data.banner } : {}),
        ...(data.address !== undefined ? { address: data.address?.trim() || null } : {}),
        ...(data.lat !== undefined ? { lat: data.lat } : {}),
        ...(data.lng !== undefined ? { lng: data.lng } : {}),
      },
      include: { business: { select: { slug: true } } },
    });
    revalidatePath(`/${updated.business.slug}`);
  } catch {
    return { ok: false, error: "No se pudo actualizar el restaurante." };
  }
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

export async function createBranch(
  businessId: string,
  name: string,
): Promise<ActionResult & { branch?: { id: string; name: string; slug: string; address: string | null; lat: number | null; lng: number | null } }> {
  if (!name.trim()) return { ok: false, error: "Nombre requerido." };
  try {
    const baseSlug = slugify(name) || "sucursal";
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.restaurant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }
    const branch = await prisma.restaurant.create({
      data: { businessId, name: name.trim(), slug, deliveryRadiusKm: 5 },
      include: { business: { select: { slug: true } } },
    });
    revalidatePath("/dashboard/menu");
    revalidatePath(`/${branch.business.slug}`);
    return { ok: true, branch };
  } catch {
    return { ok: false, error: "No se pudo crear la sucursal." };
  }
}

export async function deleteBranch(restaurantId: string): Promise<ActionResult> {
  try {
    const existing = await prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { businessId: true, business: { select: { slug: true } } } });
    const count = await prisma.restaurant.count({ where: { businessId: existing?.businessId } });
    if (count <= 1) return { ok: false, error: "No podés borrar la única sucursal." };
    await prisma.restaurant.delete({ where: { id: restaurantId } });
    if (existing) revalidatePath(`/${existing.business.slug}`);
  } catch {
    return { ok: false, error: "No se pudo borrar la sucursal." };
  }
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

export async function uploadProductImage(
  restaurantId: string,
  productId: string,
  dataUrl: string,
): Promise<UploadResult> {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return { ok: false, error: "Imagen inválida." };
  const [, mimeType, base64] = match;
  const ext = mimeType.split("/")[1];
  const path = `${restaurantId}/products/${productId}-${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(RESTAURANT_ASSETS_BUCKET)
    .upload(path, Buffer.from(base64, "base64"), { contentType: mimeType, upsert: true });

  if (error) return { ok: false, error: "No se pudo subir la imagen." };

  const { data } = supabaseAdmin.storage.from(RESTAURANT_ASSETS_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function updateProductImage(
  productId: string,
  imageUrl: string | null,
): Promise<ActionResult> {
  try {
    await prisma.product.update({ where: { id: productId }, data: { imageUrl } });
  } catch {
    return { ok: false, error: "No se pudo actualizar la imagen." };
  }
  revalidatePath("/dashboard/menu");
  return { ok: true };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId } });
      await tx.product.delete({ where: { id: productId } });
    });
  } catch {
    return { ok: false, error: "No se pudo borrar el producto." };
  }
  revalidatePath("/dashboard/menu");
  return { ok: true };
}
