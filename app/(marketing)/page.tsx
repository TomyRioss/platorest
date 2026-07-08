import Link from "next/link";
import { CreditCard, Package, UtensilsCrossed, QrCode } from "lucide-react";
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

type TableState = "free" | "occupied" | "reserved";

const FLOOR_TABLES: { id: number; seats: number; state: TableState }[] = [
  { id: 1, seats: 2, state: "occupied" },
  { id: 2, seats: 4, state: "free" },
  { id: 3, seats: 4, state: "occupied" },
  { id: 4, seats: 2, state: "reserved" },
  { id: 5, seats: 6, state: "occupied" },
  { id: 6, seats: 2, state: "free" },
  { id: 7, seats: 4, state: "free" },
  { id: 8, seats: 4, state: "occupied" },
  { id: 9, seats: 2, state: "reserved" },
];

const TABLE_STATE_STYLES: Record<TableState, string> = {
  free: "border-2 border-border bg-background text-text-secondary",
  occupied: "bg-primary text-white",
  reserved: "border-2 border-dashed border-primary bg-primary-light text-primary",
};

const INCLUDED = [
  "Soporte 24/7 en español",
  "Usuarios ilimitados",
  "Actualizaciones gratuitas de por vida",
];

export default function LandingPage() {
  return (
    <main>


      <header className="bg-background pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-secondary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Salón en vivo, sin planillas
            </div>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-5xl">
              Sabés qué pasa en cada mesa sin pararte de la caja.
            </h1>
            <p className="mt-6 max-w-lg text-pretty text-lg text-text-secondary">
              PlatoRest te muestra el salón completo en tiempo real: quién
              está sentado, quién espera la cuenta y qué mesa se libera
              primero.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu/demo"
                className={cn(buttonVariants({ size: "lg" }), "h-auto min-h-11 rounded-lg px-8 py-4 text-lg shadow-lg")}
              >
                Demo gratis
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-auto min-h-11 rounded-lg border-2 border-primary px-6 py-4 text-base text-primary hover:bg-primary-light hover:text-primary"
                )}
              >
                Iniciar sesión
              </Link>
            </div>
          </div>

          <Card className="rounded-2xl border border-border p-6 shadow-xl">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">Salón Principal</p>
                  <p className="text-xs text-text-secondary">Turno noche · Sábado</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  En vivo
                </span>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                {FLOOR_TABLES.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-bold transition-transform hover:scale-105",
                      TABLE_STATE_STYLES[t.state]
                    )}
                  >
                    <span>M{t.id}</span>
                    <span className="text-[10px] font-medium opacity-80">{t.seats}p</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm border-2 border-border bg-background" /> Libre
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-primary" /> Ocupada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm border-2 border-dashed border-primary bg-primary-light" /> Reservada
                </span>
              </div>
            </CardContent>
          </Card>
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
                <CardContent className="flex items-center gap-4 p-0">
                  <div
                    className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg",
                      f.accent ? "bg-white/20" : "bg-primary-light"
                    )}
                  >
                    {f.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={cn("truncate text-xl font-semibold", f.accent ? "text-white" : "text-text-primary")}>
                      {f.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-1 truncate text-sm",
                        f.accent ? "text-white/90" : "text-text-secondary"
                      )}
                    >
                      {f.desc}
                    </p>
                  </div>
                  <img
                    src={f.image}
                    alt={f.title}
                    className="hidden h-16 w-16 flex-shrink-0 rounded-lg object-cover sm:block"
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
