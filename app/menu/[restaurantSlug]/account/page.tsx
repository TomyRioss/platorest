import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft, HiUserCircle } from "react-icons/hi2";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { SignOutButton } from "./sign-out-button";

export default async function CustomerAccountPage({
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

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
      <Link
        href={`/menu/${restaurantSlug}`}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <HiArrowLeft className="h-4 w-4" />
        Volver al menú
      </Link>

      <div className="flex flex-col items-center gap-2 text-center">
        <HiUserCircle className="h-16 w-16 text-primary" />
        <h1 className="text-xl font-bold text-text-primary">{customer.name}</h1>
        {customer.email && <p className="text-sm text-text-secondary">{customer.email}</p>}
        {customer.phone && <p className="text-sm text-text-secondary">{customer.phone}</p>}
      </div>

      <SignOutButton restaurantSlug={restaurantSlug} />
    </main>
  );
}
