import { prisma } from "@/lib/prisma";

export const FEATURED_CATEGORY_DEFAULT_NAME = "Platos recomendados";

export async function ensureFeaturedCategory(restaurantId: string) {
  const existing = await prisma.category.findFirst({
    where: { restaurantId, isFeatured: true },
  });
  if (existing) return existing;
  return prisma.category.create({
    data: {
      restaurantId,
      name: FEATURED_CATEGORY_DEFAULT_NAME,
      isFeatured: true,
      sortOrder: -1,
    },
  });
}
