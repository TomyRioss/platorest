# Landing + Marketing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 5 marketing pages (Landing, Funcionalidades, Precios, Testimonios, Visión y Misión) under a shared `(marketing)` layout with orange/white branding.

**Architecture:** Next.js App Router route group `app/(marketing)/` holding layout + 5 page files. Two shared client components (`TopNavBar`, `WhatsappFloatButton`) live in `app/(marketing)/_components/`. Static content only, no data fetching, no DB.

**Tech Stack:** Next.js App Router, React Server Components (client components only where interactive: nav mobile toggle, testimonios form), Tailwind CSS v4 (tokens in `app/globals.css`).

## Global Constraints
- Tailwind only for styling, never inline CSS, never touch `app/globals.css` except the 3 `--primary*` variable values (explicit user permission, this task only)
- No SVG unless explicitly requested — logo is text wordmark
- Mobile-first, responsive at 375px and 1280px minimum
- No new npm dependencies unless a rung of the ladder below stdlib/native fails (check `package.json` first)
- Every error path (form validation) must show inline UX feedback, no silent failures
- Palette: primary `#ff6b00`, primary-hover derived darker, primary-light derived light tint; background/surface/border/text tokens unchanged
- No DB/Prisma access at any point in this plan

---

### Task 1: Update primary color tokens

**Files:**
- Modify: `app/globals.css:8-9` (only `--primary`, `--primary-hover`, `--primary-light` lines)

**Interfaces:**
- Produces: Tailwind classes `bg-primary`, `text-primary`, `border-primary`, `hover:bg-primary-hover`, `bg-primary-light` resolve to new orange across all later tasks.

- [ ] **Step 1: Edit the three variable values**

In `app/globals.css`, change:
```css
  --primary: #ea580c;
  --primary-hover: #c2410c;
  --primary-light: #ffedd5;
```
to:
```css
  --primary: #ff6b00;
  --primary-hover: #cc5600;
  --primary-light: #ffe4cc;
```
Do not touch any other line in the file.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds, no CSS errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: update primary color token to brand orange #ff6b00"
```

---

### Task 2: TopNavBar component

**Files:**
- Create: `app/(marketing)/_components/TopNavBar.tsx`

**Interfaces:**
- Produces: `export default function TopNavBar()` — client component, no props. Renders `<header>` with logo text "PlatoRest", nav links to `/`, `/funcionalidades`, `/precios`, `/testimonios`, `/vision-mision`, and a CTA `<Link href="/login">Login to Dashboard</Link>` styled `bg-primary`. Mobile: links collapse behind a toggle button (plain `useState`, no external menu lib).
- Consumes: `next/link`.

- [ ] **Step 1: Write the component**

Write `app/(marketing)/_components/TopNavBar.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/funcionalidades", label: "Funcionalidades" },
  { href: "/precios", label: "Precios" },
  { href: "/testimonios", label: "Testimonios" },
  { href: "/vision-mision", label: "Visión y Misión" },
];

export default function TopNavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-text-primary">
          PlatoRest
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Login to Dashboard
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-text-primary"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-6 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm font-medium text-text-secondary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-2 rounded bg-primary px-4 py-2 text-center text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Login to Dashboard
          </Link>
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds, no type errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(marketing)/_components/TopNavBar.tsx"
git commit -m "feat: add shared TopNavBar for marketing pages"
```

---

### Task 3: WhatsappFloatButton component

**Files:**
- Create: `app/(marketing)/_components/WhatsappFloatButton.tsx`

**Interfaces:**
- Produces: `export default function WhatsappFloatButton()` — server component (no interactivity needed), fixed-position link.

- [ ] **Step 1: Write the component**

```tsx
export default function WhatsappFloatButton() {
  return (
    <a
      href="https://wa.me/5491100000000"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover"
    >
      <span className="text-2xl" aria-hidden="true">
        ●
      </span>
    </a>
  );
}
```
Note: number is a placeholder (`5491100000000`) — real WhatsApp number not provided in brief, flag to user after implementation.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add "app/(marketing)/_components/WhatsappFloatButton.tsx"
git commit -m "feat: add WhatsApp float button"
```

