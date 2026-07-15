"use server";

import { prisma } from "@/lib/prisma";
import { decrementStockOrThrow } from "@/lib/stock";
import { pointsForTotal } from "@/lib/loyalty";

export type PosOrderInput = {
  restaurantId: string;
  items: { productId: string; qty: number }[];
  paymentMethod: "CASH" | "MERCADOPAGO";
  customerPhone?: string;
  customerEmail?: string;
};

export type PosOrderResult =
  | { ok: true; orderId: string; total: number }
  | { ok: false; error: string };

export async function createPosOrder(
  input: PosOrderInput,
): Promise<PosOrderResult> {
  if (input.items.length === 0) {
    return { ok: false, error: "Agregá al menos un producto." };
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: input.items.map((i) => i.productId) },
      restaurantId: input.restaurantId,
      active: true,
    },
  });
  if (products.length !== input.items.length) {
    return { ok: false, error: "Algún producto ya no está disponible." };
  }

  let customerId: string | undefined;
  if (input.customerPhone || input.customerEmail) {
    let customer = await prisma.customer.findFirst({
      where: {
        restaurantId: input.restaurantId,
        OR: [
          input.customerPhone ? { phone: input.customerPhone } : undefined,
          input.customerEmail ? { email: input.customerEmail } : undefined,
        ].filter((c): c is NonNullable<typeof c> => Boolean(c)),
      },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          restaurantId: input.restaurantId,
          name: "Cliente mostrador",
          phone: input.customerPhone,
          email: input.customerEmail,
        },
      });
    }
    customerId = customer.id;
  }

  const total = input.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + Number(product.price) * item.qty;
  }, 0);

  const result = await prisma.$transaction(async (tx) => {
    const stockError = await decrementStockOrThrow(
      tx,
      input.restaurantId,
      input.items,
    );
    if (stockError) {
      return {
        ok: false as const,
        error: `Stock insuficiente de "${stockError.name}" (disponible: ${stockError.available}).`,
      };
    }

    const order = await tx.order.create({
      data: {
        restaurantId: input.restaurantId,
        customerId,
        source: "POS",
        fulfillment: "PICKUP",
        status: "COMPLETED",
        paymentMethod: input.paymentMethod,
        total,
        items: {
          create: input.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: product.id,
              quantity: item.qty,
              unitPrice: product.price,
            };
          }),
        },
      },
    });

    // V5: loyaltyPoints only awarded on completed paid order — POS orders are created COMPLETED
    if (customerId) {
      await tx.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: pointsForTotal(total) } },
      });
    }

    return { ok: true as const, orderId: order.id, total };
  });

  return result;
}
