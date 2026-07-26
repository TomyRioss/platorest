import type { Metadata } from "next";
import { HiCube, HiTruck, HiCalendar, HiBellAlert, HiChartPie, HiClipboardDocumentCheck } from "react-icons/hi2";
import {
  FeatureHero,
  StatsBand,
  FeaturesGrid,
  CtaSection,
  type Feature,
} from "../../_components/sections";
import { SITE, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Inventario",
  description: "Inventario para restaurantes conectado a las ventas: stock en tiempo real, alertas de restock y fechas de vencimiento.",
  path: "/funcionalidades/inventario",
  index: false,
});

const FEATURES: Feature[] = [
  {
    icon: HiTruck,
    title: "Inventario por proveedor",
    desc: "Cada producto sabe quién te lo vende. Compará precios y encontrá el mejor proveedor en segundos.",
  },
  {
    icon: HiCalendar,
    title: "Fechas de vencimiento en un solo lugar",
    desc: "Nunca más tires mercadería vencida. PlatoRest te avisa qué se vence primero y en qué orden usarlo.",
  },
  {
    icon: HiBellAlert,
    title: "Alertas de restock",
    desc: "Definí un mínimo por producto y recibí el aviso antes de que se corte. Tu cocina nunca se frena por falta de stock.",
  },
  {
    icon: HiChartPie,
    title: "Stock en tiempo real",
    desc: "Cada venta, cada merma, cada compra se descuenta al instante. Lo que ves, es lo que hay.",
  },
  {
    icon: HiClipboardDocumentCheck,
    title: "Conteos rápidos",
    desc: "Hacé un inventario físico en minutos desde el celular. El sistema te marca las diferencias.",
  },
  {
    icon: HiCube,
    title: "Trazabilidad completa",
    desc: "Sabé exactamente qué plato se hizo con qué lote. Clave para responder ante una auditoría o un reclamo.",
  },
];

const STATS = [
  { value: "-23%", label: "Mermas promedio" },
  { value: "100%", label: "Trazabilidad" },
  { value: "0", label: "Stock fantasma" },
];

export default function InventarioPage() {
  return (
    <main>
      <FeatureHero
        eyebrow="Funcionalidad · Inventario"
        title="Sabé qué tenés, qué te falta y qué se vence."
        lead="Inventario inteligente conectado a tus ventas. PlatoRest descuenta
          cada plato vendido y te avisa cuándo reponer."
        primaryCta={{ href: `mailto:${SITE.email}`, label: "Probar inventario" }}
        secondaryCta={{ href: "/funcionalidades/menu-digital", label: "Ver menú digital" }}
        imageSrc="https://images.pexels.com/photos/4483773/pexels-photo-4483773.jpeg?auto=compress&cs=tinysrgb&w=900"
        imageAlt="Almacén de restaurante con estantes"
        imageFirst
      />

      <StatsBand stats={STATS} />

      <FeaturesGrid
        heading="Inventario pensado para cocina, no para oficina"
        subheading="Lo usan tus cocineros, no tu contador. Simple como contar, potente
          como un ERP."
        features={FEATURES}
      />

      <CtaSection
        title="Dejá de perder plata en mercadería vencida"
        description="Activá el módulo de inventario y empezá a ahorrar desde el primer
          mes."
        ctaLabel="Quiero controlar mi stock"
      />
    </main>
  );
}
