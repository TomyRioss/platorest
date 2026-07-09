"use server";

import { prisma } from "@/lib/prisma";
import { geocodeAddress, haversineKm } from "@/lib/geo";

export type CheckoutInput = {
  restaurantSlug: string;
  items: { productId: string; qty: number }[];
  fulfillment: "PICKUP" | "DELIVERY";
  deliveryAddress?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod: "CASH" | "MERCADOPAGO";
};

export type CheckoutResult =
  | { ok: true; orderId: string; total: number }
  | { ok: false; error: string };

export async function createOrder(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: input.restaurantSlug },
  });
  if (!restaurant) return { ok: false, error: "Restaurante no encontrado." };

  if (input.items.length === 0) {
    return { ok: false, error: "El carrito está vacío." };
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: input.items.map((i) => i.productId) },
      restaurantId: restaurant.id,
      active: true,
    },
  });
  if (products.length !== input.items.length) {
    return { ok: false, error: "Algún producto ya no está disponible." };
  }

  if (input.fulfillment === "DELIVERY") {
    if (!input.deliveryAddress) {
      return { ok: false, error: "Falta la dirección de entrega." };
    }
    if (restaurant.lat == null || restaurant.lng == null) {
      return {
        ok: false,
        error: "El restaurante no tiene ubicación configurada.",
      };
    }
    const dest = await geocodeAddress(input.deliveryAddress);
    if (!dest) {
      return { ok: false, error: "No se pudo ubicar la dirección." };
    }
    const distanceKm = haversineKm(
      { lat: restaurant.lat, lng: restaurant.lng },
      dest,
    );
    if (distanceKm > restaurant.deliveryRadiusKm) {
      return {
        ok: false,
        error: `Dirección fuera del radio de entrega (${restaurant.deliveryRadiusKm} km).`,
      };
    }
  }

  if (!input.customerPhone && !input.customerEmail) {
    return { ok: false, error: "Falta teléfono o email de contacto." };
  }

  let customer = await prisma.customer.findFirst({
    where: {
      restaurantId: restaurant.id,
      OR: [
        input.customerPhone ? { phone: input.customerPhone } : undefined,
        input.customerEmail ? { email: input.customerEmail } : undefined,
      ].filter((c): c is NonNullable<typeof c> => Boolean(c)),
    },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        restaurantId: restaurant.id,
        name: input.customerName,
        phone: input.customerPhone,
        email: input.customerEmail,
      },
    });
  }

  const total = input.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + Number(product.price) * item.qty;
  }, 0);

  const order = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      customerId: customer.id,
      source: "WEB",
      fulfillment: input.fulfillment,
      deliveryAddress:
        input.fulfillment === "DELIVERY" ? input.deliveryAddress : null,
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

  return { ok: true, orderId: order.id, total };
}
