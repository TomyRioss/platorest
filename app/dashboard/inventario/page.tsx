import { prisma } from "@/lib/prisma";
import { InventoryClient } from "./inventory-client";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  // ponytail: single-tenant MVP, same simplification as /dashboard/pos
  const restaurant = await prisma.restaurant.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      products: {
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
    <InventoryClient
      restaurantId={restaurant.id}
      products={restaurant.products
        .filter((p) => p.variants[0])
        .map((p) => ({
          id: p.id,
          variantId: p.variants[0].id,
          name: p.name,
          description: p.description,
          price: Number(p.variants[0].price),
          stockQty: p.variants[0].stockQty ?? 0,
          active: p.active,
        }))}
    />
  );
}
