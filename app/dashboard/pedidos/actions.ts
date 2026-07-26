"use server";

import { prisma } from "@/lib/prisma";
import { decrementStockOrThrow } from "@/lib/stock";
import { pointsForTotal } from "@/lib/loyalty";
import { revalidatePath } from "next/cache";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { ok: false, error: "Pedido no encontrado." };

  try {
    await prisma.$transaction(async (tx) => {
      // V4: stock decrements when order first leaves PENDING toward fulfillment
      const advancesPastPending =
        order.status === "PENDING" &&
        ["CONFIRMED", "PREPARING", "READY", "COMPLETED"].includes(newStatus);
      if (advancesPastPending) {
        const stockError = await decrementStockOrThrow(
          tx,
          order.restaurantId,
          order.items.map((i) => ({ variantId: i.variantId, qty: i.quantity })),
        );
        if (stockError) {
          throw new Error(
            `Stock insuficiente de "${stockError.name}" (disponible: ${stockError.available}).`,
          );
        }
      }

      // V5: loyaltyPoints only awarded once, on completed paid order
      if (order.status !== "COMPLETED" && newStatus === "COMPLETED" && order.customerId) {
        const points = pointsForTotal(Number(order.total));
        if (points > 0) {
          await tx.pointsTransaction.create({
            data: { customerId: order.customerId, points, reason: "ORDER", orderId: order.id },
          });
        }
      }

      await tx.order.update({ where: { id: orderId }, data: { status: newStatus } });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al actualizar el pedido.";
    return { ok: false, error: message };
  }

  revalidatePath("/dashboard/pedidos");
  return { ok: true };
}
