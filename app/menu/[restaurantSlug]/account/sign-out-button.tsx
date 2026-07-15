"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ restaurantSlug }: { restaurantSlug: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: `/menu/${restaurantSlug}` })}
      className="mt-8 w-full rounded-lg border border-border px-4 py-2.5 font-semibold text-text-primary transition hover:bg-surface"
    >
      Cerrar sesión
    </button>
  );
}
