import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const businessId = await requireBusinessId();

  const customers = await prisma.customer.findMany({
    where: {
      businessId,
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
    include: {
      _count: { select: { orders: true } },
      pointsTransactions: { select: { points: true } },
    },
  });

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
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
          <li key={c.id} className="flex items-center">
            <Link
              href={`/dashboard/clientes/${c.id}`}
              className="flex flex-1 min-w-0 items-center justify-between p-4 hover:bg-surface"
            >
              <div className="min-w-0">
                <p className="font-medium text-text-primary">{c.name}</p>
                <p className="truncate text-sm text-text-secondary">
                  {[c.phone, c.email].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="shrink-0 pl-3 text-right text-sm">
                <p className="font-medium text-primary">
                  {c.pointsTransactions.reduce((sum, t) => sum + t.points, 0)} pts
                </p>
                <p className="text-text-secondary">
                  {c._count.orders} pedido{c._count.orders !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
            {c.phone && (
              <a
                href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mr-4 shrink-0 rounded-full p-2 text-text-secondary hover:bg-surface"
                aria-label={`WhatsApp a ${c.name}`}
              >
                <FaWhatsapp size={20} />
              </a>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
