import type { Metadata } from "next";

export const SITE = {
  name: "PlatoRest",
  url: "https://platorest.com",
  email: "hola@platorest.com",
  phone: "+5491171410652",
  whatsapp: "https://wa.me/5491171410652",
  instagram: "https://www.instagram.com/platorest.ok/",
  facebook: "https://www.facebook.com/profile.php?id=61591386167046",
  locale: "es_AR",
  language: "es-AR",
  region: "Buenos Aires, Argentina",
  city: "Buenos Aires",
  country: "Argentina",
  countryCode: "AR",
  geoRegion: "AR-B",
  geo: { lat: -34.6037, lng: -58.3816 },
  defaultOgImage: "/opengraph-image",
} as const;

export const DEFAULT_KEYWORDS = [
  "menú digital",
  "menú digital para restaurantes",
  "QR para restaurantes",
  "código QR para restaurantes",
  "carta digital",
  "carta digital para restaurantes",
  "carta QR",
  "sistema gastronómico",
  "sistema para restaurantes",
  "software para restaurantes",
  "gestión de restaurantes",
  "pedidos online restaurantes",
  "pedidos sin comisiones",
  "punto de venta para restaurantes",
  "POS gastronómico",
  "menú digital Buenos Aires",
  "menú digital Argentina",
  "carta QR Buenos Aires",
  "sistema gastronómico Argentina",
  "PlatoRest",
];

/**
 * Helper para metadata de páginas de marketing: evita duplicar
 * openGraph/twitter en cada page.tsx. Extiende con `extra` si hace falta.
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  index?: boolean;
}): Metadata {
  const url = `${SITE.url}${path}`;
  return {
    title,
    description,
    ...(keywords && { keywords }),
    alternates: {
      canonical: path,
      languages: { [SITE.language]: path },
    },
    openGraph: {
      type: "website",
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title: `${title} | ${SITE.name}`,
      description,
      images: [{ url: SITE.defaultOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE.name}`,
      description,
      images: [SITE.defaultOgImage],
    },
    ...(index ? {} : { robots: { index: false, follow: false } }),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    email: SITE.email,
    telephone: SITE.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.city,
      addressRegion: "CABA",
      addressCountry: SITE.countryCode,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "sales",
      areaServed: "AR",
      availableLanguage: ["es"],
    },
    sameAs: [SITE.instagram, SITE.facebook, SITE.whatsapp],
    areaServed: [
      { "@type": "City", name: "Buenos Aires" },
      { "@type": "Country", name: "Argentina" },
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: SITE.language,
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    url: SITE.url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: SITE.language,
    description:
      "Sistema gastronómico todo-en-uno: menú digital con QR, pedidos online sin comisiones, punto de venta, inventario y fidelización para restaurantes.",
    areaServed: [
      { "@type": "City", name: "Buenos Aires" },
      { "@type": "Country", name: "Argentina" },
    ],
    offers: {
      "@type": "Offer",
      price: "40000",
      priceCurrency: "ARS",
      description: "Suscripción mensual, todo incluido. Demo gratis disponible.",
    },
    provider: { "@id": `${SITE.url}/#organization` },
  };
}

/**
 * Schema Service para las páginas de funcionalidad: refuerza GEO
 * (servicio + zona geográfica) para buscadores y motores de IA.
 */
export function serviceJsonLd({
  name,
  description,
  path,
  serviceType,
}: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType,
    url: `${SITE.url}${path}`,
    provider: { "@id": `${SITE.url}/#organization` },
    areaServed: [
      { "@type": "City", name: "Buenos Aires" },
      { "@type": "AdministrativeArea", name: "Gran Buenos Aires" },
      { "@type": "Country", name: "Argentina" },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE.url}${path}`,
      availableLanguage: ["es"],
    },
  };
}

export function webPageJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: `${SITE.url}${path}`,
    inLanguage: SITE.language,
    isPartOf: { "@id": `${SITE.url}/#website` },
    about: { "@id": `${SITE.url}/#organization` },
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.url}`,
    })),
  };
}

/** Schema Restaurant + Menu para el menú digital público de cada local. */
export function restaurantMenuJsonLd({
  name,
  slug,
  description,
  logo,
  banner,
  address,
  lat,
  lng,
  categories,
}: {
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  categories: {
    name: string;
    products: {
      id: string;
      name: string;
      description?: string | null;
      imageUrl?: string | null;
      price: number;
    }[];
  }[];
}) {
  const url = `${SITE.url}/menu/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name,
    url,
    ...(description && { description }),
    ...(logo && { logo, image: logo }),
    ...(banner && !logo && { image: banner }),
    ...(address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: address,
        addressCountry: SITE.countryCode,
      },
    }),
    ...(lat != null && lng != null && { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng } }),
    servesCuisine: "Variada",
    hasMenu: {
      "@type": "Menu",
      url,
      hasMenuSection: categories.map((c) => ({
        "@type": "MenuSection",
        name: c.name,
        hasMenuItem: c.products.map((p) => ({
          "@type": "MenuItem",
          name: p.name,
          url: `${url}/${p.id}`,
          ...(p.description && { description: p.description }),
          ...(p.imageUrl && { image: p.imageUrl }),
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "ARS",
          },
        })),
      })),
    },
  };
}
