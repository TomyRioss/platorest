import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { getPointsBalance } from "@/lib/loyalty";
import { RewardDetail } from "./reward-detail";

export default async function RewardDetailPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string; rewardId: string }>;
}) {
  const { restaurantSlug, rewardId } = await params;

  const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
  if (!restaurant) notFound();

  const result = await getOrCreateCustomer(restaurant.businessId);
  if (!result) redirect(`/menu/${restaurantSlug}/account/login`);
  const { customer } = result;

  const reward = await prisma.reward.findFirst({
    where: { id: rewardId, active: true, businessId: restaurant.businessId },
    include: {
      variants: { orderBy: { pointsCost: "asc" } },
      modifierGroups: {
        orderBy: { sortOrder: "asc" },
        include: { modifiers: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!reward) notFound();

  const variant = reward.variants.find((v) => v.isDefault) ?? reward.variants[0];
  const balance = await getPointsBalance(customer.id);

  return (
    <RewardDetail
      restaurantSlug={restaurantSlug}
      businessId={restaurant.businessId}
      balance={balance}
      reward={{
        id: reward.id,
        variantId: variant?.id ?? "",
        name: reward.name,
        description: reward.description,
        imageUrl: reward.imageUrl,
        pointsCost: variant?.pointsCost ?? 0,
        modifierGroups: reward.modifierGroups.map((g) => ({
          id: g.id,
          name: g.name,
          required: g.required,
          multiple: g.multiple,
          modifiers: g.modifiers.map((m) => ({ id: m.id, name: m.name, pointsCost: m.pointsCost })),
        })),
      }}
    />
  );
}
