import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/tenant";
import { RegalosClient } from "./regalos-client";

export const dynamic = "force-dynamic";

export default async function RegalosPage() {
  const businessId = await requireBusinessId();

  const rewards = await prisma.reward.findMany({
    where: { businessId, visitMilestone: { not: null } },
    orderBy: { visitMilestone: "asc" },
  });

  return (
    <RegalosClient
      businessId={businessId}
      rewards={rewards.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        imageUrl: r.imageUrl,
        active: r.active,
        visitMilestone: r.visitMilestone ?? 1,
      }))}
    />
  );
}
