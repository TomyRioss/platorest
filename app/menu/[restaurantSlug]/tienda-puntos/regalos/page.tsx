import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { RegalosContent } from "./regalos-content";

export const dynamic = "force-dynamic";

export default async function CustomerRegalosPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
  if (!restaurant) notFound();

  const result = await getOrCreateCustomer(restaurant.businessId);
  if (!result) redirect(`/menu/${restaurantSlug}/account/login`);
  const { customer } = result;

  const [rewards, visits, redemptions] = await Promise.all([
    prisma.reward.findMany({
      where: { businessId: restaurant.businessId, active: true, visitMilestone: { not: null } },
      orderBy: { visitMilestone: "asc" },
    }),
    prisma.order.count({ where: { customerId: customer.id, restaurant: { businessId: restaurant.businessId } } }),
    prisma.redemption.findMany({ where: { customerId: customer.id, reward: { businessId: restaurant.businessId } } }),
  ]);

  const claimedRewardIds = new Set(redemptions.map((r) => r.rewardId));

  return (
    <RegalosContent
      businessId={restaurant.businessId}
      restaurantSlug={restaurantSlug}
      visits={visits}
      rewards={rewards.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        imageUrl: r.imageUrl,
        visitMilestone: r.visitMilestone!,
        claimed: claimedRewardIds.has(r.id),
      }))}
    />
  );
}
