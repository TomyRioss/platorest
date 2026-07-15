import { notFound } from "next/navigation";
import Image from "next/image";
import { HiMapPin } from "react-icons/hi2";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CartBar } from "./cart-bar";
import { MenuNavbar } from "./menu-navbar";
import { MenuContent } from "./menu-content";

async function getIsCustomerSession(businessId: string) {
  const session = await auth();
  if (!session?.user?.email) return false;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return false;

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, businessId },
  });
  if (membership) return false;

  const customer = await prisma.customer.findUnique({
    where: { businessId_userId: { businessId, userId: user.id } },
  });
  return !!customer;
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          products: {
            where: { active: true },
            include: { variants: { orderBy: { price: "asc" } } },
          },
        },
      },
    },
  });

  if (!restaurant) notFound();

  const categoriesWithProducts = restaurant.categories
    .filter((c) => c.products.length > 0)
    .map((c) => ({
      ...c,
      products: c.products.map((p) => ({
        ...p,
        variants: p.variants.map((v) => ({ ...v, price: Number(v.price) })),
      })),
    }));
  const isCustomerSession = await getIsCustomerSession(restaurant.businessId);

  return (
    <main className="min-h-screen bg-surface pb-24">
      <MenuNavbar restaurantSlug={restaurant.slug} isCustomerSession={isCustomerSession} />
      <header className="border-b border-border bg-background pb-4">
        <div
          className="h-32 w-full bg-gradient-to-r from-primary-light to-primary/20 bg-cover bg-center md:h-44"
          style={restaurant.banner ? { backgroundImage: `url(${restaurant.banner})` } : undefined}
        />
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 text-center">
          {restaurant.logo ? (
            <Image
              src={restaurant.logo}
              alt={restaurant.name}
              width={96}
              height={96}
              className="-mt-8 h-20 w-20 shrink-0 rounded-2xl border-4 border-background object-cover shadow-sm md:-mt-10 md:h-28 md:w-28"
            />
          ) : (
            <div className="-mt-8 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-background bg-primary-light text-xl font-bold text-primary shadow-sm md:-mt-10 md:h-28 md:w-28 md:text-3xl">
              {restaurant.name.charAt(0)}
            </div>
          )}
          <h1 className="mt-2 truncate text-base font-bold text-text-primary sm:text-xl md:text-2xl">{restaurant.name}</h1>
          {restaurant.address && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
              <HiMapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{restaurant.address}</span>
            </div>
          )}
        </div>
      </header>

      <MenuContent restaurantSlug={restaurant.slug} categories={categoriesWithProducts} />

      <CartBar restaurantSlug={restaurant.slug} />
    </main>
  );
}
