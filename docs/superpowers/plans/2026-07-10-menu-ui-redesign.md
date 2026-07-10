# Menú digital UI redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/admin/menu` to match the reference design — tabs per category, a Destacados section with a 10-item cap, product thumbnails uploaded to Supabase Storage, and native HTML5 drag-reorder for categories and products.

**Architecture:** Server component (`page.tsx`) loads restaurant + categories + products (with `featured`, `sortOrder`, `imageUrl`) and passes to a client component (`menu-client.tsx`) that renders tabs and drag-sortable rows. All mutations go through server actions in `actions.ts`, each followed by `revalidatePath("/admin/menu")`. Images upload via a dedicated server action using the Supabase JS admin client (service role key), writing to a public `product-images` bucket.

**Tech Stack:** Next.js 16 server actions, Prisma 7, `@supabase/supabase-js` (new dependency, admin client only, no other Supabase SDK usage in this app yet), native HTML5 drag-and-drop (no new DnD library), Tailwind v4.

## Global Constraints

- Never touch DB/Prisma without explicit per-message permission — user already gave it for this plan's migration (see spec).
- All errors must be caught, logged to console, and surfaced as visible UI feedback (project rule).
- Use TailwindCSS only, no raw CSS, never touch `globals.css`.
- No component file over 500 lines — split if exceeded.
- No automated test framework exists in this repo (no jest/vitest configured) — verification is manual via `npm run dev` + browser, not unit tests. Do not introduce a test framework as part of this plan.
- Responsive (mobile + desktop) for all new markup.

---

### Task 1: Prisma schema — add `featured` and `sortOrder` to `Product`

**Files:**
- Modify: `prisma/schema.prisma:223-234` (the `Product` model)

**Interfaces:**
- Produces: `Product.featured: boolean` (default `false`), `Product.sortOrder: number` (default `0`) — consumed by Task 4 (actions), Task 5 (page query), Task 6 (client UI).

- [ ] **Step 1: Edit the `Product` model**

In `prisma/schema.prisma`, change:

```prisma
model Product {
  id           String     @id @default(cuid())
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  categoryId   String?
  category     Category?  @relation(fields: [categoryId], references: [id])
  name         String
  description  String?
  imageUrl     String?
  active       Boolean    @default(true)
  variants     ProductVariant[]
}
```

to:

```prisma
model Product {
  id           String     @id @default(cuid())
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  categoryId   String?
  category     Category?  @relation(fields: [categoryId], references: [id])
  name         String
  description  String?
  imageUrl     String?
  active       Boolean    @default(true)
  featured     Boolean    @default(false)
  sortOrder    Int        @default(0)
  variants     ProductVariant[]
}
```

- [ ] **Step 2: Run the migration**

Run: `npx prisma migrate dev --name product_featured_sort_order`
Expected: migration file created under `prisma/migrations/`, command exits 0, prints "Your database is now in sync with your schema."

- [ ] **Step 3: Verify Prisma Client regenerated**

