import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

const PRIVATE_PATHS = [
  "/dashboard",
  "/api",
  "/onboarding",
  "/menu/*/checkout",
  "/menu/*/account",
];

// Crawlers de IA permitidos explícitamente (GEO: optimización para motores
// generativos como ChatGPT, Perplexity, Claude y Google AI Overviews).
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: AI_CRAWLERS,
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
