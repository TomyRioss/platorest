import { prisma } from "@/lib/prisma";
import { InventoryClient } from "./inventory-client";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  // ponytail: single-tenant MVP, same simplification as /dashboard/pos
  const restaurant = await prisma.restaurant.findFirst({
    orderBy: { createdAt: "asc" },
    include: { products: { orderBy: { name: "asc" } } },
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
      products={restaurant.products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        stockQty: p.stockQty,
        lowStockAlertAt: p.lowStockAlertAt,
        active: p.active,
      }))}
    />
  );
}
