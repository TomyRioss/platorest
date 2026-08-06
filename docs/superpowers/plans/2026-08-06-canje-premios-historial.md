# Historial de canjes + canjeador de premios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Success screen muestra qué se compró, cliente puede ver su historial de canjes desde la navbar, y staff puede validar/confirmar un código en un canjeador nuevo en el dashboard.

**Architecture:** Todo sobre el modelo `Redemption` ya existente (no requiere cambios de schema/Prisma). Server components para fetch de datos (patrón `requireBusinessId` / `getOrCreateCustomer` ya usado en el repo), server actions `"use server"` para mutaciones, client components solo donde hay interactividad.

**Tech Stack:** Next.js App Router, Prisma, TailwindCSS, react-icons (`hi2`).

## Global Constraints

- Nunca tocar Prisma/schema/DB en este plan — el modelo `Redemption` ya soporta todo.
- Todo error catcheado: `console.error("[contexto] ...")` + feedback visual (mensaje de error en UI).
- TailwindCSS únicamente, sin CSS puro, sin tocar `global.css`.
- Sin SVG custom — usar `react-icons` (`hi2` para consistencia con el resto de `menu-navbar.tsx` y páginas de tienda-puntos).
- Responsive mobile-first (proyecto ya mobile-first; estas vistas siguen el mismo patrón de las páginas de tienda-puntos existentes: `max-w-md`, `px-4`/`px-6`, `min-h-11` en targets táctiles).
- No hay framework de test en el repo (`package.json` no tiene `vitest`/`jest`/script `test`). Verificación es manual: dev server (`npm run dev`, ya corriendo en :3000) + navegación en browser. No agregar test runner nuevo — fuera de alcance.
- No agregar dependencias nuevas — todo se resuelve con lo ya instalado.

---

### Task 1: Success screen muestra qué se compró

**Files:**
- Modify: `app/menu/[restaurantSlug]/tienda-puntos/[rewardId]/reward-detail.tsx:73-89`

**Interfaces:**
- Consumes: `reward.name` (string, ya en props), `selectedModifiers` (ya calculado en el componente, `{id,name,pointsCost}[]`), `totalCost` (ya calculado).
- Produces: nada consumido por otras tasks — cambio aislado a este componente.

- [ ] **Step 1: Editar el bloque de success (líneas 73-89) para incluir nombre del premio y modifiers elegidos**

Reemplazar:

```tsx
  if (redeemedCode) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
          <HiCheckCircle className="h-9 w-9 text-primary" />
        </div>
        <h1 className="text-lg font-bold text-text-primary">¡Canjeado!</h1>
        <p className="text-sm text-text-secondary">Mostrá este código en el local:</p>
        <p className="rounded-xl border border-primary/30 bg-primary-light px-6 py-3 text-2xl font-bold tracking-widest text-primary">
          {redeemedCode}
        </p>
        <button type="button" onClick={goBack} className="mt-4 text-sm font-medium text-primary hover:underline">
          Volver a la tienda de puntos
        </button>
      </main>
    );
  }
```

Por:

```tsx
  if (redeemedCode) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
          <HiCheckCircle className="h-9 w-9 text-primary" />
        </div>
        <h1 className="text-lg font-bold text-text-primary">¡Canjeado!</h1>
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-base font-semibold text-text-primary">{reward.name}</p>
          {selectedModifiers.length > 0 && (
            <p className="text-sm text-text-secondary">
              {selectedModifiers.map((m) => m.name).join(", ")}
            </p>
          )}
          <p className="text-sm text-text-secondary">{totalCost.toLocaleString("es-AR")} pts</p>
        </div>
        <p className="text-sm text-text-secondary">Mostrá este código en el local:</p>
        <p className="rounded-xl border border-primary/30 bg-primary-light px-6 py-3 text-2xl font-bold tracking-widest text-primary">
          {redeemedCode}
        </p>
        <button type="button" onClick={goBack} className="mt-4 text-sm font-medium text-primary hover:underline">
          Volver a la tienda de puntos
        </button>
      </main>
    );
  }
```

- [ ] **Step 2: Verificar manualmente**

Con dev server corriendo, ir a `/menu/milanesas-tomy/tienda-puntos`, elegir un premio, canjearlo. El success screen debe mostrar nombre del premio, modifiers elegidos (si eligió alguno) y puntos gastados, además del código.

- [ ] **Step 3: Commit**

