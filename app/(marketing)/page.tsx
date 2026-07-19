import Link from "next/link";
import { HiHeart, HiDeviceTablet, HiCalculator, HiCube, HiChartBar, HiSparkles } from "react-icons/hi2";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import LeadForm from "./_components/LeadForm";

const FEATURES = [
  {
    icon: HiHeart,
    title: "Fidelización",
    image: "https://images.pexels.com/photos/1304540/pexels-photo-1304540.jpeg?auto=compress&cs=tinysrgb&w=800",
    items: [
      "Tienda de puntos",
      "Regalos por visita",
      "Registro de clientes",
    ],
  },
  {
    icon: HiDeviceTablet,
    title: "Menú digital",
    image: "https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=800",
    items: [
      "Pedidos online sin comisiones",
      "Menú digital apto para Google Maps",
      "Reservas desde el menú digital",
    ],
  },
  {
    icon: HiCalculator,
    title: "POS punto de venta",
    image: "https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg?auto=compress&cs=tinysrgb&w=800",
    items: [
      "Registro de pedidos",
      "Registro de gastos",
      "Ventas por cajero",
    ],
  },
  {
    icon: HiCube,
    title: "Inventario",
    image: "https://images.pexels.com/photos/4483773/pexels-photo-4483773.jpeg?auto=compress&cs=tinysrgb&w=800",
    items: [
      "Inventario por proveedor",
      "Fechas de vencimiento en un solo lugar",
      "Stock y alertas de restock",
    ],
  },
  {
    icon: HiChartBar,
    title: "Estadísticas",
    image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800",
    items: [
      "Márgenes por plato",
      "Márgenes por ingredientes y proveedor",
      "Línea de tiempo de márgenes y ganancias",
      "Márgenes ajustado a la inflación en tiempo real",
    ],
  },
  {
    icon: HiSparkles,
    title: "Próximamente",
    image: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800",
    items: [
      "Pedidos a cocina",
      "App para mozos",
      "Gestión de mesas con IA",
      "Manejo de WhatsApp con IA",
      "Y mucho más...",
    ],
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


      <header className="relative flex min-h-[640px] items-start justify-center overflow-hidden bg-orange-50 pt-16 pb-16 md:h-[70vh] md:pb-24">
        <img
          src="https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Cocina de restaurante"
          className="absolute inset-y-0 right-0 hidden h-full w-[40%] object-cover md:block"
        />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl items-start justify-start px-6 md:w-[60%] md:pr-40">
          <div className="max-w-xl pt-20">
            <h1 className="text-balance text-2xl font-bold leading-[1.15] tracking-tight text-primary sm:text-3xl md:text-4xl">
              El único sistema que necesitas, todo-en-uno para restaurantes.
            </h1>
            <p className="mt-6 max-w-lg text-pretty text-lg text-text-secondary">
              PlatoRest te muestra el salón completo en tiempo real: quién
              está sentado, quién espera la cuenta y qué mesa se libera
              primero.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#contacto"
                className={cn(buttonVariants({ size: "lg" }), "h-auto min-h-11 rounded-lg px-8 py-4 text-lg shadow-lg")}
              >
                Agendar demo
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-auto min-h-11 rounded-lg border-2 border-primary px-6 py-4 text-base text-primary hover:bg-primary-light hover:text-primary"
                )}
              >
                Acceder ahora
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-1 left-0 right-0 h-24 rounded-t-[100%] bg-surface md:h-32" />
      </header>


      <section className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-primary md:text-4xl">
              ¡Gestiona todo desde un solo lugar!
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="overflow-hidden rounded-xl border border-border bg-background"
              >
                <img
                  src={f.image}
                  alt={f.title}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
                <CardContent className="p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <f.icon className="h-6 w-6" aria-hidden="true" />
                    {f.title}
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {f.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-text-primary">
                        <span className="mt-0.5 text-green-500">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {process.env.NEXT_PUBLIC_SHOW_PRICING === "true" && (
        <section className="px-6 py-32">
          <div className="mx-auto max-w-6xl">
            <Card className="relative overflow-hidden rounded-3xl border-2 border-primary p-16 shadow-xl md:p-20">
              <CardContent className="grid grid-cols-1 items-center gap-12 p-0 lg:grid-cols-2">
                <div>
                  <h2 className="text-4xl font-bold text-primary underline decoration-primary/40 underline-offset-8 sm:text-5xl">
                    Plan fundadores
                  </h2>
                  <ul className="mt-8 space-y-4 text-xl">
                    <li className="flex items-start gap-3 text-text-primary">
                      <span className="mt-1 text-primary">✓</span>
                      <span>Soporte 24/7 feriados y fines de semana</span>
                    </li>
                    <li className="flex items-start gap-3 text-text-primary">
                      <span className="mt-1 text-primary">✓</span>
                      <span>Soporte Presencial CABA y GBA</span>
                    </li>
                    <li className="flex items-start gap-3 text-text-primary">
                      <span className="mt-1 text-primary">✓</span>
                      <span>Todas las funcionalidades actuales y futuras</span>
                    </li>
                  </ul>
                  <p className="mt-6 text-base text-text-secondary">
                    Tiempo limitado, solo para nuestros primeros 100 clientes.
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-6xl font-bold text-primary">
                    $40.000<span className="text-2xl font-medium text-text-secondary">/mes</span>
                  </p>
                  <Link
                    href="/precios"
                    className={cn(buttonVariants({ size: "lg" }), "mt-8 h-auto w-full rounded-lg px-6 py-4 text-lg")}
                  >
                    PROBALO GRATIS
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <section id="contacto" className="bg-primary px-6 py-24 text-white scroll-mt-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Potencia tu restaurante hoy</h2>
            <p className="mt-4 max-w-md text-white/80">
              Déjanos tus datos y te llamaremos para darte una demo personalizada de 15 minutos.
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
