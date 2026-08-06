"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { generateRedemptionCode } from "@/lib/loyalty";
import { revalidatePath } from "next/cache";

export type ClaimResult = { ok: true; code: string } | { ok: false; error: string };

export async function claimVisitGift(businessId: string, restaurantSlug: string, rewardId: string): Promise<ClaimResult> {
  const result = await getOrCreateCustomer(businessId);
  if (!result) return { ok: false, error: "Necesitás iniciar sesión." };
  const { customer } = result;

  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward || reward.businessId !== businessId || !reward.active || !reward.visitMilestone) {
    return { ok: false, error: "Regalo no disponible." };
  }

  try {
    const code = await prisma.$transaction(async (tx) => {
      const existing = await tx.redemption.findFirst({ where: { rewardId, customerId: customer.id } });
      if (existing) throw new Error("ALREADY_CLAIMED");

      const visits = await tx.order.count({
        where: { customerId: customer.id, restaurant: { businessId } },
      });
      if (visits < reward.visitMilestone!) throw new Error("NOT_ELIGIBLE");

      const redemptionCode = generateRedemptionCode();
      await tx.redemption.create({
        data: { rewardId, customerId: customer.id, code: redemptionCode, pointsSpent: 0 },
      });
      return redemptionCode;
    });

    revalidatePath(`/menu/${restaurantSlug}/tienda-puntos/regalos`);
    return { ok: true, code };
  } catch (err) {
    if (err instanceof Error && err.message === "ALREADY_CLAIMED") {
      return { ok: false, error: "Ya reclamaste este regalo." };
    }
    if (err instanceof Error && err.message === "NOT_ELIGIBLE") {
      return { ok: false, error: "Todavía no llegaste a la cantidad de visitas." };
    }
    console.error("[claimVisitGift] failed", err);
    return { ok: false, error: "No se pudo reclamar el regalo." };
  }
}
