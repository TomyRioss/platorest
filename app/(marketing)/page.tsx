import Link from "next/link";

const FEATURES = [
  { title: "Smart POS", desc: "Cierres rápidos, pagos integrados, interfaz intuitiva." },
  { title: "Inventario en tiempo real", desc: "Control de stock con alertas automáticas de bajo stock." },
  { title: "Mapeo de mesas", desc: "Visualización 2D de planos, reservas y rotación." },
  { title: "Menú QR digital", desc: "Actualización instantánea de precios y menús interactivos." },
  { title: "Kitchen Display System", desc: "Gestión digital de cocina, sin papeles ni errores." },
  { title: "Soporte 24/7", desc: "Soporte remoto y presencial (CABA/GBA)." },
];

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Elevando el Estándar Gastronómico
        </h1>
        <p className="mt-4 max-w-xl text-lg text-text-secondary">
          PlatoRest unifica POS, inventario, mesas y menú digital en una sola
          plataforma con precisión de chef.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/menu/demo"
            className="rounded bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
          >
            Ver menú demo
          </Link>
          <Link
            href="/login"
            className="rounded border border-border px-6 py-3 font-medium text-text-primary hover:bg-primary-light"
          >
            Ingresar al panel
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold text-text-primary">
            Todo tu restaurante, en un solo lugar
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded border border-border bg-background p-6">
                <h3 className="font-semibold text-text-primary">{f.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold text-text-primary">
          Sumá un 24% más de eficiencia operativa
        </h2>
        <Link
          href="/precios"
          className="mt-6 inline-block rounded bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
        >
          Ver planes
        </Link>
      </section>
    </main>
  );
}
