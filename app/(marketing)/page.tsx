import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import LeadForm from "./_components/LeadForm";

const FEATURES = [
  {
    icon: "💳",
    title: "Smart POS",
    desc: "Ventas rápidas, cierres de caja automatizados y múltiples métodos de pago integrados en una interfaz intuitiva.",
    image: "https://images.pexels.com/photos/12935074/pexels-photo-12935074.jpeg?auto=compress&cs=tinysrgb&w=800",
    span: "md:col-span-8",
    accent: false,
  },
  {
    icon: "📦",
    title: "Inventario en tiempo real",
    desc: "Control de stock automático con alertas antes de que falte un insumo.",
    image: "https://images.pexels.com/photos/4483773/pexels-photo-4483773.jpeg?auto=compress&cs=tinysrgb&w=800",
    span: "md:col-span-4",
    accent: false,
  },
  {
    icon: "🍽️",
    title: "Mapa de mesas",
    desc: "Visualizá tu salón en tiempo real. Reservas y rotación con un click.",
    image: "https://images.pexels.com/photos/776538/pexels-photo-776538.jpeg?auto=compress&cs=tinysrgb&w=800",
    span: "md:col-span-4",
    accent: false,
  },
  {
    icon: "📱",
    title: "Menú digital QR",
    desc: "Actualizá precios y platos al instante. Tus clientes piden desde su celular sin esperas.",
    image: "https://images.pexels.com/photos/12935064/pexels-photo-12935064.jpeg?auto=compress&cs=tinysrgb&w=800",
    span: "md:col-span-8",
    accent: true,
  },
];

const INCLUDED = [
  "Soporte 24/7 en español",
  "Usuarios ilimitados",
  "Actualizaciones gratuitas de por vida",
];

export default function LandingPage() {
  return (
    <main>
      <header className="relative overflow-hidden bg-background pt-16 pb-20 md:pt-32 md:pb-40">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <Badge className="mb-4 bg-primary-light text-primary hover:bg-primary-light">
              Gestión Gastronómica 2.0
            </Badge>
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
                className={cn(buttonVariants({ size: "lg" }), "h-auto rounded-lg px-6 py-3 text-base shadow-lg")}
              >
                Iniciar prueba gratis
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-auto rounded-lg border-2 border-primary px-6 py-3 text-base text-primary hover:bg-primary-light hover:text-primary"
                )}
              >
                Ingresar al panel
              </Link>
            </div>
          </div>

          <div className="relative">
            <Card className="overflow-hidden rounded-xl border border-border p-0 shadow-xl">
              <CardContent className="p-0">
                <img
                  src="https://images.pexels.com/photos/2544829/pexels-photo-2544829.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Chef trabajando en cocina de restaurante"
                  className="aspect-[4/3] w-full object-cover"
                  loading="eager"
                />
              </CardContent>
            </Card>
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
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className={cn(
                  "rounded-xl border border-border p-8",
                  f.span,
                  f.accent && "border-transparent bg-primary text-white"
                )}
              >
                <CardContent className="flex items-center gap-6 p-0">
                  <div className="flex-1">
                    <div
                      className={cn(
                        "mb-3 flex h-10 w-10 items-center justify-center rounded-full text-lg",
                        f.accent ? "bg-white/20" : "bg-primary-light"
                      )}
                    >
                      {f.icon}
                    </div>
                    <h3 className={cn("text-xl font-semibold", f.accent ? "text-white" : "text-text-primary")}>
                      {f.title}
                    </h3>
                    <p className={cn("mt-2 max-w-md text-sm", f.accent ? "text-white/90" : "text-text-secondary")}>
                      {f.desc}
                    </p>
                  </div>
                  <img
                    src={f.image}
                    alt={f.title}
                    className="hidden h-24 w-24 flex-shrink-0 rounded-lg object-cover sm:block"
                    loading="lazy"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/funcionalidades" className="font-semibold text-primary hover:text-primary-hover">
              Ver todas las funcionalidades →
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Card className="relative overflow-hidden rounded-3xl border-4 border-primary p-8 shadow-xl md:p-12">
            <Badge className="absolute right-0 top-0 rounded-none rounded-bl-3xl bg-primary px-4 py-2 text-white hover:bg-primary">
              RECOMENDADO
            </Badge>
            <CardContent className="grid grid-cols-1 items-center gap-10 p-0 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
                  Un solo plan, <br />
                  <span className="text-primary">todo el poder.</span>
                </h2>
                <p className="mt-4 text-lg text-text-secondary">
                  Sin sorpresas ni costos ocultos. Acceso total a todas las
                  herramientas que tu restaurante necesita para crecer.
                </p>
                <ul className="mt-6 space-y-2">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-text-primary">
                      <span className="text-primary">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-8 text-center lg:text-right">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  Suscripción mensual
                </p>
                <p className="mt-2 text-4xl font-bold text-primary">
                  $40.000<span className="text-lg font-medium text-text-secondary">/mes</span>
                </p>
                <p className="mt-2 text-sm font-semibold text-primary">
                  Todo incluido, sin cargos por transacción.
                </p>
                <Link
                  href="/precios"
                  className={cn(buttonVariants({ size: "lg" }), "mt-6 h-auto w-full rounded-lg px-6 py-3 text-base")}
                >
                  Activar plan ahora
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-primary px-6 py-24 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Potencia tu restaurante hoy</h2>
            <p className="mt-4 max-w-md text-white/80">
              Dejanos tus datos y un especialista en sistemas gastronómicos te
              contactará para una demo personalizada de 15 minutos.
            </p>
          </div>

          <Card className="rounded-2xl border-0 p-8 shadow-2xl">
            <CardContent className="p-0">
              <LeadForm />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
