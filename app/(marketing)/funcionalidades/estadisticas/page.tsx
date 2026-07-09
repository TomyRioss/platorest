import Link from "next/link";
import { HiChartBar, HiCalculator, HiCube, HiClock, HiPresentationChartLine, HiCurrencyDollar } from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: HiCalculator,
    title: "Márgenes por plato",
    desc: "Sabé exactamente cuánto te deja cada plato después de costos. Identificá los ganadores y los que dan pérdida.",
  },
  {
    icon: HiCube,
    title: "Márgenes por ingrediente y proveedor",
    desc: "Descubrí qué proveedor te encarece el plato y dónde podés renegociar. Datos concretos, no sensaciones.",
  },
  {
    icon: HiClock,
    title: "Línea de tiempo de márgenes y ganancias",
    desc: "Cómo evolucionan tus márgenes semana a semana, mes a mes. Detectás tendencias antes que sea tarde.",
  },
  {
    icon: HiPresentationChartLine,
    title: "Ajustado a la inflación en tiempo real",
    desc: "Los precios cambian, la inflación no perdona. Tus márgenes se recalculan al ritmo del mercado.",
  },
  {
    icon: HiChartBar,
    title: "Comparativas y proyecciones",
    desc: "Compará contra períodos anteriores y proyectá la ganancia del mes. Para tomar decisiones, no corazonadas.",
  },
  {
    icon: HiCurrencyDollar,
    title: "Reporte de ganancia real",
    desc: "No solo facturación: ganancia neta después de costos, gastos fijos y variables. Lo que te llevás a casa.",
  },
];

const STATS = [
  { value: "+18%", label: "Margen promedio" },
  { value: "100%", label: "Datos en tiempo real" },
  { value: "0", label: "Suposiciones" },
];

export default function EstadisticasPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-orange-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Funcionalidad · Estadísticas
            </div>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
              Dejá de manejar tu restaurante a ciegas.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-text-secondary">
              PlatoRest mide márgenes por plato, por ingrediente y los ajusta
              por inflación en tiempo real. Decisiones con datos, no con corazonadas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="mailto:hola@platorest.com"
                className={cn(buttonVariants({ size: "lg" }), "h-auto rounded-lg px-8 py-4 text-base shadow-lg")}
              >
                Ver demo de estadísticas
              </Link>
              <Link
                href="/funcionalidades/inventario"
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-6 py-4 text-base font-semibold text-primary hover:bg-primary-light"
              >
                Ver inventario
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" aria-hidden="true" />
            <img
              src="https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Gráficos y estadísticas de negocio"
              className="relative aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface px-6 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className="text-5xl font-bold text-primary sm:text-6xl">{s.value}</p>
              <p className="mt-2 text-sm font-medium uppercase tracking-wider text-text-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl">
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Los números que necesitás, en el momento que los necesitás
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Sin Excel, sin cálculos a mano, sin esperar al fin de mes para
              saber si el negocio cierra.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="rounded-2xl border border-border bg-background p-6 transition hover:border-primary hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <f.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-text-primary">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary px-6 py-20 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Conocé tu negocio de verdad
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Activá el módulo de estadísticas y empezá a tomar decisiones que
            se ven reflejadas en la ganancia del mes.
          </p>
          <Link
            href="mailto:hola@platorest.com"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary transition hover:bg-orange-50"
          >
            Quiero ver mis números reales
          </Link>
        </div>
      </section>
    </main>
  );
}
