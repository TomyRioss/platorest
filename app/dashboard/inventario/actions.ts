"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ProductInput = {
  name: string;
  description?: string;
  price: number;
  stockQty: number;
  lowStockAlertAt: number;
};

export async function createProduct(restaurantId: string, input: ProductInput) {
  await prisma.product.create({
    data: {
      restaurantId,
      name: input.name,
      description: input.description || null,
      price: input.price,
      stockQty: input.stockQty,
      lowStockAlertAt: input.lowStockAlertAt,
    },
  });
  revalidatePath("/dashboard/inventario");
}

export async function updateProduct(
  productId: string,
  input: Partial<ProductInput> & { active?: boolean },
) {
  await prisma.product.update({
    where: { id: productId },
    data: input,
  });
  revalidatePath("/dashboard/inventario");
}
