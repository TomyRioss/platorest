import Link from "next/link";
import { HiCalculator, HiClipboardDocumentList, HiBanknotes, HiUserGroup, HiCreditCard, HiBolt } from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: HiClipboardDocumentList,
    title: "Registro de pedidos",
    desc: "Cada pedido queda asentado con mesa, mozo, hora y monto. Auditoría instantánea cuando la necesitás.",
  },
  {
    icon: HiBanknotes,
    title: "Registro de gastos",
    desc: "Cargá cuentas de luz, proveedores, sueldos. Todo queda en un solo lugar para tomar decisiones reales.",
  },
  {
    icon: HiUserGroup,
    title: "Ventas por cajero",
    desc: "Medí el rendimiento de cada cajero, sabé quién vende más y capacitá con datos, no con corazonadas.",
  },
  {
    icon: HiCreditCard,
    title: "Múltiples medios de pago",
    desc: "Efectivo, tarjeta, transferencia, MercadoPago, billeteras. Combiná como tu cliente prefiera.",
  },
  {
    icon: HiBolt,
    title: "Cierre de caja express",
    desc: "Al final del día, un click. El sistema cuadra caja, descuenta gastos y te dice la ganancia real.",
  },
  {
    icon: HiCalculator,
    title: "Pensado para la velocidad",
    desc: "Interfaz optimizada para pantallas táctiles. Tus mozos cargan pedidos en segundos, no en minutos.",
  },
];

const STATS = [
  { value: "3s", label: "Tiempo de carga promedio" },
  { value: "+30%", label: "Rotación de mesas" },
  { value: "100%", label: "Trazabilidad por pedido" },
];

export default function PuntoDeVentaPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-orange-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Funcionalidad · Punto de Venta
            </div>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
              Cobrá más rápido, sin errores y sin perder ventas.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-text-secondary">
              El POS pensado para la cocina y el salón. Tus mozos cargan en
              segundos, vos cerrás la caja en un click.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="mailto:hola@platorest.com"
                className={cn(buttonVariants({ size: "lg" }), "h-auto rounded-lg px-8 py-4 text-base shadow-lg")}
              >
                Probar el POS
              </Link>
              <Link
                href="/funcionalidades/estadisticas"
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-6 py-4 text-base font-semibold text-primary hover:bg-primary-light"
              >
                Ver estadísticas
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" aria-hidden="true" />
            <img
              src="https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Sistema POS en un restaurante"
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
              El POS que se adapta a cómo servís, no al revés
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Configurable por mesa, por mostrador o por delivery. Vos elegís,
              nosotros nos adaptamos.
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
            Tu próximo cierre de caja, en un click
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Probá el POS sin compromiso. Te dejamos un sistema demo listo para
            que cargues pedidos reales hoy mismo.
          </p>
          <Link
            href="mailto:hola@platorest.com"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary transition hover:bg-orange-50"
          >
            Quiero probar el POS
          </Link>
        </div>
      </section>
    </main>
  );
}
