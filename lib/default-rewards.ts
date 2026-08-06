import { prisma } from "@/lib/prisma";

export type DefaultReward = {
  categoryName: string;
  name: string;
  description: string;
  pointsCost: number;
};

export const DEFAULT_REWARD_CATEGORY = "Premios";

export const DEFAULT_REWARDS: DefaultReward[] = [
  {
    categoryName: DEFAULT_REWARD_CATEGORY,
    name: "Coca-Cola",
    description: "Gaseosa 500ml.",
    pointsCost: 500,
  },
  {
    categoryName: DEFAULT_REWARD_CATEGORY,
    name: "Medialuna",
    description: "Medialuna dulce recién horneada.",
    pointsCost: 300,
  },
];

export async function seedDefaultRewards(businessId: string) {
  const category = await prisma.rewardCategory.create({
    data: { businessId, name: DEFAULT_REWARD_CATEGORY },
  });

  for (const r of DEFAULT_REWARDS) {
    await prisma.reward.create({
      data: {
        businessId,
        categoryId: category.id,
        name: r.name,
        description: r.description,
        variants: {
          create: { name: "Único", pointsCost: r.pointsCost, isDefault: true },
        },
      },
    });
  }
}
