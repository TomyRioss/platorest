import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/tenant";
import { DesignClient } from "./design-client";

export const dynamic = "force-dynamic";

export default async function DesignPage() {
  const businessId = await requireBusinessId();
  const restaurant = await prisma.restaurant.findFirst({
    where: { businessId },
    orderBy: { createdAt: "asc" },
    include: {
      business: {
        include: {
          socialLinks: true,
          restaurants: { orderBy: { createdAt: "asc" } },
        },
      },
      openingHours: { orderBy: [{ dayOfWeek: "asc" }, { sortOrder: "asc" }] },
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
    <DesignClient
      restaurantId={restaurant.id}
      restaurantName={restaurant.name}
      restaurantLogo={restaurant.logo}
      restaurantBanner={restaurant.banner}
      businessId={restaurant.business.id}
      businessSlug={restaurant.business.slug}
      socialLinks={restaurant.business.socialLinks.map((l) => ({ platform: l.platform, url: l.url }))}
      branches={restaurant.business.restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        address: r.address,
        lat: r.lat,
        lng: r.lng,
      }))}
      openingHours={restaurant.openingHours.map((h) => ({
        id: h.id,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
      }))}
      timezone={restaurant.timezone}
    />
  );
}
