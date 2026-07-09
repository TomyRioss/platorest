import { prisma } from "@/lib/prisma";
import { PosClient } from "./pos-client";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  // ponytail: single-tenant MVP, admin login isn't bound to a restaurant yet — use the first one
  const restaurant = await prisma.restaurant.findFirst({
    orderBy: { createdAt: "asc" },
    include: { products: { where: { active: true }, orderBy: { name: "asc" } } },
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
      products={restaurant.products.map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
      }))}
    />
  );
}
