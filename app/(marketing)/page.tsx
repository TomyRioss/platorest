import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      <header className="relative overflow-hidden bg-background pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <span className="mb-4 inline-block rounded-full border border-primary/20 bg-primary-light px-4 py-1 text-xs font-semibold tracking-wide text-primary">
              Gestión Gastronómica 2.0
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl">
              Todo tu restaurante bajo{" "}
              <span className="text-primary">un solo control.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-text-secondary">
              Optimiza desde el inventario hasta la mesa. PlatoRest es la
              herramienta definitiva para restaurantes de alto rendimiento.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu/demo"
                className="rounded-lg bg-primary px-6 py-3 text-center font-semibold text-white shadow-lg hover:bg-primary-hover"
              >
                Iniciar prueba gratis
              </Link>
              <Link
                href="/login"
                className="rounded-lg border-2 border-primary px-6 py-3 text-center font-semibold text-primary hover:bg-primary-light"
              >
                Ingresar al panel
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-xl border border-border bg-surface p-10 shadow-xl">
              <div className="flex aspect-video items-center justify-center rounded-lg bg-primary-light">
                <span className="text-sm font-medium text-primary">
                  Panel PlatoRest
                </span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden items-center gap-3 rounded-xl border border-border bg-background p-4 shadow-lg md:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                ↑
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">+24% Eficiencia</p>
                <p className="text-xs text-text-secondary">En el primer mes</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-text-primary">
              Potencia cada rincón de tu cocina
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
              Diseñado para ser tan afilado como el cuchillo de un chef.
              Funcionalidades integradas para una operación sin fricción.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="rounded-xl border border-border bg-background p-8 md:col-span-8">
              <h3 className="text-xl font-semibold text-text-primary">Smart POS</h3>
              <p className="mt-2 max-w-md text-sm text-text-secondary">
                Ventas rápidas, cierres de caja automatizados y múltiples
                métodos de pago integrados en una interfaz intuitiva.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-8 md:col-span-4">
              <h3 className="text-xl font-semibold text-text-primary">Inventario en tiempo real</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Control de stock automático con alertas antes de que falte un insumo.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-8 md:col-span-4">
              <h3 className="text-xl font-semibold text-text-primary">Mapa de mesas</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Visualizá tu salón en tiempo real. Reservas y rotación con un click.
              </p>
            </div>

            <div className="rounded-xl bg-primary p-8 text-white md:col-span-8">
              <h3 className="text-xl font-semibold">Menú digital QR</h3>
              <p className="mt-2 max-w-md text-sm text-white/90">
                Actualizá precios y platos al instante. Tus clientes piden
                desde su celular sin esperas.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/funcionalidades"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Ver todas las funcionalidades →
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold text-text-primary">
          Sumá un 24% más de eficiencia operativa
        </h2>
        <Link
          href="/precios"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
        >
          Ver planes
        </Link>
      </section>
    </main>
  );
}
