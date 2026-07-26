import type { Metadata } from "next";
import { HiDeviceTablet, HiBolt, HiLanguage, HiPhoto, HiCreditCard, HiCalendarDays } from "react-icons/hi2";
import {
  FeatureHero,
  StatsBand,
  FeaturesGrid,
  FaqSection,
  CtaSection,
  type Feature,
} from "../../_components/sections";
import {
  SITE,
  buildMetadata,
  faqJsonLd,
  breadcrumbJsonLd,
  serviceJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

const DESCRIPTION =
  "Menú digital para restaurantes en Buenos Aires y toda Argentina. Carta QR sin comisiones, actualización de precios en tiempo real, pedidos online y reservas desde el menú. Pedí tu demo gratis.";

export const metadata: Metadata = buildMetadata({
  title: "Menú Digital para Restaurantes con QR",
  description: DESCRIPTION,
  path: "/funcionalidades/menu-digital",
  keywords: [
    "menú digital",
    "menú digital para restaurantes",
    "QR para restaurantes",
    "carta digital para restaurantes",
    "carta QR",
    "menú QR sin comisiones",
    "menú digital Buenos Aires",
    "menú digital Argentina",
  ],
});

const FEATURES: Feature[] = [
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

const FAQS = [
  {
    question: "¿Qué es un menú digital para restaurantes?",
    answer:
      "Es la versión online de tu carta: tus clientes la abren desde el celular escaneando un código QR o con un link, y siempre ven precios y platos actualizados. Con PlatoRest además pueden pedir, pagar y reservar desde el mismo menú.",
  },
  {
    question: "¿Cómo funciona el código QR para restaurantes?",
    answer:
      "Pegás un QR personalizado en cada mesa. El cliente lo escanea con la cámara de su celular, sin descargar ninguna app, y accede a tu carta digital al instante. Cualquier cambio que hagas se refleja en todos los QR al momento, sin reimprimir nada.",
  },
  {
    question: "¿El menú digital sirve para restaurantes de Buenos Aires y toda Argentina?",
    answer:
      "Sí. PlatoRest funciona en CABA, GBA y cualquier provincia de Argentina. Es 100% online, acepta pagos con MercadoPago y ofrece soporte en español, con atención presencial en CABA y GBA.",
  },
  {
    question: "¿Tengo que pagar comisiones por los pedidos online?",
    answer:
      "No. A diferencia de las apps de delivery, PlatoRest no cobra comisiones por pedido. El menú digital es parte de tu sistema gastronómico y los pedidos que recibís son 100% tuyos.",
  },
  {
    question: "¿Puedo vincular el menú digital a mi ficha de Google Maps?",
    answer:
      "Sí. Tu menú digital tiene una URL propia que podés agregar a tu ficha de Google Business Profile, así los clientes que te buscan en Google Maps ven tu carta actualizada antes de visitarte.",
  },
];

export default function MenuDigitalPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            serviceJsonLd({
              name: "Menú Digital para Restaurantes con QR",
              description: DESCRIPTION,
              path: "/funcionalidades/menu-digital",
              serviceType: "Menú digital con código QR para restaurantes",
            }),
            webPageJsonLd({
              name: "Menú Digital para Restaurantes con QR",
              description: DESCRIPTION,
              path: "/funcionalidades/menu-digital",
            }),
            faqJsonLd(FAQS),
            breadcrumbJsonLd([
              { name: "Inicio", url: "/" },
              { name: "Funcionalidades", url: "/funcionalidades/menu-digital" },
              { name: "Menú Digital", url: "/funcionalidades/menu-digital" },
            ]),
          ]),
        }}
      />

      <FeatureHero
        eyebrow="Funcionalidad · Menú Digital"
        title="Menú digital para restaurantes: tu carta viva en cada pantalla."
        lead="Un menú digital con QR que se actualiza solo, se ve increíble y se
          encuentra en Google. Tus clientes piden antes de sentarse y vos ya
          tenés el pedido listo. Sin comisiones, en Buenos Aires y toda Argentina."
        primaryCta={{ href: `mailto:${SITE.email}`, label: "Probar menú demo" }}
        secondaryCta={{ href: "/menu/demo", label: "Ver ejemplo en vivo" }}
        imageSrc="https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=900"
        imageAlt="Menú digital para restaurante con código QR en una tablet"
      />

      <StatsBand stats={STATS} />

      <FeaturesGrid
        heading="Todo lo que tu carta en papel nunca pudo hacer"
        subheading="Diseñado para restaurantes que no quieren reimprimir su menú
          cada vez que cambia el precio del tomate."
        features={FEATURES}
      />

      <FaqSection
        heading="Preguntas frecuentes sobre el menú digital"
        faqs={FAQS}
      />

      <CtaSection
        title="Empezá con tu menú digital hoy"
        description="Te lo dejamos configurado en menos de 24 horas. Solo mandanos tu
          carta y nosotros la subimos."
        ctaLabel="Quiero mi menú digital"
      />
    </main>
  );
}
