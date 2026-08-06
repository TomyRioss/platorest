# Encuestas Flexibles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar las 2 encuestas fijas (interna de 3 estrellas / externa Google Maps) por un sistema de N encuestas configurables por negocio, tipo Google Forms: formularios con preguntas de estrella/texto combinables y reordenables, o acciones de un solo click con link externo (seguinos en IG, dejá una reseña, etc).

**Architecture:** Server Components para queries (Prisma) + Client Components para interacción (crear/editar/reordenar/responder), server actions para todas las mutaciones. Sigue el patrón ya usado en `app/dashboard/menu/menu-client.tsx` para drag & drop con `@dnd-kit` y en `app/dashboard/menu/actions.ts` para el shape de las server actions.

**Tech Stack:** Next.js App Router, Prisma, `@dnd-kit/core` + `@dnd-kit/sortable` (ya instalado), react-icons (`hi2`), lucide-react (`GripVertical`, ya usado para drag handles).

## Global Constraints

- Nunca correr comandos Prisma sin permiso explícito del usuario en el mensaje — permiso ya otorgado para este plan puntual.
- No modificar el modelo `Survey` (rating/nps/comment) ni el enum que no sea `SurveyType`/`SurveyKind` — es un modelo no relacionado, sin uso en `app/`.
- Sin migración de datos de `SurveyConfig`/`SurveyCompletion` viejos — se dropean, cada negocio recrea sus encuestas.
- Puntos: uno por encuesta completa, no por pregunta.
- El campo `order` de `SurveyDefinition` (listado de encuestas) NO se implementa — no fue un requisito decidido (solo el reorden de preguntas dentro de un formulario lo fue). El listado se ordena por `createdAt`. Si más adelante hace falta reordenar encuestas, se agrega ahí.
- Todo error debe catchearse: loguear en consola (`console.error`) y devolver mensaje de error visible en UI (regla de `CLAUDE.md` del proyecto).
- Todos los precios/montos que aparezcan deben usar `formatMoney` de `@/lib/utils` — no aplica acá (no hay montos en dinero en esta feature).

---

## File Structure

- `prisma/schema.prisma` — reemplaza `SurveyType`/`SurveyConfig`/`SurveyCompletion` viejos por `QuestionType`, `SurveyKind`, `SurveyDefinition`, `SurveyQuestion`, `SurveyCompletion` (nuevo), `SurveyAnswer`.
- `app/dashboard/fidelizacion/encuestas/actions.ts` — server actions del dashboard: `saveSurvey`, `deleteSurvey`.
- `app/dashboard/fidelizacion/encuestas/page.tsx` — server component, query de encuestas del negocio.
- `app/dashboard/fidelizacion/encuestas/encuestas-client.tsx` — lista de encuestas (cards) + orquesta abrir/cerrar el form.
- `app/dashboard/fidelizacion/encuestas/survey-form.tsx` — form de crear/editar una encuesta, incluye el builder de preguntas con drag & drop.
- `app/menu/[restaurantSlug]/tienda-puntos/encuestas/actions.ts` — server actions del cliente: `submitFormSurvey`, `completeLinkAction`.
- `app/menu/[restaurantSlug]/tienda-puntos/encuestas/page.tsx` — server component, query de encuestas activas + completions del customer.
- `app/menu/[restaurantSlug]/tienda-puntos/encuestas/encuestas-content.tsx` — renderiza cada encuesta según `kind` (formulario o botón de acción).

No hay test runner configurado en el proyecto (sin jest/vitest en `package.json`). La verificación de cada tarea es `npx tsc --noEmit` (falla si hay tipos rotos) más, en la última tarea, un smoke test manual en el navegador.

---

### Task 1: Prisma schema — nuevos modelos de encuestas

**Files:**
- Modify: `prisma/schema.prisma:31` (campo `surveyConfigs` en `Business`)
- Modify: `prisma/schema.prisma:597-630` (enum `SurveyType`, model `SurveyConfig`, model `SurveyCompletion` viejo)

**Interfaces:**
- Produces: modelos Prisma `SurveyDefinition { id, businessId, title, kind: SurveyKind, points, active, externalUrl?, buttonLabel?, questions: SurveyQuestion[], completions: SurveyCompletion[], createdAt }`, `SurveyQuestion { id, surveyId, type: QuestionType, label, order, answers: SurveyAnswer[] }`, `SurveyCompletion { id, surveyId, customerId, pointsAwarded, createdAt, answers: SurveyAnswer[] }`, `SurveyAnswer { id, completionId, questionId, ratingValue?, textValue? }`. Enums `QuestionType { STAR, TEXT }`, `SurveyKind { FORM, LINK_ACTION }`.

