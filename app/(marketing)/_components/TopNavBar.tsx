"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HiDeviceTablet, HiCube, HiCalculator, HiQrCode, HiChartBar, HiHeart } from "react-icons/hi2";
import type { IconType } from "react-icons";

const FUNCTIONALITIES: { href: string; label: string; icon: IconType; available?: boolean }[] = [
  { href: "/funcionalidades/menu-digital", label: "Menu Digital", icon: HiDeviceTablet, available: true },
  { href: "/funcionalidades/inventario", label: "Inventario", icon: HiCube },
  { href: "/funcionalidades/punto-de-venta", label: "Punto de Venta", icon: HiCalculator },
  { href: "/funcionalidades/menu-qr", label: "Menu QR", icon: HiQrCode },
  { href: "/funcionalidades/estadisticas", label: "Estadísticas", icon: HiChartBar },
  { href: "/funcionalidades/fidelizacion", label: "Fidelización", icon: HiHeart },
];

const NAV_LINKS = [
  ...(process.env.NEXT_PUBLIC_SHOW_PRICING === "true"
    ? [{ href: "/precios", label: "Precios" }]
    : []),
];

function FunctionalityDropdown({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mobile) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [mobile]);

  if (mobile) {
    return (
      <details className="group">
        <summary className="flex cursor-pointer items-center justify-between border-b-2 border-transparent py-2 text-sm font-semibold text-text-primary hover:border-orange-500 hover:text-orange-500">
          Funcionalidades
          <span className="text-xs transition group-open:rotate-180">▾</span>
        </summary>
        <ul className="mt-1 space-y-1 pl-3">
          {FUNCTIONALITIES.map((f) => {
            const Icon = f.icon;
            return (
              <li key={f.href}>
                {f.available ? (
                  <Link
                    href={f.href}
                    onClick={onNavigate}
                    className="flex items-center gap-3 py-2 text-sm text-text-primary hover:text-orange-500"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {f.label}
                  </Link>
                ) : (
                  <div
                    aria-disabled="true"
                    className="flex cursor-default items-center gap-3 py-2 text-sm text-text-secondary opacity-60"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {f.label}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </details>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative pb-1 text-sm font-semibold text-text-primary transition-colors duration-200 hover:text-orange-500"
      >
        Funcionalidades
        <span className={`ml-1 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-50 mt-3 w-60 -translate-x-1/2 rounded-xl border border-border bg-background p-2 shadow-2xl"
        >
          {FUNCTIONALITIES.map((f) => {
            const Icon = f.icon;
            if (f.available) {
              return (
                <Link
                  key={f.href}
                  href={f.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-text-primary transition hover:bg-primary-light hover:text-primary"
                >
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  {f.label}
                </Link>
              );
            }
            return (
              <div
                key={f.href}
                role="menuitem"
                aria-disabled="true"
                className="flex cursor-default items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-text-primary opacity-60"
              >
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                {f.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TopNavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-2 items-center px-6 py-4 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex items-center gap-1.5 text-3xl font-medium tracking-normal text-primary">
          PlatoRest
        </Link>

        <div className="hidden items-center justify-center gap-6 md:flex">
          <FunctionalityDropdown />
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative pb-1 text-sm font-semibold text-text-primary transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-orange-500 after:transition-transform after:duration-300 after:ease-out hover:text-orange-500 hover:after:scale-x-100"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center justify-end gap-3 md:flex">
          <Link
            href="/login"
            className="border-b-2 border-primary text-sm font-semibold text-text-primary transition-colors duration-200 hover:text-primary"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
          >
            Demo Gratis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="-m-2 justify-self-end p-2 text-xl leading-none text-text-primary md:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-6 py-4 md:hidden">
          <FunctionalityDropdown mobile onNavigate={() => setOpen(false)} />
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="relative w-fit py-2 text-sm font-semibold text-text-primary transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-orange-500 after:transition-transform after:duration-300 after:ease-out hover:text-orange-500 hover:after:scale-x-100"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-2 self-center border-b-2 border-primary py-2 text-center text-sm font-semibold text-text-primary transition-colors duration-200 hover:text-primary"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="rounded bg-primary px-4 py-2 text-center text-sm font-bold text-white transition-colors duration-200 hover:bg-primary-hover"
          >
            Demo Gratis
          </Link>
        </nav>
      )}
    </header>
  );
}
