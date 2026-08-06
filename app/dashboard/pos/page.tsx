import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/tenant";
import { PosClient } from "./pos-client";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const businessId = await requireBusinessId();
  const restaurant = await prisma.restaurant.findFirst({
    where: { businessId },
    orderBy: { createdAt: "asc" },
    include: {
      products: {
        where: { active: true },
        orderBy: { name: "asc" },
        include: { variants: { where: { isDefault: true }, take: 1 } },
      },
    },
  });

  if (!restaurant) {
    return (
      <main className="p-6 text-text-secondary">
        No hay restaurantes configurados.
      </main>
    );
  }

  return (
    <PosClient
      restaurantId={restaurant.id}
      products={restaurant.products
        .filter((p) => p.variants[0])
        .map((p) => ({
          variantId: p.variants[0].id,
          name: p.name,
          price: Number(p.variants[0].price),
        }))}
    />
  );
}