```bash
git add "app/menu/[restaurantSlug]/tienda-puntos/[rewardId]/reward-detail.tsx"
git commit -m "feat: success de canje muestra premio comprado"
```

---

### Task 2: Historial de canjes del cliente

**Files:**
- Create: `app/menu/[restaurantSlug]/tienda-puntos/historial/page.tsx`
- Create: `app/menu/[restaurantSlug]/tienda-puntos/historial/historial-content.tsx`

**Interfaces:**
- Consumes: `getOrCreateCustomer(businessId)` de `lib/customer-auth.ts` (devuelve `{ customer }` o `null`), `prisma.redemption.findMany`.
- Produces: `HistorialContent` client component con props `{ restaurantSlug: string; redemptions: HistorialItem[] }` donde
  `HistorialItem = { id: string; code: string; status: "PENDING"|"USED"|"EXPIRED"; pointsSpent: number; createdAt: string; rewardName: string; variantName: string | null; modifiers: string[] }`.
  Ruta consumida por Task 3 (navbar): `/menu/${restaurantSlug}/tienda-puntos/historial`.

- [ ] **Step 1: Crear `page.tsx`**

```tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { HistorialContent } from "./historial-content";

export const dynamic = "force-dynamic";

export default async function HistorialPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const { restaurantSlug } = await params;

  const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
  if (!restaurant) notFound();

  const result = await getOrCreateCustomer(restaurant.businessId);
  if (!result) redirect(`/menu/${restaurantSlug}/account/login`);
  const { customer } = result;

  const redemptions = await prisma.redemption.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: { reward: true, rewardVariant: true },
  });

  return (
    <HistorialContent
      restaurantSlug={restaurantSlug}
      redemptions={redemptions.map((r) => ({
        id: r.id,
        code: r.code,
        status: r.status,
        pointsSpent: r.pointsSpent,
        createdAt: r.createdAt.toISOString(),
        rewardName: r.reward.name,
        variantName: r.rewardVariant && r.rewardVariant.name !== "Único" ? r.rewardVariant.name : null,
        modifiers: Array.isArray(r.selectedModifiers)
          ? (r.selectedModifiers as { name: string }[]).map((m) => m.name)
          : [],
      }))}
    />
  );
}
```

- [ ] **Step 2: Crear `historial-content.tsx`**

```tsx
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
```

- [ ] **Step 3: Verificar manualmente**

Ir a `/menu/milanesas-tomy/tienda-puntos/historial` logueado. Debe listar canjes ordenados por fecha desc con estado correcto. Tap en uno PENDING reabre el código grande; tap en uno USED/EXPIRED no hace nada (no clickable).

- [ ] **Step 4: Commit**

```bash
git add "app/menu/[restaurantSlug]/tienda-puntos/historial"
git commit -m "feat: historial de canjes del cliente"
```

---

### Task 3: Item "Mis canjes" en navbar

**Files:**
- Modify: `app/menu/[restaurantSlug]/menu-navbar.tsx:1-8` (import), `:322-350` (popover)

**Interfaces:**
- Consumes: ruta de Task 2 (`/menu/${restaurantSlug}/tienda-puntos/historial`).
- Produces: nada.

- [ ] **Step 1: Agregar import de ícono**

En `menu-navbar.tsx:7`, reemplazar:

```tsx
import { HiUserCircle, HiShare, HiGift, HiEye, HiEyeSlash, HiArrowLeft } from "react-icons/hi2";
```

Por:

```tsx
import { HiUserCircle, HiShare, HiGift, HiEye, HiEyeSlash, HiArrowLeft, HiTicket } from "react-icons/hi2";
```

- [ ] **Step 2: Agregar link "Mis canjes" en el popover**

Ubicar el bloque del popover (después del fix de `left-0` ya aplicado). Reemplazar:

```tsx
            <Link
              href={`/menu/${restaurantSlug}/tienda-puntos`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-text-primary hover:bg-surface"
            >
              <HiGift className="h-4 w-4" />
              Tienda de puntos
            </Link>
            <button
```

Por:

```tsx
            <Link
              href={`/menu/${restaurantSlug}/tienda-puntos`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-text-primary hover:bg-surface"
            >
              <HiGift className="h-4 w-4" />
              Tienda de puntos
            </Link>
            <Link
              href={`/menu/${restaurantSlug}/tienda-puntos/historial`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-text-primary hover:bg-surface"
            >
              <HiTicket className="h-4 w-4" />
              Mis canjes
            </Link>
            <button
```

