import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "./add-to-cart-button";
import { CartBar } from "./cart-bar";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: {
      products: {
        where: { active: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!restaurant) notFound();

  return (
    <main className="min-h-screen bg-surface pb-16">
      <header className="border-b border-border bg-background px-4 py-6">
        <h1 className="text-2xl font-semibold text-text-primary">
          {restaurant.name}
        </h1>
        <p className="text-sm text-text-secondary">{restaurant.address}</p>
      </header>

      <ul className="mx-auto max-w-2xl divide-y divide-border px-4">
        {restaurant.products.length === 0 && (
          <li className="py-8 text-center text-text-secondary">
            Sin productos disponibles por el momento.
          </li>
        )}
        {restaurant.products.map((product) => (
          <li key={product.id} className="flex items-center gap-4 py-4">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded object-cover"
              />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded bg-primary-light" />
            )}
            <div className="flex-1">
              <p className="font-medium text-text-primary">{product.name}</p>
              {product.description && (
                <p className="text-sm text-text-secondary">
                  {product.description}
                </p>
              )}
            </div>
            <p className="font-semibold text-primary">
              ${product.price.toString()}
            </p>
            <AddToCartButton
              restaurantSlug={restaurant.slug}
              productId={product.id}
              name={product.name}
              price={Number(product.price)}
            />
          </li>
        ))}
      </ul>

      <CartBar restaurantSlug={restaurant.slug} />
    </main>
  );
}
