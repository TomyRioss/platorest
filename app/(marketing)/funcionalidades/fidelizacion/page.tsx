import Link from "next/link";
import { HiHeart, HiStar, HiGift, HiUserPlus, HiEnvelope, HiSparkles } from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: HiStar,
    title: "Tienda de puntos",
    desc: "Tus clientes suman puntos con cada visita y los canjean por premios. Configurás las reglas, ellos juegan.",
  },
  {
    icon: HiGift,
    title: "Regalos por visita",
    desc: "Postre gratis en la quinta visita, café en la tercera. Pequeños gestos que vuelven a la gente.",
  },
  {
    icon: HiUserPlus,
    title: "Registro de clientes",
    desc: "Una base de datos propia: nombre, contacto, cumpleaños, preferencias. Conocé a quien te visita.",
  },
  {
    icon: HiEnvelope,
    title: "Campañas por WhatsApp",
    desc: "Mandá promos, cumpleañeros o avisos a toda tu base con un click. Directo al celular del cliente.",
  },
  {
    icon: HiSparkles,
    title: "Ofertas inteligentes",
    desc: "Segmentá por comportamiento: los que no vuelven hace 30 días, los que más gastan, los nuevos. Cada mensaje llega a quien corresponde.",
  },
  {
    icon: HiHeart,
    title: "Clientes que vuelven",
    desc: "Conseguir un cliente nuevo cuesta 5x más que retener uno. La fidelización se paga sola.",
  },
];

const STATS = [
  { value: "+40%", label: "Visitas recurrentes" },
  { value: "5x", label: "Más barato que captar" },
  { value: "1 click", label: "Campaña por WhatsApp" },
];

export default function FidelizacionPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-orange-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="md:order-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Funcionalidad · Fidelización
            </div>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
              Que vuelvan, no que sea casualidad.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-text-secondary">
              Tienda de puntos, regalos automáticos y campañas por WhatsApp.
              Convertí clientes nuevos en habituales sin esfuerzo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="mailto:hola@platorest.com"
                className={cn(buttonVariants({ size: "lg" }), "h-auto rounded-lg px-8 py-4 text-base shadow-lg")}
              >
                Probar fidelización
              </Link>
              <Link
                href="/funcionalidades/menu-qr"
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary px-6 py-4 text-base font-semibold text-primary hover:bg-primary-light"
              >
                Ver menú QR
              </Link>
            </div>
          </div>
          <div className="relative md:order-1">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" aria-hidden="true" />
            <img
              src="https://images.pexels.com/photos/1304540/pexels-photo-1304540.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Cliente feliz en un restaurante"
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
              Clientes felices vuelven siempre
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Un cliente nuevo sale caro. Un cliente fidelizado sale rentable.
              Hacé cuentas y empezá hoy.
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
            Empezá a fidelizar desde hoy
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Configuramos tu tienda de puntos y te ayudamos a lanzar tu primera
            campaña. Sin costo extra.
          </p>
          <Link
            href="mailto:hola@platorest.com"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary transition hover:bg-orange-50"
          >
            Quiero fidelizar a mis clientes
          </Link>
        </div>
      </section>
    </main>
  );
}
