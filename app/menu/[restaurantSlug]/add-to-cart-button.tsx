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
      className="shrink-0 rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover"
    >
      Agregar
    </button>
  );
}
