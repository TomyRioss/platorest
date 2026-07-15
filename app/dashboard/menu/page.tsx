import { prisma } from "@/lib/prisma";
import { MenuClient } from "./menu-client";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const restaurant = await prisma.restaurant.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!restaurant) {
    return (
      <main className="p-6 text-text-secondary">
        No hay restaurantes configurados.
      </main>
    );
  }

  const categories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        orderBy: { name: "asc" },
        include: { variants: true },
      },
    },
  });

  return (
    <MenuClient
      restaurantId={restaurant.id}
      restaurantSlug={restaurant.slug}
      restaurantName={restaurant.name}
      restaurantLogo={restaurant.logo}
      restaurantBanner={restaurant.banner}
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        products: c.products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          active: p.active,
          price: Number(p.variants.find((v) => v.isDefault)?.price ?? p.variants[0]?.price ?? 0),
          imageUrl: p.imageUrl,
          variants: p.variants.map((v) => ({
            id: v.id,
            name: v.name,
            price: Number(v.price),
            costPrice: v.costPrice === null ? null : Number(v.costPrice),
            packagingPrice: v.packagingPrice === null ? null : Number(v.packagingPrice),
            sku: v.sku,
            isDefault: v.isDefault,
          })),
        })),
      }))}
    />
  );
}
