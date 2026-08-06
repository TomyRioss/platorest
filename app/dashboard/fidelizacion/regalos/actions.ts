"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supabaseAdmin, RESTAURANT_ASSETS_BUCKET } from "@/lib/supabase-admin";
import { assertOwnsBusiness } from "@/lib/tenant";

type ActionResult = { ok: true } | { ok: false; error: string };

const PATH = "/dashboard/fidelizacion/regalos";

async function businessIdOfGiftReward(rewardId: string) {
  const r = await prisma.reward.findUnique({ where: { id: rewardId }, select: { businessId: true } });
  return r?.businessId ?? null;
}

export type SaveGiftRewardInput = {
  rewardId?: string;
  businessId: string;
  name: string;
  description: string;
  visitMilestone: number;
};

export type SaveGiftRewardResult = { ok: true; rewardId: string } | { ok: false; error: string };

export async function saveGiftReward(input: SaveGiftRewardInput): Promise<SaveGiftRewardResult> {
  if (!input.name.trim()) return { ok: false, error: "Nombre requerido." };
  if (!Number.isInteger(input.visitMilestone) || input.visitMilestone < 1) {
    return { ok: false, error: "Cantidad de visitas inválida." };
  }

  try {
    await assertOwnsBusiness(input.businessId);
    if (input.rewardId) {
      const existingBusinessId = await businessIdOfGiftReward(input.rewardId);
      if (existingBusinessId !== input.businessId) return { ok: false, error: "No autorizado." };
    }

    const reward = input.rewardId
      ? await prisma.reward.update({
          where: { id: input.rewardId },
          data: {
            name: input.name.trim(),
            description: input.description.trim() || null,
            visitMilestone: input.visitMilestone,
          },
        })
      : await prisma.reward.create({
          data: {
            businessId: input.businessId,
            name: input.name.trim(),
            description: input.description.trim() || null,
            visitMilestone: input.visitMilestone,
          },
        });

    revalidatePath(PATH);
    return { ok: true, rewardId: reward.id };
  } catch {
    return { ok: false, error: "No se pudo guardar el regalo." };
  }
}

export async function toggleGiftRewardActive(rewardId: string, active: boolean): Promise<ActionResult> {
  try {
    const businessId = await businessIdOfGiftReward(rewardId);
    if (!businessId) return { ok: false, error: "Regalo no encontrado." };
    await assertOwnsBusiness(businessId);
    await prisma.reward.update({ where: { id: rewardId }, data: { active } });
  } catch {
    return { ok: false, error: "Error al actualizar el regalo." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteGiftReward(rewardId: string): Promise<ActionResult> {
  try {
    const businessId = await businessIdOfGiftReward(rewardId);
    if (!businessId) return { ok: false, error: "Regalo no encontrado." };
    await assertOwnsBusiness(businessId);
    await prisma.reward.delete({ where: { id: rewardId } });
  } catch {
    return { ok: false, error: "No se pudo borrar el regalo." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadGiftRewardImage(
  businessId: string,
  rewardId: string,
  dataUrl: string,
): Promise<UploadResult> {
  try {
    await assertOwnsBusiness(businessId);
    const rewardBusinessId = await businessIdOfGiftReward(rewardId);
    if (rewardBusinessId !== businessId) return { ok: false, error: "No autorizado." };
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return { ok: false, error: "Imagen inválida." };
  const [, mimeType, base64] = match;
  const ext = mimeType.split("/")[1];
  const path = `${businessId}/gift-rewards/${rewardId}-${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(RESTAURANT_ASSETS_BUCKET)
    .upload(path, Buffer.from(base64, "base64"), { contentType: mimeType, upsert: true });

  if (error) return { ok: false, error: "No se pudo subir la imagen." };

  const { data } = supabaseAdmin.storage.from(RESTAURANT_ASSETS_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function updateGiftRewardImage(rewardId: string, imageUrl: string | null): Promise<ActionResult> {
  try {
    const businessId = await businessIdOfGiftReward(rewardId);
    if (!businessId) return { ok: false, error: "Regalo no encontrado." };
    await assertOwnsBusiness(businessId);
    await prisma.reward.update({ where: { id: rewardId }, data: { imageUrl } });
  } catch {
    return { ok: false, error: "No se pudo actualizar la imagen." };
  }
  revalidatePath(PATH);
  return { ok: true };
}