- [ ] **Step 1: Cambiar el campo de relación en `Business`**

En `prisma/schema.prisma` línea 31, reemplazar:

```prisma
  surveyConfigs SurveyConfig[]
```

por:

```prisma
  surveyDefinitions SurveyDefinition[]
```

- [ ] **Step 2: Reemplazar `SurveyType`/`SurveyConfig`/`SurveyCompletion` viejos por los nuevos modelos**

En `prisma/schema.prisma`, reemplazar el bloque completo (líneas 597-630, desde `enum SurveyType {` hasta el cierre de `model SurveyCompletion {`):

```prisma
enum SurveyType {
  INTERNAL
  EXTERNAL
}

model SurveyConfig {
  id          String   @id @default(cuid())
  businessId  String
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  type        SurveyType
  points      Int
  active      Boolean  @default(false)
  // solo EXTERNAL: link a reseña de Google Maps
  externalUrl String?
  completions SurveyCompletion[]

  @@unique([businessId, type])
}

model SurveyCompletion {
  id               String       @id @default(cuid())
  surveyConfigId   String
  surveyConfig     SurveyConfig @relation(fields: [surveyConfigId], references: [id], onDelete: Cascade)
  customerId       String
  customer         Customer     @relation(fields: [customerId], references: [id], onDelete: Cascade)
  // solo INTERNAL, 1-5
  attentionRating  Int?
  foodRating       Int?
  experienceRating Int?
  pointsAwarded    Int
  createdAt        DateTime     @default(now())

  @@unique([surveyConfigId, customerId])
}
```

por:

```prisma
enum QuestionType {
  STAR
  TEXT
}

enum SurveyKind {
  FORM
  LINK_ACTION
}

model SurveyDefinition {
  id          String     @id @default(cuid())
  businessId  String
  business    Business   @relation(fields: [businessId], references: [id], onDelete: Cascade)
  title       String
  kind        SurveyKind
  points      Int
  active      Boolean    @default(false)
  // solo LINK_ACTION
  externalUrl String?
  buttonLabel String?
  questions   SurveyQuestion[]
  completions SurveyCompletion[]
  createdAt   DateTime   @default(now())

  @@index([businessId])
}

model SurveyQuestion {
  id       String           @id @default(cuid())
  surveyId String
  survey   SurveyDefinition @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  type     QuestionType
  label    String
  order    Int
  answers  SurveyAnswer[]

  @@index([surveyId, order])
}

model SurveyCompletion {
  id            String           @id @default(cuid())
  surveyId      String
  survey        SurveyDefinition @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  customerId    String
  customer      Customer         @relation(fields: [customerId], references: [id], onDelete: Cascade)
  pointsAwarded Int
  createdAt     DateTime         @default(now())
  answers       SurveyAnswer[]

  @@unique([surveyId, customerId])
}

model SurveyAnswer {
  id           String           @id @default(cuid())
  completionId String
  completion   SurveyCompletion @relation(fields: [completionId], references: [id], onDelete: Cascade)
  questionId   String
  question     SurveyQuestion   @relation(fields: [questionId], references: [id], onDelete: Cascade)
  ratingValue  Int?
  textValue    String?
}
```

No tocar `model Survey` (líneas 581-595) ni el campo `surveys Survey[]` de `Customer`/`Restaurant` — son de un modelo distinto sin relación con esta feature.

- [ ] **Step 3: Correr la migración**

Run: `cd "C:/Users/Pc/Desktop/proyectos/platorest" && npx prisma migrate dev --name flexible_surveys`
Expected: crea una carpeta nueva en `prisma/migrations/`, termina con `Your database is now in sync with your schema.` y regenera el client sin errores.

- [ ] **Step 4: Verificar tipos generados**

