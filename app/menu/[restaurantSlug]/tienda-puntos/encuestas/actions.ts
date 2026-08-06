"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { revalidatePath } from "next/cache";

type ActionResult = { ok: true } | { ok: false; error: string };

async function pathFor(restaurantSlug: string) {
  return `/menu/${restaurantSlug}/tienda-puntos/encuestas`;
}

export async function submitInternalSurvey(
  businessId: string,
  restaurantSlug: string,
  ratings: { attentionRating: number; foodRating: number; experienceRating: number },
): Promise<ActionResult> {
  for (const value of Object.values(ratings)) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return { ok: false, error: "Calificación inválida." };
    }
  }

  const result = await getOrCreateCustomer(businessId);
  if (!result) return { ok: false, error: "Necesitás iniciar sesión." };
  const { customer } = result;

  try {
    const config = await prisma.surveyConfig.findUnique({
      where: { businessId_type: { businessId, type: "INTERNAL" } },
    });
    if (!config || !config.active) return { ok: false, error: "La encuesta no está disponible." };

    await prisma.$transaction(async (tx) => {
      await tx.surveyCompletion.create({
        data: {
          surveyConfigId: config.id,
          customerId: customer.id,
          attentionRating: ratings.attentionRating,
          foodRating: ratings.foodRating,
          experienceRating: ratings.experienceRating,
          pointsAwarded: config.points,
        },
      });
      await tx.pointsTransaction.create({
        data: { customerId: customer.id, points: config.points, reason: "ACTION" },
      });
    });
  } catch (err) {
    console.error("[submitInternalSurvey] failed", err);
    return { ok: false, error: "Ya completaste esta encuesta." };
  }

  revalidatePath(await pathFor(restaurantSlug));
  return { ok: true };
}

export async function claimExternalSurveyPoints(businessId: string, restaurantSlug: string): Promise<ActionResult> {
  const result = await getOrCreateCustomer(businessId);
  if (!result) return { ok: false, error: "Necesitás iniciar sesión." };
  const { customer } = result;

  try {
    const config = await prisma.surveyConfig.findUnique({
      where: { businessId_type: { businessId, type: "EXTERNAL" } },
    });
    if (!config || !config.active) return { ok: false, error: "La encuesta no está disponible." };

    await prisma.$transaction(async (tx) => {
      await tx.surveyCompletion.create({
        data: { surveyConfigId: config.id, customerId: customer.id, pointsAwarded: config.points },
      });
      await tx.pointsTransaction.create({
        data: { customerId: customer.id, points: config.points, reason: "ACTION" },
      });
    });
  } catch (err) {
    console.error("[claimExternalSurveyPoints] failed", err);
    return { ok: false, error: "Ya reclamaste estos puntos." };
  }

  revalidatePath(await pathFor(restaurantSlug));
  return { ok: true };
}
