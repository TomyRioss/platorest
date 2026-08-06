"use client";

import { useState } from "react";
import Link from "next/link";
import { HiArrowLeft, HiCheckCircle, HiClock, HiXCircle } from "react-icons/hi2";

export type HistorialItem = {
  id: string;
  code: string;
  status: "PENDING" | "USED" | "EXPIRED";
  pointsSpent: number;
  createdAt: string;
  rewardName: string;
  variantName: string | null;
  modifiers: string[];
};

const STATUS_LABEL: Record<HistorialItem["status"], string> = {
  PENDING: "Pendiente",
  USED: "Canjeado",
  EXPIRED: "Expirado",
};

const STATUS_STYLE: Record<HistorialItem["status"], string> = {
  PENDING: "bg-primary-light text-primary",
  USED: "bg-surface text-text-secondary",
  EXPIRED: "bg-danger/10 text-danger",
};

function StatusIcon({ status }: { status: HistorialItem["status"] }) {
  if (status === "USED") return <HiCheckCircle className="h-4 w-4" />;
  if (status === "EXPIRED") return <HiXCircle className="h-4 w-4" />;
  return <HiClock className="h-4 w-4" />;
}

export function HistorialContent({
  restaurantSlug,
  redemptions,
}: {
  restaurantSlug: string;
  redemptions: HistorialItem[];
}) {
  const [openCode, setOpenCode] = useState<HistorialItem | null>(null);

  if (openCode) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-base font-semibold text-text-primary">{openCode.rewardName}</p>
          {openCode.variantName && <p className="text-sm text-text-secondary">{openCode.variantName}</p>}
          {openCode.modifiers.length > 0 && (
            <p className="text-sm text-text-secondary">{openCode.modifiers.join(", ")}</p>
          )}
          <p className="text-sm text-text-secondary">{openCode.pointsSpent.toLocaleString("es-AR")} pts</p>
        </div>
        <p className="text-sm text-text-secondary">Mostrá este código en el local:</p>
        <p className="rounded-xl border border-primary/30 bg-primary-light px-6 py-3 text-2xl font-bold tracking-widest text-primary">
          {openCode.code}
        </p>
        <button
          type="button"
          onClick={() => setOpenCode(null)}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          Volver al historial
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
      <Link
        href={`/menu/${restaurantSlug}/tienda-puntos`}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <HiArrowLeft className="h-4 w-4" />
        Volver a la tienda de puntos
      </Link>

      <h1 className="mb-4 text-lg font-bold text-text-primary">Mis canjes</h1>

      {redemptions.length === 0 && (
        <p className="text-sm text-text-secondary">Todavía no canjeaste ningún premio.</p>
      )}

      <ul className="flex flex-col gap-2">
        {redemptions.map((r) => {
          const clickable = r.status === "PENDING";
          return (
            <li key={r.id}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && setOpenCode(r)}
                className={`flex min-h-11 w-full flex-col gap-1 rounded-xl border border-border px-3 py-2.5 text-left transition ${
                  clickable ? "cursor-pointer hover:bg-surface" : "cursor-default"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text-primary">{r.rewardName}</p>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[r.status]}`}
                  >
                    <StatusIcon status={r.status} />
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                {(r.variantName || r.modifiers.length > 0) && (
                  <p className="text-xs text-text-secondary">
                    {[r.variantName, ...r.modifiers].filter(Boolean).join(", ")}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span className="font-mono tracking-wider">{r.code}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString("es-AR")} · {r.pointsSpent.toLocaleString("es-AR")} pts</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
