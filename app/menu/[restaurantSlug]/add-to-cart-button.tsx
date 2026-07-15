"use client";

import { addToCart } from "@/lib/cart";

export function AddToCartButton({
  restaurantSlug,
  productId,
  name,
  price,
}: {
  restaurantSlug: string;
  productId: string;
  name: string;
  price: number;
}) {
  return (
    <button
      onClick={() => addToCart(restaurantSlug, { productId, name, price, qty: 1 })}
      aria-label={`Agregar ${name}`}
      className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-lg font-bold leading-none text-white shadow-sm hover:bg-primary-hover"
    >
      +
    </button>
  );
}
