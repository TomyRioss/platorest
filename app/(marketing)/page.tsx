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

const COMANDAS = [
  {
    id: "128",
    table: "Delivery · Av. Corrientes 1200",
    items: ["1x Milanesa napolitana", "1x Papas fritas", "1x Coca-Cola 500ml"],
    ready: false,
    rotate: -6,
  },
  {
    id: "092",
    table: "Mesa 7 · 4 cubiertos",
    items: ["2x Bife de chorizo", "2x Ensalada mixta", "1x Malbec copa"],
    ready: false,
    rotate: 3,
  },
  {
    id: "071",
    table: "Take away · Mostrador",
    items: ["1x Pizza muzzarella", "1x Empanadas x6"],
    ready: true,
    rotate: -1,
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


      <header className="relative overflow-hidden bg-background pt-16 pb-24 md:pt-28 md:pb-32">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 md:grid-cols-2">
          <div>
            <span className="hero-ticket-stub inline-block bg-primary-light px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary">
              Sistema Todo-En-Uno para Gastronomía
            </span>
            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-5xl">
              Tu restaurante entero, en una sola pantalla.
            </h1>
            <p className="mt-6 max-w-lg text-pretty text-lg text-text-secondary">
              PlatoRest une POS, inventario, mapa de mesas y menú digital QR
              en un solo sistema. Dejá de saltar entre apps.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["POS", "Inventario", "Mesas", "Menú QR"].map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-text-secondary">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu/demo"
                className={cn(buttonVariants({ size: "lg" }), "h-auto min-h-11 rounded-lg px-8 py-4 text-lg shadow-lg")}
              >
                Iniciar prueba gratis
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-auto min-h-11 rounded-lg border-2 border-primary px-6 py-4 text-base text-primary hover:bg-primary-light hover:text-primary"
                )}
              >
                Ver demo en vivo
              </Link>
            </div>
          </div>

          <div className="relative flex h-[26rem] items-center justify-center sm:h-[30rem]">
            {COMANDAS.map((c, i) => (
              <div
                key={c.id}
                className="hero-comanda absolute w-64 rounded-sm bg-background p-5 shadow-2xl ring-1 ring-black/5"
                style={{
                  transform: `rotate(${c.rotate}deg) translateY(${i * 10}px)`,
                  zIndex: COMANDAS.length - i,
                }}
              >
                <div className="flex items-center justify-between border-b border-dashed border-border pb-3">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-secondary">
                    Comanda #{c.id}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide",
                      c.ready ? "text-success" : "text-primary"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", c.ready ? "bg-success" : "bg-primary animate-pulse")} />
                    {c.ready ? "Listo" : "En cocina"}
                  </span>
                </div>
                <p className="mt-3 font-mono text-sm font-semibold text-text-primary">{c.table}</p>
                <ul className="mt-2 space-y-1 font-mono text-xs text-text-secondary">
                  {c.items.map((item) => (
                    <li key={item} className="flex justify-between gap-2">
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="hero-ticket-stub mt-4 -mx-5 -mb-5 h-4 bg-surface" />
              </div>
            ))}
          </div>
        </div>
      </header>


      <section className="border-t border-border bg-surface px-6 py-20">
        <div data-impeccable-variants="d26e3a7b" data-impeccable-variant-count="3" style={{ display: "contents" }}>
          {/* impeccable-variants-start d26e3a7b */}
          {/* Original */}
          <div data-impeccable-variant="original">
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
          </div>
          {/* Variants: insert below this line */}
          {/* impeccable-variants-end d26e3a7b */}
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
