# Prod solo QR + Menú digital

## Contexto

Platorest sale a producción (platorest.com) solo con QR + menú digital. El resto (fidelización, POS, inventario, estadísticas) se sigue desarrollando en paralelo en el mismo repo/branch, sin bloquear el deploy de prod.

Mecanismo: un feature flag por env var, no branches separados. Mismo código, mismo deploy pipeline — lo que cambia es qué se renderiza según el entorno.

## El flag

`lib/feature-scope.ts`:
```ts
export const isDev = () => process.env.NEXT_PUBLIC_ISDEV === "true";
```

Env var: `NEXT_PUBLIC_ISDEV`
- Local/dev/preview: `NEXT_PUBLIC_ISDEV=true` → se ven las features "extra" en desarrollo
- Proyecto Vercel prod (platorest.com): sin setear (undefined → `false`) → solo scope "qr-menu"

Único punto de verdad. Todo gating de features usa esta función, nunca `process.env` directo.

## Convención manual (no hay detección automática)

El flag no sabe qué es "QR/menú" y qué no. Eso lo decide quien agrega la feature, marcando cada item explícitamente:

```ts
type FeatureItem = { scope?: "extra"; /* resto de campos */ };
```

Sin `scope` = queda en prod (default). `scope: "extra"` = oculto en prod, visible solo si `isDev()`.

Al agregar una feature nueva a cualquiera de estos arrays, se le pone el scope correspondiente:
- `app/dashboard/sidebar-nav.tsx` → `NAV_GROUPS` ✅ (Inventario marcado `extra`)
- `app/(marketing)/_components/TopNavBar.tsx` → `FUNCTIONALITIES`
- `app/(marketing)/page.tsx` → `FEATURES`

Filtro a aplicar:
```ts
items.filter(i => i.scope !== "extra" || isDev())
```

Rutas completas nuevas fuera de qr/menú (ej. `/dashboard/fidelizacion`) deben chequear el flag al inicio del `page.tsx`:
```ts
if (!isDev()) notFound();
```
Así no queda accesible ni por URL directa en prod.

## Clasificación actual (según relevamiento)

**sin scope** (queda en prod)
- `app/dashboard/menu/**` (menú digital + diseño)
- `app/dashboard/qr-download-button.tsx`
- `app/menu/[businessSlug]/**` (render público del menú)
- Marketing: `app/(marketing)/funcionalidades/menu-digital/`, `app/(marketing)/funcionalidades/menu-qr/`

**scope: "extra"** (oculto en prod, sigue en desarrollo)
- `app/dashboard/inventario/**` — marcado en `sidebar-nav.tsx` ✅
- Fidelización — hoy solo página marketing (`app/(marketing)/funcionalidades/fidelizacion/`), sin feature en dashboard todavía
- `app/(marketing)/funcionalidades/punto-de-venta/`
- `app/(marketing)/funcionalidades/estadisticas/`

## Qué falta (fuera de este alcance, pendiente para cuando se refactoricen)

- Filtrar `FUNCTIONALITIES` en `TopNavBar.tsx`.
- Filtrar `FEATURES` en landing `app/(marketing)/page.tsx`.
- Gating por `notFound()` en cada `funcionalidades/*/page.tsx` que sea "extra", y en rutas dashboard fuera de menú (ej. `/dashboard/inventario/page.tsx`).
- Confirmar que `NEXT_PUBLIC_ISDEV` NO esté seteado en el proyecto Vercel de prod.
