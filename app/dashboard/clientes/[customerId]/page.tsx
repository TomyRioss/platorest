import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      },
    },
  });
  if (!customer) notFound();

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard/clientes" className="text-sm text-primary">
          ← Clientes
        </Link>

        <div className="my-4 rounded-lg border border-border bg-background p-4">
          <h1 className="text-xl font-semibold text-text-primary">
            {customer.name}
          </h1>
          <p className="text-text-secondary">
            {[customer.phone, customer.email].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-2 font-medium text-primary">
            {customer.loyaltyPoints} puntos
          </p>
        </div>

        <h2 className="mb-2 font-semibold text-text-primary">
          Historial de pedidos
        </h2>
        <ul className="divide-y divide-border rounded-lg border border-border bg-background">
          {customer.orders.length === 0 && (
            <li className="p-4 text-sm text-text-secondary">Sin pedidos.</li>
          )}
          {customer.orders.map((order) => (
            <li key={order.id} className="p-4">
              <div className="flex justify-between text-sm text-text-secondary">
                <span>{order.createdAt.toLocaleString("es-AR")}</span>
                <span>{order.source} · {order.status}</span>
              </div>
              <ul className="mt-1 text-text-primary">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.product.name}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-right font-medium text-text-primary">
                Total: ${order.total.toString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
