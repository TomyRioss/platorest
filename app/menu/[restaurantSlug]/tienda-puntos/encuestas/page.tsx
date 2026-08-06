import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { EncuestasContent } from "./encuestas-content";

export const dynamic = "force-dynamic";

export default async function CustomerEncuestasPage({
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

  const configs = await prisma.surveyConfig.findMany({
    where: { businessId: restaurant.businessId, active: true },
    include: { completions: { where: { customerId: customer.id } } },
  });

  const internal = configs.find((c) => c.type === "INTERNAL");
  const external = configs.find((c) => c.type === "EXTERNAL");

  return (
    <EncuestasContent
      businessId={restaurant.businessId}
      restaurantSlug={restaurantSlug}
      internal={internal ? { points: internal.points, completed: internal.completions.length > 0 } : null}
      external={
        external
          ? { points: external.points, externalUrl: external.externalUrl ?? "", completed: external.completions.length > 0 }
          : null
      }
    />
  );
}
