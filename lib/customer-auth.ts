import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getOrCreateCustomer(businessId: string) {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return null;

  let customer = await prisma.customer.findUnique({
    where: { businessId_userId: { businessId, userId: user.id } },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        businessId,
        userId: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }

  return { user, customer };
}