- [ ] **Step 3: Verificar manualmente**

Abrir popover de cuenta en `/menu/milanesas-tomy`, confirmar que aparece "Mis canjes" entre "Tienda de puntos" y "Cerrar sesión", que el link navega a `/menu/milanesas-tomy/tienda-puntos/historial`, y que el popover sigue sin cortarse en mobile (375px).

- [ ] **Step 4: Commit**

```bash
git add "app/menu/[restaurantSlug]/menu-navbar.tsx"
git commit -m "feat: item Mis canjes en navbar del menu"
```

---

### Task 4: Canjeador de premios (admin)

**Files:**
- Create: `app/dashboard/fidelizacion/canjeador/actions.ts`
- Create: `app/dashboard/fidelizacion/canjeador/page.tsx`
- Create: `app/dashboard/fidelizacion/canjeador/canjeador-client.tsx`
- Modify: `app/dashboard/sidebar-nav.tsx` (agregar entry en grupo Fidelización)

**Interfaces:**
- Consumes: `requireBusinessId()` de `lib/tenant.ts`.
- Produces:
  - `lookupRedemption(code: string): Promise<LookupResult>` donde
    `LookupResult = { ok: true; redemption: { id: string; code: string; rewardName: string; variantName: string | null; modifiers: string[]; pointsSpent: number; customerName: string; createdAt: string } } | { ok: false; error: string }`.
  - `confirmRedemption(redemptionId: string): Promise<{ ok: true } | { ok: false; error: string }>`.

- [ ] **Step 1: Crear `actions.ts`**

```tsx
"use server";

import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/tenant";

export type LookupResult =
  | {
      ok: true;
      redemption: {
        id: string;
        code: string;
        rewardName: string;
        variantName: string | null;
        modifiers: string[];
        pointsSpent: number;
        customerName: string;
        createdAt: string;
      };
    }
  | { ok: false; error: string };

export async function lookupRedemption(code: string): Promise<LookupResult> {
  const businessId = await requireBusinessId();
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, error: "Ingresá un código." };

  try {
    const redemption = await prisma.redemption.findUnique({
      where: { code: normalized },
      include: { reward: true, rewardVariant: true, customer: true },
    });

    if (!redemption || redemption.reward.businessId !== businessId) {
      return { ok: false, error: "Código inválido." };
    }
    if (redemption.status === "USED") {
      return {
        ok: false,
        error: `Ya fue canjeado el ${redemption.usedAt?.toLocaleString("es-AR") ?? "-"}.`,
      };
    }
    if (redemption.status === "EXPIRED") {
      return { ok: false, error: "Código expirado." };
    }

    return {
      ok: true,
      redemption: {
        id: redemption.id,
        code: redemption.code,
        rewardName: redemption.reward.name,
        variantName:
          redemption.rewardVariant && redemption.rewardVariant.name !== "Único"
            ? redemption.rewardVariant.name
            : null,
        modifiers: Array.isArray(redemption.selectedModifiers)
          ? (redemption.selectedModifiers as { name: string }[]).map((m) => m.name)
          : [],
        pointsSpent: redemption.pointsSpent,
        customerName: redemption.customer.name,
        createdAt: redemption.createdAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("[lookupRedemption] failed", err);
    return { ok: false, error: "No se pudo buscar el código." };
  }
}

export async function confirmRedemption(
  redemptionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const businessId = await requireBusinessId();

  try {
    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId },
      include: { reward: true },
    });
    if (!redemption || redemption.reward.businessId !== businessId) {
      return { ok: false, error: "Código inválido." };
    }
    if (redemption.status !== "PENDING") {
      return { ok: false, error: "Este código ya no está pendiente." };
    }

    await prisma.redemption.update({
      where: { id: redemptionId },
      data: { status: "USED", usedAt: new Date() },
    });
    return { ok: true };
  } catch (err) {
    console.error("[confirmRedemption] failed", err);
    return { ok: false, error: "No se pudo confirmar el canje." };
  }
}
```

- [ ] **Step 2: Crear `page.tsx`**

```tsx
import { requireBusinessId } from "@/lib/tenant";
import { CanjeadorClient } from "./canjeador-client";

export const dynamic = "force-dynamic";

export default async function CanjeadorPage() {
  await requireBusinessId();
  return <CanjeadorClient />;
}
```

