# Tienda de puntos — design

## Goal
Admin/dueño arma catálogo de premios canjeables por puntos (categorías, premios con imagen, variantes, modificadores). Cliente logueado ve su balance, elige premio + variante/modificadores, canjea.

## Schema (Prisma)

```prisma
model RewardCategory {
  id         String   @id @default(cuid())
  businessId String
  business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  name       String
  sortOrder  Int      @default(0)
  rewards    Reward[]
}

model Reward {
  // existentes: id, businessId, business, name, description, pointsCost, visitMilestone, active, redemptions
  imageUrl       String?
  categoryId     String?
  category       RewardCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  variants       RewardVariant[]
  modifierGroups RewardModifierGroup[]
}

model RewardVariant {
  id          String  @id @default(cuid())
  rewardId    String
  reward      Reward  @relation(fields: [rewardId], references: [id], onDelete: Cascade)
  name        String  @default("Único")
  pointsCost  Int
  isDefault   Boolean @default(false)
  redemptions Redemption[]
}

model RewardModifierGroup {
  id        String @id @default(cuid())
  rewardId  String
  reward    Reward @relation(fields: [rewardId], references: [id], onDelete: Cascade)
  name      String
  required  Boolean @default(false)
  multiple  Boolean @default(false)
  sortOrder Int    @default(0)
  modifiers RewardModifier[]
}

model RewardModifier {
  id                    String @id @default(cuid())
  rewardModifierGroupId String
  group      RewardModifierGroup @relation(fields: [rewardModifierGroupId], references: [id], onDelete: Cascade)
  name       String
  pointsCost Int @default(0)
  sortOrder  Int @default(0)
}

model Redemption {
  // existentes: id, rewardId, reward, customerId, customer, code, status, createdAt, usedAt
  rewardVariantId   String?
  rewardVariant     RewardVariant? @relation(fields: [rewardVariantId], references: [id], onDelete: SetNull)
  selectedModifiers Json?   // snapshot [{name, pointsCost}]
  pointsSpent       Int     // snapshot total, no depende de precio actual
}
```

`Reward.pointsCost`/`visitMilestone` quedan (legacy, no usados por flujo de variantes). Costo real = `RewardVariant.pointsCost` + suma modificadores elegidos, snapshot en `Redemption.pointsSpent`.

`lib/loyalty.ts`: agregar `getPointsBalance(customerId)` — `SUM(PointsTransaction.points)` por cliente.

## Admin — `app/dashboard/fidelizacion/tienda-puntos/`
Mirror exacto de `app/dashboard/menu/`:
- `page.tsx` (server) — carga `RewardCategory[]` + `Reward[]` con `variants`/`modifierGroups` por `businessId`.
- `tienda-puntos-client.tsx` (mirror `menu-client.tsx`) — categorías drag-reorder/colapsar, grid premios.
- `reward-drawer.tsx` (mirror `product-drawer.tsx`) — nombre, descripción, imagen, variantes (nombre+costo puntos), modificadores.
- `reward-modifier-groups-editor.tsx` (mirror `modifier-groups-editor.tsx`).
- `actions.ts` — CRUD categorías (`createRewardCategory`, `renameRewardCategory`, `deleteRewardCategory`, `reorderRewardCategories`), CRUD premios (`saveReward`, `toggleRewardActive`, `deleteReward`, `duplicateReward`, `moveRewardCategory`), `uploadRewardImage` (Supabase Storage, mismo patrón `uploadProductImage`).
- Reemplaza placeholder actual en `tienda-puntos/page.tsx`.
- Nav: ya existe entry "Tienda de puntos" en sidebar Fidelización — apunta a esta ruta, sin cambios ahí.

## Cliente — `app/menu/[restaurantSlug]/tienda-puntos/`
- `page.tsx` (server) — gate con `getOrCreateCustomer` (mismo patrón `account/page.tsx`, redirect a login si no hay sesión). Carga balance + categorías/premios activos.
- Header: balance de puntos, back a menú.
- Grid premios por categoría, mismo layout visual que menú público.
- `[rewardId]/page.tsx` (mirror `[productId]/product-page.tsx`) — selector variante + modificadores, costo total en vivo.
- Server action `redeemReward(rewardVariantId, selectedModifierIds[])`: recalcula costo server-side, valida `balance >= costo`, transacción Prisma crea `Redemption` (PENDING, code random) + `PointsTransaction` (reason REDEMPTION, points negativo). Balance insuficiente → error catcheado + feedback visual, sin tocar DB.
- Confirmación: muestra código de canje.
- Nav: link "Tienda de puntos" en `menu-navbar.tsx` junto a "Mi cuenta" (ícono `HiGift`).

## Errores
Todo error catcheado: log consola + feedback visual (toast) al usuario, por regla de proyecto.

## Testing
- Admin: crear categoría/premio/variante/modificador, editar, borrar, reordenar, subir imagen, toggle activo.
- Cliente: balance correcto, canje descuenta puntos y crea Redemption, balance insuficiente bloquea sin mutar DB, código de canje se muestra.
