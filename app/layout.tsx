import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import { PostHogProvider } from "./providers";
import { PostHogIdentify } from "@/components/posthog-identify";
import {
  SITE,
  DEFAULT_KEYWORDS,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "PlatoRest | Menú Digital y Sistema Gastronómico para Restaurantes",
    template: "%s | PlatoRest",
  },
  description:
    "Sistema gastronómico todo-en-uno para restaurantes en Buenos Aires y toda Argentina. Menú digital con QR, pedidos online sin comisiones, punto de venta, inventario y fidelización.",
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "technology",
  alternates: {
    canonical: "/",
    languages: { [SITE.language]: "/" },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: "PlatoRest | Menú Digital y Sistema Gastronómico para Restaurantes",
    description:
      "Menú digital con QR para restaurantes, pedidos online sin comisiones, POS, inventario y fidelización. Hecho para restaurantes de Buenos Aires y toda Argentina.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlatoRest | Menú Digital y Sistema Gastronómico para Restaurantes",
    description:
      "Menú digital con QR para restaurantes, pedidos online sin comisiones, POS, inventario y fidelización. Hecho para restaurantes de Buenos Aires y toda Argentina.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": SITE.geoRegion,
    "geo.placename": SITE.region,
    "geo.position": `${SITE.geo.lat};${SITE.geo.lng}`,
    ICBM: `${SITE.geo.lat}, ${SITE.geo.lng}`,
  },
  icons: { icon: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#ff6b00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={SITE.language} className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col bg-background text-text-primary font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd(), websiteJsonLd()]),
          }}
        />
        <PostHogProvider>
          <SessionProvider>
            <PostHogIdentify />
            {children}
          </SessionProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
