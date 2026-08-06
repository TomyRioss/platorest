import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/tenant";
import { DEFAULT_PESOS_PER_POINT } from "@/lib/loyalty";
import { ConversionClient } from "./conversion-client";

export const dynamic = "force-dynamic";

export default async function ConversionPage() {
  const businessId = await requireBusinessId();

  const config = await prisma.loyaltyConfig.findUnique({ where: { businessId } });
  const pointsPerCurrency = config ? Number(config.pointsPerCurrency) : null;
  const pesosPerPunto = pointsPerCurrency && pointsPerCurrency > 0 ? Math.round(1 / pointsPerCurrency) : DEFAULT_PESOS_PER_POINT;

  return <ConversionClient businessId={businessId} initialPesosPerPunto={pesosPerPunto} />;
}
