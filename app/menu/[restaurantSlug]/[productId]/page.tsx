import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductPage } from "./product-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ restaurantSlug: string; productId: string }>;
}): Promise<Metadata> {
  const { restaurantSlug, productId } = await params;
  const product = await prisma.product.findFirst({
    where: { id: productId, active: true, restaurant: { slug: restaurantSlug } },
    select: {
      name: true,
      description: true,
      imageUrl: true,
      restaurant: { select: { name: true } },
    },
  });
  if (!product) return {};

  const title = `${product.name} | ${product.restaurant.name}`;
  const description =
    product.description ??
    `${product.name} del menú digital de ${product.restaurant.name}. Pedilo online desde tu celular.`;
  const url = `/menu/${restaurantSlug}/${productId}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      ...(product.imageUrl && { images: [{ url: product.imageUrl }] }),
    },
  };
}

export default async function MenuProductPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string; productId: string }>;
}) {
  const { restaurantSlug, productId } = await params;

  const product = await prisma.product.findFirst({
    where: { id: productId, active: true, restaurant: { slug: restaurantSlug } },
    include: {
      variants: { orderBy: { price: "asc" } },
      modifierGroups: {
        orderBy: { sortOrder: "asc" },
        include: {
          modifierGroup: {
            include: { modifiers: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });

  if (!product) notFound();

  const variant = product.variants.find((v) => v.isDefault) ?? product.variants[0];

  return (
    <ProductPage
      restaurantSlug={restaurantSlug}
      product={{
        id: product.id,
        variantId: variant?.id ?? "",
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: Number(variant?.price ?? 0),
        modifierGroups: product.modifierGroups.map((pmg) => ({
          id: pmg.modifierGroup.id,
          name: pmg.modifierGroup.name,
          required: pmg.modifierGroup.required,
          multiple: pmg.modifierGroup.multiple,
          modifiers: pmg.modifierGroup.modifiers.map((m) => ({ id: m.id, name: m.name, price: Number(m.price) })),
        })),
      }}
    />
  );
}