Run: `npx prisma generate`
Expected: exits 0, "Generated Prisma Client" message.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add featured and sortOrder fields to Product"
```

---

### Task 2: Supabase admin client helper

**Files:**
- Create: `lib/supabase-admin.ts`
- Modify: `package.json` (add `@supabase/supabase-js` dependency)
- Modify: `.env.example` (document required var, if not already present)

**Interfaces:**
- Produces: `getSupabaseAdmin(): SupabaseClient` — consumed by Task 3 (upload action).

- [ ] **Step 1: Install the dependency**

Run: `npm install @supabase/supabase-js`
Expected: exits 0, `package.json` gains `"@supabase/supabase-js": "^2.x.x"`.

- [ ] **Step 2: Create the admin client helper**

`lib/supabase-admin.ts`:

```typescript
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
```

- [ ] **Step 3: Verify `.env.local` has real values**

Read `.env.local` — it must already contain `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` with real (non-placeholder) values for Task 3 to work. If missing, stop and ask the user for them before continuing (do not fabricate keys).

- [ ] **Step 4: Commit**

```bash
git add lib/supabase-admin.ts package.json package-lock.json
git commit -m "feat: add Supabase admin client helper for storage uploads"
```

---

### Task 3: Product image upload — bucket + server action

**Files:**
- Modify: `app/admin/menu/actions.ts`

**Interfaces:**
- Consumes: `getSupabaseAdmin()` from Task 2.
- Produces: `uploadProductImage(productId: string, formData: FormData): Promise<{ ok: true; imageUrl: string } | { ok: false; error: string }>` — consumed by Task 6 (client UI).

- [ ] **Step 1: Add the action**

Append to `app/admin/menu/actions.ts`:

```typescript
export async function uploadProductImage(
  productId: string,
  formData: FormData,
): Promise<{ ok: true; imageUrl: string } | { ok: false; error: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Archivo inválido." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "El archivo debe ser una imagen." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "Imagen demasiado grande (máx 5MB)." };
  }
  try {
    const supabase = getSupabaseAdmin();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${productId}-${Date.now()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return { ok: false, error: "No se pudo subir la imagen." };
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    await prisma.product.update({ where: { id: productId }, data: { imageUrl: data.publicUrl } });
    revalidatePath("/admin/menu");
    return { ok: true, imageUrl: data.publicUrl };
  } catch (err) {
    console.error("uploadProductImage error:", err);
    return { ok: false, error: "Error al subir la imagen." };
  }
}
```

Add the import at the top of the file:

```typescript
import { getSupabaseAdmin } from "@/lib/supabase-admin";
```

- [ ] **Step 2: Create the storage bucket**

This requires dashboard/DB-adjacent access — ask the user to confirm before proceeding, since project rules forbid touching Supabase/DB without explicit per-instance permission. Once confirmed, create a public bucket named `product-images` (via Supabase dashboard → Storage → New bucket → public) or, if the user prefers, via `mcp__claude_ai_Supabase` tools with their explicit go-ahead in that message.

- [ ] **Step 3: Manual verification**

Run `npm run dev`, open `/admin/menu`, temporarily call the action from a scratch button or via the Task 6 UI once wired (this step is fully verified in Task 6's manual test — mark this step done once Task 6's upload test passes).

- [ ] **Step 4: Commit**

```bash
git add app/admin/menu/actions.ts
git commit -m "feat: add uploadProductImage server action"
```

---

### Task 4: Server actions — reorder, featured toggle, category rename

**Files:**
- Modify: `app/admin/menu/actions.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/prisma`, `revalidatePath` from `next/cache` (both already imported in this file).
- Produces:
  - `reorderCategories(items: { id: string; sortOrder: number }[]): Promise<ActionResult>`
  - `reorderProducts(items: { id: string; sortOrder: number }[]): Promise<ActionResult>`
  - `toggleFeatured(productId: string, featured: boolean): Promise<ActionResult>`
  - `updateCategoryName(categoryId: string, name: string): Promise<ActionResult>`
  All consumed by Task 6 (client UI). `ActionResult` type already defined in this file as `{ ok: true } | { ok: false; error: string }`.

- [ ] **Step 1: Add `reorderCategories`**

```typescript
export async function reorderCategories(
  items: { id: string; sortOrder: number }[],
): Promise<ActionResult> {
  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.category.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } }),
      ),
    );
  } catch (err) {
    console.error("reorderCategories error:", err);
    return { ok: false, error: "No se pudo reordenar las categorías." };
  }
  revalidatePath("/admin/menu");
  return { ok: true };
}
```

- [ ] **Step 2: Add `reorderProducts`**

```typescript
export async function reorderProducts(
  items: { id: string; sortOrder: number }[],
): Promise<ActionResult> {
  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.product.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } }),
      ),
    );
  } catch (err) {
    console.error("reorderProducts error:", err);
    return { ok: false, error: "No se pudo reordenar los productos." };
  }
  revalidatePath("/admin/menu");
  return { ok: true };
}
```

- [ ] **Step 3: Add `toggleFeatured` with 10-item cap**

```typescript
export async function toggleFeatured(
  productId: string,
  featured: boolean,
): Promise<ActionResult> {
  try {
    if (featured) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return { ok: false, error: "Producto no encontrado." };
      const count = await prisma.product.count({
        where: { restaurantId: product.restaurantId, featured: true },
      });
      if (count >= 10) {
        return { ok: false, error: "Máximo 10 productos destacados." };
      }
    }
    await prisma.product.update({ where: { id: productId }, data: { featured } });
  } catch (err) {
    console.error("toggleFeatured error:", err);
    return { ok: false, error: "No se pudo actualizar destacado." };
  }
  revalidatePath("/admin/menu");
  return { ok: true };
}
```

- [ ] **Step 4: Add `updateCategoryName`**

```typescript
export async function updateCategoryName(
  categoryId: string,
  name: string,
): Promise<ActionResult> {
  if (!name.trim()) return { ok: false, error: "Nombre requerido." };
  try {
    await prisma.category.update({ where: { id: categoryId }, data: { name: name.trim() } });
  } catch (err) {
    console.error("updateCategoryName error:", err);
    return { ok: false, error: "No se pudo renombrar la categoría." };
  }
  revalidatePath("/admin/menu");
  return { ok: true };
}
```

- [ ] **Step 5: Update `createProduct` to set initial `sortOrder`**

In the existing `createProduct` function, replace:

```typescript
  try {
    await prisma.product.create({
      data: {
        restaurantId,
        categoryId,
        name: name.trim(),
        variants: { create: { name: "Único", price, isDefault: true } },
      },
    });
  } catch {
```

with:

```typescript
  try {
    const count = await prisma.product.count({ where: { categoryId } });
    await prisma.product.create({
      data: {
        restaurantId,
        categoryId,
        name: name.trim(),
        sortOrder: count,
        variants: { create: { name: "Único", price, isDefault: true } },
      },
    });
  } catch {
```

- [ ] **Step 6: Manual verification**

Run `npm run dev`, temporarily add a `console.log` call to one new action from a Node script or trigger via `curl`-free manual UI test deferred to Task 6 (server actions can't be called outside a form/component easily). Mark this done once Task 6's manual tests exercise reorder, featured toggle, and rename.

- [ ] **Step 7: Commit**

```bash
git add app/admin/menu/actions.ts
git commit -m "feat: add reorder, featured toggle, and category rename actions"
```

---

### Task 5: Page query — fetch new fields, order by `sortOrder`

**Files:**
- Modify: `app/admin/menu/page.tsx`

**Interfaces:**
- Produces: `MenuClient` props shape `{ restaurantId: string; restaurantSlug: string; categories: { id: string; name: string; sortOrder: number; products: { id: string; name: string; active: boolean; featured: boolean; sortOrder: number; imageUrl: string | null; price: number }[] }[] }` — consumed by Task 6.

- [ ] **Step 1: Update the query and mapping**

Replace the full file content with:

```typescript
import { prisma } from "@/lib/prisma";
import { MenuClient } from "./menu-client";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const restaurant = await prisma.restaurant.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!restaurant) {
    return (
      <main className="p-6 text-text-secondary">
        No hay restaurantes configurados.
      </main>
    );
  }

  const categories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { sortOrder: "asc" },
    include: {
      products: {
        orderBy: { sortOrder: "asc" },
        include: { variants: true },
      },
    },
  });

  return (
    <MenuClient
      restaurantId={restaurant.id}
      restaurantSlug={restaurant.slug}
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        sortOrder: c.sortOrder,
        products: c.products.map((p) => ({
          id: p.id,
          name: p.name,
          active: p.active,
          featured: p.featured,
          sortOrder: p.sortOrder,
          imageUrl: p.imageUrl,
          price: Number(p.variants.find((v) => v.isDefault)?.price ?? p.variants[0]?.price ?? 0),
        })),
      }))}
    />
  );
}
```

- [ ] **Step 2: Manual verification**

Run `npm run dev`, open `http://localhost:3000/admin/menu`. Expected: page loads without a TypeScript error (old `menu-client.tsx` will show type errors until Task 6 — that's expected and resolved next task).

