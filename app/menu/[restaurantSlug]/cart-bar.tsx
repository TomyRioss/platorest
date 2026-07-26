"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { getCart } from "@/lib/cart";
import posthog from "posthog-js";

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
      href={`/menu/${restaurantSlug}/checkout`}
      onClick={() => posthog.capture("checkout_started", { restaurant_slug: restaurantSlug, item_count: count })}
      aria-label={`Ver pedido, ${count} producto${count !== 1 ? "s" : ""}`}
      className="fixed inset-x-4 bottom-4 z-10 mx-auto flex max-w-2xl items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white shadow-lg hover:bg-primary-hover"
    >
      <HiOutlineShoppingBag className="h-5 w-5" />
      Ver tú pedido →
    </Link>
  );
}
