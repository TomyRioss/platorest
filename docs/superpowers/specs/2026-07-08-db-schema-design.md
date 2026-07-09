# DB Schema PlatoRest — Diseño aprobado 2026-07-08

Postgres + Prisma. DB actual sin datos → schema se rehace completo.

## Principios
- Ledger everywhere: stock y puntos = suma de transacciones, nunca contadores mutables.
- Dinero y cantidades de ingrediente: `Decimal`.
- Todo dato operativo cuelga de `restaurantId` (sucursal); fidelización cuelga de `businessId` (marca).
- Disponibilidad de platos: derivada (receta vs stock), no flag manual (salvo `active`).

## 1. Multi-tenancy y roles
- `Business` (marca) → `Restaurant` (sucursal: slug único, dirección, geo). Menú, inventario y staff por sucursal.
- `User` (staff, credenciales) + `Membership(userId, businessId, restaurantId?, role)`. `restaurantId null` = todas las sucursales.
- `Role` enum: `OWNER | MANAGER | CASHIER | WAITER`. Permisos hardcodeados en app.

## 2. Inventario
- `Supplier`: por restaurant, nombre + contacto.
- `Ingredient`: por restaurant, nombre, `unit` enum `G | ML | UNIT`, `lowStockAlertAt Decimal`.
- `PurchaseDocument`: archivo origen (CSV ahora, factura+IA después), estado de procesamiento; genera lotes.
- `Batch` (lote): `code` ("A01"), ingrediente, supplier?, `unitCost Decimal`, `receivedAt`, `expiresAt?`, `documentId?`.
- `StockMovement`: batch, `qty Decimal` (+/-), `type` enum `PURCHASE | SALE | WASTE | ADJUSTMENT | RETURN`, `orderItemId?`, `reason?`, `userId?`. **Stock lote = SUM(qty)**.
- Consumo en venta: FIFO por `receivedAt` asc, transaccional.

## 3. Menú y recetas
- `Category` (por restaurant, `sortOrder`) → `Product` → `ProductVariant` (precio y receta propia; producto simple = 1 variante default `isDefault`).
- `RecipeItem`: variante + ingrediente + `qty Decimal` en unidad base.
- Disponibilidad variante = todo ingrediente con stock ≥ qty requerida. Query compartida POS + menú digital.

## 4. Pedidos
- `Order`: restaurant, `customerId?`, `source POS|WEB`, `fulfillment PICKUP|DELIVERY|DINE_IN`, `tableNumber?`, `status`, `paymentMethod`, `total`, `createdByUserId?`, `registerSessionId?`.
- `OrderItem`: variante, qty, `unitPrice` **y `unitCost`** (snapshot costo real de lotes consumidos) → margen exacto histórico.
- Stock se descuenta al pasar a `CONFIRMED` (movements negativos por receta, FIFO). Cancelación → movements inversos.
- Métricas (márgenes por plato día/semana, timeline neto, ranking) = agregaciones sobre OrderItem; sin tablas de stats.

## 5. Fidelización (por Business)
- `Customer`: `userId?` (login web) o alta por teléfono en POS; visitas derivadas de pedidos (1/día).
- `LoyaltyConfig`: puntos por $ gastado.
- `PointsTransaction`: earn (pedido/acción) / redeem, saldo = SUM.
- `LoyaltyAction` (catálogo: "dejanos reseña" = N pts) + `ActionCompletion`.
- `Reward`: costo en puntos O `visitMilestone` (regalo por N visitas). `Redemption`: código corto, `PENDING | USED | EXPIRED`, validación en POS.
- `Survey` fija: `orderId?`, rating 1-5, NPS 0-10, comentario; otorga puntos.

## 6. Caja y rendimiento cajero
- `RegisterSession`: userId, restaurant, `openedAt/closedAt`, `openingCash?/closingCash?`. Orders POS ligadas a sesión.
- Métricas cajero = agregación de orders por `createdByUserId` / sesión.

## 7. Auditoría
- `AuditLog`: userId, restaurantId, `action` string, `entityType/entityId`, `payload Json`, `createdAt`. Insert en misma transacción de cada acción mutante. Índices `(userId, createdAt)`, `(restaurantId, createdAt)`.

## Fuera de alcance (agregable sin romper)
- Modificadores libres con precio, cuenta corriente proveedores, permisos granulares, encuestas configurables, multi-moneda.

## Migración
- DB sin datos: reset + init migration nueva. `Lead` (admin_leads) se conserva tal cual.
