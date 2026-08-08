import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/tenant";
import { PedidosClient } from "./pedidos-client";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const businessId = await requireBusinessId();
  const restaurant = await prisma.restaurant.findFirst({
    where: { businessId },
    orderBy: { createdAt: "asc" },
  });
  if (!restaurant) {
    return (
      <main className="p-6 text-text-secondary">
        No hay restaurantes configurados.
      </main>
    );
  }

  const [orders, products] = await Promise.all([
    prisma.order.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: { include: { variant: { include: { product: true } } } },
      },
    }),
    prisma.product.findMany({
      where: { restaurantId: restaurant.id, active: true },
      include: { variants: true },
      orderBy: { name: "asc" },
    }),
  ]);

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
          variantId: i.variantId,
          name: i.variant.product.name,
          variantName: i.variant.name,
          quantity: i.quantity,
        })),
      }))}
      catalog={products.flatMap((p) =>
        p.variants.map((v) => ({
          variantId: v.id,
          productName: p.name,
          variantName: v.name,
          price: Number(v.price),
        })),
      )}
    />
  );
}
