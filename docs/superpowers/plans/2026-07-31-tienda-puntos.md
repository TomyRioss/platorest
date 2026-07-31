# Tienda de Puntos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin catalogs redeemable rewards (categories, variants, modifiers, image); logged-in customer views balance and redeems a reward for points.

**Architecture:** Mirrors the existing menu system (`app/dashboard/menu/`, `app/menu/[restaurantSlug]/`) 1:1 wherever the domain matches — same Sheet/drawer patterns, same Server Action shape (`{ ok: true } | { ok: false; error: string }`), same tenant-ownership guard style. Reward catalog is **business-scoped** (not restaurant-scoped) since loyalty already is (`Reward.businessId`). Reward modifier groups belong directly to one `Reward` (no join table) — simpler than menu's shared `ModifierGroup`, because rewards don't need cross-reward modifier sharing (confirmed in design).

**Tech Stack:** Next.js App Router, Prisma, Supabase Storage (existing `restaurant-assets` bucket, new `rewards/` path prefix), Tailwind + shadcn (Sheet, DropdownMenu), @dnd-kit for reorder.

## Global Constraints

- Never touch DB/Prisma without explicit per-message permission — **already granted for this feature** (schema changes below, migration in Task 1).
- Every error caught: log to console AND show user-facing visual feedback (toast/inline message). No silent failures.
- No CSS files, no `global.css` edits — Tailwind only.
- No new npm dependencies — everything needed already exists in the repo.
- Components stay under ~500 lines; if a mirrored file would exceed it, split (none of the planned files do, based on their menu-equivalents).
- Money/points fields: reuse the same numeric-input pattern already in the codebase (`inputMode="numeric"`, strip non-digits, `Number(...) || 0`).

---

### Task 1: Prisma schema — reward categories, variants, modifiers, redemption snapshot

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: Prisma models `RewardCategory`, `RewardVariant`, `RewardModifierGroup`, `RewardModifier`; new fields on `Reward` (`imageUrl`, `categoryId`, `category`, `variants`, `modifierGroups`); new fields on `Redemption` (`rewardVariantId`, `rewardVariant`, `selectedModifiers`, `pointsSpent`); new field on `Business` (`rewardCategories`).

- [ ] **Step 1: Add `rewardCategories` relation to `Business`**

In `prisma/schema.prisma`, inside `model Business { ... }`, right after the `rewards Reward[]` line:

```prisma
  rewards       Reward[]
  rewardCategories RewardCategory[]
```

- [ ] **Step 2: Add `RewardCategory` model**

Insert immediately before `model Reward {` (around line 495):

```prisma
model RewardCategory {
  id         String   @id @default(cuid())
  businessId String
  business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  name       String
  sortOrder  Int      @default(0)
  rewards    Reward[]
}
```

- [ ] **Step 3: Extend `Reward` model**

Replace the existing `model Reward { ... }` block with:

```prisma
model Reward {
  id             String   @id @default(cuid())
  businessId     String
  business       Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  name           String
  description    String?
  imageUrl       String?
  categoryId     String?
  category       RewardCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  // legacy: unused by the variant-based redeem flow, kept for the visit-milestone gift feature
  pointsCost     Int?
  visitMilestone Int?
  active         Boolean  @default(true)
  variants       RewardVariant[]
  modifierGroups RewardModifierGroup[]
  redemptions    Redemption[]
}

model RewardVariant {
  id          String   @id @default(cuid())
  rewardId    String
  reward      Reward   @relation(fields: [rewardId], references: [id], onDelete: Cascade)
  name        String   @default("Único")
  pointsCost  Int
  isDefault   Boolean  @default(false)
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
  pointsCost Int    @default(0)
  sortOrder  Int    @default(0)
}
```

- [ ] **Step 4: Extend `Redemption` model**

Replace the existing `model Redemption { ... }` block with:

```prisma
model Redemption {
  id                String           @id @default(cuid())
  rewardId          String
  reward            Reward           @relation(fields: [rewardId], references: [id], onDelete: Cascade)
  rewardVariantId   String?
  rewardVariant     RewardVariant?   @relation(fields: [rewardVariantId], references: [id], onDelete: SetNull)
  customerId        String
  customer          Customer         @relation(fields: [customerId], references: [id], onDelete: Cascade)
  code              String           @unique
  status            RedemptionStatus @default(PENDING)
  selectedModifiers Json?
  pointsSpent       Int              @default(0)
  createdAt         DateTime         @default(now())
  usedAt            DateTime?
}
```

- [ ] **Step 5: Run the migration**

```bash
npx prisma migrate dev --name reward_catalog
```

Expected: migration file created under `prisma/migrations/`, applies cleanly, `prisma generate` runs via the migrate hook. If it prompts about data loss on `Redemption.pointsSpent` (non-null new column on a table that may have rows), accept the default (Prisma will add it as `0` for existing rows since the field has `@default(0)`).

- [ ] **Step 6: Verify types generated**

```bash
npx tsc --noEmit
```

Expected: no errors (nothing consumes the new models yet, so this just confirms `@prisma/client` regenerated cleanly).

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add reward catalog schema (categories, variants, modifiers)"
```

---

### Task 2: `lib/loyalty.ts` — points balance + redemption code

**Files:**
- Modify: `lib/loyalty.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/prisma`, `PointsTransaction` Prisma model (existing, `customerId`, `points`).
- Produces: `getPointsBalance(customerId: string): Promise<number>`, `generateRedemptionCode(): string`.

- [ ] **Step 1: Add balance + code helpers**

Append to `lib/loyalty.ts`:

```ts
import { prisma } from "@/lib/prisma";

export async function getPointsBalance(customerId: string): Promise<number> {
  const result = await prisma.pointsTransaction.aggregate({
    where: { customerId },
    _sum: { points: true },
  });
  return result._sum.points ?? 0;
}

