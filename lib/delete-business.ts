import "server-only";
import { prisma } from "@/lib/prisma";

export async function deleteBusinessCompletely(businessId: string) {
  const memberships = await prisma.membership.findMany({
    where: { businessId },
    select: { userId: true },
  });
  const userIds = [...new Set(memberships.map((m) => m.userId))];

  await prisma.business.delete({ where: { id: businessId } });

  const orphanUserIds: string[] = [];
  for (const userId of userIds) {
    const remaining = await prisma.membership.count({ where: { userId } });
    if (remaining === 0) orphanUserIds.push(userId);
  }
  if (orphanUserIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: orphanUserIds } } });
  }

  return { deletedUserIds: orphanUserIds };
}
