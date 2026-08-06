"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertOwnsBusiness } from "@/lib/tenant";
import type { SurveyType } from "@prisma/client";

type ActionResult = { ok: true } | { ok: false; error: string };

const PATH = "/dashboard/fidelizacion/encuestas";

export type SaveSurveyConfigInput = {
  businessId: string;
  type: SurveyType;
  points: number;
  active: boolean;
  externalUrl?: string;
};

export async function saveSurveyConfig(input: SaveSurveyConfigInput): Promise<ActionResult> {
  if (!Number.isInteger(input.points) || input.points < 0) {
    return { ok: false, error: "Puntos inválidos." };
  }
  if (input.type === "EXTERNAL" && input.active && !input.externalUrl?.trim()) {
    return { ok: false, error: "Ingresá el link de la reseña para activar." };
  }

  try {
    await assertOwnsBusiness(input.businessId);
    await prisma.surveyConfig.upsert({
      where: { businessId_type: { businessId: input.businessId, type: input.type } },
      create: {
        businessId: input.businessId,
        type: input.type,
        points: input.points,
        active: input.active,
        externalUrl: input.type === "EXTERNAL" ? input.externalUrl?.trim() || null : null,
      },
      update: {
        points: input.points,
        active: input.active,
        externalUrl: input.type === "EXTERNAL" ? input.externalUrl?.trim() || null : null,
      },
    });
  } catch {
    return { ok: false, error: "No se pudo guardar la encuesta." };
  }
  revalidatePath(PATH);
  return { ok: true };
}
