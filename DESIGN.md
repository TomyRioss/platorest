---
name: Platorest
description: All-in-one restaurant management platform — menu, POS, kitchen, stock, loyalty
colors:
  primary: "#ff6b00"
  primary-hover: "#cc5600"
  primary-light: "#ffe4cc"
  surface: "#fafafa"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  text-primary: "#1c1917"
  text-secondary: "#78716c"
  border: "oklch(0.922 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  success: "#16a34a"
  danger: "#dc2626"
  destructive: "oklch(0.577 0.245 27.325)"
typography:
  body:
    fontFamily: "var(--font-sans)"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  title:
    fontFamily: "var(--font-sans)"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.375
rounded:
  sm: "calc(0.625rem * 0.6)"
  md: "calc(0.625rem * 0.8)"
  lg: "0.625rem"
  xl: "calc(0.625rem * 1.4)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: Platorest

## 1. Overview

**Creative North Star: "The Service Window"**

Platorest is the pass-through between kitchen and floor: fast, functional, nothing between the person and the action they need to take. This is an MVP for an all-in-one restaurant platform (menu, POS/checkout, kitchen display, stock, loyalty, admin) — the system stays plain and legible now, not decorative later. Kitchen Orange (#ff6b00) is the one signal color: it means "act here" (primary buttons, confirm actions) and appears sparingly against a near-white, flat surface. No shadows, no gradients, no cream/sand tinting — this rejects the generic SaaS template look explicitly.

**Key Characteristics:**
- Flat surfaces, thin ring borders instead of shadows for separation
- One accent color (Kitchen Orange) reserved for primary/action elements
- High contrast text on white/near-white backgrounds for glare-heavy tablet use
- Tactile, immediate feedback — minimal transition delay, `active:translate-y-px` press feedback on buttons

## 2. Colors

Flat, high-contrast, one-accent palette built for legibility under kitchen/floor lighting, not visual richness.

### Primary
- **Kitchen Orange** (#ff6b00): primary action color — confirm, submit, "go" actions (buttons, active nav states). Reserved for actions, not decoration.
- **Kitchen Orange Hover** (#cc5600): hover/pressed state for primary actions.
- **Kitchen Orange Light** (#ffe4cc): tint backgrounds for primary-adjacent surfaces (e.g. selected/active chips).

### Neutral
- **Surface** (#fafafa): app background, off-white base.
- **Background** (oklch(1 0 0)): card/panel background, pure white.
- **Ink** (#1c1917 / oklch(0.145 0 0) as foreground): primary text.
- **Muted Text** (#78716c): secondary text, labels, timestamps.
- **Border** (oklch(0.922 0 0)): dividers, input borders, card rings.

### Status
- **Success** (#16a34a): confirmations, in-stock, completed states.
- **Danger** (#dc2626): destructive actions, out-of-stock.
- **Destructive** (oklch(0.577 0.245 27.325)): form/validation errors.

### Named Rules
**The One Signal Rule.** Kitchen Orange marks the one action to take on any screen — primary buttons and active states only. It never appears as decoration, background wash, or in text for emphasis.

## 3. Typography

**Body Font:** var(--font-sans) (system sans stack)

**Character:** One typeface, weight does the work. No display face — this is a tool, not a brand moment. Legible at speed on a tablet from arm's length.

### Hierarchy
- **Title** (500 weight, 1rem, 1.375 line-height): card titles, section headers.
- **Body** (400 weight, 0.875rem, 1.4 line-height): default UI text, labels, table cells.
- **Label** (400-500 weight, 0.8rem–0.875rem): button text, form labels, chip text.

### Named Rules
**The No-Decoration Rule.** Emphasis comes from weight (400 → 500) and color (ink vs. muted-foreground), never from italics, letter-spacing tricks, or size alone.

## 4. Elevation

Flat by default. Depth is conveyed with a 1px `ring-foreground/10` border on cards, not shadows — matches the current `card.tsx` implementation. No `box-shadow` in the system today.

### Named Rules
**The Flat-By-Default Rule.** Surfaces sit at the same visual depth. Separation comes from a thin ring border and background contrast (white card on off-white `--surface`), not elevation.

## 5. Components

Tactile and immediate: fast feedback, minimal transition, built for tapping fast on a tablet mid-service.

### Buttons
- **Shape:** rounded corners (radius scales from `--radius: 0.625rem`; default button uses `rounded-lg`).
- **Primary:** Kitchen Orange background, white text, `hover:bg-primary/80`, `active:translate-y-px` press feedback.
- **Hover / Focus:** `focus-visible:ring-3 ring-ring/50`, near-instant transition (`transition-all`, no eased choreography).
- **Secondary / Outline / Ghost / Destructive:** neutral backgrounds (`bg-secondary`, transparent, `bg-destructive/10`) with the same rounded shape and press feedback; orange reserved for `default` variant only.

### Cards
- **Corner Style:** `rounded-xl`.
- **Background:** white (`bg-card`) on off-white page surface.
- **Shadow Strategy:** none — see Elevation. Separation via `ring-1 ring-foreground/10`.
- **Border:** 1px ring, not a stroke border.
- **Internal Padding:** `--card-spacing: 1rem` (0.75rem in `sm` size).

### Inputs / Fields
- **Style:** bordered, `--border` stroke, matches card radius scale.
- **Focus:** ring treatment consistent with buttons (`ring-ring/50`).
- **Error:** destructive border + ring (`aria-invalid:border-destructive aria-invalid:ring-destructive/20`).

### Navigation
- Top nav for marketing pages; sidebar pattern reserved (`--sidebar-*` tokens present) for admin/product screens. Active states use ink/foreground, not orange fills, to keep orange reserved for actions.

## 6. Do's and Don'ts

### Do:
- **Do** use Kitchen Orange (#ff6b00) only for the primary action on a screen — one signal, not a palette.
- **Do** keep cards flat with a 1px `ring-foreground/10` border; no shadows.
- **Do** keep text high-contrast (ink #1c1917 on white/off-white) for glare-heavy tablet/kitchen environments.
- **Do** give buttons immediate press feedback (`active:translate-y-px`), no eased/bouncy transitions.

### Don't:
- **Don't** use a cream/sand/paper background — this is a flat white/off-white system, not a warm-tinted SaaS template.
- **Don't** add gradient text, glassmorphism, or decorative shadows.
- **Don't** add tiny uppercase eyebrow labels or numbered section scaffolding (01/02/03) to admin or marketing pages.
- **Don't** use orange as a background wash or decorative color — it signals an action, nothing else.
- **Don't** introduce a display/serif font — one sans typeface, weight-driven hierarchy only.
