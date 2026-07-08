# Landing + Marketing Sections — Design

## Goal
5 páginas marketing: Landing, Funcionalidades, Precios, Testimonios, Visión y Misión. Monocromo naranja/blanco, Inter, mobile+desktop.

## Routes
- `app/(marketing)/layout.tsx` — TopNavBar (logo, links a 5 secciones, CTA "Login to Dashboard" -> /login) + WhatsApp float button. Sin footer.
- `app/(marketing)/page.tsx` — Landing: hero (headline "Elevando el Estándar Gastronómico", subcopy, CTA demo+login), resumen de 6 features (POS, Inventario, Mesas, QR Menu, KDS, Soporte 24/7) con cards, CTA final.
- `app/(marketing)/funcionalidades/page.tsx` — detalle técnico de cada feature + tiers de soporte.
- `app/(marketing)/precios/page.tsx` — plan único $40.000/mes, lista de qué incluye, CTA contacto.
- `app/(marketing)/testimonios/page.tsx` — grid de testimonios (mock estático) + form lead-capture (nombre, email, comentario) — submit sin persistencia, solo estado local "enviado" (mock, sin guardar).
- `app/(marketing)/vision-mision/page.tsx` — texto misión/visión + impacto regional (España/Latam).

## Design tokens (tailwind.config)
- `primary: #ff6b00`, `primary-hover: #cc5500` (derivado -20% luminosidad), `primary-light: #ffe4cc`
- Resto tokens sin cambio (background #fff, surface #fafafa, border #e5e5e5, text-primary #1c1917, text-secondary #78716c)
- Actualiza SPEC.md §C palette section.

## Components
- `TopNavBar` — client component, logo wordmark texto "PlatoRest", links, CTA button, responsive (hamburger mobile via shadcn Sheet o simple toggle).
- `WhatsappFloatButton` — fixed bottom-right, link `https://wa.me/<placeholder>`.
- Cards/sections reusan Tailwind, no libs nuevas salvo shadcn si falta componente (Sheet para mobile menu).

## Out of scope
- Dashboard mobile adaptation (milestone futuro, brief §7)
- Persistencia real de testimonios/leads (mock only, confirmado por usuario)
- Logo gráfico (uso wordmark texto, sin asset SVG por regla "nunca SVG si no pedido")

## Error handling
- Form testimonios: validar campos vacíos client-side, mostrar mensaje inline si falta dato. No hay llamada a red.

## Verification
- Cada página renderiza sin error, responsive en mobile (375px) y desktop (1280px), nav funcional en las 5 rutas.
