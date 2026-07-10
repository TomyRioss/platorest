# Menú digital — rediseño UI (sub-proyecto 1/3)

Contexto: plan mayor tiene 3 sub-proyectos (UI menú, menú de bienvenida, sitio web+subdominio). Este spec cubre solo UI menú.

## Objetivo
Rediseñar `/admin/menu` para parecerse a la referencia (tabs por categoría, sección Destacados, imágenes de producto, drag reorder).

## Schema (Prisma)
- `Product.featured Boolean @default(false)`
- `Product.sortOrder Int @default(0)`
- `Category.sortOrder` ya existe, sin cambios

Requiere migración. Usuario dio permiso explícito para esta instancia.

## Storage
Bucket Supabase Storage `product-images`, público, sin transformación. Server action recibe `FormData` con archivo, sube, devuelve URL pública, persiste en `Product.imageUrl`.

## UI — `app/admin/menu/menu-client.tsx`
- Tabs arriba: "Destacados" + una por categoría existente (orden = `Category.sortOrder`)
- Sección Destacados: contador `N/10`, toggle on/off de la sección, "Copiar enlace" (copia URL pública del menú), ojo = preview
- Categoría: fila header con drag handle, nombre editable inline (blur/enter guarda), contador de productos, botón "+ Producto", kebab (borrar categoría), expand/collapse
- Fila de producto: drag handle, thumbnail cuadrado (click abre file picker, sube a Supabase, muestra loading state), nombre, precio, ojo (activo/inactivo — reusa `active` existente), kebab (editar nombre/precio, marcar/desmarcar destacado — bloqueado si ya hay 10, borrar)
- Sin variantes múltiples en esta iteración (precio simple vía variante `isDefault`)

## Drag & drop
HTML5 nativo (`draggable`, `onDragStart/Over/Drop`), sin nueva dependencia. Al soltar, recalcula `sortOrder` de todos los items del contenedor afectado y llama action de reorder en batch (un solo request con array `{id, sortOrder}[]`).

## Server actions nuevas (`app/admin/menu/actions.ts`)
- `reorderCategories(items: {id: string; sortOrder: number}[])`
- `reorderProducts(items: {id: string; sortOrder: number}[])`
- `toggleFeatured(productId: string, featured: boolean)` — rechaza si se excede 10 destacados
- `uploadProductImage(productId: string, formData: FormData)` — sube a Supabase Storage, actualiza `imageUrl`
- `updateCategoryName(categoryId: string, name: string)`

Actions existentes (`createCategory`, `deleteCategory`, `createProduct`, `updateProduct`, `toggleProductActive`, `deleteProduct`) se mantienen, ajustando `createProduct`/queries para incluir `imageUrl`, `featured`, `sortOrder`.

## Fuera de alcance
Variantes múltiples, menú de bienvenida, sitio público con subdominio (sub-proyectos separados).

## Testing
Server actions: validar límite de 10 destacados, validar reorder persiste. UI: probar en navegador drag reorder, upload imagen, toggle destacado, toggle activo — flujo completo en `/admin/menu`.
