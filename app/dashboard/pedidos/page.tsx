import { prisma } from "@/lib/prisma";
import { PedidosClient } from "./pedidos-client";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const restaurant = await prisma.restaurant.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!restaurant) {
    return (
      <main className="p-6 text-text-secondary">
        No hay restaurantes configurados.
      </main>
    );
  }

  const orders = await prisma.order.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: { include: { product: true } },
    },
  });

  return (
    <PedidosClient
      orders={orders.map((o) => ({
        id: o.id,
        source: o.source,
        fulfillment: o.fulfillment,
        status: o.status,
        total: Number(o.total),
        createdAt: o.createdAt.toISOString(),
        customerName: o.customer?.name ?? null,
        items: o.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
        })),
      }))}
    />
  );
}
