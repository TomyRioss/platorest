import type { Metadata } from "next";
import { HiCalculator, HiClipboardDocumentList, HiBanknotes, HiUserGroup, HiCreditCard, HiBolt } from "react-icons/hi2";
import {
  FeatureHero,
  StatsBand,
  FeaturesGrid,
  CtaSection,
  type Feature,
} from "../../_components/sections";
import { SITE, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Punto de Venta",
  description: "Punto de venta (POS) para restaurantes: registro de pedidos, gastos, ventas por cajero y cierre de caja en un click.",
  path: "/funcionalidades/punto-de-venta",
  index: false,
});

const FEATURES: Feature[] = [
  {
    icon: HiClipboardDocumentList,
    title: "Registro de pedidos",
    desc: "Cada pedido queda asentado con mesa, mozo, hora y monto. Auditoría instantánea cuando la necesitás.",
  },
  {
    icon: HiBanknotes,
    title: "Registro de gastos",
    desc: "Cargá cuentas de luz, proveedores, sueldos. Todo queda en un solo lugar para tomar decisiones reales.",
  },
  {
    icon: HiUserGroup,
    title: "Ventas por cajero",
    desc: "Medí el rendimiento de cada cajero, sabé quién vende más y capacitá con datos, no con corazonadas.",
  },
  {
    icon: HiCreditCard,
    title: "Múltiples medios de pago",
    desc: "Efectivo, tarjeta, transferencia, MercadoPago, billeteras. Combiná como tu cliente prefiera.",
  },
  {
    icon: HiBolt,
    title: "Cierre de caja express",
    desc: "Al final del día, un click. El sistema cuadra caja, descuenta gastos y te dice la ganancia real.",
  },
  {
    icon: HiCalculator,
    title: "Pensado para la velocidad",
    desc: "Interfaz optimizada para pantallas táctiles. Tus mozos cargan pedidos en segundos, no en minutos.",
  },
];

const STATS = [
  { value: "3s", label: "Tiempo de carga promedio" },
  { value: "+30%", label: "Rotación de mesas" },
  { value: "100%", label: "Trazabilidad por pedido" },
];

export default function PuntoDeVentaPage() {
  return (
    <main>
      <FeatureHero
        eyebrow="Funcionalidad · Punto de Venta"
        title="Cobrá más rápido, sin errores y sin perder ventas."
        lead="El POS pensado para la cocina y el salón. Tus mozos cargan en
          segundos, vos cerrás la caja en un click."
        primaryCta={{ href: `mailto:${SITE.email}`, label: "Probar el POS" }}
        secondaryCta={{ href: "/funcionalidades/estadisticas", label: "Ver estadísticas" }}
        imageSrc="https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg?auto=compress&cs=tinysrgb&w=900"
        imageAlt="Sistema POS en un restaurante"
      />

      <StatsBand stats={STATS} />

      <FeaturesGrid
        heading="El POS que se adapta a cómo servís, no al revés"
        subheading="Configurable por mesa, por mostrador o por delivery. Vos elegís,
          nosotros nos adaptamos."
        features={FEATURES}
      />

      <CtaSection
        title="Tu próximo cierre de caja, en un click"
        description="Probá el POS sin compromiso. Te dejamos un sistema demo listo para
          que cargues pedidos reales hoy mismo."
        ctaLabel="Quiero probar el POS"
      />
    </main>
  );
}
