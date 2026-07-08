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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-text-primary">
          PlatoRest
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Login to Dashboard
          </Link>
        </nav>

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
              className="py-2 text-sm font-medium text-text-secondary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-2 rounded bg-primary px-4 py-2 text-center text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Login to Dashboard
          </Link>
        </nav>
      )}
    </header>
  );
}
