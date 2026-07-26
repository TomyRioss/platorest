import type { Metadata } from "next";
import { HiQrCode, HiDevicePhoneMobile, HiBolt, HiPhoto, HiLanguage, HiShieldCheck } from "react-icons/hi2";
import {
  FeatureHero,
  StatsBand,
  FeaturesGrid,
  CtaSection,
  type Feature,
} from "../../_components/sections";
import { SITE, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Menú QR",
  description: "Código QR para restaurantes: el cliente escanea, ve la carta digital actualizada y pide sin descargar apps. Sin comisiones.",
  path: "/funcionalidades/menu-qr",
  index: false,
});

const FEATURES: Feature[] = [
  {
    icon: HiBolt,
    title: "Actualización instantánea",
    desc: "Cambiaste el precio del café o sacaste un plato del menú y ya está reflejado en todos los QR del salón.",
  },
  {
    icon: HiDevicePhoneMobile,
    title: "Sin app para descargar",
    desc: "El cliente escanea con la cámara de su celular y listo. Sin descargar nada, sin registrarse, sin fricción.",
  },
  {
    icon: HiPhoto,
    title: "Fotos que venden",
    desc: "Cada plato con su foto profesional. La gente come primero con los ojos.",
  },
  {
    icon: HiLanguage,
    title: "Multi-idioma",
    desc: "Atendé turistas sin esfuerzo. Traducción automática de tu carta.",
  },
  {
    icon: HiShieldCheck,
    title: "Pagos integrados",
    desc: "El cliente puede pedir y pagar desde el QR. Vos recibís el pedido en cocina y el pago directo.",
  },
  {
    icon: HiQrCode,
    title: "QR personalizado",
    desc: "Tu marca, tus colores. Un QR que se ve profesional, no un link genérico.",
  },
];

const STATS = [
  { value: "0%", label: "Comisiones" },
  { value: "5s", label: "Tiempo de pedido" },
  { value: "∞", label: "Reimpresiones del QR" },
];

export default function MenuQrPage() {
  return (
    <main>
      <FeatureHero
        eyebrow="Funcionalidad · Menú QR"
        title="El cliente escanea, pide y disfruta. Sin esperas."
        lead="Un QR por mesa, un menú vivo y cero comisiones. Tus comensales
          piden solos y vos los atendés mejor."
        primaryCta={{ href: `mailto:${SITE.email}`, label: "Probar el QR" }}
        secondaryCta={{ href: "/funcionalidades/menu-digital", label: "Ver menú digital" }}
        imageSrc="https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=900"
        imageAlt="Mesa de restaurante con código QR"
        imageFirst
      />

      <StatsBand stats={STATS} />

      <FeaturesGrid
        heading="La carta en papel, versión siglo XXI"
        subheading="Sin reimprimir, sin mozo que tenga que ir a buscar la carta
          actualizada, sin enojos por el precio viejo."
        features={FEATURES}
      />

      <CtaSection
        title="Imprimí un QR por mesa y listo"
        description="Te mandamos los QR personalizados por mail. Los pegás en las mesas
          y empezás a recibir pedidos en minutos."
        ctaLabel="Quiero mis QR personalizados"
      />
    </main>
  );
}
