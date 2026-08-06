import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/tenant";
import { EncuestasClient } from "./encuestas-client";

export const dynamic = "force-dynamic";

export default async function EncuestasPage() {
  const businessId = await requireBusinessId();

  const configs = await prisma.surveyConfig.findMany({ where: { businessId } });
  const internal = configs.find((c) => c.type === "INTERNAL");
  const external = configs.find((c) => c.type === "EXTERNAL");

  return (
    <EncuestasClient
      businessId={businessId}
      internal={{ points: internal?.points ?? 0, active: internal?.active ?? false }}
      external={{ points: external?.points ?? 0, active: external?.active ?? false, externalUrl: external?.externalUrl ?? "" }}
    />
  );
}