Run: `npx tsc --noEmit`
Expected: falla en los archivos que todavía usan `prisma.surveyConfig`/`SurveyType` (son los que se reescriben en las próximas tareas) — no debe fallar por el schema en sí.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): replace fixed survey slots with configurable survey definitions"
```

---

### Task 2: Server actions del dashboard (`saveSurvey`, `deleteSurvey`)

**Files:**
- Modify: `app/dashboard/fidelizacion/encuestas/actions.ts` (reescribir completo)

**Interfaces:**
- Consumes: `assertOwnsBusiness(businessId: string): Promise<void>` de `@/lib/tenant`; `prisma` de `@/lib/prisma`; modelos `SurveyDefinition`/`SurveyQuestion` de Task 1.
- Produces: `saveSurvey(input: SaveSurveyInput): Promise<ActionResult>`, `deleteSurvey(surveyId: string, businessId: string): Promise<ActionResult>`, tipo exportado `SaveSurveyInput`.

- [ ] **Step 1: Reescribir `actions.ts`**

Reemplazar todo el contenido de `app/dashboard/fidelizacion/encuestas/actions.ts` por:

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertOwnsBusiness } from "@/lib/tenant";
import type { QuestionType, SurveyKind } from "@prisma/client";

type ActionResult = { ok: true } | { ok: false; error: string };

const PATH = "/dashboard/fidelizacion/encuestas";

export type SurveyQuestionInput = {
  id?: string;
  type: QuestionType;
  label: string;
};

export type SaveSurveyInput = {
  surveyId?: string;
  businessId: string;
  title: string;
  kind: SurveyKind;
  points: number;
  active: boolean;
  externalUrl?: string;
  buttonLabel?: string;
  questions: SurveyQuestionInput[];
};

export async function saveSurvey(input: SaveSurveyInput): Promise<ActionResult> {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Ingresá un título." };
  if (!Number.isInteger(input.points) || input.points < 0) {
    return { ok: false, error: "Puntos inválidos." };
  }
  if (input.kind === "LINK_ACTION") {
    if (input.active && !input.externalUrl?.trim()) {
      return { ok: false, error: "Ingresá el link para activar." };
    }
  } else {
    const questions = input.questions.filter((q) => q.label.trim());
    if (questions.length === 0) {
      return { ok: false, error: "Agregá al menos una pregunta." };
    }
  }

  try {
    await assertOwnsBusiness(input.businessId);

    if (input.surveyId) {
      const existing = await prisma.surveyDefinition.findUnique({
        where: { id: input.surveyId },
        select: { businessId: true },
      });
      if (!existing || existing.businessId !== input.businessId) {
        return { ok: false, error: "Encuesta no encontrada." };
      }
    }

    const questions =
      input.kind === "FORM"
        ? input.questions.filter((q) => q.label.trim()).map((q, index) => ({ ...q, label: q.label.trim(), order: index }))
        : [];

    await prisma.$transaction(async (tx) => {
      const survey = input.surveyId
        ? await tx.surveyDefinition.update({
            where: { id: input.surveyId },
            data: {
              title,
              kind: input.kind,
              points: input.points,
              active: input.active,
              externalUrl: input.kind === "LINK_ACTION" ? input.externalUrl?.trim() || null : null,
              buttonLabel: input.kind === "LINK_ACTION" ? input.buttonLabel?.trim() || null : null,
            },
          })
        : await tx.surveyDefinition.create({
            data: {
              businessId: input.businessId,
              title,
              kind: input.kind,
              points: input.points,
              active: input.active,
              externalUrl: input.kind === "LINK_ACTION" ? input.externalUrl?.trim() || null : null,
              buttonLabel: input.kind === "LINK_ACTION" ? input.buttonLabel?.trim() || null : null,
            },
          });

      if (input.kind === "FORM") {
        const keepIds = questions.filter((q) => q.id).map((q) => q.id as string);
        await tx.surveyQuestion.deleteMany({
          where: { surveyId: survey.id, id: { notIn: keepIds.length > 0 ? keepIds : ["__none__"] } },
        });
        for (const q of questions) {
          if (q.id) {
            await tx.surveyQuestion.update({
              where: { id: q.id },
              data: { type: q.type, label: q.label, order: q.order },
            });
          } else {
            await tx.surveyQuestion.create({
              data: { surveyId: survey.id, type: q.type, label: q.label, order: q.order },
            });
          }
        }
      } else {
        await tx.surveyQuestion.deleteMany({ where: { surveyId: survey.id } });
      }
    });
  } catch (err) {
    console.error("[saveSurvey] failed", err);
    return { ok: false, error: "No se pudo guardar la encuesta." };
  }

  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteSurvey(surveyId: string, businessId: string): Promise<ActionResult> {
  try {
    await assertOwnsBusiness(businessId);
    const existing = await prisma.surveyDefinition.findUnique({
      where: { id: surveyId },
      select: { businessId: true },
    });
    if (!existing || existing.businessId !== businessId) {
      return { ok: false, error: "Encuesta no encontrada." };
    }
    await prisma.surveyDefinition.delete({ where: { id: surveyId } });
  } catch (err) {
    console.error("[deleteSurvey] failed", err);
    return { ok: false, error: "No se pudo borrar la encuesta." };
  }

  revalidatePath(PATH);
  return { ok: true };
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos en este archivo (los errores restantes son de `page.tsx`/`encuestas-client.tsx`, se resuelven en Task 3).

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/fidelizacion/encuestas/actions.ts
git commit -m "feat: add saveSurvey/deleteSurvey server actions"
```

---

### Task 3: Dashboard — page.tsx + encuestas-client.tsx (lista)

