import type { Metadata } from "next";
import { HiChartBar, HiCalculator, HiCube, HiClock, HiPresentationChartLine, HiCurrencyDollar } from "react-icons/hi2";
import {
  FeatureHero,
  StatsBand,
  FeaturesGrid,
  CtaSection,
  type Feature,
} from "../../_components/sections";
import { SITE, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Estadísticas",
  description: "Estadísticas para restaurantes: márgenes por plato, ingrediente y proveedor, ajustados a la inflación en tiempo real.",
  path: "/funcionalidades/estadisticas",
  index: false,
});

const FEATURES: Feature[] = [
  {
    icon: HiCalculator,
    title: "Márgenes por plato",
    desc: "Sabé exactamente cuánto te deja cada plato después de costos. Identificá los ganadores y los que dan pérdida.",
  },
  {
    icon: HiCube,
    title: "Márgenes por ingrediente y proveedor",
    desc: "Descubrí qué proveedor te encarece el plato y dónde podés renegociar. Datos concretos, no sensaciones.",
  },
  {
    icon: HiClock,
    title: "Línea de tiempo de márgenes y ganancias",
    desc: "Cómo evolucionan tus márgenes semana a semana, mes a mes. Detectás tendencias antes que sea tarde.",
  },
  {
    icon: HiPresentationChartLine,
    title: "Ajustado a la inflación en tiempo real",
    desc: "Los precios cambian, la inflación no perdona. Tus márgenes se recalculan al ritmo del mercado.",
  },
  {
    icon: HiChartBar,
    title: "Comparativas y proyecciones",
    desc: "Compará contra períodos anteriores y proyectá la ganancia del mes. Para tomar decisiones, no corazonadas.",
  },
  {
    icon: HiCurrencyDollar,
    title: "Reporte de ganancia real",
    desc: "No solo facturación: ganancia neta después de costos, gastos fijos y variables. Lo que te llevás a casa.",
  },
];

const STATS = [
  { value: "+18%", label: "Margen promedio" },
  { value: "100%", label: "Datos en tiempo real" },
  { value: "0", label: "Suposiciones" },
];

export default function EstadisticasPage() {
  return (
    <main>
      <FeatureHero
        eyebrow="Funcionalidad · Estadísticas"
        title="Dejá de manejar tu restaurante a ciegas."
        lead="PlatoRest mide márgenes por plato, por ingrediente y los ajusta
          por inflación en tiempo real. Decisiones con datos, no con corazonadas."
        primaryCta={{ href: `mailto:${SITE.email}`, label: "Ver demo de estadísticas" }}
        secondaryCta={{ href: "/funcionalidades/inventario", label: "Ver inventario" }}
        imageSrc="https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=900"
        imageAlt="Gráficos y estadísticas de negocio"
      />

      <StatsBand stats={STATS} />

      <FeaturesGrid
        heading="Los números que necesitás, en el momento que los necesitás"
        subheading="Sin Excel, sin cálculos a mano, sin esperar al fin de mes para
          saber si el negocio cierra."
        features={FEATURES}
      />

      <CtaSection
        title="Conocé tu negocio de verdad"
        description="Activá el módulo de estadísticas y empezá a tomar decisiones que
          se ven reflejadas en la ganancia del mes."
        ctaLabel="Quiero ver mis números reales"
      />
    </main>
  );
}
