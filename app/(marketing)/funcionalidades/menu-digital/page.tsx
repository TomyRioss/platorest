import Link from "next/link";
import { HiDeviceTablet, HiBolt, HiLanguage, HiPhoto, HiCreditCard, HiCalendarDays } from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: HiBolt,
    title: "Actualización en tiempo real",
    desc: "Cambiá precios, agregá platos o marquéalos como agotados al instante. Sin reimprimir, sin esperar.",
  },
  {
    icon: HiLanguage,
    title: "Apto para Google Maps",
    desc: "Tu menú digital indexado y enlazado desde tu ficha de Google para que los clientes te descubran.",
  },
  {
    icon: HiCalendarDays,
    title: "Reservas integradas",
    desc: "Tus clientes reservan mesa directamente desde el menú. Sin llamadas, sin WhatsApp perdido.",
  },
  {
    icon: HiPhoto,
    title: "Multi-foto por plato",
    desc: "Mostrá cada plato con varias fotos profesionales. Las fotos venden, y vos las tenés.",
  },
  {
    icon: HiCreditCard,
    title: "Pagos online y offline",
    desc: "Aceptá pagos online antes de la entrega o cobra en puerta. Vos elegís cómo trabajar.",
  },
  {
    icon: HiDeviceTablet,
    title: "Multi-idioma",
    desc: "Atendé turistas sin esfuerzo. Traducción automática y edición manual por plato.",
  },
];

const STATS = [
  { value: "0%", label: "Comisiones por pedido" },
  { value: "24/7", label: "Tu menú siempre activo" },
  { value: "< 30s", label: "Actualizar un precio" },
];

export default function MenuDigitalPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-orange-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Funcionalidad · Menú Digital
            </div>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
              Tu carta, viva en cada pantalla.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-text-secondary">
              Un menú digital que se actualiza solo, se ve increíble y se
              encuentra en Google. Tus clientes piden antes de sentarse y vos
              ya tenés el pedido listo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="mailto:hola@platorest.com"
                className={cn(buttonVariants({ size: "lg" }), "h-auto rounded-lg px-8 py-4 text-base shadow-lg")}
              >
                Probar menú demo
              </Link>
              <Link
                href="/menu/demo"
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-6 py-4 text-base font-semibold text-primary hover:bg-primary-light"
              >
                Ver ejemplo en vivo
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" aria-hidden="true" />
            <img
              src="https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Menú digital en una tablet"
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
              Todo lo que tu carta en papel nunca pudo hacer
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Diseñado para restaurantes que no quieren reimprimir su menú
              cada vez que cambia el precio del tomate.
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
            Empezá con tu menú digital hoy
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Te lo dejamos configurado en menos de 24 horas. Solo mandanos tu
            carta y nosotros la subimos.
          </p>
          <Link
            href="mailto:hola@platorest.com"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary transition hover:bg-orange-50"
          >
            Quiero mi menú digital
          </Link>
        </div>
      </section>
    </main>
  );
}
