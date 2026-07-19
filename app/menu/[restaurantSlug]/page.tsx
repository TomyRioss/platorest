import { notFound } from "next/navigation";
import Image from "next/image";
import { HiOutlineClock } from "react-icons/hi2";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ensureFeaturedCategory } from "@/lib/featured-category";
import { getOpenStatus } from "@/lib/opening-hours";
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
            include: {
              variants: { orderBy: { price: "asc" } },
              modifierGroups: {
                orderBy: { sortOrder: "asc" },
                include: { modifiers: { orderBy: { sortOrder: "asc" } } },
              },
            },
          },
        },
      },
      business: {
        include: {
          socialLinks: { where: { platform: "WHATSAPP" } },
        },
      },
      openingHours: true,
    },
  });

  if (!restaurant) notFound();

  await ensureFeaturedCategory(restaurant.id);

  const categoriesWithProducts = restaurant.categories
    .filter((c) => c.products.length > 0)
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
    .map((c) => ({
      ...c,
      products: c.products.map((p) => ({
        ...p,
        variants: p.variants.map((v) => ({ ...v, price: Number(v.price) })),
        modifierGroups: p.modifierGroups.map((g) => ({
          id: g.id,
          name: g.name,
          required: g.required,
          multiple: g.multiple,
          modifiers: g.modifiers.map((m) => ({ id: m.id, name: m.name, price: Number(m.price) })),
        })),
      })),
    }));
  const isCustomerSession = await getIsCustomerSession(restaurant.businessId);
  const whatsappNumber = restaurant.business.socialLinks[0]?.url ?? null;
  const openStatus = getOpenStatus(restaurant.openingHours);

  return (
    <main className="min-h-screen bg-surface pb-24">
      <MenuNavbar
        restaurantSlug={restaurant.slug}
        restaurantName={restaurant.name}
        isCustomerSession={isCustomerSession}
        whatsappNumber={whatsappNumber}
      />
      <header className="bg-background pb-4">
        <div
          className="h-20 w-full bg-gradient-to-r from-primary-light to-primary/20 bg-cover bg-center md:h-28"
          style={restaurant.banner ? { backgroundImage: `url(${restaurant.banner})` } : undefined}
        />
        {openStatus && (
          <div
            className={`flex items-center justify-center gap-1.5 rounded-t-lg py-1.5 text-xs font-bold text-white ${
              openStatus.isOpen ? "bg-success" : "bg-danger"
            }`}
          >
            <HiOutlineClock className="h-3.5 w-3.5 shrink-0" />
            {openStatus.isOpen ? `Cierra a las ${openStatus.time}` : `Abre a las ${openStatus.time}`}
          </div>
        )}
        <div className="mx-auto mt-4 max-w-2xl px-4">
          <div className="flex items-center gap-3">
            {restaurant.logo ? (
              <Image
                src={restaurant.logo}
                alt={restaurant.name}
                width={112}
                height={112}
                className="h-20 w-20 shrink-0 rounded-xl object-cover md:h-28 md:w-28"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary-light text-2xl font-bold text-primary md:h-28 md:w-28 md:text-3xl">
                {restaurant.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight text-text-primary sm:text-3xl md:text-4xl">{restaurant.name}</h1>
            </div>
          </div>
        </div>
      </header>

      <MenuContent restaurantSlug={restaurant.slug} categories={categoriesWithProducts} />

      <CartBar restaurantSlug={restaurant.slug} />
    </main>
  );
}
