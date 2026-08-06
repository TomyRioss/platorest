import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export class TenantError extends Error {}

/** Business id of the logged-in owner. Redirects if not authenticated / no business yet. */
export async function requireBusinessId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, role: "OWNER" },
    select: { businessId: true },
    orderBy: { id: "asc" },
  });
  if (!membership) redirect("/onboarding");

  return membership.businessId;
}

/** Throws TenantError if restaurantId doesn't belong to the logged-in owner's business. */
export async function assertOwnsRestaurant(restaurantId: string): Promise<void> {
  const businessId = await requireBusinessId();
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { businessId: true },
  });
  if (!restaurant || restaurant.businessId !== businessId) {
    throw new TenantError("No autorizado.");
  }
}

/** Throws TenantError if businessId doesn't match the logged-in owner's business. */
export async function assertOwnsBusiness(businessId: string): Promise<void> {
  const ownedBusinessId = await requireBusinessId();
  if (businessId !== ownedBusinessId) throw new TenantError("No autorizado.");
}
