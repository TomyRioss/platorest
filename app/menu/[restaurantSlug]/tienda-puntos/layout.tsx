import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { getPointsBalance } from "@/lib/loyalty";
import { TiendaPuntosNavbar } from "./tienda-puntos-navbar";

export const dynamic = "force-dynamic";

export default async function TiendaPuntosLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
  if (!restaurant) notFound();

  const result = await getOrCreateCustomer(restaurant.businessId);
  if (!result) redirect(`/menu/${restaurantSlug}/account/login`);
  const { customer } = result;

  const balance = await getPointsBalance(customer.id);

  return (
    <main className="min-h-screen w-full pb-6">
      <TiendaPuntosNavbar restaurantSlug={restaurantSlug} customerName={customer.name} balance={balance} />
      <div className="px-4 pt-4">{children}</div>
    </main>
  );
}
