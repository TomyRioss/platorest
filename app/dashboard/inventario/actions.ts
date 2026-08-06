"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertOwnsRestaurant, TenantError } from "@/lib/tenant";

export type ProductInput = {
  name: string;
  description?: string;
  price: number;
  stockQty: number;
};

export async function createProduct(restaurantId: string, input: ProductInput) {
  await assertOwnsRestaurant(restaurantId);
  await prisma.product.create({
    data: {
      restaurantId,
      name: input.name,
      description: input.description || null,
      variants: {
        create: {
          name: "Único",
          price: input.price,
          stockQty: input.stockQty,
          trackStock: true,
          isDefault: true,
        },
      },
    },
  });
  revalidatePath("/dashboard/inventario");
}

export async function updateVariantStock(variantId: string, stockQty: number) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { product: { select: { restaurantId: true } } },
  });
  if (!variant) throw new TenantError("Variante no encontrada.");
  await assertOwnsRestaurant(variant.product.restaurantId);

  await prisma.productVariant.update({ where: { id: variantId }, data: { stockQty } });
  revalidatePath("/dashboard/inventario");
}

export async function toggleProductActive(productId: string, active: boolean) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { restaurantId: true },
  });
  if (!product) throw new TenantError("Producto no encontrado.");
  await assertOwnsRestaurant(product.restaurantId);

  await prisma.product.update({ where: { id: productId }, data: { active } });
  revalidatePath("/dashboard/inventario");
}
