import Link from "next/link";
import { HiCube, HiTruck, HiCalendar, HiBellAlert, HiChartPie, HiClipboardDocumentCheck } from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: HiTruck,
    title: "Inventario por proveedor",
    desc: "Cada producto sabe quién te lo vende. Compará precios y encontrá el mejor proveedor en segundos.",
  },
  {
    icon: HiCalendar,
    title: "Fechas de vencimiento en un solo lugar",
    desc: "Nunca más tires mercadería vencida. PlatoRest te avisa qué se vence primero y en qué orden usarlo.",
  },
  {
    icon: HiBellAlert,
    title: "Alertas de restock",
    desc: "Definí un mínimo por producto y recibí el aviso antes de que se corte. Tu cocina nunca se frena por falta de stock.",
  },
  {
    icon: HiChartPie,
    title: "Stock en tiempo real",
    desc: "Cada venta, cada merma, cada compra se descuenta al instante. Lo que ves, es lo que hay.",
  },
  {
    icon: HiClipboardDocumentCheck,
    title: "Conteos rápidos",
    desc: "Hacé un inventario físico en minutos desde el celular. El sistema te marca las diferencias.",
  },
  {
    icon: HiCube,
    title: "Trazabilidad completa",
    desc: "Sabé exactamente qué plato se hizo con qué lote. Clave para responder ante una auditoría o un reclamo.",
  },
];

const STATS = [
  { value: "-23%", label: "Mermas promedio" },
  { value: "100%", label: "Trazabilidad" },
  { value: "0", label: "Stock fantasma" },
];

export default function InventarioPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-orange-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="md:order-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Funcionalidad · Inventario
            </div>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
              Sabé qué tenés, qué te falta y qué se vence.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-text-secondary">
              Inventario inteligente conectado a tus ventas. PlatoRest descuenta
              cada plato vendido y te avisa cuándo reponer.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="mailto:hola@platorest.com"
                className={cn(buttonVariants({ size: "lg" }), "h-auto rounded-lg px-8 py-4 text-base shadow-lg")}
              >
                Probar inventario
              </Link>
              <Link
                href="/funcionalidades/menu-digital"
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-6 py-4 text-base font-semibold text-primary hover:bg-primary-light"
              >
                Ver menú digital
              </Link>
            </div>
          </div>
          <div className="relative md:order-1">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" aria-hidden="true" />
            <img
              src="https://images.pexels.com/photos/4483773/pexels-photo-4483773.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Almacén de restaurante con estantes"
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
              Inventario pensado para cocina, no para oficina
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Lo usan tus cocineros, no tu contador. Simple como contar, potente
              como un ERP.
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
            Dejá de perder plata en mercadería vencida
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Activá el módulo de inventario y empezá a ahorrar desde el primer
            mes.
          </p>
          <Link
            href="mailto:hola@platorest.com"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary transition hover:bg-orange-50"
          >
            Quiero controlar mi stock
          </Link>
        </div>
      </section>
    </main>
  );
}
