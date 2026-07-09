"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart } from "@/lib/cart";

export function CartBar({ restaurantSlug }: { restaurantSlug: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function sync() {
      const cart = getCart();
      const total =
        cart && cart.restaurantSlug === restaurantSlug
          ? cart.items.reduce((sum, i) => sum + i.qty, 0)
          : 0;
      setCount(total);
    }
    sync();
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, [restaurantSlug]);

  if (count === 0) return null;

  return (
    <Link
      href="/checkout"
      className="fixed inset-x-4 bottom-4 z-10 mx-auto flex max-w-2xl items-center justify-between rounded-lg bg-primary px-4 py-3 font-medium text-white shadow-lg hover:bg-primary-hover"
    >
      <span>{count} producto{count !== 1 ? "s" : ""} en el carrito</span>
      <span>Ver pedido →</span>
    </Link>
  );
}
