"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/funcionalidades", label: "Funcionalidades" },
  { href: "/precios", label: "Precios" },
  { href: "/testimonios", label: "Testimonios" },
  { href: "/vision-mision", label: "Visión y Misión" },
];

export default function TopNavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-2 items-center px-6 py-4 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="text-xl font-bold tracking-tight text-text-primary">
          PlatoRest
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b-2 border-transparent text-sm font-medium text-text-secondary hover:border-primary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-3 md:flex">
          <Link
            href="/login"
            className="border-b-2 border-primary text-sm font-semibold text-text-primary hover:text-primary"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/menu/demo"
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Demo Gratis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-text-primary"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-6 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="w-fit border-b-2 border-transparent py-2 text-sm font-medium text-text-secondary hover:border-primary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-2 self-center border-b-2 border-primary py-2 text-center text-sm font-semibold text-text-primary hover:text-primary"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/menu/demo"
            onClick={() => setOpen(false)}
            className="rounded bg-primary px-4 py-2 text-center text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Demo Gratis
          </Link>
        </nav>
      )}
    </header>
  );
}
