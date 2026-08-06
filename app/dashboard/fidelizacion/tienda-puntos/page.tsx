import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/tenant";
import { ensureFeaturedRewardCategory } from "@/lib/featured-reward-category";
import { TiendaPuntosClient } from "./tienda-puntos-client";

export const dynamic = "force-dynamic";

export default async function TiendaPuntosPage() {
  const businessId = await requireBusinessId();
  await ensureFeaturedRewardCategory(businessId);

  const categories = await prisma.rewardCategory.findMany({
    where: { businessId },
    orderBy: { sortOrder: "asc" },
    include: {
      rewards: {
        orderBy: { name: "asc" },
        include: {
          variants: true,
          modifierGroups: {
            orderBy: { sortOrder: "asc" },
            include: { modifiers: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });

  return (
    <TiendaPuntosClient
      businessId={businessId}
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        isFeatured: c.isFeatured,
        rewards: c.rewards.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          active: r.active,
          imageUrl: r.imageUrl,
          pointsCost: r.variants.find((v) => v.isDefault)?.pointsCost ?? r.variants[0]?.pointsCost ?? 0,
          variants: r.variants.map((v) => ({
            id: v.id,
            name: v.name,
            pointsCost: v.pointsCost,
            costPrice: v.costPrice ? Number(v.costPrice) : null,
            packagingPrice: v.packagingPrice ? Number(v.packagingPrice) : null,
            sku: v.sku,
            isDefault: v.isDefault,
          })),
          modifierGroups: r.modifierGroups.map((g) => ({
            id: g.id,
            name: g.name,
            required: g.required,
            multiple: g.multiple,
            modifiers: g.modifiers.map((m) => ({ id: m.id, name: m.name, pointsCost: m.pointsCost })),
          })),
        })),
      }))}
    />
  );
}
