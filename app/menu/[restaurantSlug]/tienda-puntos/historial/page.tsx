import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { HistorialContent } from "./historial-content";

export const dynamic = "force-dynamic";

export default async function HistorialPage({
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

  const redemptions = await prisma.redemption.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: { reward: true, rewardVariant: true },
  });

  return (
    <HistorialContent
      restaurantSlug={restaurantSlug}
      redemptions={redemptions.map((r) => ({
        id: r.id,
        code: r.code,
        status: r.status,
        pointsSpent: r.pointsSpent,
        createdAt: r.createdAt.toISOString(),
        rewardName: r.reward.name,
        variantName: r.rewardVariant && r.rewardVariant.name !== "Único" ? r.rewardVariant.name : null,
        modifiers: Array.isArray(r.selectedModifiers)
          ? (r.selectedModifiers as { name: string }[]).map((m) => m.name)
          : [],
      }))}
    />
  );
}
