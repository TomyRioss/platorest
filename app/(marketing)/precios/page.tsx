import Link from "next/link";

const INCLUDED = [
  "Smart POS ilimitado",
  "Inventario en tiempo real",
  "Mapeo de mesas y reservas",
  "Menú QR digital",
  "Kitchen Display System",
  "Soporte 24/7",
];

export default function PreciosPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-text-primary">Precios</h1>
      <p className="mt-3 text-text-secondary">
        Un solo plan, todo incluido. Sin sorpresas.
      </p>

      <div className="mt-12 rounded border border-border bg-surface p-10">
        <p className="text-sm font-medium text-text-secondary">Plan único</p>
        <p className="mt-2 text-5xl font-bold text-text-primary">
          $40.000<span className="text-lg font-medium text-text-secondary">/mes</span>
        </p>

        <ul className="mt-8 space-y-3 text-left">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-center gap-2 text-text-primary">
              <span className="text-primary">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href="/testimonios"
          className="mt-10 inline-block rounded bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
        >
          Contactanos
        </Link>
      </div>
    </main>
  );
}