export function generateRedemptionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/loyalty.ts
git commit -m "feat: add points balance and redemption code helpers"
```

---

### Task 3: Admin actions — reward categories + rewards CRUD

**Files:**
- Create: `app/dashboard/fidelizacion/tienda-puntos/actions.ts`

**Interfaces:**
- Consumes: `prisma`, `assertOwnsBusiness` from `@/lib/tenant`, `supabaseAdmin`/`RESTAURANT_ASSETS_BUCKET` from `@/lib/supabase-admin`.
- Produces: `type RewardVariantInput`, `type SaveRewardInput`, `type SaveRewardResult`, `createRewardCategory`, `renameRewardCategory`, `deleteRewardCategory`, `reorderRewardCategories`, `saveReward`, `toggleRewardActive`, `deleteReward`, `duplicateReward`, `moveRewardCategory`, `uploadRewardImage`, `updateRewardImage`. All consumed by Task 5/6 client components.

- [ ] **Step 1: Write the file**

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { supabaseAdmin, RESTAURANT_ASSETS_BUCKET } from "@/lib/supabase-admin";
import { assertOwnsBusiness } from "@/lib/tenant";

type ActionResult = { ok: true } | { ok: false; error: string };

const PATH = "/dashboard/fidelizacion/tienda-puntos";

async function businessIdOfRewardCategory(categoryId: string) {
  const c = await prisma.rewardCategory.findUnique({ where: { id: categoryId }, select: { businessId: true } });
  return c?.businessId ?? null;
}

async function businessIdOfReward(rewardId: string) {
  const r = await prisma.reward.findUnique({ where: { id: rewardId }, select: { businessId: true } });
  return r?.businessId ?? null;
}

export async function createRewardCategory(businessId: string, name: string): Promise<ActionResult> {
  if (!name.trim()) return { ok: false, error: "Nombre requerido." };
  try {
    await assertOwnsBusiness(businessId);
    await prisma.rewardCategory.create({ data: { businessId, name: name.trim() } });
  } catch {
    return { ok: false, error: "Error al crear categoría." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function renameRewardCategory(categoryId: string, name: string): Promise<ActionResult> {
  if (!name.trim()) return { ok: false, error: "Nombre requerido." };
  try {
    const businessId = await businessIdOfRewardCategory(categoryId);
    if (!businessId) return { ok: false, error: "Categoría no encontrada." };
    await assertOwnsBusiness(businessId);
    await prisma.rewardCategory.update({ where: { id: categoryId }, data: { name: name.trim() } });
  } catch {
    return { ok: false, error: "No se pudo renombrar." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function reorderRewardCategories(categoryIds: string[]): Promise<ActionResult> {
  try {
    const categories = await prisma.rewardCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, businessId: true },
    });
    if (categories.length !== categoryIds.length) return { ok: false, error: "Categoría no encontrada." };
    const businessIds = new Set(categories.map((c) => c.businessId));
    if (businessIds.size !== 1) return { ok: false, error: "No autorizado." };
    await assertOwnsBusiness([...businessIds][0]);

    await prisma.$transaction(
      categoryIds.map((id, index) => prisma.rewardCategory.update({ where: { id }, data: { sortOrder: index } })),
    );
  } catch {
    return { ok: false, error: "No se pudo reordenar." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteRewardCategory(categoryId: string): Promise<ActionResult> {
  try {
    const category = await prisma.rewardCategory.findUnique({ where: { id: categoryId } });
    if (!category) return { ok: false, error: "Categoría no encontrada." };
    await assertOwnsBusiness(category.businessId);
    await prisma.rewardCategory.delete({ where: { id: categoryId } });
  } catch {
    return { ok: false, error: "No se pudo borrar (tiene premios asociados)." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export type RewardVariantInput = {
  id?: string;
  name: string;
  pointsCost: number;
  isDefault: boolean;
};

export type SaveRewardInput = {
  rewardId?: string;
  businessId: string;
  categoryId: string;
  name: string;
  description: string;
  variants: RewardVariantInput[];
};

export type SaveRewardResult = { ok: true; rewardId: string } | { ok: false; error: string };

export async function saveReward(input: SaveRewardInput): Promise<SaveRewardResult> {
  if (!input.name.trim()) return { ok: false, error: "Nombre requerido." };
  if (input.variants.length === 0) return { ok: false, error: "Agregá al menos un costo en puntos." };
  for (const v of input.variants) {
    if (!Number.isInteger(v.pointsCost) || v.pointsCost < 0) {
      return { ok: false, error: "Costo en puntos inválido." };
    }
  }

  try {
    await assertOwnsBusiness(input.businessId);
    if (input.rewardId) {
      const existingBusinessId = await businessIdOfReward(input.rewardId);
      if (existingBusinessId !== input.businessId) return { ok: false, error: "No autorizado." };
    }

    const rewardId = await prisma.$transaction(async (tx) => {
      let id = input.rewardId;
      if (id) {
        await tx.reward.update({
          where: { id },
          data: { name: input.name.trim(), description: input.description.trim() || null, categoryId: input.categoryId },
        });
        const existing = await tx.rewardVariant.findMany({ where: { rewardId: id } });
        const keepIds = new Set(input.variants.filter((v) => v.id).map((v) => v.id));
        const toDelete = existing.filter((v) => !keepIds.has(v.id));
        if (toDelete.length > 0) {
          await tx.rewardVariant.deleteMany({ where: { id: { in: toDelete.map((v) => v.id) } } });
        }
      } else {
        const reward = await tx.reward.create({
          data: {
            businessId: input.businessId,
            categoryId: input.categoryId,
            name: input.name.trim(),
            description: input.description.trim() || null,
          },
        });
        id = reward.id;
      }

      for (const v of input.variants) {
        const data = {
          name: v.name.trim() || "Único",
          pointsCost: v.pointsCost,
          isDefault: v.isDefault,
        };
        if (v.id) {
          await tx.rewardVariant.update({ where: { id: v.id }, data });
        } else {
          await tx.rewardVariant.create({ data: { ...data, rewardId: id! } });
        }
      }

      return id!;
    });

    revalidatePath(PATH);
    return { ok: true, rewardId };
  } catch {
    return { ok: false, error: "No se pudo guardar el premio." };
  }
}

export async function toggleRewardActive(rewardId: string, active: boolean): Promise<ActionResult> {
  try {
    const businessId = await businessIdOfReward(rewardId);
    if (!businessId) return { ok: false, error: "Premio no encontrado." };
    await assertOwnsBusiness(businessId);
    await prisma.reward.update({ where: { id: rewardId }, data: { active } });
  } catch {
    return { ok: false, error: "Error al actualizar premio." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function duplicateReward(rewardId: string): Promise<ActionResult> {
  try {
    const reward = await prisma.reward.findUnique({ where: { id: rewardId }, include: { variants: true } });
    if (!reward) return { ok: false, error: "Premio no encontrado." };
    await assertOwnsBusiness(reward.businessId);
    await prisma.reward.create({
      data: {
        businessId: reward.businessId,
        categoryId: reward.categoryId,
        name: `${reward.name} (copia)`,
        description: reward.description,
        imageUrl: reward.imageUrl,
        active: reward.active,
        variants: {
          create: reward.variants.map((v) => ({ name: v.name, pointsCost: v.pointsCost, isDefault: v.isDefault })),
        },
      },
    });
  } catch {
    return { ok: false, error: "No se pudo duplicar el premio." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function moveRewardCategory(rewardId: string, categoryId: string): Promise<ActionResult> {
  try {
    const [rewardBusinessId, categoryBusinessId] = await Promise.all([
      businessIdOfReward(rewardId),
      businessIdOfRewardCategory(categoryId),
    ]);
    if (!rewardBusinessId || rewardBusinessId !== categoryBusinessId) return { ok: false, error: "No autorizado." };
    await assertOwnsBusiness(rewardBusinessId);
    await prisma.reward.update({ where: { id: rewardId }, data: { categoryId } });
  } catch {
    return { ok: false, error: "No se pudo mover el premio." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteReward(rewardId: string): Promise<ActionResult> {
  try {
    const businessId = await businessIdOfReward(rewardId);
    if (!businessId) return { ok: false, error: "Premio no encontrado." };
    await assertOwnsBusiness(businessId);
    await prisma.$transaction(async (tx) => {
      await tx.rewardVariant.deleteMany({ where: { rewardId } });
      await tx.reward.delete({ where: { id: rewardId } });
    });
  } catch {
    return { ok: false, error: "No se pudo borrar el premio." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadRewardImage(
  businessId: string,
  rewardId: string,
  dataUrl: string,
): Promise<UploadResult> {
  try {
    await assertOwnsBusiness(businessId);
    const rewardBusinessId = await businessIdOfReward(rewardId);
    if (rewardBusinessId !== businessId) return { ok: false, error: "No autorizado." };
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return { ok: false, error: "Imagen inválida." };
  const [, mimeType, base64] = match;
  const ext = mimeType.split("/")[1];
  const path = `${businessId}/rewards/${rewardId}-${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(RESTAURANT_ASSETS_BUCKET)
    .upload(path, Buffer.from(base64, "base64"), { contentType: mimeType, upsert: true });

  if (error) return { ok: false, error: "No se pudo subir la imagen." };

  const { data } = supabaseAdmin.storage.from(RESTAURANT_ASSETS_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function updateRewardImage(rewardId: string, imageUrl: string | null): Promise<ActionResult> {
  try {
    const businessId = await businessIdOfReward(rewardId);
    if (!businessId) return { ok: false, error: "Premio no encontrado." };
    await assertOwnsBusiness(businessId);
    await prisma.reward.update({ where: { id: rewardId }, data: { imageUrl } });
  } catch {
    return { ok: false, error: "No se pudo actualizar la imagen." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export type RewardModifierInput = { id?: string; name: string; pointsCost: number };
export type RewardModifierGroupInput = {
  id?: string;
  name: string;
  required: boolean;
  multiple: boolean;
  modifiers: RewardModifierInput[];
};

export async function saveRewardModifierGroup(
  businessId: string,
  rewardId: string,
  input: RewardModifierGroupInput,
): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Nombre requerido." };
  try {
    await assertOwnsBusiness(businessId);
    const rewardBusinessId = await businessIdOfReward(rewardId);
    if (rewardBusinessId !== businessId) return { ok: false, error: "No autorizado." };

    await prisma.$transaction(async (tx) => {
      let groupId = input.id;
      if (groupId) {
        await tx.rewardModifierGroup.update({
          where: { id: groupId },
          data: { name: input.name.trim(), required: input.required, multiple: input.multiple },
        });
        const existing = await tx.rewardModifier.findMany({ where: { rewardModifierGroupId: groupId } });
        const keepIds = new Set(input.modifiers.filter((m) => m.id).map((m) => m.id));
        const toDelete = existing.filter((m) => !keepIds.has(m.id));
        if (toDelete.length > 0) {
          await tx.rewardModifier.deleteMany({ where: { id: { in: toDelete.map((m) => m.id) } } });
        }
      } else {
        const count = await tx.rewardModifierGroup.count({ where: { rewardId } });
        const group = await tx.rewardModifierGroup.create({
          data: { rewardId, name: input.name.trim(), required: input.required, multiple: input.multiple, sortOrder: count },
        });
        groupId = group.id;
      }

      for (let i = 0; i < input.modifiers.length; i++) {
        const m = input.modifiers[i];
        const data = { name: m.name.trim() || "Opción", pointsCost: m.pointsCost, sortOrder: i };
        if (m.id) {
          await tx.rewardModifier.update({ where: { id: m.id }, data });
        } else {
          await tx.rewardModifier.create({ data: { ...data, rewardModifierGroupId: groupId! } });
        }
      }
    });
  } catch {
    return { ok: false, error: "No se pudo guardar el grupo de modificadores." };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteRewardModifierGroup(groupId: string): Promise<ActionResult> {
  try {
    const group = await prisma.rewardModifierGroup.findUnique({ where: { id: groupId }, include: { reward: true } });
    if (!group) return { ok: false, error: "Grupo no encontrado." };
    await assertOwnsBusiness(group.reward.businessId);
    await prisma.rewardModifierGroup.delete({ where: { id: groupId } });
  } catch {
    return { ok: false, error: "No se pudo borrar el grupo." };
  }
  revalidatePath(PATH);
  return { ok: true };
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/fidelizacion/tienda-puntos/actions.ts
git commit -m "feat: add reward catalog admin server actions"
```

---

### Task 4: Admin page — load categories/rewards

**Files:**
- Modify: `app/dashboard/fidelizacion/tienda-puntos/page.tsx` (replace placeholder)

**Interfaces:**
- Consumes: `requireBusinessId` from `@/lib/tenant`, `prisma`.
- Produces: renders `<TiendaPuntosClient />` (Task 6) with `businessId`, `categories` prop shaped `{ id, name, rewards: { id, name, description, active, imageUrl, pointsCost, variants, modifierGroups }[] }[]`.

- [ ] **Step 1: Write the file**

```tsx
import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/tenant";
import { TiendaPuntosClient } from "./tienda-puntos-client";

export const dynamic = "force-dynamic";

export default async function TiendaPuntosPage() {
  const businessId = await requireBusinessId();

  const categories = await prisma.rewardCategory.findMany({
    where: { businessId },
    orderBy: { sortOrder: "asc" },
    include: {
      rewards: {
        orderBy: { name: "asc" },
        include: {
          variants: true,
          modifierGroups: {
            orderBy: { sortOrder: "asc" },
            include: { modifiers: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });

  return (
    <TiendaPuntosClient
      businessId={businessId}
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        rewards: c.rewards.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          active: r.active,
          imageUrl: r.imageUrl,
          pointsCost: r.variants.find((v) => v.isDefault)?.pointsCost ?? r.variants[0]?.pointsCost ?? 0,
          variants: r.variants.map((v) => ({ id: v.id, name: v.name, pointsCost: v.pointsCost, isDefault: v.isDefault })),
          modifierGroups: r.modifierGroups.map((g) => ({
            id: g.id,
            name: g.name,
            required: g.required,
            multiple: g.multiple,
            modifiers: g.modifiers.map((m) => ({ id: m.id, name: m.name, pointsCost: m.pointsCost })),
          })),
        })),
      }))}
    />
  );
}
```

- [ ] **Step 2: Verify it renders without the client component**

This will fail to compile until Task 6 creates `tienda-puntos-client.tsx` — that's expected. Move directly to Task 5/6.

- [ ] **Step 3: Commit** (bundle with Task 6's commit — see Task 6 Step 5)

---

### Task 5: Admin reward modifier groups editor

**Files:**
- Create: `app/dashboard/fidelizacion/tienda-puntos/reward-modifier-groups-editor.tsx`

**Interfaces:**
- Consumes: `saveRewardModifierGroup`, `deleteRewardModifierGroup`, `type RewardModifierGroupInput` from `./actions` (Task 3).
- Produces: `type RewardModifierGroupData = { id: string; name: string; required: boolean; multiple: boolean; modifiers: { id: string; name: string; pointsCost: number }[] }`, `<RewardModifierGroupsEditor businessId productId={rewardId} groups onSaved />` — consumed by Task 6 (reward-drawer).

This mirrors `app/dashboard/menu/modifier-groups-editor.tsx` minus the cross-product "Asociar platillos" feature (reward modifier groups aren't shared — no join table, per design).

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  saveRewardModifierGroup,
  deleteRewardModifierGroup,
  type RewardModifierGroupInput,
} from "./actions";

export type RewardModifierGroupData = {
  id: string;
  name: string;
  required: boolean;
  multiple: boolean;
  modifiers: { id: string; name: string; pointsCost: number }[];
};

type GroupForm = {
  key: string;
  id?: string;
  name: string;
  required: boolean;
  multiple: boolean;
  modifiers: { key: string; id?: string; name: string; pointsCost: string }[];
};

function groupToForm(g?: RewardModifierGroupData): GroupForm {
  return {
    key: g?.id ?? crypto.randomUUID(),
    id: g?.id,
    name: g?.name ?? "",
    required: g?.required ?? false,
    multiple: g?.multiple ?? false,
    modifiers: g?.modifiers.map((m) => ({ key: m.id, id: m.id, name: m.name, pointsCost: String(m.pointsCost) })) ?? [
      { key: crypto.randomUUID(), name: "", pointsCost: "0" },
    ],
  };
}

export function RewardModifierGroupsEditor({
  businessId,
  rewardId,
  groups,
  onSaved,
}: {
  businessId: string;
  rewardId: string;
  groups: RewardModifierGroupData[];
  onSaved: () => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [forms, setForms] = useState<GroupForm[]>([]);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    setForms((prev) => {
      const unsaved = prev.filter((f) => !f.id);
      const saved = groups.map((g) => prev.find((f) => f.id === g.id) ?? groupToForm(g));
      return [...saved, ...unsaved];
    });
  }, [groups, drawerOpen]);

  function openDrawer(expandKey: string | null) {
    setForms(groups.map((g) => groupToForm(g)));
    setExpandedKey(expandKey);
    setError(null);
    setDrawerOpen(true);
  }

  function openNewGroup() {
    const form = groupToForm();
    setForms(groups.map((g) => groupToForm(g)).concat(form));
    setExpandedKey(form.key);
    setError(null);
    setDrawerOpen(true);
  }

  function updateForm(key: string, patch: Partial<GroupForm>) {
    setForms((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  }

  function addModifier(key: string) {
    setForms((prev) =>
      prev.map((f) =>
        f.key === key ? { ...f, modifiers: [...f.modifiers, { key: crypto.randomUUID(), name: "", pointsCost: "0" }] } : f,
      ),
    );
  }

  function updateModifier(formKey: string, modKey: string, patch: Partial<GroupForm["modifiers"][number]>) {
    setForms((prev) =>
      prev.map((f) =>
        f.key === formKey
          ? { ...f, modifiers: f.modifiers.map((m) => (m.key === modKey ? { ...m, ...patch } : m)) }
          : f,
      ),
    );
  }

  function removeModifier(formKey: string, modKey: string) {
    setForms((prev) =>
      prev.map((f) =>
        f.key === formKey && f.modifiers.length > 1
          ? { ...f, modifiers: f.modifiers.filter((m) => m.key !== modKey) }
          : f,
      ),
    );
  }

  function removeUnsavedGroup(key: string) {
    setForms((prev) => prev.filter((f) => f.key !== key));
    setExpandedKey(null);
  }

  function saveGroup(form: GroupForm) {
    if (!form.name.trim()) {
      setError("Nombre del grupo requerido.");
      return;
    }
    setError(null);
    const input: RewardModifierGroupInput = {
      id: form.id,
      name: form.name,
      required: form.required,
      multiple: form.multiple,
      modifiers: form.modifiers.map((m) => ({ id: m.id, name: m.name, pointsCost: Number(m.pointsCost) || 0 })),
    };
    startTransition(async () => {
      const result = await saveRewardModifierGroup(businessId, rewardId, input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  }

  function removeGroup(groupId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteRewardModifierGroup(groupId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">
          Modificadores{groups.length > 0 ? ` (${groups.length})` : ""}
        </p>
        <button
          type="button"
          onClick={openNewGroup}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" /> Agregar grupo
        </button>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-text-secondary">Tamaño, color, extras...</p>
      ) : (
        <div className="space-y-1.5">
          {groups.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm text-text-primary"
            >
              <span className="truncate">{g.name}</span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => openDrawer(g.id)}
                  className="rounded-full p-1.5 text-text-secondary hover:bg-surface hover:text-primary"
                  aria-label="Editar grupo"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeGroup(g.id)}
                  className="rounded-full p-1.5 text-text-secondary hover:bg-surface hover:text-danger"
                  aria-label="Borrar grupo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="flex w-full flex-col sm:max-w-sm data-[side=left]:left-56">
          <SheetHeader>
            <SheetTitle>Editar modificadores</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-4">
            {error && <p className="text-sm text-danger">{error}</p>}

            {forms.map((form) => {
              const expanded = expandedKey === form.key;
              return (
                <div key={form.key} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={form.name}
                      onChange={(e) => updateForm(form.key, { name: e.target.value })}
                      placeholder="Ej: Elegí el tamaño"
                      className="flex-1 border-b border-border bg-transparent px-1 py-0.5 text-sm font-medium outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setExpandedKey(expanded ? null : form.key)}
                      className="rounded-full p-1 text-text-secondary hover:bg-surface"
                    >
                      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => (form.id ? removeGroup(form.id) : removeUnsavedGroup(form.key))}
                      className="rounded-full p-1 text-text-secondary hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {expanded && (
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap gap-4 text-sm text-text-primary">
                        <label className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={form.required}
                            onChange={(e) => updateForm(form.key, { required: e.target.checked })}
                          />
                          Obligatorio
                        </label>
                        <label className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={form.multiple}
                            onChange={(e) => updateForm(form.key, { multiple: e.target.checked })}
                          />
                          Selección múltiple
                        </label>
                      </div>

                      <div className="space-y-2">
                        {form.modifiers.map((m) => (
                          <div key={m.key} className="flex items-center gap-2">
                            <input
                              value={m.name}
                              onChange={(e) => updateModifier(form.key, m.key, { name: e.target.value })}
                              placeholder="Opción"
                              className="flex-1 rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                            />
                            <input
                              type="text"
                              inputMode="numeric"
                              value={m.pointsCost}
                              onChange={(e) => updateModifier(form.key, m.key, { pointsCost: e.target.value.replace(/\D/g, "") })}
                              placeholder="0 pts"
                              className="w-24 rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => removeModifier(form.key, m.key)}
                              className="shrink-0 text-text-secondary hover:text-danger"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addModifier(form.key)}
                          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <Plus className="h-3.5 w-3.5" /> Agregar opción
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => saveGroup(form)}
                        disabled={isPending}
                        className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                      >
                        Guardar grupo
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

- [ ] **Step 2: Type-check** (will still fail — `reward-drawer.tsx` doesn't exist yet; that's Task 6). Skip standalone verification, proceed.

---

### Task 6: Admin reward drawer + tienda-puntos client (categories grid)

**Files:**
- Create: `app/dashboard/fidelizacion/tienda-puntos/reward-drawer.tsx`
- Create: `app/dashboard/fidelizacion/tienda-puntos/tienda-puntos-client.tsx`

**Interfaces:**
- Consumes: `type RewardVariantInput`, `saveReward`, `toggleRewardActive`, `deleteReward`, `duplicateReward`, `moveRewardCategory`, `createRewardCategory`, `renameRewardCategory`, `deleteRewardCategory`, `reorderRewardCategories`, `uploadRewardImage`, `updateRewardImage` from `./actions` (Task 3); `RewardModifierGroupsEditor`, `type RewardModifierGroupData` from `./reward-modifier-groups-editor` (Task 5); `ProductImageUploader` from `@/app/dashboard/menu/product-image-uploader` (existing, reused as-is — generic `image`/`onChange`/`size` props, no reward-specific logic needed).
- Produces: `<TiendaPuntosClient businessId categories />` — the default export consumed by Task 4's `page.tsx`.

- [ ] **Step 1: Write `reward-drawer.tsx`**

Mirrors `app/dashboard/menu/product-drawer.tsx` with: no AI-description generation (not requested for rewards), "Precio(s)" → "Costo en puntos", `ARS $` money field → plain integer points field, no costo/embalaje/SKU pill fields (rewards don't track cost/packaging/SKU).

```tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, X, GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ProductImageUploader } from "@/app/dashboard/menu/product-image-uploader";
import type { RewardVariantInput } from "./actions";
import { RewardModifierGroupsEditor, type RewardModifierGroupData } from "./reward-modifier-groups-editor";

type Variant = { id: string; name: string; pointsCost: number; isDefault: boolean };
type Reward = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  pointsCost: number;
  imageUrl: string | null;
  variants: Variant[];
  modifierGroups: RewardModifierGroupData[];
};

export type DrawerState =
  | { mode: "create"; categoryId: string }
  | { mode: "edit"; reward: Reward; categoryId: string }
  | null;

type Row = { key: string; id?: string; name: string; pointsCost: string; collapsed: boolean };

function rowFromVariant(v?: Variant, name = "Único"): Row {
  return {
    key: v?.id ?? crypto.randomUUID(),
    id: v?.id,
    name: v?.name ?? name,
    pointsCost: v ? String(v.pointsCost) : "",
    collapsed: false,
  };
}

function PointsField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs text-text-secondary">{label}</p>
      <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5">
        <input
          type="text"
          inputMode="numeric"
          value={value ? Number(value).toLocaleString("es-AR") : ""}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          placeholder="0"
          className="w-full min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none"
        />
        <span className="shrink-0 text-sm text-text-secondary">pts</span>
      </div>
    </div>
  );
}

export function RewardDrawer({
  businessId,
  state,
  isPending,
  onClose,
  onSave,
  onImageChange,
  onModifiersSaved,
}: {
  businessId: string;
  state: DrawerState;
  isPending: boolean;
  onClose: () => void;
  onSave: (input: { rewardId?: string; categoryId: string; name: string; description: string; variants: RewardVariantInput[]; imageDataUrl?: string }) => void;
  onImageChange: (rewardId: string, dataUrl: string) => void;
  onModifiersSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceMode, setPriceMode] = useState<"simple" | "variants">("simple");
  const [rows, setRows] = useState<Row[]>([rowFromVariant()]);
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  useEffect(() => {
    if (!state) return;
    if (state.mode === "edit") {
      setName(state.reward.name);
      setDescription(state.reward.description ?? "");
      const variants = state.reward.variants.length > 0 ? state.reward.variants : undefined;
      setRows(variants ? variants.map((v) => rowFromVariant(v)) : [rowFromVariant()]);
      setPriceMode(variants && variants.length > 1 ? "variants" : "simple");
    } else {
      setName("");
      setDescription("");
      setRows([rowFromVariant()]);
      setPriceMode("simple");
    }
    setPendingImage(null);
  }, [state]);

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addVariantRow() {
    setRows((prev) => [...prev, rowFromVariant(undefined, "")]);
  }

  function removeVariantRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  function handleSave() {
    if (!state) return;
    const activeRows = priceMode === "simple" ? [rows[0]] : rows;
    const variants: RewardVariantInput[] = activeRows.map((r, i) => ({
      id: r.id,
      name: priceMode === "simple" ? "Único" : r.name || `Variante ${i + 1}`,
      pointsCost: Number(r.pointsCost) || 0,
      isDefault: i === 0,
    }));
    onSave({
      rewardId: state.mode === "edit" ? state.reward.id : undefined,
      categoryId: state.categoryId,
      name,
      description,
      variants,
      imageDataUrl: pendingImage ?? undefined,
    });
  }

  return (
    <Sheet
      open={!!state}
      onOpenChange={(open, eventDetails) => {
        if (open) return;
        if (eventDetails.reason === "outside-press" || eventDetails.reason === "focus-out") return;
        onClose();
      }}
      modal={false}
    >
      <SheetContent
        showOverlay={false}
        className="flex w-full flex-col sm:max-w-md data-[side=right]:top-16 data-[side=right]:h-[calc(100%-4rem)]"
      >
        <SheetHeader>
          <SheetTitle>{state?.mode === "create" ? "Nuevo premio" : "Editar premio"}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="flex gap-3">
            <ProductImageUploader
              size="lg"
              image={state?.mode === "edit" ? state.reward.imageUrl : pendingImage}
              onChange={(dataUrl) =>
                state?.mode === "edit" ? onImageChange(state.reward.id, dataUrl) : setPendingImage(dataUrl)
              }
            />
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-text-secondary">Nombre</p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-text-secondary">Descripción</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <Separator />

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">Costo en puntos</p>
              <div className="inline-flex rounded-md border border-border p-0.5">
                <button
                  type="button"
                  onClick={() => setPriceMode("simple")}
                  className={`rounded px-3 py-1 text-xs font-medium ${priceMode === "simple" ? "bg-primary text-white" : "text-text-secondary"}`}
                >
                  Simple
                </button>
                <button
                  type="button"
                  onClick={() => setPriceMode("variants")}
                  className={`rounded px-3 py-1 text-xs font-medium ${priceMode === "variants" ? "bg-primary text-white" : "text-text-secondary"}`}
                >
                  Variantes{rows.length > 1 ? ` ${rows.length}` : ""}
                </button>
              </div>
            </div>

            {priceMode === "simple" ? (
              <PointsField label="Puntos" value={rows[0]?.pointsCost ?? ""} onChange={(v) => updateRow(rows[0].key, { pointsCost: v })} />
            ) : (
              <div className="space-y-3">
                {rows.map((row) => (
                  <div key={row.key} className="rounded-lg border border-border p-3">
                    <div className={row.collapsed ? "" : "mb-2"}>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 shrink-0 text-text-secondary" />
                        <input
                          value={row.name}
                          onChange={(e) => updateRow(row.key, { name: e.target.value })}
                          placeholder="Nombre de la variante"
                          className="flex-1 border-b border-border bg-transparent px-1 py-0.5 text-sm font-medium outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => updateRow(row.key, { collapsed: !row.collapsed })}
                          className="rounded-full p-1 text-text-secondary hover:bg-surface"
                        >
                          {row.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                        </button>
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariantRow(row.key)}
                            className="rounded-full p-1 text-text-secondary hover:bg-surface"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {!row.collapsed && (
                      <PointsField label="Puntos" value={row.pointsCost} onChange={(v) => updateRow(row.key, { pointsCost: v })} />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVariantRow}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" /> Añadir variante
                </button>
              </div>
            )}
          </div>

          <Separator />

          {state?.mode === "edit" ? (
            <RewardModifierGroupsEditor
              businessId={businessId}
              rewardId={state.reward.id}
              groups={state.reward.modifierGroups}
              onSaved={onModifiersSaved}
            />
          ) : (
            <p className="text-sm text-text-secondary">Guardá el premio para poder agregar modificadores.</p>
          )}
        </div>

        <Separator />
        <SheetFooter className="flex-row justify-end gap-3">
          <SheetClose className="text-sm text-text-secondary hover:underline">Cancelar</SheetClose>
          <button
            onClick={handleSave}
            disabled={isPending || !name.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            Guardar
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Write `tienda-puntos-client.tsx`**

Mirrors `app/dashboard/menu/menu-client.tsx`, stripped of: restaurant logo/banner/name header, live-preview iframe, share/copy-link panel, opening hours, branches (none of that applies to a business-scoped reward catalog).

```tsx
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown, ChevronUp, GripVertical, MoreVertical, Plus, FoldVertical, UnfoldVertical, Eye, EyeOff, Pencil, Copy, FolderInput, Trash2, Settings2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createRewardCategory,
  renameRewardCategory,
  reorderRewardCategories,
  deleteRewardCategory,
  saveReward,
  toggleRewardActive,
  deleteReward,
  duplicateReward,
  moveRewardCategory,
  uploadRewardImage,
  updateRewardImage,
  type RewardVariantInput,
} from "./actions";
import { ProductImageUploader } from "@/app/dashboard/menu/product-image-uploader";
import { RewardDrawer, type DrawerState } from "./reward-drawer";
import type { RewardModifierGroupData } from "./reward-modifier-groups-editor";

type Variant = { id: string; name: string; pointsCost: number; isDefault: boolean };
type Reward = { id: string; name: string; description: string | null; active: boolean; pointsCost: number; imageUrl: string | null; variants: Variant[]; modifierGroups: RewardModifierGroupData[] };
type Category = { id: string; name: string; rewards: Reward[] };

export function TiendaPuntosClient({
  businessId,
  categories: initialCategories,
}: {
  businessId: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  useEffect(() => setCategories(initialCategories), [initialCategories]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<Set<string>>(new Set());
  const [isReordering, setIsReordering] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const newCategoryInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );
  const [drawerState, setDrawerState] = useState<DrawerState>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: true } | { ok: false; error: string }>, onOk?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOk?.();
    });
  }

  function handleCreateCategory() {
    const name = newCategoryName;
    run(() => createRewardCategory(businessId, name), () => {
      setCategories((prev) => [...prev, { id: crypto.randomUUID(), name: name.trim(), rewards: [] }]);
      setNewCategoryName("");
      setIsAddingCategory(false);
    });
  }

  function handleRenameCategory(categoryId: string, name: string) {
    if (!name.trim()) return;
    run(() => renameRewardCategory(categoryId, name), () => {
      setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, name: name.trim() } : c)));
    });
  }

  function handleDeleteCategory(categoryId: string) {
    run(() => deleteRewardCategory(categoryId), () => {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    });
  }

  function toggleCategoryCollapsed(categoryId: string) {
    setCollapsedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = categories.findIndex((c) => c.id === active.id);
    const toIndex = categories.findIndex((c) => c.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = arrayMove(categories, fromIndex, toIndex);
    setCategories(next);
    run(() => reorderRewardCategories(next.map((c) => c.id)));
  }

  function handleSaveReward(input: { rewardId?: string; categoryId: string; name: string; description: string; variants: RewardVariantInput[]; imageDataUrl?: string }) {
    setError(null);
    startTransition(async () => {
      const result = await saveReward({
        rewardId: input.rewardId,
        businessId,
        categoryId: input.categoryId,
        name: input.name,
        description: input.description,
        variants: input.variants,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (input.imageDataUrl) {
        const uploaded = await uploadRewardImage(businessId, result.rewardId, input.imageDataUrl);
        if (uploaded.ok) await updateRewardImage(result.rewardId, uploaded.url);
      }
      router.refresh();
      setDrawerState(null);
    });
  }

  function handleDuplicateReward(rewardId: string) {
    run(() => duplicateReward(rewardId), () => router.refresh());
  }

  function handleMoveRewardCategory(rewardId: string, categoryId: string) {
    run(() => moveRewardCategory(rewardId, categoryId), () => router.refresh());
  }

  function handleToggleActive(rewardId: string, active: boolean) {
    run(() => toggleRewardActive(rewardId, active), () => {
      setCategories((prev) => prev.map((c) => ({ ...c, rewards: c.rewards.map((r) => (r.id === rewardId ? { ...r, active } : r)) })));
    });
  }

  async function handleRewardImageChange(rewardId: string, dataUrl: string) {
    setError(null);
    startTransition(async () => {
      const uploaded = await uploadRewardImage(businessId, rewardId, dataUrl);
      if (!uploaded.ok) {
        setError(uploaded.error);
        return;
      }
      const result = await updateRewardImage(rewardId, uploaded.url);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCategories((prev) => prev.map((c) => ({ ...c, rewards: c.rewards.map((r) => (r.id === rewardId ? { ...r, imageUrl: uploaded.url } : r)) })));
    });
  }

  function handleDeleteReward(rewardId: string) {
    run(() => deleteReward(rewardId), () => {
      setCategories((prev) => prev.map((c) => ({ ...c, rewards: c.rewards.filter((r) => r.id !== rewardId) })));
    });
  }

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      <h1 className="mb-4 text-lg font-semibold text-text-primary">Tienda de puntos</h1>

      {categories.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex shrink-0 items-center gap-1.5 rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white outline-none hover:bg-orange-600">
              <Menu className="h-4 w-4" />
              Categorías
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              <DropdownMenuItem
                onClick={() => {
                  setIsAddingCategory(true);
                  requestAnimationFrame(() => newCategoryInputRef.current?.focus());
                }}
              >
                <Plus className="h-4 w-4" />
                Crear categoría
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsReordering((prev) => !prev)}>
                <Settings2 className="h-4 w-4" />
                {isReordering ? "Terminar de configurar" : "Configurar categorías"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCollapsedCategoryIds(new Set())}>
                <UnfoldVertical className="h-4 w-4" />
                Abrir todas las categorías
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCollapsedCategoryIds(new Set(categories.map((c) => c.id)))}>
                <FoldVertical className="h-4 w-4" />
                Cerrar todas las categorías
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex flex-1 gap-4 overflow-x-auto border-b border-border">
            {categories.map((category, i) => (
              <span
                key={category.id}
                className={`shrink-0 border-b-2 px-1 py-2 text-sm font-medium ${i === 0 ? "border-primary text-primary" : "border-transparent text-text-primary"}`}
              >
                {category.name}
              </span>
            ))}
            {isAddingCategory ? (
              <input
                ref={newCategoryInputRef}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onBlur={() => {
                  if (!newCategoryName.trim()) setIsAddingCategory(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCategory();
                  if (e.key === "Escape") {
                    setNewCategoryName("");
                    setIsAddingCategory(false);
                  }
                }}
                placeholder="Nueva categoría"
                disabled={isPending}
                className="w-32 shrink-0 rounded border border-border px-2 py-1 text-sm outline-none focus:border-primary"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsAddingCategory(true);
                  requestAnimationFrame(() => newCategoryInputRef.current?.focus());
                }}
                className="flex shrink-0 items-center gap-1 px-1 py-2 text-sm font-medium text-orange-500 hover:text-orange-600"
              >
                <Plus className="h-4 w-4" />
                Añadir categoría
              </button>
            )}
          </div>
        </div>
      )}

      {categories.length === 0 && !isAddingCategory && (
        <button
          type="button"
          onClick={() => setIsAddingCategory(true)}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-600"
        >
          <Plus className="h-4 w-4" /> Crear tu primera categoría de premios
        </button>
      )}
      {categories.length === 0 && isAddingCategory && (
        <div className="mb-4 flex items-center gap-2">
          <input
            ref={newCategoryInputRef}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
            placeholder="Nombre de la categoría"
            autoFocus
            className="rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
          <button onClick={handleCreateCategory} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white">
            Crear
          </button>
        </div>
      )}

      {error && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <DndContext id="reward-categories-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {categories.map((category) => (
              <SortableCategoryRow key={category.id} categoryId={category.id}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:flex-nowrap sm:gap-3">
                  <div className="min-w-0 flex-1 basis-36">
                    <p className="text-xs text-text-secondary">Nombre de categoría</p>
                    <input
                      defaultValue={category.name}
                      onBlur={(e) => handleRenameCategory(category.id, e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                      className="w-full truncate border-b border-border bg-transparent pb-0.5 font-medium text-text-primary outline-none focus:border-primary"
                    />
                  </div>
                  <span className="order-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-xs font-medium text-text-secondary sm:order-none">
                    {category.rewards.length}
                  </span>
                  <button
                    onClick={() => setDrawerState({ mode: "create", categoryId: category.id })}
                    className="order-4 shrink-0 whitespace-nowrap rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary-light sm:order-none"
                  >
                    + Premio
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="order-5 shrink-0 rounded-full p-1 text-text-secondary outline-none hover:bg-background sm:order-none">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)}>Borrar categoría</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button
                    onClick={() => toggleCategoryCollapsed(category.id)}
                    className="order-2 ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background text-text-secondary hover:text-primary sm:order-none sm:ml-0"
                  >
                    {collapsedCategoryIds.has(category.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </button>
                </div>

                {!isReordering && !collapsedCategoryIds.has(category.id) && (
                  <>
                    <ul className="divide-y divide-border">
                      {category.rewards.map((reward) => (
                        <li key={reward.id} className="flex items-center gap-2 py-2">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setDrawerState({ mode: "edit", reward, categoryId: category.id })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setDrawerState({ mode: "edit", reward, categoryId: category.id });
                              }
                            }}
                            className="flex min-w-0 items-center gap-3 text-left"
                          >
                            <ProductImageUploader image={reward.imageUrl} onChange={(dataUrl) => handleRewardImageChange(reward.id, dataUrl)} />
                            <div className="min-w-0 max-w-xs">
                              <p className={`truncate text-sm font-medium ${reward.active ? "text-text-primary" : "text-text-secondary"}`}>
                                {reward.name}
                              </p>
                              {!reward.active && <p className="text-xs font-medium text-danger">No disponible</p>}
                            </div>
                          </div>
                          <Separator orientation="vertical" className="h-4 !w-px !self-center" />
                          <div className="flex shrink-0 items-center gap-3">
                            <p className="text-sm font-medium text-text-primary">{reward.pointsCost.toLocaleString("es-AR")} pts</p>
                            <button
                              onClick={() => handleToggleActive(reward.id, !reward.active)}
                              disabled={isPending}
                              className={reward.active ? "text-primary" : "text-text-secondary"}
                              title={reward.active ? "Desactivar" : "Activar"}
                            >
                              {reward.active ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="rounded-full p-1 text-text-secondary outline-none hover:bg-background">
                                <MoreVertical className="h-5 w-5" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setDrawerState({ mode: "edit", reward, categoryId: category.id })}>
                                  <Pencil className="h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateReward(reward.id)}>
                                  <Copy className="h-4 w-4" />
                                  Duplicar
                                </DropdownMenuItem>
                                {categories.length > 1 && (
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                      <FolderInput className="h-4 w-4" />
                                      Mover a categoría...
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuSubContent>
                                        {categories
                                          .filter((c) => c.id !== category.id)
                                          .map((c) => (
                                            <DropdownMenuItem key={c.id} onClick={() => handleMoveRewardCategory(reward.id, c.id)}>
                                              {c.name}
                                            </DropdownMenuItem>
                                          ))}
                                      </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenuSub>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={() => handleDeleteReward(reward.id)}>
                                  <Trash2 className="h-4 w-4" />
                                  Borrar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {category.rewards.length === 0 && (
                      <button
                        type="button"
                        onClick={() => setDrawerState({ mode: "create", categoryId: category.id })}
                        className="flex w-full items-center gap-1.5 py-2 text-sm font-medium text-orange-500 hover:text-orange-600"
                      >
                        <Plus className="h-4 w-4" />
                        Añadir premio
                      </button>
                    )}
                  </>
                )}
              </SortableCategoryRow>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <RewardDrawer
        businessId={businessId}
        state={drawerState}
        isPending={isPending}
        onClose={() => setDrawerState(null)}
        onSave={handleSaveReward}
        onImageChange={handleRewardImageChange}
        onModifiersSaved={() => router.refresh()}
      />
    </main>
  );
}

function SortableCategoryRow({ categoryId, children }: { categoryId: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: categoryId });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={`rounded-lg bg-surface p-3 transition-opacity ${isDragging ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-1 shrink-0 touch-none cursor-grab text-text-secondary active:cursor-grabbing"
          title="Arrastrar para reordenar"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors across Tasks 3–6.

- [ ] **Step 4: Manual verification**

```bash
npm run dev
```

Visit `/dashboard/fidelizacion/tienda-puntos` logged in as a business owner. Verify:
- create a category, rename it, reorder via drag, delete it
- create a reward with a single points cost, edit it, add a second variant, remove it
- upload a reward image (crops and shows)
- add a modifier group (required/multiple), add options with points cost, save, delete
- toggle active/inactive, duplicate, move to another category, delete

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/fidelizacion/tienda-puntos
git commit -m "feat: admin UI for reward catalog (categories, rewards, variants, modifiers)"
```

---

### Task 7: Customer redeem action

**Files:**
- Create: `app/menu/[restaurantSlug]/tienda-puntos/actions.ts`

**Interfaces:**
- Consumes: `prisma`, `getOrCreateCustomer` from `@/lib/customer-auth`, `getPointsBalance`, `generateRedemptionCode` from `@/lib/loyalty` (Task 2).
- Produces: `type RedeemResult`, `redeemReward(businessId: string, rewardVariantId: string, selectedModifierIds: string[]): Promise<RedeemResult>` — consumed by Task 9's reward detail page.

- [ ] **Step 1: Write the file**

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { getPointsBalance, generateRedemptionCode } from "@/lib/loyalty";

export type RedeemResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

export async function redeemReward(
  businessId: string,
  rewardVariantId: string,
  selectedModifierIds: string[],
): Promise<RedeemResult> {
  const result = await getOrCreateCustomer(businessId);
  if (!result) return { ok: false, error: "Necesitás iniciar sesión." };
  const { customer } = result;

  const variant = await prisma.rewardVariant.findUnique({
    where: { id: rewardVariantId },
    include: { reward: true },
  });
  if (!variant || variant.reward.businessId !== businessId || !variant.reward.active) {
    return { ok: false, error: "Premio no disponible." };
  }

  const modifiers = selectedModifierIds.length
    ? await prisma.rewardModifier.findMany({
        where: { id: { in: selectedModifierIds }, group: { rewardId: variant.rewardId } },
      })
    : [];
  if (modifiers.length !== selectedModifierIds.length) {
    return { ok: false, error: "Modificador inválido." };
  }

  const modifiersCost = modifiers.reduce((sum, m) => sum + m.pointsCost, 0);
  const totalCost = variant.pointsCost + modifiersCost;

  try {
    const code = await prisma.$transaction(async (tx) => {
      const balance = await tx.pointsTransaction.aggregate({
        where: { customerId: customer.id },
        _sum: { points: true },
      });
      if ((balance._sum.points ?? 0) < totalCost) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const redemptionCode = generateRedemptionCode();
      await tx.redemption.create({
        data: {
          rewardId: variant.rewardId,
          rewardVariantId: variant.id,
          customerId: customer.id,
          code: redemptionCode,
          selectedModifiers: modifiers.map((m) => ({ name: m.name, pointsCost: m.pointsCost })),
          pointsSpent: totalCost,
        },
      });
      await tx.pointsTransaction.create({
        data: { customerId: customer.id, points: -totalCost, reason: "REDEMPTION" },
      });
      return redemptionCode;
    });

    return { ok: true, code };
  } catch (err) {
    console.error("[redeemReward] failed", err);
    if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
      return { ok: false, error: "No tenés puntos suficientes para este premio." };
    }
    return { ok: false, error: "No se pudo procesar el canje." };
  }
}
```

Note: `getPointsBalance` is imported but the transaction re-checks balance internally (`tx.pointsTransaction.aggregate`) for atomicity — a redeem racing with another redeem must not double-spend. `getPointsBalance` is used by Task 8's catalog page for display only.

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/menu/\[restaurantSlug\]/tienda-puntos/actions.ts
git commit -m "feat: add customer reward redemption action"
```

---

### Task 8: Customer catalog page (balance + reward grid)

**Files:**
- Create: `app/menu/[restaurantSlug]/tienda-puntos/page.tsx`
- Create: `app/menu/[restaurantSlug]/tienda-puntos/tienda-puntos-content.tsx`

**Interfaces:**
- Consumes: `getOrCreateCustomer` from `@/lib/customer-auth`, `getPointsBalance` from `@/lib/loyalty`, `prisma`.
- Produces: page at `/menu/[restaurantSlug]/tienda-puntos`, renders `<TiendaPuntosContent restaurantSlug balance categories />` where a reward click navigates to `/menu/[restaurantSlug]/tienda-puntos/[rewardId]` (Task 9).

- [ ] **Step 1: Write `page.tsx`**

Mirrors the auth-gate pattern in `app/menu/[restaurantSlug]/account/page.tsx`.

```tsx
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { getPointsBalance } from "@/lib/loyalty";
import { TiendaPuntosContent } from "./tienda-puntos-content";

export const dynamic = "force-dynamic";

export default async function CustomerTiendaPuntosPage({
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

  const [balance, categories] = await Promise.all([
    getPointsBalance(customer.id),
    prisma.rewardCategory.findMany({
      where: { businessId: restaurant.businessId },
      orderBy: { sortOrder: "asc" },
      include: {
        rewards: {
          where: { active: true },
          orderBy: { name: "asc" },
          include: { variants: true },
        },
      },
    }),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6">
      <Link
        href={`/menu/${restaurantSlug}`}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <HiArrowLeft className="h-4 w-4" />
        Volver al menú
      </Link>
      <TiendaPuntosContent
        restaurantSlug={restaurantSlug}
        balance={balance}
        categories={categories
          .map((c) => ({
            id: c.id,
            name: c.name,
            rewards: c.rewards.map((r) => ({
              id: r.id,
              name: r.name,
              description: r.description,
              imageUrl: r.imageUrl,
              pointsCost: r.variants.find((v) => v.isDefault)?.pointsCost ?? r.variants[0]?.pointsCost ?? 0,
            })),
          }))
          .filter((c) => c.rewards.length > 0)}
      />
    </main>
  );
}
```

- [ ] **Step 2: Write `tienda-puntos-content.tsx`**

Simple grid, mirrors the visual language of `app/menu/[restaurantSlug]/menu-content.tsx` (category sections, product-card-like reward tiles) without the search bar / sticky nav (not requested for this catalog).

```tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiGift } from "react-icons/hi2";

type Reward = { id: string; name: string; description: string | null; imageUrl: string | null; pointsCost: number };
type Category = { id: string; name: string; rewards: Reward[] };

export function TiendaPuntosContent({
  restaurantSlug,
  balance,
  categories,
}: {
  restaurantSlug: string;
  balance: number;
  categories: Category[];
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-light px-4 py-4">
        <HiGift className="h-8 w-8 text-primary" />
        <div>
          <p className="text-xs text-text-secondary">Tus puntos</p>
          <p className="text-2xl font-bold text-primary">{balance.toLocaleString("es-AR")}</p>
        </div>
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-text-secondary">Todavía no hay premios disponibles.</p>
      )}

      {categories.map((category) => (
        <div key={category.id}>
          <h2 className="mb-2 text-sm font-semibold text-text-primary">{category.name}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {category.rewards.map((reward) => {
              const affordable = balance >= reward.pointsCost;
              return (
                <button
                  key={reward.id}
                  type="button"
                  onClick={() => router.push(`/menu/${restaurantSlug}/tienda-puntos/${reward.id}`)}
                  className={`flex flex-col overflow-hidden rounded-lg border border-border bg-background text-left ${!affordable ? "opacity-60" : ""}`}
                >
                  <div className="flex h-24 w-full items-center justify-center bg-surface">
                    {reward.imageUrl ? (
                      <Image src={reward.imageUrl} alt={reward.name} width={200} height={96} className="h-24 w-full object-cover" />
                    ) : (
                      <HiGift className="h-8 w-8 text-text-secondary" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-2">
                    <p className="truncate text-sm font-medium text-text-primary">{reward.name}</p>
                    <p className="text-xs font-semibold text-primary">{reward.pointsCost.toLocaleString("es-AR")} pts</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: fails until Task 9 exists (the `[rewardId]` route it links to). That's fine — proceed directly.

---

### Task 9: Customer reward detail + canjear flow

**Files:**
- Create: `app/menu/[restaurantSlug]/tienda-puntos/[rewardId]/page.tsx`
- Create: `app/menu/[restaurantSlug]/tienda-puntos/[rewardId]/reward-detail.tsx`

**Interfaces:**
- Consumes: `prisma`, `getOrCreateCustomer` from `@/lib/customer-auth`, `getPointsBalance` from `@/lib/loyalty`, `redeemReward` from `../actions` (Task 7).
- Produces: page at `/menu/[restaurantSlug]/tienda-puntos/[rewardId]` — terminal route, nothing downstream depends on it.

- [ ] **Step 1: Write `page.tsx`**

Mirrors `app/menu/[restaurantSlug]/[productId]/page.tsx`'s data-loading shape, adds the auth gate (redeeming requires a logged-in customer) and balance.

```tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { getPointsBalance } from "@/lib/loyalty";
import { RewardDetail } from "./reward-detail";

export default async function RewardDetailPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string; rewardId: string }>;
}) {
  const { restaurantSlug, rewardId } = await params;

  const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
  if (!restaurant) notFound();

  const result = await getOrCreateCustomer(restaurant.businessId);
  if (!result) redirect(`/menu/${restaurantSlug}/account/login`);
  const { customer } = result;

  const reward = await prisma.reward.findFirst({
    where: { id: rewardId, active: true, businessId: restaurant.businessId },
    include: {
      variants: { orderBy: { pointsCost: "asc" } },
      modifierGroups: {
        orderBy: { sortOrder: "asc" },
        include: { modifiers: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!reward) notFound();

  const variant = reward.variants.find((v) => v.isDefault) ?? reward.variants[0];
  const balance = await getPointsBalance(customer.id);

  return (
    <RewardDetail
      restaurantSlug={restaurantSlug}
      businessId={restaurant.businessId}
      balance={balance}
      reward={{
        id: reward.id,
        variantId: variant?.id ?? "",
        name: reward.name,
        description: reward.description,
        imageUrl: reward.imageUrl,
        pointsCost: variant?.pointsCost ?? 0,
        modifierGroups: reward.modifierGroups.map((g) => ({
          id: g.id,
          name: g.name,
          required: g.required,
          multiple: g.multiple,
          modifiers: g.modifiers.map((m) => ({ id: m.id, name: m.name, pointsCost: m.pointsCost })),
        })),
      }}
    />
  );
}
```

- [ ] **Step 2: Write `reward-detail.tsx`**

Mirrors `app/menu/[restaurantSlug]/[productId]/product-page.tsx`'s selection/total logic, swaps "Agregar a mi pedido" (cart) for "Canjear" (spends points via `redeemReward`), shows insufficient-balance and success states inline.

```tsx
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiXMark, HiCheckCircle } from "react-icons/hi2";
import { redeemReward } from "../actions";

type Modifier = { id: string; name: string; pointsCost: number };
type ModifierGroup = { id: string; name: string; required: boolean; multiple: boolean; modifiers: Modifier[] };
export type RewardDetailData = {
  id: string;
  variantId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  pointsCost: number;
  modifierGroups: ModifierGroup[];
};

export function RewardDetail({
  restaurantSlug,
  businessId,
  balance,
  reward,
}: {
  restaurantSlug: string;
  businessId: string;
  balance: number;
  reward: RewardDetailData;
}) {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);

  function goBack() {
    router.push(`/menu/${restaurantSlug}/tienda-puntos`);
  }

  function toggleOption(group: ModifierGroup, modifierId: string) {
    setSelections((prev) => {
      const current = prev[group.id] ?? [];
      if (group.multiple) {
        const next = current.includes(modifierId) ? current.filter((id) => id !== modifierId) : [...current, modifierId];
        return { ...prev, [group.id]: next };
      }
      return { ...prev, [group.id]: current.includes(modifierId) ? [] : [modifierId] };
    });
  }

  const selectedModifiers = reward.modifierGroups.flatMap((g) => g.modifiers.filter((m) => (selections[g.id] ?? []).includes(m.id)));
  const modifiersCost = selectedModifiers.reduce((sum, m) => sum + m.pointsCost, 0);
  const totalCost = reward.pointsCost + modifiersCost;
  const missingRequired = reward.modifierGroups.some((g) => g.required && (selections[g.id] ?? []).length === 0);
  const canAfford = balance >= totalCost;

  function handleRedeem() {
    if (missingRequired || !canAfford) return;
    setError(null);
    startTransition(async () => {
      const result = await redeemReward(businessId, reward.variantId, selectedModifiers.map((m) => m.id));
      if (!result.ok) {
        console.error("[RewardDetail] redeem failed", result.error);
        setError(result.error);
        return;
      }
      setRedeemedCode(result.code);
    });
  }

  if (redeemedCode) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-3 px-4 text-center">
        <HiCheckCircle className="h-12 w-12 text-primary" />
        <h1 className="text-lg font-bold text-text-primary">¡Canjeado!</h1>
        <p className="text-sm text-text-secondary">Mostrá este código en el local:</p>
        <p className="rounded-lg border border-primary/30 bg-primary-light px-6 py-3 text-2xl font-bold tracking-widest text-primary">
          {redeemedCode}
        </p>
        <button type="button" onClick={goBack} className="mt-4 text-sm font-medium text-primary hover:underline">
          Volver a la tienda de puntos
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col bg-background pb-28">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold text-text-primary">{reward.name}</h1>
        <button
          type="button"
          onClick={goBack}
          aria-label="Cerrar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-surface"
        >
          <HiXMark className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        {reward.imageUrl && (
          <Image src={reward.imageUrl} alt={reward.name} width={640} height={360} className="h-48 w-full rounded-lg object-cover" />
        )}
        {reward.description && <p className="text-sm text-text-secondary">{reward.description}</p>}
        <p className="text-lg font-bold text-primary">{reward.pointsCost.toLocaleString("es-AR")} pts</p>

        {reward.modifierGroups.map((group) => (
          <div key={group.id} className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-text-primary">{group.name}</p>
              {group.required && (
                <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">Obligatorio</span>
              )}
            </div>
            <div className="space-y-2">
              {group.modifiers.map((m) => {
                const checked = (selections[group.id] ?? []).includes(m.id);
                return (
                  <label key={m.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 text-text-primary">
                      <input type={group.multiple ? "checkbox" : "radio"} name={group.id} checked={checked} onChange={() => toggleOption(group, m.id)} />
                      {m.name}
                    </span>
                    {m.pointsCost > 0 && <span className="text-text-secondary">+{m.pointsCost.toLocaleString("es-AR")} pts</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {error && <p className="text-sm text-danger">{error}</p>}
        {!canAfford && <p className="text-sm text-danger">No tenés puntos suficientes para este premio.</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-2xl border-t border-border bg-background p-4">
        <button
          type="button"
          onClick={handleRedeem}
          disabled={missingRequired || !canAfford || isPending}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Canjeando..." : `Canjear · ${totalCost.toLocaleString("es-AR")} pts`}
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors across Tasks 7–9.

- [ ] **Step 4: Manual verification**

```bash
npm run dev
```

As a logged-in customer at `/menu/<slug>/tienda-puntos`: verify balance shows, reward grid renders, click a reward, select required modifiers (button disabled until selected), click "Canjear":
- with insufficient points → error shown, no DB row created (spot-check `Redemption`/`PointsTransaction` count unchanged)
- with sufficient points → code shown, balance on catalog page decreases on next visit

- [ ] **Step 5: Commit**

```bash
git add app/menu/\[restaurantSlug\]/tienda-puntos
git commit -m "feat: customer reward catalog and redemption flow"
```

---

### Task 10: Nav link to customer tienda de puntos

**Files:**
- Modify: `app/menu/[restaurantSlug]/menu-navbar.tsx:6` (import), `app/menu/[restaurantSlug]/menu-navbar.tsx:188-194` (account menu link)

**Interfaces:**
- Consumes: nothing new (pure UI addition to an existing client component).
- Produces: nothing consumed downstream — leaf change.

- [ ] **Step 1: Add `HiGift` to the existing import**

In `app/menu/[restaurantSlug]/menu-navbar.tsx:6`, change:

```tsx
import { HiUserCircle, HiShare, HiGift, HiEye, HiEyeSlash } from "react-icons/hi2";
```

`HiGift` is already imported (used elsewhere in the file) — verify with a quick read; if the exact import line differs, add `HiGift` to it without duplicating.

- [ ] **Step 2: Add the link in the account dropdown**

In the same file, right after the closing `</Link>` of the "Mi cuenta" link (around line 194) and before the "Cerrar sesión" button, insert:

```tsx
            <Link
              href={`/menu/${restaurantSlug}/tienda-puntos`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-text-primary hover:bg-surface"
            >
              <HiGift className="h-4 w-4" />
              Tienda de puntos
            </Link>
```

- [ ] **Step 3: Type-check + manual check**

```bash
npx tsc --noEmit
npm run dev
```

Open the public menu as a logged-in customer, click the account icon, confirm "Tienda de puntos" link appears and navigates correctly.

- [ ] **Step 4: Commit**

```bash
git add app/menu/\[restaurantSlug\]/menu-navbar.tsx
git commit -m "feat: link to tienda de puntos from customer account menu"
```

---

## Self-review notes (already applied above)

- Spec coverage: schema (Task 1), admin CRUD (Tasks 3–6), customer balance+catalog (Task 8), variant/modifier picker + redeem (Task 9), nav entry (Task 10) — all design sections covered.
- No placeholders: every step has full file content or an exact line-range edit.
- Type consistency checked: `RewardVariantInput`/`RewardModifierGroupInput` names match between `actions.ts` (Task 3) and the components that import them (Tasks 5, 6); `RedeemResult`/`redeemReward` signature matches between Task 7 and Task 9.
