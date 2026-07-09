import Link from "next/link";
import { HiQrCode, HiDevicePhoneMobile, HiBolt, HiPhoto, HiLanguage, HiShieldCheck } from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: HiBolt,
    title: "Actualización instantánea",
    desc: "Cambiaste el precio del café o sacaste un plato del menú y ya está reflejado en todos los QR del salón.",
  },
  {
    icon: HiDevicePhoneMobile,
    title: "Sin app para descargar",
    desc: "El cliente escanea con la cámara de su celular y listo. Sin descargar nada, sin registrarse, sin fricción.",
  },
  {
    icon: HiPhoto,
    title: "Fotos que venden",
    desc: "Cada plato con su foto profesional. La gente come primero con los ojos.",
  },
  {
    icon: HiLanguage,
    title: "Multi-idioma",
    desc: "Atendé turistas sin esfuerzo. Traducción automática de tu carta.",
  },
  {
    icon: HiShieldCheck,
    title: "Pagos integrados",
    desc: "El cliente puede pedir y pagar desde el QR. Vos recibís el pedido en cocina y el pago directo.",
  },
  {
    icon: HiQrCode,
    title: "QR personalizado",
    desc: "Tu marca, tus colores. Un QR que se ve profesional, no un link genérico.",
  },
];

const STATS = [
  { value: "0%", label: "Comisiones" },
  { value: "5s", label: "Tiempo de pedido" },
  { value: "∞", label: "Reimpresiones del QR" },
];

export default function MenuQrPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-orange-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="md:order-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Funcionalidad · Menú QR
            </div>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
              El cliente escanea, pide y disfruta. Sin esperas.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-text-secondary">
              Un QR por mesa, un menú vivo y cero comisiones. Tus comensales
              piden solos y vos los atendés mejor.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="mailto:hola@platorest.com"
                className={cn(buttonVariants({ size: "lg" }), "h-auto rounded-lg px-8 py-4 text-base shadow-lg")}
              >
                Probar el QR
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
              src="https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Mesa de restaurante con código QR"
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
              La carta en papel, versión siglo XXI
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Sin reimprimir, sin mozo que tenga que ir a buscar la carta
              actualizada, sin enojos por el precio viejo.
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
            Imprimí un QR por mesa y listo
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Te mandamos los QR personalizados por mail. Los pegás en las mesas
            y empezás a recibir pedidos en minutos.
          </p>
          <Link
            href="mailto:hola@platorest.com"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary transition hover:bg-orange-50"
          >
            Quiero mis QR personalizados
          </Link>
        </div>
      </section>
    </main>
  );
}
