import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { getPointsBalance } from "@/lib/loyalty";
import { TiendaPuntosContent } from "./tienda-puntos-content";

export const dynamic = "force-dynamic";

export default async function CustomerTiendaPuntosPage({
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

  const [balance, categories] = await Promise.all([
    getPointsBalance(customer.id),
    prisma.rewardCategory.findMany({
      where: { businessId: restaurant.businessId },
      orderBy: { sortOrder: "asc" },
      include: {
        rewards: {
          where: { active: true },
          orderBy: { name: "asc" },
          include: { variants: true },
        },
      },
    }),
  ]);

  return (
    <TiendaPuntosContent
      restaurantSlug={restaurantSlug}
      balance={balance}
      categories={categories
        .map((c) => ({
          id: c.id,
          name: c.name,
          rewards: c.rewards.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            imageUrl: r.imageUrl,
            pointsCost: r.variants.find((v) => v.isDefault)?.pointsCost ?? r.variants[0]?.pointsCost ?? 0,
          })),
        }))
        .filter((c) => c.rewards.length > 0)}
    />
  );
}
