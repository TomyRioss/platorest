import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HiHeart, HiDeviceTablet, HiCalculator, HiCube, HiChartBar, HiSparkles } from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  buildMetadata,
  faqJsonLd,
  softwareApplicationJsonLd,
  webPageJsonLd,
} from "@/lib/seo";
import { FaqSection } from "./_components/sections";
import LeadForm from "./_components/LeadForm";

const DESCRIPTION =
  "PlatoRest es el menú digital con QR y sistema gastronómico para restaurantes en Buenos Aires y toda Argentina: carta digital, pedidos online sin comisiones, punto de venta, inventario, estadísticas y fidelización en un solo lugar.";

export const metadata: Metadata = buildMetadata({
  title: "Menú Digital con QR y Sistema Gastronómico para Restaurantes",
  description: DESCRIPTION,
  path: "/",
});

const HOME_FAQS = [
  {
    question: "¿Qué es PlatoRest?",
    answer:
      "PlatoRest es un sistema gastronómico todo-en-uno para restaurantes, desarrollado en Buenos Aires, Argentina. Incluye menú digital con código QR, pedidos online sin comisiones, punto de venta (POS), control de inventario, estadísticas y fidelización de clientes en una sola plataforma.",
  },
  {
    question: "¿Qué es un menú digital con QR para restaurantes?",
    answer:
      "Es la versión online de tu carta: el cliente escanea un código QR desde su celular, sin descargar ninguna app, y ve tus platos y precios siempre actualizados. Con PlatoRest además puede pedir, pagar y reservar desde el mismo menú digital.",
  },
  {
    question: "¿PlatoRest cobra comisiones por los pedidos online?",
    answer:
      "No. A diferencia de las apps de delivery, PlatoRest no cobra comisiones por pedido. Funciona con una suscripción mensual fija y los pedidos que recibís a través de tu menú digital son 100% tuyos.",
  },
  {
    question: "¿Funciona en Buenos Aires y en el resto de Argentina?",
    answer:
      "Sí. PlatoRest funciona en CABA, GBA y cualquier provincia de Argentina porque es 100% online. El soporte es 24/7, incluidos feriados y fines de semana, con atención presencial en CABA y Gran Buenos Aires.",
  },
  {
    question: "¿Puedo probar el menú digital antes de pagar?",
    answer:
      "Sí. Podés agendar una demo personalizada gratuita de 15 minutos o acceder a un menú de ejemplo en vivo. Te dejamos tu carta digital configurada en menos de 24 horas.",
  },
];

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

export default function LandingPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            softwareApplicationJsonLd(),
            webPageJsonLd({
              name: "Menú Digital con QR y Sistema Gastronómico para Restaurantes",
              description: DESCRIPTION,
              path: "/",
            }),
            faqJsonLd(HOME_FAQS),
          ]),
        }}
      />

      <header className="relative flex min-h-[640px] items-start justify-center overflow-hidden bg-orange-50 pt-16 pb-16 md:h-[70vh] md:pb-24">
        <div className="absolute inset-y-0 right-0 hidden h-full w-[40%] md:block">
          <Image
            src="https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Cocina de restaurante usando un sistema gastronómico"
            fill
            priority
            sizes="40vw"
            className="object-cover"
          />
        </div>

        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl items-start justify-start px-6 md:w-[60%] md:pr-40">
          <div className="max-w-xl pt-20">
            <h1 className="text-balance text-2xl font-bold leading-[1.15] tracking-tight text-primary sm:text-3xl md:text-4xl">
              Menú digital con QR y sistema gastronómico todo-en-uno para tu restaurante.
            </h1>
            <p className="mt-6 max-w-lg text-pretty text-lg text-text-secondary">
              PlatoRest te muestra el salón completo en tiempo real: quién
              está sentado, quién espera la cuenta y qué mesa se libera
              primero. Menú digital con QR, POS, inventario y fidelización.
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
                <div className="relative h-48 w-full">
                  <Image
                    src={f.image}
                    alt={`${f.title} para restaurantes - PlatoRest`}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
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
                    href="/register"
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

      <FaqSection
        heading="Preguntas frecuentes sobre PlatoRest"
        faqs={HOME_FAQS}
      />

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
