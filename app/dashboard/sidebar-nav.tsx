"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, Boxes, ChevronDown } from "lucide-react";
import { isDev } from "@/lib/feature-scope";

type NavItem = { href: string; label: string };
type NavGroup = { label: string; icon: React.ComponentType<{ className?: string }>; items: NavItem[]; scope?: "extra" };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Menú digital",
    icon: UtensilsCrossed,
    items: [
      { href: "/dashboard/menu", label: "Menú de productos" },
      { href: "/dashboard/menu/landing", label: "Bienvenida y diseño" },
    ],

  },
  {
    label: "Inventario",
    icon: Boxes,
    scope: "extra",
    items: [
      { href: "/dashboard/inventario", label: "Inventario" },
      { href: "/dashboard/inventario/carta", label: "Carta" },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const visibleGroups = NAV_GROUPS.filter((g) => g.scope !== "extra" || isDev());
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const active = visibleGroups.find((g) => g.items.some((i) => pathname.startsWith(i.href)));
    return new Set(active ? [active.label] : []);
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dashboard-open-groups");
      if (stored) setOpenGroups((prev) => new Set([...prev, ...JSON.parse(stored)]));
    } catch (err) {
      console.error("[SidebarNav] failed to read stored state", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("dashboard-open-groups", JSON.stringify([...openGroups]));
    } catch (err) {
      console.error("[SidebarNav] failed to persist state", err);
    }
  }, [openGroups]);

  return (
    <nav className="flex flex-1 flex-col gap-2 px-2">
      {visibleGroups.map((group) => {
        const Icon = group.icon;
        const isOpen = openGroups.has(group.label);
        return (
          <div key={group.label}>
            <button
              type="button"
              onClick={() =>
                setOpenGroups((prev) => {
                  const next = new Set(prev);
                  if (next.has(group.label)) next.delete(group.label);
                  else next.add(group.label);
                  return next;
                })
              }
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="relative mt-1 ml-6 flex flex-col gap-1 border-l border-white/20 pl-2">
                {group.items.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`rounded-md px-3 py-2 text-sm font-normal transition-colors ${
                        active
                          ? "bg-white/15 text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