- [ ] **Step 3: Crear `canjeador-client.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { HiCheckCircle, HiTicket } from "react-icons/hi2";
import { lookupRedemption, confirmRedemption, type LookupResult } from "./actions";

export function CanjeadorClient() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Extract<LookupResult, { ok: true }>["redemption"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setConfirmed(false);
    startTransition(async () => {
      const res = await lookupRedemption(code);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res.redemption);
    });
  }

  function handleConfirm() {
    if (!result) return;
    startTransition(async () => {
      const res = await confirmRedemption(result.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setConfirmed(true);
    });
  }

  function reset() {
    setCode("");
    setResult(null);
    setError(null);
    setConfirmed(false);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <HiTicket className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold text-text-primary">Canjeador de premios</h1>
      </div>

      {confirmed ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary-light p-6 text-center">
          <HiCheckCircle className="h-10 w-10 text-primary" />
          <p className="text-sm font-semibold text-text-primary">¡Canje confirmado!</p>
          <button type="button" onClick={reset} className="mt-2 text-sm font-medium text-primary hover:underline">
            Canjear otro código
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleLookup} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código del cliente"
              className="min-h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm uppercase tracking-widest text-text-primary outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isPending || !code.trim()}
              className="min-h-11 shrink-0 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              Buscar
            </button>
          </form>

          {error && <p className="text-sm text-danger">{error}</p>}

          {result && (
            <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
              <p className="text-sm font-semibold text-text-primary">{result.rewardName}</p>
              {(result.variantName || result.modifiers.length > 0) && (
                <p className="text-xs text-text-secondary">
                  {[result.variantName, ...result.modifiers].filter(Boolean).join(", ")}
                </p>
              )}
              <p className="text-xs text-text-secondary">Cliente: {result.customerName}</p>
              <p className="text-xs text-text-secondary">{result.pointsSpent.toLocaleString("es-AR")} pts</p>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="mt-2 min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
              >
                Confirmar canje
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Agregar entry en sidebar**

En `app/dashboard/sidebar-nav.tsx`, dentro del grupo `Fidelización` (respetar el resto del array tal cual quedó, incluido el label "Configurar Conversión" ya editado por el usuario), agregar el item de canjeador. Reemplazar:

```tsx
      { href: "/dashboard/fidelizacion/tienda-puntos", label: "Tienda de puntos" },
      { href: "/dashboard/fidelizacion/regalos", label: "Regalos por visita" },
      { href: "/dashboard/fidelizacion/encuestas", label: "Encuestas" },
      { href: "/dashboard/fidelizacion/conversion", label: "Configurar Conversión" },
```

Por:

```tsx
      { href: "/dashboard/fidelizacion/tienda-puntos", label: "Tienda de puntos" },
      { href: "/dashboard/fidelizacion/regalos", label: "Regalos por visita" },
      { href: "/dashboard/fidelizacion/canjeador", label: "Canjeador de premios" },
      { href: "/dashboard/fidelizacion/encuestas", label: "Encuestas" },
      { href: "/dashboard/fidelizacion/conversion", label: "Configurar Conversión" },
```

- [ ] **Step 5: Verificar manualmente**

Login dashboard, ir a Fidelización → Canjeador de premios. Probar: código inexistente → "Código inválido"; código PENDING real (generar uno comprando en tienda-puntos) → muestra preview correcto → confirmar → "¡Canje confirmado!"; reintentar el mismo código → "Este código ya no está pendiente." Confirmar en el historial del cliente (Task 2) que ese canje ahora aparece como "Canjeado" y no es clickable.

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/fidelizacion/canjeador app/dashboard/sidebar-nav.tsx
git commit -m "feat: canjeador de premios en dashboard"
```

---

## Self-Review Notes

- **Spec coverage:** success screen (Task 1), historial cliente (Task 2), navbar item (Task 3), canjeador admin (Task 4) — las 4 partes del spec cubiertas. Fuera de alcance (QR/cámara, expiración automática, schema) respetado, no se tocó.
- **Placeholders:** ninguno — todo código completo, sin TODO.
- **Type consistency:** `HistorialItem.status` usa el mismo union `"PENDING"|"USED"|"EXPIRED"` que el enum Prisma `RedemptionStatus`; `LookupResult`/`redemption.id` en Task 4 coincide con el `redemptionId` que consume `confirmRedemption`.
