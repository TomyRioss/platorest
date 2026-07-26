import { Prisma } from "@prisma/client";

export type StockCheckError = { variantId: string; name: string; available: number };

// V4: validate all items have enough stock, then decrement atomically. Caller must run inside a $transaction.
export async function decrementStockOrThrow(
  tx: Prisma.TransactionClient,
  restaurantId: string,
  items: { variantId: string; qty: number }[],
): Promise<StockCheckError | null> {
  for (const item of items) {
    const variant = await tx.productVariant.findUniqueOrThrow({
      where: { id: item.variantId },
      include: { product: true },
    });
    if (variant.product.restaurantId !== restaurantId) {
      return { variantId: item.variantId, name: variant.product.name, available: 0 };
    }
    if (variant.trackStock && (variant.stockQty ?? 0) < item.qty) {
      return { variantId: item.variantId, name: variant.product.name, available: variant.stockQty ?? 0 };
    }
  }

  for (const item of items) {
    const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: item.variantId } });
    if (variant.trackStock) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stockQty: { decrement: item.qty } },
      });
    }
  }

  return null;
}
