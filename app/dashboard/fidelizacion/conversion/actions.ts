"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertOwnsBusiness } from "@/lib/tenant";

type ActionResult = { ok: true } | { ok: false; error: string };

const PATH = "/dashboard/fidelizacion/conversion";

export async function saveLoyaltyConversion(businessId: string, pesosPerPunto: number): Promise<ActionResult> {
  if (!Number.isFinite(pesosPerPunto) || pesosPerPunto <= 0) {
    return { ok: false, error: "El valor debe ser mayor a 0." };
  }

  try {
    await assertOwnsBusiness(businessId);
    await prisma.loyaltyConfig.upsert({
      where: { businessId },
      create: { businessId, pointsPerCurrency: 1 / pesosPerPunto },
      update: { pointsPerCurrency: 1 / pesosPerPunto },
    });
  } catch {
    return { ok: false, error: "No se pudo guardar la conversión." };
  }
  revalidatePath(PATH);
  return { ok: true };
}