**Files:**
- Modify: `app/dashboard/fidelizacion/encuestas/page.tsx` (reescribir completo)
- Modify: `app/dashboard/fidelizacion/encuestas/encuestas-client.tsx` (reescribir completo)

**Interfaces:**
- Consumes: `saveSurvey`, `deleteSurvey`, `SaveSurveyInput` de Task 2; `SurveyForm` de Task 4 (prop `onSaved`, `onCancel`, `businessId`, `initial?`).
- Produces: tipo `SurveyListItem = { id, title, kind, points, active, externalUrl, buttonLabel, questions: { id, type, label, order }[] }`, usado por `SurveyForm`.

- [ ] **Step 1: Reescribir `page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { requireBusinessId } from "@/lib/tenant";
import { EncuestasClient } from "./encuestas-client";

export const dynamic = "force-dynamic";

export default async function EncuestasPage() {
  const businessId = await requireBusinessId();

  const surveys = await prisma.surveyDefinition.findMany({
    where: { businessId },
    include: { questions: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return <EncuestasClient businessId={businessId} surveys={surveys} />;
}
```

- [ ] **Step 2: Reescribir `encuestas-client.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { HiPlus, HiStar, HiChatBubbleLeftText, HiLink, HiPencil, HiTrash } from "react-icons/hi2";
import type { QuestionType, SurveyKind } from "@prisma/client";
import { deleteSurvey } from "./actions";
import { SurveyForm } from "./survey-form";

export type SurveyListItem = {
  id: string;
  title: string;
  kind: SurveyKind;
  points: number;
  active: boolean;
  externalUrl: string | null;
  buttonLabel: string | null;
  questions: { id: string; type: QuestionType; label: string; order: number }[];
};

export function EncuestasClient({
  businessId,
  surveys: initialSurveys,
}: {
  businessId: string;
  surveys: SurveyListItem[];
}) {
  const [surveys, setSurveys] = useState(initialSurveys);
  const [formState, setFormState] = useState<"closed" | "new" | string>("closed");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete(surveyId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteSurvey(surveyId, businessId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSurveys((prev) => prev.filter((s) => s.id !== surveyId));
    });
  }

  const editing = formState !== "closed" && formState !== "new" ? surveys.find((s) => s.id === formState) : undefined;

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Encuestas</h1>
          <p className="text-sm text-text-secondary">
            Sumá puntos a tus clientes cuando completan una encuesta o una acción (seguinos en Instagram, dejanos una reseña, etc).
          </p>
        </div>
        <button
          onClick={() => setFormState("new")}
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <HiPlus className="h-4 w-4" /> Nueva encuesta
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {formState === "new" && (
        <SurveyForm
          businessId={businessId}
          onCancel={() => setFormState("closed")}
          onSaved={(survey) => {
            setSurveys((prev) => [...prev, survey]);
            setFormState("closed");
          }}
        />
      )}

      {editing && (
        <SurveyForm
          businessId={businessId}
          initial={editing}
          onCancel={() => setFormState("closed")}
          onSaved={(survey) => {
            setSurveys((prev) => prev.map((s) => (s.id === survey.id ? survey : s)));
            setFormState("closed");
          }}
        />
      )}

      <div className="space-y-3">
        {surveys.length === 0 && (
          <p className="text-sm text-text-secondary">Todavía no creaste ninguna encuesta.</p>
        )}
        {surveys.map((survey) => (
          <div key={survey.id} className="rounded-lg bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                {survey.kind === "LINK_ACTION" ? (
                  <HiLink className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                ) : (
                  <HiStar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                )}
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">{survey.title}</h2>
                  <p className="text-xs text-text-secondary">
                    {survey.kind === "LINK_ACTION"
                      ? "Acción con link"
                      : `${survey.questions.length} pregunta${survey.questions.length === 1 ? "" : "s"}`}
                    {" · "}
                    {survey.points} pts {survey.active ? "· Activa" : "· Inactiva"}
                  </p>
                  {survey.kind === "FORM" && (
                    <ul className="mt-2 space-y-1">
                      {survey.questions.map((q) => (
                        <li key={q.id} className="flex items-center gap-1 text-xs text-text-secondary">
                          {q.type === "STAR" ? <HiStar className="h-3 w-3" /> : <HiChatBubbleLeftText className="h-3 w-3" />}
                          {q.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setFormState(survey.id)}
                  className="cursor-pointer rounded border border-border p-1.5 text-text-secondary hover:bg-muted"
                  title="Editar"
                >
                  <HiPencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(survey.id)}
                  disabled={isPending}
                  className="cursor-pointer rounded border border-red-200 p-1.5 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed"
                  title="Borrar"
                >
                  <HiTrash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: solo quedan errores en `survey-form.tsx` (no existe todavía) — se crea en Task 4.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/fidelizacion/encuestas/page.tsx app/dashboard/fidelizacion/encuestas/encuestas-client.tsx
git commit -m "feat: list configurable surveys in dashboard"
```

