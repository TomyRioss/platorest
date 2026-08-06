import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const DEFAULT_PESOS_PER_POINT = 1000;

type Db = Prisma.TransactionClient | typeof prisma;

export async function getPesosPerPoint(businessId: string, db: Db = prisma): Promise<number> {
  const config = await db.loyaltyConfig.findUnique({ where: { businessId } });
  if (!config) return DEFAULT_PESOS_PER_POINT;
  const pointsPerCurrency = Number(config.pointsPerCurrency);
  return pointsPerCurrency > 0 ? 1 / pointsPerCurrency : DEFAULT_PESOS_PER_POINT;
}

export async function pointsForTotal(total: number, businessId: string, db: Db = prisma): Promise<number> {
  const pesosPerPoint = await getPesosPerPoint(businessId, db);
  return Math.floor(total / pesosPerPoint);
}

export async function getPointsBalance(customerId: string): Promise<number> {
  const result = await prisma.pointsTransaction.aggregate({
    where: { customerId },
    _sum: { points: true },
  });
  return result._sum.points ?? 0;
}

export function generateRedemptionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
