"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ProductInput = {
  name: string;
  description?: string;
  price: number;
  stockQty: number;
};

export async function createProduct(restaurantId: string, input: ProductInput) {
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
  await prisma.productVariant.update({ where: { id: variantId }, data: { stockQty } });
  revalidatePath("/dashboard/inventario");
}

export async function toggleProductActive(productId: string, active: boolean) {
  await prisma.product.update({ where: { id: productId }, data: { active } });
  revalidatePath("/dashboard/inventario");
}
