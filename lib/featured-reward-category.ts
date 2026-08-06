import { prisma } from "@/lib/prisma";

export const FEATURED_REWARD_CATEGORY_DEFAULT_NAME = "Premios recomendados";
export const DEFAULT_REWARD_CATEGORY_NAMES = ["Destacados", "Postres"];

export async function ensureFeaturedRewardCategory(businessId: string) {
  const existing = await prisma.rewardCategory.findFirst({
    where: { businessId, isFeatured: true },
  });
  if (!existing) {
    await prisma.rewardCategory.create({
      data: {
        businessId,
        name: FEATURED_REWARD_CATEGORY_DEFAULT_NAME,
        isFeatured: true,
        sortOrder: -1,
      },
    });
  }

  for (const name of DEFAULT_REWARD_CATEGORY_NAMES) {
    const exists = await prisma.rewardCategory.findFirst({ where: { businessId, name } });
    if (!exists) {
      await prisma.rewardCategory.create({ data: { businessId, name } });
    }
  }
}
