"use client";

import { useEffect, useState } from "react";
import { PROMO_ENDS_AT } from "@/lib/pricing";

function getTimeLeft() {
  const diff = new Date(PROMO_ENDS_AT).getTime() - Date.now();
  const clamped = Math.max(0, diff);
  return {
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
    expired: diff <= 0,
  };
}

export function PromoCountdown({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time || time.expired) return null;

  const parts = [
    [time.days, "d"],
    [time.hours, "h"],
    [time.minutes, "m"],
    [time.seconds, "s"],
  ] as const;

  return (
    <div
      className={`inline-flex w-fit items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary ${className}`}
    >
      Promo termina en{" "}
      <span className="tabular-nums">
        {parts.map(([value, unit]) => `${String(value).padStart(2, "0")}${unit} `).join("")}
      </span>
    </div>
  );
}