---

### Task 4: Marketing layout + move landing page into route group

**Files:**
- Create: `app/(marketing)/layout.tsx`
- Modify: `app/page.tsx` — replace content (becomes new landing hero, see Task 5), moved conceptually into `app/(marketing)/page.tsx`
- Create: `app/(marketing)/page.tsx` (landing content, written fully in Task 5)
- Delete: old `app/page.tsx` (route group page.tsx replaces it — Next.js route groups don't add URL segments, so `app/(marketing)/page.tsx` still serves `/`)

**Interfaces:**
- Consumes: `TopNavBar` (Task 2), `WhatsappFloatButton` (Task 3) via relative import `./_components/...`.
- Produces: `export default function MarketingLayout({ children })` wrapping all 5 pages.

- [ ] **Step 1: Create the layout**

Write `app/(marketing)/layout.tsx`:
```tsx
import TopNavBar from "./_components/TopNavBar";
import WhatsappFloatButton from "./_components/WhatsappFloatButton";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <TopNavBar />
      {children}
      <WhatsappFloatButton />
    </>
  );
}
```

- [ ] **Step 2: Remove old root page**

```bash
git rm app/page.tsx
```
(Content is rebuilt as `app/(marketing)/page.tsx` in Task 5 — do not recreate `app/page.tsx`.)

- [ ] **Step 3: Verify dev server boots**

Run: `npm run dev` (background), then check `http://localhost:3000` returns 404 temporarily (expected — page.tsx not yet created in group). Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add "app/(marketing)/layout.tsx"
git commit -m "feat: add marketing route group layout, remove old root page"
```

---

### Task 5: Landing page

**Files:**
- Create: `app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: nothing external (static content).
- Produces: default export page component serving `/`.

- [ ] **Step 1: Write the page**

```tsx
import Link from "next/link";

const FEATURES = [
  { title: "Smart POS", desc: "Cierres rápidos, pagos integrados, interfaz intuitiva." },
  { title: "Inventario en tiempo real", desc: "Control de stock con alertas automáticas de bajo stock." },
  { title: "Mapeo de mesas", desc: "Visualización 2D de planos, reservas y rotación." },
  { title: "Menú QR digital", desc: "Actualización instantánea de precios y menús interactivos." },
  { title: "Kitchen Display System", desc: "Gestión digital de cocina, sin papeles ni errores." },
  { title: "Soporte 24/7", desc: "Soporte remoto y presencial (CABA/GBA)." },
];

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Elevando el Estándar Gastronómico
        </h1>
        <p className="mt-4 max-w-xl text-lg text-text-secondary">
          PlatoRest unifica POS, inventario, mesas y menú digital en una sola
          plataforma con precisión de chef.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/menu/demo"
            className="rounded bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
          >
            Ver menú demo
          </Link>
          <Link
            href="/login"
            className="rounded border border-border px-6 py-3 font-medium text-text-primary hover:bg-primary-light"
          >
            Ingresar al panel
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold text-text-primary">
            Todo tu restaurante, en un solo lugar
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded border border-border bg-background p-6">
                <h3 className="font-semibold text-text-primary">{f.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold text-text-primary">
          Sumá un 24% más de eficiencia operativa
        </h2>
        <Link
          href="/precios"
          className="mt-6 inline-block rounded bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
        >
          Ver planes
        </Link>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: hero + features grid + CTA render, orange buttons, no console errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(marketing)/page.tsx"
git commit -m "feat: add landing page hero and feature summary"
```

---

### Task 6: Funcionalidades page

**Files:**
- Create: `app/(marketing)/funcionalidades/page.tsx`

**Interfaces:**
- Produces: default export serving `/funcionalidades`.

- [ ] **Step 1: Write the page**

```tsx
const FEATURES = [
  {
    title: "Smart POS",
    desc: "Cierres rápidos, cobros integrados con múltiples medios de pago y una interfaz pensada para el ritmo del salón.",
  },
  {
    title: "Inventario en tiempo real",
    desc: "Control de stock automático con alertas de bajo stock antes de que falte un insumo en cocina.",
  },
  {
    title: "Mapeo de mesas",
    desc: "Visualización 2D del salón: reservas, rotación y ocupación en tiempo real.",
  },
  {
    title: "Menú QR digital",
    desc: "Actualizá precios al instante y ofrecé un menú interactivo sin reimprimir nada.",
  },
  {
    title: "Kitchen Display System (KDS)",
    desc: "Comandas digitales en cocina: elimina el papel y reduce errores de preparación.",
  },
];

const SUPPORT_TIERS = [
  { name: "Remoto", desc: "Soporte por chat y videollamada, 24/7." },
  { name: "Presencial CABA/GBA", desc: "Visitas técnicas en sitio para instalación y mantenimiento." },
];

export default function FuncionalidadesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-3xl font-bold text-text-primary">Funcionalidades</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        Todo lo que necesitás para operar tu restaurante, integrado en una sola plataforma.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded border border-border p-6">
            <h2 className="font-semibold text-text-primary">{f.title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{f.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-semibold text-text-primary">Soporte</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {SUPPORT_TIERS.map((t) => (
          <div key={t.name} className="rounded bg-surface p-6">
            <h3 className="font-semibold text-text-primary">{t.name}</h3>
            <p className="mt-2 text-sm text-text-secondary">{t.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/funcionalidades`.
Expected: renders feature list + support tiers, no console errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(marketing)/funcionalidades/page.tsx"
git commit -m "feat: add funcionalidades page"
```

---

### Task 7: Precios page

**Files:**
- Create: `app/(marketing)/precios/page.tsx`

**Interfaces:**
- Produces: default export serving `/precios`.

- [ ] **Step 1: Write the page**

```tsx
import Link from "next/link";

const INCLUDED = [
  "Smart POS ilimitado",
  "Inventario en tiempo real",
  "Mapeo de mesas y reservas",
  "Menú QR digital",
  "Kitchen Display System",
  "Soporte 24/7",
];

export default function PreciosPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-text-primary">Precios</h1>
      <p className="mt-3 text-text-secondary">
        Un solo plan, todo incluido. Sin sorpresas.
      </p>

      <div className="mt-12 rounded border border-border bg-surface p-10">
        <p className="text-sm font-medium text-text-secondary">Plan único</p>
        <p className="mt-2 text-5xl font-bold text-text-primary">
          $40.000<span className="text-lg font-medium text-text-secondary">/mes</span>
        </p>

        <ul className="mt-8 space-y-3 text-left">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-center gap-2 text-text-primary">
              <span className="text-primary">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <Link
          href="/testimonios"
          className="mt-10 inline-block rounded bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
        >
          Contactanos
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/precios`.
Expected: pricing card renders, CTA links to /testimonios.

- [ ] **Step 3: Commit**

```bash
git add "app/(marketing)/precios/page.tsx"
git commit -m "feat: add precios page"
```

---

### Task 8: Testimonios page with mock lead-capture form

**Files:**
- Create: `app/(marketing)/testimonios/_components/TestimonioForm.tsx` (client component, isolated for the one interactive piece)
- Create: `app/(marketing)/testimonios/page.tsx` (server component, imports the form)

**Interfaces:**
- Produces: `TestimonioForm` — `export default function TestimonioForm()`, client component, internal `useState` only, no network call, no props.
- Consumes (page.tsx): `TestimonioForm` via `./_components/TestimonioForm`.

- [ ] **Step 1: Write the form component**

```tsx
"use client";

import { useState, type FormEvent } from "react";

type Errors = { name?: string; email?: string; comment?: string };

export default function TestimonioForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Ingresá tu nombre.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Ingresá un email válido.";
    if (!comment.trim()) next.comment = "Contanos tu experiencia.";
    return next;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="rounded border border-border bg-surface p-6 text-center">
        <p className="font-medium text-text-primary">¡Gracias por tu testimonio!</p>
        <p className="mt-1 text-sm text-text-secondary">Lo vamos a revisar pronto.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded border border-border p-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-primary">
          Nombre
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-border px-3 py-2 text-text-primary"
        />
        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-border px-3 py-2 text-text-primary"
        />
        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-text-primary">
          Comentario
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded border border-border px-3 py-2 text-text-primary"
        />
        {errors.comment && <p className="mt-1 text-sm text-danger">{errors.comment}</p>}
      </div>

      <button
        type="submit"
        className="rounded bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
      >
        Enviar testimonio
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Write the page**

```tsx
import TestimonioForm from "./_components/TestimonioForm";

const TESTIMONIALS = [
  { name: "Laura Gómez", role: "Dueña, Buenos Aires", quote: "Bajamos los tiempos de cierre a la mitad." },
  { name: "Martín Pérez", role: "Chef ejecutivo, Madrid", quote: "El KDS terminó con los errores de comanda." },
  { name: "Sofía Ramírez", role: "Gerente, Rosario", quote: "El inventario en tiempo real nos salvó de quiebres de stock." },
];

export default function TestimoniosPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-3xl font-bold text-text-primary">Testimonios</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        Lo que dicen los equipos que ya usan PlatoRest.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="rounded border border-border bg-surface p-6">
            <p className="text-text-primary">&ldquo;{t.quote}&rdquo;</p>
            <p className="mt-4 text-sm font-medium text-text-primary">{t.name}</p>
            <p className="text-sm text-text-secondary">{t.role}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-xl">
        <h2 className="text-xl font-semibold text-text-primary">Dejá tu testimonio</h2>
        <div className="mt-4">
          <TestimonioForm />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/testimonios`. Submit form empty → expect 3 inline error messages. Fill valid data → expect "¡Gracias por tu testimonio!" confirmation, no network request fired (check Network tab).

- [ ] **Step 4: Commit**

```bash
git add "app/(marketing)/testimonios"
git commit -m "feat: add testimonios page with mock lead-capture form"
```

---

### Task 9: Visión y Misión page

**Files:**
- Create: `app/(marketing)/vision-mision/page.tsx`

**Interfaces:**
- Produces: default export serving `/vision-mision`.

- [ ] **Step 1: Write the page**

```tsx
export default function VisionMisionPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold text-text-primary">Visión y Misión</h1>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">Misión</h2>
        <p className="mt-3 text-text-secondary">
          Unificar la operación gastronómica en una sola plataforma de
          precisión de chef, para que cada restaurante en España y
          Latinoamérica pueda enfocarse en la cocina, no en la
          administración.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-text-primary">Visión</h2>
        <p className="mt-3 text-text-secondary">
          Ser el estándar de software gastronómico en la región,
          elevando la eficiencia operativa de cada equipo que confía en
          nosotros.
        </p>
      </section>

      <section className="mt-10 rounded border border-border bg-surface p-6">
        <h2 className="text-xl font-semibold text-text-primary">Impacto regional</h2>
        <p className="mt-3 text-text-secondary">
          Trabajamos con dueños de restaurante, chefs ejecutivos y
          consultores gastronómicos en España y Latam, ayudándolos a
          ganar hasta un 24% de eficiencia operativa.
        </p>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/vision-mision`.
Expected: three sections render, no console errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(marketing)/vision-mision/page.tsx"
git commit -m "feat: add vision y mision page"
```

---

### Task 10: Update SPEC.md and final verification

**Files:**
- Modify: `SPEC.md` §C palette section (lines 14-18) and §I.routes (add new marketing routes)

**Interfaces:** none (docs only).

- [ ] **Step 1: Update palette lines**

In `SPEC.md`, change:
```
  - primary #EA580C, primary-hover #C2410C, primary-light #FFEDD5
```
to:
```
  - primary #FF6B00, primary-hover #CC5600, primary-light #FFE4CC
```

- [ ] **Step 2: Add routes to §I.routes**

After `- / (landing page)` add:
```
  - /funcionalidades (marketing)
  - /precios (marketing)
  - /testimonios (marketing)
  - /vision-mision (marketing)
```

- [ ] **Step 3: Full build check**

Run: `npm run build`
Expected: build succeeds, all 5 marketing routes listed in output, no type errors.

- [ ] **Step 4: Commit**

```bash
git add SPEC.md
git commit -m "docs: update SPEC.md palette and routes for marketing pages"
```