- [ ] **Step 3: Commit**

```bash
git add app/admin/menu/page.tsx
git commit -m "feat: query featured/sortOrder/imageUrl in menu page"
```

---

### Task 6: Rebuild `menu-client.tsx` — tabs, Destacados, drag reorder, image upload

**Files:**
- Modify: `app/admin/menu/menu-client.tsx` (full rewrite — file stays under 500 lines; if it grows past that while implementing, split the product-row rendering into `app/admin/menu/product-row.tsx` per project rule)

**Interfaces:**
- Consumes (from Task 3/4/5): `uploadProductImage`, `reorderCategories`, `reorderProducts`, `toggleFeatured`, `updateCategoryName`, plus existing `createCategory`, `deleteCategory`, `createProduct`, `updateProduct`, `toggleProductActive`, `deleteProduct`. Props shape from Task 5.
- Produces: default export `MenuClient` (named export, same as today) — no other file consumes its internals beyond the prop contract already used by `page.tsx`.

- [ ] **Step 1: Write the new component**

Replace `app/admin/menu/menu-client.tsx` with:

```tsx
"use client";

import { useState, useTransition, useRef } from "react";
import {
  createCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  toggleProductActive,
  deleteProduct,
  uploadProductImage,
  reorderCategories,
  reorderProducts,
  toggleFeatured,
  updateCategoryName,
} from "./actions";

type Product = {
  id: string;
  name: string;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  imageUrl: string | null;
  price: number;
};
type Category = { id: string; name: string; sortOrder: number; products: Product[] };

const FEATURED_LIMIT = 10;

export function MenuClient({
  restaurantId,
  restaurantSlug,
  categories: initialCategories,
}: {
  restaurantId: string;
  restaurantSlug: string;
  categories: Category[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [activeTab, setActiveTab] = useState<string>("destacados");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newProduct, setNewProduct] = useState<{ categoryId: string; name: string; price: string } | null>(null);
  const [editingProduct, setEditingProduct] = useState<{ id: string; name: string; price: string } | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [draggedProduct, setDraggedProduct] = useState<{ categoryId: string; productId: string } | null>(null);
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadProductId = useRef<string | null>(null);

  const featuredProducts = categories.flatMap((c) => c.products.filter((p) => p.featured));

  function run(action: () => Promise<{ ok: true } | { ok: false; error: string }>, onOk?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        console.error("Menu action failed:", result.error);
        return;
      }
      onOk?.();
    });
  }

  function handleCreateCategory() {
    const name = newCategoryName;
    run(() => createCategory(restaurantId, name), () => {
      setCategories((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: name.trim(), sortOrder: prev.length, products: [] },
      ]);
      setNewCategoryName("");
    });
  }

  function handleDeleteCategory(categoryId: string) {
    run(() => deleteCategory(categoryId), () => {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    });
  }

  function handleRenameCategory(categoryId: string, name: string) {
    run(() => updateCategoryName(categoryId, name), () => {
      setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, name: name.trim() } : c)));
      setEditingCategoryId(null);
    });
  }

  function handleCreateProduct() {
    if (!newProduct) return;
    const { categoryId, name, price } = newProduct;
    const priceNum = Number(price);
    run(() => createProduct(restaurantId, categoryId, name, priceNum), () => {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                products: [
                  ...c.products,
                  {
                    id: crypto.randomUUID(),
                    name: name.trim(),
                    active: true,
                    featured: false,
                    sortOrder: c.products.length,
                    imageUrl: null,
                    price: priceNum,
                  },
                ],
              }
            : c,
        ),
      );
      setNewProduct(null);
    });
  }

  function handleUpdateProduct() {
    if (!editingProduct) return;
    const { id, name, price } = editingProduct;
    const priceNum = Number(price);
    run(() => updateProduct(id, name, priceNum), () => {
      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          products: c.products.map((p) => (p.id === id ? { ...p, name: name.trim(), price: priceNum } : p)),
        })),
      );
      setEditingProduct(null);
    });
  }

  function handleToggleActive(productId: string, active: boolean) {
    run(() => toggleProductActive(productId, active), () => {
      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          products: c.products.map((p) => (p.id === productId ? { ...p, active } : p)),
        })),
      );
    });
  }

  function handleToggleFeatured(productId: string, featured: boolean) {
    if (featured && featuredProducts.length >= FEATURED_LIMIT) {
      setError(`Máximo ${FEATURED_LIMIT} productos destacados.`);
      return;
    }
    run(() => toggleFeatured(productId, featured), () => {
      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          products: c.products.map((p) => (p.id === productId ? { ...p, featured } : p)),
        })),
      );
    });
  }

  function handleDeleteProduct(productId: string) {
    run(() => deleteProduct(productId), () => {
      setCategories((prev) =>
        prev.map((c) => ({ ...c, products: c.products.filter((p) => p.id !== productId) })),
      );
    });
  }

  function handleImageClick(productId: string) {
    pendingUploadProductId.current = productId;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const productId = pendingUploadProductId.current;
    e.target.value = "";
    if (!file || !productId) return;
    setError(null);
    setUploadingProductId(productId);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadProductImage(productId, formData);
    setUploadingProductId(null);
    if (!result.ok) {
      setError(result.error);
      console.error("Image upload failed:", result.error);
      return;
    }
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        products: c.products.map((p) => (p.id === productId ? { ...p, imageUrl: result.imageUrl } : p)),
      })),
    );
  }

  function handleCategoryDrop(targetId: string) {
    if (!draggedCategoryId || draggedCategoryId === targetId) return;
    const ordered = [...categories];
    const fromIdx = ordered.findIndex((c) => c.id === draggedCategoryId);
    const toIdx = ordered.findIndex((c) => c.id === targetId);
    const [moved] = ordered.splice(fromIdx, 1);
    ordered.splice(toIdx, 0, moved);
    const withOrder = ordered.map((c, idx) => ({ ...c, sortOrder: idx }));
    setCategories(withOrder);
    setDraggedCategoryId(null);
    run(() => reorderCategories(withOrder.map((c) => ({ id: c.id, sortOrder: c.sortOrder }))));
  }

  function handleProductDrop(categoryId: string, targetProductId: string) {
    if (!draggedProduct || draggedProduct.categoryId !== categoryId) return;
    if (draggedProduct.productId === targetProductId) return;
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    const ordered = [...category.products];
    const fromIdx = ordered.findIndex((p) => p.id === draggedProduct.productId);
    const toIdx = ordered.findIndex((p) => p.id === targetProductId);
    const [moved] = ordered.splice(fromIdx, 1);
    ordered.splice(toIdx, 0, moved);
    const withOrder = ordered.map((p, idx) => ({ ...p, sortOrder: idx }));
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, products: withOrder } : c)));
    setDraggedProduct(null);
    run(() => reorderProducts(withOrder.map((p) => ({ id: p.id, sortOrder: p.sortOrder }))));
  }

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-text-primary">Menú digital</h1>
          <a
            href={`/menu/${restaurantSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary underline"
          >
            Ver página pública ↗
          </a>
        </div>

        {error && (
          <p className="mb-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="mb-4 flex flex-wrap gap-2 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab("destacados")}
            className={`rounded px-3 py-1 text-sm font-medium ${activeTab === "destacados" ? "bg-primary text-white" : "text-text-secondary"}`}
          >
            Destacados
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              className={`rounded px-3 py-1 text-sm font-medium ${activeTab === c.id ? "bg-primary text-white" : "text-text-secondary"}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mb-4 flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nueva categoría"
            className="flex-1 rounded border border-border px-2 py-1 text-sm"
          />
          <button
            onClick={handleCreateCategory}
            disabled={isPending || !newCategoryName.trim()}
            className="rounded bg-primary px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
          >
            Agregar
          </button>
        </div>

        {activeTab === "destacados" && (
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-medium text-text-primary">
                Destacados <span className="text-sm text-text-secondary">({featuredProducts.length}/{FEATURED_LIMIT})</span>
              </h2>
            </div>
            {featuredProducts.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Marcá productos como destacados desde su menú de opciones.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {featuredProducts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                    <span className="text-sm text-text-primary">{p.name}</span>
                    <span className="text-sm text-text-secondary">${p.price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="space-y-4">
          {categories.length === 0 && activeTab !== "destacados" && (
            <p className="text-sm text-text-secondary">Sin categorías todavía.</p>
          )}
          {categories
            .filter((c) => activeTab === c.id)
            .map((category) => (
              <div
                key={category.id}
                draggable
                onDragStart={() => setDraggedCategoryId(category.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleCategoryDrop(category.id)}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="cursor-move text-text-secondary" aria-hidden>⠿⠿</span>
                  {editingCategoryId === category.id ? (
                    <input
                      autoFocus
                      defaultValue={category.name}
                      onBlur={(e) => handleRenameCategory(category.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                      className="flex-1 rounded border border-border px-2 py-1 text-sm"
                    />
                  ) : (
                    <h2
                      onClick={() => setEditingCategoryId(category.id)}
                      className="flex-1 cursor-text font-medium text-text-primary"
                    >
                      {category.name} <span className="text-sm text-text-secondary">({category.products.length})</span>
                    </h2>
                  )}
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={isPending}
                    className="text-xs text-danger hover:underline"
                  >
                    Borrar categoría
                  </button>
                </div>

                <ul className="divide-y divide-border">
                  {category.products.map((product) => (
                    <li
                      key={product.id}
                      draggable
                      onDragStart={() => setDraggedProduct({ categoryId: category.id, productId: product.id })}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleProductDrop(category.id, product.id)}
                      className="flex items-center justify-between gap-2 py-2"
                    >
                      {editingProduct?.id === product.id ? (
                        <div className="flex flex-1 flex-wrap items-center gap-2">
                          <input
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="min-w-0 flex-1 rounded border border-border px-2 py-1 text-sm"
                          />
                          <input
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                            className="w-24 rounded border border-border px-2 py-1 text-sm"
                          />
                          <button onClick={handleUpdateProduct} disabled={isPending} className="text-xs font-medium text-primary hover:underline">
                            Guardar
                          </button>
                          <button onClick={() => setEditingProduct(null)} className="text-xs text-text-secondary hover:underline">
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="cursor-move text-text-secondary" aria-hidden>⠿</span>
                            <button
                              onClick={() => handleImageClick(product.id)}
                              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-surface text-xs text-text-secondary"
                              title="Cambiar imagen"
                            >
                              {uploadingProductId === product.id ? (
                                "…"
                              ) : product.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                "📷"
                              )}
                            </button>
                            <div>
                              <p className={`text-sm font-medium ${product.active ? "text-text-primary" : "text-text-secondary line-through"}`}>
                                {product.name}
                              </p>
                              <p className="text-sm text-text-secondary">${product.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setEditingProduct({ id: product.id, name: product.name, price: String(product.price) })}
                              className="text-xs text-primary hover:underline"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleToggleFeatured(product.id, !product.featured)}
                              disabled={isPending}
                              className={`text-xs hover:underline ${product.featured ? "text-primary" : "text-text-secondary"}`}
                            >
                              {product.featured ? "★ Destacado" : "☆ Destacar"}
                            </button>
                            <button
                              onClick={() => handleToggleActive(product.id, !product.active)}
                              disabled={isPending}
                              className="text-xs text-text-secondary hover:underline"
                            >
                              {product.active ? "Desactivar" : "Activar"}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={isPending}
                              className="text-xs text-danger hover:underline"
                            >
                              Borrar
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                {newProduct?.categoryId === category.id ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Nombre"
                      className="min-w-0 flex-1 rounded border border-border px-2 py-1 text-sm"
                    />
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="Precio"
                      className="w-24 rounded border border-border px-2 py-1 text-sm"
                    />
                    <button onClick={handleCreateProduct} disabled={isPending || !newProduct.name.trim()} className="text-xs font-medium text-primary hover:underline">
                      Guardar
                    </button>
                    <button onClick={() => setNewProduct(null)} className="text-xs text-text-secondary hover:underline">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setNewProduct({ categoryId: category.id, name: "", price: "" })}
                    className="mt-2 text-xs font-medium text-primary hover:underline"
                  >
                    + Agregar producto
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Check file length**

Run: `wc -l app/admin/menu/menu-client.tsx`
Expected: under 500. If over, extract the product `<li>` block into `app/admin/menu/product-row.tsx` as a component taking `{ product, categoryId, isPending, editingProduct, onEdit, onSave, onCancelEdit, onToggleFeatured, onToggleActive, onDelete, onImageClick, uploading, onDragStart, onDragOver, onDrop }` props, mirroring the inline logic above exactly.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `menu-client.tsx` or `actions.ts`.

- [ ] **Step 4: Manual verification in browser**

Run `npm run dev`, open `http://localhost:3000/admin/menu`:
- Click a category tab, confirm only that category's products show.
- Click the image thumbnail on a product, pick a local image file, confirm it uploads and displays (check Network tab / console for errors — none expected).
- Click "☆ Destacar" on a product, confirm it moves into the Destacados tab count; repeat until 10, confirm the 11th shows the "Máximo 10" error message.
- Drag a category by its handle to reorder, refresh the page, confirm the new order persisted.
- Drag a product within a category to reorder, refresh the page, confirm the new order persisted.
- Rename a category inline (click name, edit, blur), confirm it saves.
- Trigger an error path (e.g. disconnect network then try an action) and confirm the red error message appears and `console.error` logs it.

- [ ] **Step 5: Commit**

```bash
git add app/admin/menu/menu-client.tsx
git commit -m "feat: redesign menu admin UI with tabs, featured section, image upload, drag reorder"
```

---

### Task 7: Public menu page — respect `featured` and `sortOrder`

**Files:**
- Modify: whichever file renders `/menu/[slug]` (locate via `Explore` at task start — expected `app/menu/[slug]/page.tsx` or similar)

**Interfaces:**
- Consumes: `Product.featured`, `Product.sortOrder`, `Product.imageUrl` (from Task 1).

- [ ] **Step 1: Locate the public menu page**

Run: `grep -rl "menu/\[slug\]" app --include=*.tsx` (or equivalent glob) to find the render file.

- [ ] **Step 2: Update its Prisma query**

Change the `products` `orderBy` from whatever it currently is to `orderBy: { sortOrder: "asc" }`, matching the admin page. If the public page has its own "featured" concept already, wire it to the new `featured` field the same way Task 6 exposed it (e.g., render a "Destacados" section first using `products.filter(p => p.featured)` before the rest). Show the exact diff based on what's found — do not guess blind; read the file fully before editing.

- [ ] **Step 3: Manual verification**

Open `http://localhost:3000/menu/<restaurantSlug>` in the browser, confirm products render in the same order as configured in `/admin/menu`, and previously-marked-featured products appear first (or in their own section, matching whatever the file already does structurally).

- [ ] **Step 4: Commit**

```bash
git add <file from step 1>
git commit -m "feat: order public menu by sortOrder and surface featured products"
```

---

## Self-Review Notes

- Spec coverage: schema fields (Task 1), storage (Task 2-3), tabs/Destacados/drag/upload UI (Task 6), actions (Task 3-4), public page consistency (Task 7) — all covered. Variants and welcome-page/subdomain explicitly out of scope per spec.
- No placeholders: every step has real code or an exact command.
- Type consistency checked: `Product`/`Category` client types match the `page.tsx` mapping in Task 5, and action signatures in Task 6 match Task 3/4 exactly.
