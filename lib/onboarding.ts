import "server-only";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PRODUCTS } from "@/lib/default-products";

const DEFAULT_PRODUCT_IMAGE_URLS = DEFAULT_PRODUCTS.map((p) => p.imageUrl);

export type OnboardingStep = { label: string; href: string; done: boolean };
export type OnboardingProgress = { steps: OnboardingStep[]; percent: number };

/** Onboarding progress derived live from existing data (no extra state stored). Returns null once complete. */
export async function getOnboardingProgress(
  businessId: string,
  restaurantId: string | null
): Promise<OnboardingProgress | null> {
  if (!restaurantId) return null;

  const [productCount, restaurant, whatsapp, hoursCount] = await Promise.all([
    prisma.product.count({
      where: { restaurantId, imageUrl: { notIn: DEFAULT_PRODUCT_IMAGE_URLS } },
    }),
    prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { logo: true, address: true } }),
    prisma.socialLink.findFirst({ where: { businessId, platform: "WHATSAPP" } }),
    prisma.openingHours.count({ where: { restaurantId } }),
  ]);

  const steps: OnboardingStep[] = [
    { label: "Subí tu primer producto", href: "/dashboard/menu", done: productCount > 0 },
    { label: "Subí tu logo", href: "/dashboard/menu/landing", done: !!restaurant?.logo },
    { label: "Poné tu número de teléfono", href: "/dashboard/menu/landing", done: !!whatsapp },
    { label: "Configurá tu horario", href: "/dashboard/menu/landing", done: hoursCount > 0 },
    { label: "Poné tu dirección", href: "/dashboard/menu/landing", done: !!restaurant?.address },
  ];

  const percent = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);
  if (percent === 100) return null;

  return { steps, percent };
}
