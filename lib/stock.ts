import { Prisma } from "@prisma/client";

export type StockCheckError = { productId: string; name: string; available: number };

// V4: validate all items have enough stock, then decrement atomically. Caller must run inside a $transaction.
export async function decrementStockOrThrow(
  tx: Prisma.TransactionClient,
  restaurantId: string,
  items: { productId: string; qty: number }[],
): Promise<StockCheckError | null> {
  for (const item of items) {
    const product = await tx.product.findUniqueOrThrow({
      where: { id: item.productId },
    });
    if (product.restaurantId !== restaurantId) {
      return { productId: item.productId, name: product.name, available: 0 };
    }
    if (product.stockQty < item.qty) {
      return { productId: item.productId, name: product.name, available: product.stockQty };
    }
  }

  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stockQty: { decrement: item.qty } },
    });
  }

  return null;
}
