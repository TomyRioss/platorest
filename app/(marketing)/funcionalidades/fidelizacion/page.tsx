import type { Metadata } from "next";
import { HiHeart, HiStar, HiGift, HiUserPlus, HiEnvelope, HiSparkles } from "react-icons/hi2";
import {
  FeatureHero,
  StatsBand,
  FeaturesGrid,
  CtaSection,
  type Feature,
} from "../../_components/sections";
import { SITE, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Fidelización",
  description: "Fidelización de clientes para restaurantes: tienda de puntos, regalos por visita y campañas por WhatsApp.",
  path: "/funcionalidades/fidelizacion",
  index: false,
});

const FEATURES: Feature[] = [
  {
    icon: HiStar,
    title: "Tienda de puntos",
    desc: "Tus clientes suman puntos con cada visita y los canjean por premios. Configurás las reglas, ellos juegan.",
  },
  {
    icon: HiGift,
    title: "Regalos por visita",
    desc: "Postre gratis en la quinta visita, café en la tercera. Pequeños gestos que vuelven a la gente.",
  },
  {
    icon: HiUserPlus,
    title: "Registro de clientes",
    desc: "Una base de datos propia: nombre, contacto, cumpleaños, preferencias. Conocé a quien te visita.",
  },
  {
    icon: HiEnvelope,
    title: "Campañas por WhatsApp",
    desc: "Mandá promos, cumpleañeros o avisos a toda tu base con un click. Directo al celular del cliente.",
  },
  {
    icon: HiSparkles,
    title: "Ofertas inteligentes",
    desc: "Segmentá por comportamiento: los que no vuelven hace 30 días, los que más gastan, los nuevos. Cada mensaje llega a quien corresponde.",
  },
  {
    icon: HiHeart,
    title: "Clientes que vuelven",
    desc: "Conseguir un cliente nuevo cuesta 5x más que retener uno. La fidelización se paga sola.",
  },
];

const STATS = [
  { value: "+40%", label: "Visitas recurrentes" },
  { value: "5x", label: "Más barato que captar" },
  { value: "1 click", label: "Campaña por WhatsApp" },
];

export default function FidelizacionPage() {
  return (
    <main>
      <FeatureHero
        eyebrow="Funcionalidad · Fidelización"
        title="Que vuelvan, no que sea casualidad."
        lead="Tienda de puntos, regalos automáticos y campañas por WhatsApp.
          Convertí clientes nuevos en habituales sin esfuerzo."
        primaryCta={{ href: `mailto:${SITE.email}`, label: "Probar fidelización" }}
        secondaryCta={{ href: "/funcionalidades/menu-qr", label: "Ver menú QR" }}
        imageSrc="https://images.pexels.com/photos/1304540/pexels-photo-1304540.jpeg?auto=compress&cs=tinysrgb&w=900"
        imageAlt="Cliente feliz en un restaurante"
        imageFirst
      />

      <StatsBand stats={STATS} />

      <FeaturesGrid
        heading="Clientes felices vuelven siempre"
        subheading="Un cliente nuevo sale caro. Un cliente fidelizado sale rentable.
          Hacé cuentas y empezá hoy."
        features={FEATURES}
      />

      <CtaSection
        title="Empezá a fidelizar desde hoy"
        description="Configuramos tu tienda de puntos y te ayudamos a lanzar tu primera
          campaña. Sin costo extra."
        ctaLabel="Quiero fidelizar a mis clientes"
      />
    </main>
  );
}
