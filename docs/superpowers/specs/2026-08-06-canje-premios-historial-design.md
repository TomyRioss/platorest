# Historial de canjes + canjeador de premios

## Contexto

Tienda de puntos ya permite comprar premios con puntos: `redeemReward` (`app/menu/[restaurantSlug]/tienda-puntos/actions.ts`) crea un `Redemption` con `code` único y muestra un success screen simple con el código. El modelo `Redemption` ya soporta todo lo necesario (`status`: PENDING/USED/EXPIRED, `pointsSpent`, `selectedModifiers`, `usedAt`) — no requiere cambios de schema.

Falta: mostrar qué se compró en el success, que el cliente pueda ver su historial de canjes, acceso desde la navbar, y que el staff pueda canjear un código (marcarlo USED).

## Alcance

1. Success screen muestra nombre del premio comprado (+ variante/modifiers) además del código.
2. Historial cliente: `/menu/[restaurantSlug]/tienda-puntos/historial`, lista sus `Redemption` propios ordenados por fecha desc (premio, código, pts, estado, fecha). Tap en uno PENDING reabre el código grande.
3. Navbar del menú público: item "Mis canjes" en el popover de cuenta (`menu-navbar.tsx`), entre "Tienda de puntos" y "Cerrar sesión".
4. Canjeador admin: `/dashboard/fidelizacion/canjeador` + entry en sidebar. Input manual de código (sin cámara/QR — queda pendiente, ver Fuera de alcance). Busca `Redemption` por code scoped al `businessId` del staff. Estados:
   - No existe → error "Código inválido"
   - `USED` → error "Ya fue canjeado el {fecha}"
   - `EXPIRED` → error "Código expirado"
   - `PENDING` → preview (cliente, premio, variante, modifiers, pts) + botón "Confirmar canje" → `status: USED`, `usedAt: now()`

## Fuera de alcance

- Escáner QR/cámara para el canjeador — pendiente a futuro, se agrega a Linear cuando se conecte el MCP.
- Lógica de expiración automática (nada setea `EXPIRED` hoy; no se toca).
- Cambios de schema/Prisma — el modelo actual alcanza.

## Errores

Todo error catcheado, logueado en consola (`console.error("[contexto] ...")`) y con feedback visual al usuario (mensaje de error en UI), consistente con el resto del proyecto.
