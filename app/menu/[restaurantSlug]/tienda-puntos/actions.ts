"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { generateRedemptionCode } from "@/lib/loyalty";

export type RedeemResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export async function redeemReward(
  businessId: string,
  rewardVariantId: string,
  selectedModifierIds: string[],
): Promise<RedeemResult> {
  const result = await getOrCreateCustomer(businessId);
  if (!result) return { ok: false, error: "Necesitás iniciar sesión." };
  const { customer } = result;

  const variant = await prisma.rewardVariant.findUnique({
    where: { id: rewardVariantId },
    include: { reward: true },
  });
  if (!variant || variant.reward.businessId !== businessId || !variant.reward.active) {
    return { ok: false, error: "Premio no disponible." };
  }

  const modifiers = selectedModifierIds.length
    ? await prisma.rewardModifier.findMany({
        where: { id: { in: selectedModifierIds }, group: { rewardId: variant.rewardId } },
      })
    : [];
  if (modifiers.length !== selectedModifierIds.length) {
    return { ok: false, error: "Modificador inválido." };
  }

  const modifiersCost = modifiers.reduce((sum, m) => sum + m.pointsCost, 0);
  const totalCost = variant.pointsCost + modifiersCost;

  try {
    const code = await prisma.$transaction(async (tx) => {
      const balance = await tx.pointsTransaction.aggregate({
        where: { customerId: customer.id },
        _sum: { points: true },
      });
      if ((balance._sum.points ?? 0) < totalCost) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const redemptionCode = generateRedemptionCode();
      await tx.redemption.create({
        data: {
          rewardId: variant.rewardId,
          rewardVariantId: variant.id,
          customerId: customer.id,
          code: redemptionCode,
          selectedModifiers: modifiers.map((m) => ({ name: m.name, pointsCost: m.pointsCost })),
          pointsSpent: totalCost,
        },
      });
      await tx.pointsTransaction.create({
        data: { customerId: customer.id, points: -totalCost, reason: "REDEMPTION" },
      });
      return redemptionCode;
    });

    return { ok: true, code };
  } catch (err) {
    console.error("[redeemReward] failed", err);
    if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
      return { ok: false, error: "No tenés puntos suficientes para este premio." };
    }
    return { ok: false, error: "No se pudo procesar el canje." };
  }
}