---

### Task 4: Dashboard — `survey-form.tsx` (builder con drag & drop)

**Files:**
- Create: `app/dashboard/fidelizacion/encuestas/survey-form.tsx`

**Interfaces:**
- Consumes: `saveSurvey`, `SaveSurveyInput`, `SurveyQuestionInput` de Task 2; `SurveyListItem` de Task 3.
- Produces: componente `SurveyForm({ businessId, initial?, onSaved, onCancel })` que llama `onSaved(survey: SurveyListItem)` al guardar OK.

- [ ] **Step 1: Crear `survey-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { HiStar, HiChatBubbleLeftText, HiTrash, HiPlus } from "react-icons/hi2";
import type { QuestionType, SurveyKind } from "@prisma/client";
import { saveSurvey } from "./actions";
import type { SurveyListItem } from "./encuestas-client";

type QuestionDraft = { key: string; id?: string; type: QuestionType; label: string };

function newKey() {
  return Math.random().toString(36).slice(2);
}

export function SurveyForm({
  businessId,
  initial,
  onSaved,
  onCancel,
}: {
  businessId: string;
  initial?: SurveyListItem;
  onSaved: (survey: SurveyListItem) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [kind, setKind] = useState<SurveyKind>(initial?.kind ?? "FORM");
  const [points, setPoints] = useState(initial?.points ?? 0);
  const [active, setActive] = useState(initial?.active ?? false);
  const [externalUrl, setExternalUrl] = useState(initial?.externalUrl ?? "");
  const [buttonLabel, setButtonLabel] = useState(initial?.buttonLabel ?? "");
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    initial?.questions.map((q) => ({ key: q.id, id: q.id, type: q.type, label: q.label })) ?? [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  function addQuestion(type: QuestionType) {
    setQuestions((prev) => [...prev, { key: newKey(), type, label: "" }]);
  }

  function updateQuestionLabel(key: string, label: string) {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, label } : q)));
  }

  function removeQuestion(key: string) {
    setQuestions((prev) => prev.filter((q) => q.key !== key));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active: activeItem, over } = event;
    if (!over || activeItem.id === over.id) return;
    const fromIndex = questions.findIndex((q) => q.key === activeItem.id);
    const toIndex = questions.findIndex((q) => q.key === over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    setQuestions((prev) => arrayMove(prev, fromIndex, toIndex));
  }

  async function handleSave() {
    setError(null);
    setIsSaving(true);
    const result = await saveSurvey({
      surveyId: initial?.id,
      businessId,
      title,
      kind,
      points,
      active,
      externalUrl,
      buttonLabel,
      questions: questions.map((q) => ({ id: q.id, type: q.type, label: q.label })),
    });
    setIsSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved({
      id: initial?.id ?? newKey(),
      title: title.trim(),
      kind,
      points,
      active,
      externalUrl: kind === "LINK_ACTION" ? externalUrl.trim() || null : null,
      buttonLabel: kind === "LINK_ACTION" ? buttonLabel.trim() || null : null,
      questions: questions
        .filter((q) => q.label.trim())
        .map((q, index) => ({ id: q.id ?? newKey(), type: q.type, label: q.label.trim(), order: index })),
    });
  }

  return (
    <div className="mb-4 rounded-lg border border-primary bg-background p-4">
      {error && (
        <p className="mb-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-3">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-text-secondary">Título</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: ¿Cómo estuvo tu visita?"
            className="rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Tipo</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as SurveyKind)}
            className="rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
          >
            <option value="FORM">Formulario</option>
            <option value="LINK_ACTION">Acción con link</option>
          </select>
        </label>
      </div>

      {kind === "LINK_ACTION" ? (
        <div className="mb-3 flex flex-wrap gap-3">
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-text-secondary">Link</span>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://instagram.com/turestaurante"
              className="rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary">Texto del botón</span>
            <input
              type="text"
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              placeholder="Ir"
              className="w-40 rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
      ) : (
        <div className="mb-3">
          <span className="mb-1 block text-xs text-text-secondary">Preguntas</span>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map((q) => q.key)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {questions.map((q) => (
                  <SortableQuestionRow
                    key={q.key}
                    questionKey={q.key}
                    type={q.type}
                    label={q.label}
                    onLabelChange={(label) => updateQuestionLabel(q.key, label)}
                    onRemove={() => removeQuestion(q.key)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => addQuestion("STAR")}
              className="flex cursor-pointer items-center gap-1 rounded border border-border px-2 py-1 text-xs text-text-secondary hover:bg-muted"
            >
              <HiStar className="h-3.5 w-3.5" /> + Estrellas
            </button>
            <button
              type="button"
              onClick={() => addQuestion("TEXT")}
              className="flex cursor-pointer items-center gap-1 rounded border border-border px-2 py-1 text-xs text-text-secondary hover:bg-muted"
            >
              <HiChatBubbleLeftText className="h-3.5 w-3.5" /> + Texto corto
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Puntos por completar</span>
          <input
            type="number"
            min={0}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-32 rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="flex items-center gap-2 pb-1.5">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4" />
          <span className="text-sm text-text-primary">Activa</span>
        </label>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          Guardar
        </button>
        <button
          onClick={onCancel}
          type="button"
          className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-muted"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function SortableQuestionRow({
  questionKey,
  type,
  label,
  onLabelChange,
  onRemove,
}: {
  questionKey: string;
  type: QuestionType;
  label: string;
  onLabelChange: (label: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: questionKey });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded border border-border bg-surface px-2 py-1.5 ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 touch-none cursor-grab text-text-secondary active:cursor-grabbing"
        title="Arrastrar para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {type === "STAR" ? <HiStar className="h-4 w-4 shrink-0 text-primary" /> : <HiChatBubbleLeftText className="h-4 w-4 shrink-0 text-primary" />}
      <input
        type="text"
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
        placeholder={type === "STAR" ? "Ej: Calidad de la comida" : "Ej: ¿Algo que quieras comentarnos?"}
        className="flex-1 border-none bg-transparent text-sm outline-none"
      />
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 cursor-pointer text-text-secondary hover:text-danger"
        title="Borrar pregunta"
      >
        <HiTrash className="h-4 w-4" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores en `app/dashboard/fidelizacion/encuestas/**`.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/fidelizacion/encuestas/survey-form.tsx
git commit -m "feat: add survey builder form with drag-and-drop questions"
```

---

### Task 5: Server actions del cliente (`submitFormSurvey`, `completeLinkAction`)

**Files:**
- Modify: `app/menu/[restaurantSlug]/tienda-puntos/encuestas/actions.ts` (reescribir completo)

**Interfaces:**
- Consumes: `getOrCreateCustomer(businessId: string)` de `@/lib/customer-auth` (devuelve `{ customer } | null`); `prisma` de `@/lib/prisma`.
- Produces: `submitFormSurvey(businessId: string, restaurantSlug: string, surveyId: string, answers: { questionId: string; ratingValue?: number; textValue?: string }[]): Promise<ActionResult>`, `completeLinkAction(businessId: string, restaurantSlug: string, surveyId: string): Promise<ActionResult>`.

- [ ] **Step 1: Reescribir `actions.ts`**

```ts
"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { revalidatePath } from "next/cache";

type ActionResult = { ok: true } | { ok: false; error: string };

function pathFor(restaurantSlug: string) {
  return `/menu/${restaurantSlug}/tienda-puntos/encuestas`;
}

export async function submitFormSurvey(
  businessId: string,
  restaurantSlug: string,
  surveyId: string,
  answers: { questionId: string; ratingValue?: number; textValue?: string }[],
): Promise<ActionResult> {
  const result = await getOrCreateCustomer(businessId);
  if (!result) return { ok: false, error: "Necesitás iniciar sesión." };
  const { customer } = result;

  try {
    const survey = await prisma.surveyDefinition.findUnique({
      where: { id: surveyId },
      include: { questions: true },
    });
    if (!survey || survey.businessId !== businessId || !survey.active || survey.kind !== "FORM") {
      return { ok: false, error: "La encuesta no está disponible." };
    }

    if (answers.length !== survey.questions.length) {
      return { ok: false, error: "Respondé todas las preguntas." };
    }
    const answersByQuestion = new Map(answers.map((a) => [a.questionId, a]));
    for (const question of survey.questions) {
      const answer = answersByQuestion.get(question.id);
      if (!answer) return { ok: false, error: "Respondé todas las preguntas." };
      if (question.type === "STAR") {
        if (!Number.isInteger(answer.ratingValue) || (answer.ratingValue as number) < 1 || (answer.ratingValue as number) > 5) {
          return { ok: false, error: "Calificación inválida." };
        }
      } else if (!answer.textValue?.trim()) {
        return { ok: false, error: "Completá todas las respuestas de texto." };
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.surveyCompletion.create({
        data: {
          surveyId: survey.id,
          customerId: customer.id,
          pointsAwarded: survey.points,
          answers: {
            create: survey.questions.map((question) => {
              const answer = answersByQuestion.get(question.id)!;
              return {
                questionId: question.id,
                ratingValue: question.type === "STAR" ? answer.ratingValue : null,
                textValue: question.type === "TEXT" ? answer.textValue?.trim() : null,
              };
            }),
          },
        },
      });
      await tx.pointsTransaction.create({
        data: { customerId: customer.id, points: survey.points, reason: "ACTION" },
      });
    });
  } catch (err) {
    console.error("[submitFormSurvey] failed", err);
    return { ok: false, error: "Ya completaste esta encuesta." };
  }

  revalidatePath(pathFor(restaurantSlug));
  return { ok: true };
}

export async function completeLinkAction(
  businessId: string,
  restaurantSlug: string,
  surveyId: string,
): Promise<ActionResult> {
  const result = await getOrCreateCustomer(businessId);
  if (!result) return { ok: false, error: "Necesitás iniciar sesión." };
  const { customer } = result;

  try {
    const survey = await prisma.surveyDefinition.findUnique({ where: { id: surveyId } });
    if (!survey || survey.businessId !== businessId || !survey.active || survey.kind !== "LINK_ACTION") {
      return { ok: false, error: "La acción no está disponible." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.surveyCompletion.create({
        data: { surveyId: survey.id, customerId: customer.id, pointsAwarded: survey.points },
      });
      await tx.pointsTransaction.create({
        data: { customerId: customer.id, points: survey.points, reason: "ACTION" },
      });
    });
  } catch (err) {
    console.error("[completeLinkAction] failed", err);
    return { ok: false, error: "Ya completaste esta acción." };
  }

  revalidatePath(pathFor(restaurantSlug));
  return { ok: true };
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores en este archivo.

- [ ] **Step 3: Commit**

```bash
git add "app/menu/[restaurantSlug]/tienda-puntos/encuestas/actions.ts"
git commit -m "feat: add customer-facing survey submit/complete actions"
```

---

### Task 6: Cliente — page.tsx + encuestas-content.tsx

**Files:**
- Modify: `app/menu/[restaurantSlug]/tienda-puntos/encuestas/page.tsx` (reescribir completo)
- Modify: `app/menu/[restaurantSlug]/tienda-puntos/encuestas/encuestas-content.tsx` (reescribir completo)

**Interfaces:**
- Consumes: `submitFormSurvey`, `completeLinkAction` de Task 5.
- Produces: componente `EncuestasContent({ businessId, restaurantSlug, surveys })` donde `surveys: { id, title, kind, points, externalUrl, buttonLabel, completed, questions: { id, type, label }[] }[]`.

- [ ] **Step 1: Reescribir `page.tsx`**

```tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer } from "@/lib/customer-auth";
import { EncuestasContent } from "./encuestas-content";

export const dynamic = "force-dynamic";

export default async function CustomerEncuestasPage({
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

  const surveys = await prisma.surveyDefinition.findMany({
    where: { businessId: restaurant.businessId, active: true },
    include: {
      questions: { orderBy: { order: "asc" } },
      completions: { where: { customerId: customer.id } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <EncuestasContent
      businessId={restaurant.businessId}
      restaurantSlug={restaurantSlug}
      surveys={surveys.map((s) => ({
        id: s.id,
        title: s.title,
        kind: s.kind,
        points: s.points,
        externalUrl: s.externalUrl,
        buttonLabel: s.buttonLabel,
        completed: s.completions.length > 0,
        questions: s.questions.map((q) => ({ id: q.id, type: q.type, label: q.label })),
      }))}
    />
  );
}
```

- [ ] **Step 2: Reescribir `encuestas-content.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HiStar, HiChatBubbleLeftText, HiLink, HiCheckCircle } from "react-icons/hi2";
import type { QuestionType, SurveyKind } from "@prisma/client";
import { submitFormSurvey, completeLinkAction } from "./actions";

type SurveyItem = {
  id: string;
  title: string;
  kind: SurveyKind;
  points: number;
  externalUrl: string | null;
  buttonLabel: string | null;
  completed: boolean;
  questions: { id: string; type: QuestionType; label: string }[];
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="leading-none">
          <HiStar className={n <= value ? "h-6 w-6 text-primary" : "h-6 w-6 text-border"} />
        </button>
      ))}
    </div>
  );
}

function FormSurveyCard({
  survey,
  onSubmit,
  isPending,
}: {
  survey: SurveyItem;
  onSubmit: (answers: { questionId: string; ratingValue?: number; textValue?: string }[]) => void;
  isPending: boolean;
}) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});

  const allAnswered = survey.questions.every((q) =>
    q.type === "STAR" ? (ratings[q.id] ?? 0) > 0 : (texts[q.id] ?? "").trim().length > 0,
  );

  function handleSubmit() {
    onSubmit(
      survey.questions.map((q) => ({
        questionId: q.id,
        ratingValue: q.type === "STAR" ? ratings[q.id] : undefined,
        textValue: q.type === "TEXT" ? texts[q.id] : undefined,
      })),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-text-secondary">Sumá {survey.points} puntos completando esta encuesta.</p>
      {survey.questions.map((q) => (
        <div key={q.id} className="flex flex-col gap-2">
          <span className="text-sm text-text-primary">{q.label}</span>
          {q.type === "STAR" ? (
            <StarRating value={ratings[q.id] ?? 0} onChange={(v) => setRatings((prev) => ({ ...prev, [q.id]: v }))} />
          ) : (
            <input
              type="text"
              value={texts[q.id] ?? ""}
              onChange={(e) => setTexts((prev) => ({ ...prev, [q.id]: e.target.value }))}
              className="rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
            />
          )}
        </div>
      ))}
      <button
        onClick={handleSubmit}
        disabled={isPending || !allAnswered}
        className="mt-1 self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Enviar encuesta
      </button>
    </div>
  );
}

export function EncuestasContent({
  businessId,
  restaurantSlug,
  surveys,
}: {
  businessId: string;
  restaurantSlug: string;
  surveys: SurveyItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmitForm(surveyId: string, answers: { questionId: string; ratingValue?: number; textValue?: string }[]) {
    setError(null);
    startTransition(async () => {
      const result = await submitFormSurvey(businessId, restaurantSlug, surveyId, answers);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleLinkAction(surveyId: string, url: string) {
    setError(null);
    window.open(url, "_blank", "noopener,noreferrer");
    startTransition(async () => {
      const result = await completeLinkAction(businessId, restaurantSlug, surveyId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (surveys.length === 0) {
    return <p className="text-sm text-text-secondary">Todavía no hay encuestas disponibles.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {surveys.map((survey) => (
        <div key={survey.id} className="rounded-xl border border-border bg-background p-4">
          <div className="mb-2 flex items-center gap-2">
            {survey.kind === "LINK_ACTION" ? (
              <HiLink className="h-5 w-5 text-primary" />
            ) : (
              <HiChatBubbleLeftText className="h-5 w-5 text-primary" />
            )}
            <h2 className="text-sm font-semibold text-text-primary">{survey.title}</h2>
          </div>

          {survey.completed ? (
            <div className="flex items-center gap-2 text-sm text-primary">
              <HiCheckCircle className="h-5 w-5" />
              ¡Gracias! Ya sumaste {survey.points} puntos.
            </div>
          ) : survey.kind === "FORM" ? (
            <FormSurveyCard survey={survey} isPending={isPending} onSubmit={(answers) => handleSubmitForm(survey.id, answers)} />
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-text-secondary">Sumá {survey.points} puntos completando esta acción.</p>
              <button
                onClick={() => handleLinkAction(survey.id, survey.externalUrl ?? "")}
                disabled={isPending || !survey.externalUrl}
                className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {survey.buttonLabel?.trim() || "Ir"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores en todo el proyecto.

- [ ] **Step 4: Commit**

```bash
git add "app/menu/[restaurantSlug]/tienda-puntos/encuestas/page.tsx" "app/menu/[restaurantSlug]/tienda-puntos/encuestas/encuestas-content.tsx"
git commit -m "feat: render configurable surveys and link actions to customers"
```

---

### Task 7: Smoke test manual

**Files:** ninguno (solo verificación).

- [ ] **Step 1: Levantar el dev server**

Run: `npm run dev`

- [ ] **Step 2: Dashboard — crear una encuesta tipo Formulario**

Ir a `/dashboard/fidelizacion/encuestas` → "Nueva encuesta" → título "Test", tipo Formulario, agregar 1 pregunta de estrellas + 1 de texto, arrastrar para reordenar, puntos 10, marcar Activa, Guardar. Verificar que aparece en la lista con las preguntas en el orden final.

- [ ] **Step 3: Dashboard — crear una encuesta tipo Acción-link**

"Nueva encuesta" → título "Seguinos en Instagram", tipo Acción con link, link `https://instagram.com/test`, texto de botón "Seguir", puntos 5, Activa, Guardar. Verificar que aparece en la lista.

- [ ] **Step 4: Cliente — completar ambas**

Ir a `/menu/<slug>/tienda-puntos/encuestas` logueado como cliente. Responder el formulario (botón "Enviar encuesta" debe habilitarse solo con todo respondido) y verificar que suma los puntos y pasa a estado completado. Clickear el botón de la acción-link, verificar que abre la URL en pestaña nueva y que la tarjeta pasa a completada sin pasos extra.

- [ ] **Step 5: Confirmar resultado con el usuario**

No marcar la tarea como terminada hasta que el usuario confirme que probó ambos flujos en el navegador.
