import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

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

  const customers = await prisma.customer.findMany({
    where: {
      restaurantId: restaurant.id,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-xl font-semibold text-text-primary">
          Clientes
        </h1>

        <form className="mb-4">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre, teléfono o email"
            className="w-full rounded border border-border px-3 py-2 outline-none focus:border-primary"
          />
        </form>

        <ul className="divide-y divide-border rounded-lg border border-border bg-background">
          {customers.length === 0 && (
            <li className="p-4 text-sm text-text-secondary">
              Sin clientes todavía.
            </li>
          )}
          {customers.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/clientes/${c.id}`}
                className="flex items-center justify-between p-4 hover:bg-surface"
              >
                <div>
                  <p className="font-medium text-text-primary">{c.name}</p>
                  <p className="text-sm text-text-secondary">
                    {[c.phone, c.email].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium text-primary">
                    {c.loyaltyPoints} pts
                  </p>
                  <p className="text-text-secondary">
                    {c._count.orders} pedido{c._count.orders !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
