"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { HiUserCircle, HiShare } from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa6";

export function MenuNavbar({
  restaurantSlug,
  restaurantName,
  isCustomerSession,
  whatsappNumber,
}: {
  restaurantSlug: string;
  restaurantName: string;
  isCustomerSession: boolean;
  whatsappNumber: string | null;
}) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      await navigator.share({ title: restaurantName, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => {});
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-background px-4 py-2.5">
      <span className="truncate text-sm font-semibold text-text-primary">{restaurantName}</span>
      <div className="flex items-center gap-2">
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface"
        >
          <FaWhatsapp className="h-5 w-5" />
        </a>
      )}
      <button
        type="button"
        onClick={handleShare}
        aria-label="Compartir"
        className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface"
      >
        <HiShare className="h-5 w-5" />
      </button>

      <div ref={ref} className="relative flex items-center gap-2">
        {isCustomerSession && session?.user && (
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface"
            aria-label="Cuenta"
          >
            <HiUserCircle className="h-6 w-6" />
          </button>
        )}

        {menuOpen && isCustomerSession && session?.user && (
          <div className="absolute right-0 top-10 w-48 rounded-xl border border-border bg-background p-1.5 shadow-lg">
            <p className="truncate px-2.5 py-1.5 text-sm font-semibold text-text-primary">
              {session.user.name}
            </p>
            <Link
              href={`/menu/${restaurantSlug}/account`}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-2.5 py-1.5 text-sm text-text-primary hover:bg-surface"
            >
              Mi cuenta
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: `/menu/${restaurantSlug}` })}
              className="block w-full rounded-lg px-2.5 py-1.5 text-left text-sm text-danger hover:bg-surface"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
