<wizard-report>
# PostHog post-wizard report

The wizard completed a full PostHog integration for PlatoRest — a Next.js 16 App Router restaurant SaaS. Client-side analytics are initialized via `instrumentation-client.ts` (the recommended Next.js 15.3+ pattern), with a reverse proxy configured in `next.config.ts` to route PostHog traffic through `/ingest` and avoid ad blockers. A server-side singleton (`lib/posthog-server.ts`) powers server-action and API-route events. User identification runs automatically on every authenticated page load via `PostHogIdentify` (placed inside `SessionProvider` in the root layout).

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `user_signed_up` | User successfully completes registration with email and password | `app/register/page.tsx` |
| `user_signed_up_google` | User initiates registration via Google OAuth | `app/register/page.tsx` |
| `user_logged_in` | User successfully logs in with email and password | `app/login/page.tsx` |
| `user_logged_in_google` | User initiates login via Google OAuth | `app/login/page.tsx` |
| `login_failed` | User login attempt failed due to incorrect credentials | `app/login/page.tsx` |
| `onboarding_completed` | Restaurant and business successfully created during onboarding (server-side) | `app/api/onboarding/route.ts` |
| `lead_form_submitted` | Visitor submits the demo request form on the marketing landing page | `app/(marketing)/_components/LeadForm.tsx` |
| `menu_viewed` | Customer opens a restaurant's digital menu — top of the order conversion funnel | `app/menu/[restaurantSlug]/menu-content.tsx` |
| `product_viewed` | Customer taps a product to view its detail page | `app/menu/[restaurantSlug]/menu-content.tsx` |
| `menu_searched` | Customer types in the menu search box to find a product | `app/menu/[restaurantSlug]/menu-content.tsx` |
| `checkout_started` | Customer proceeds to the checkout form after filling the cart | `app/menu/[restaurantSlug]/cart-bar.tsx` |
| `order_placed` | Customer order is successfully created in the database (server-side) | `app/menu/[restaurantSlug]/checkout/actions.ts` |
| `order_place_failed` | Order creation failed and the customer sees an error | `app/menu/[restaurantSlug]/checkout/page.tsx` |

## Files created or modified

| File | Change |
|---|---|
| `instrumentation-client.ts` | **Created** — client-side PostHog init (Next.js 15.3+ pattern) |
| `lib/posthog-server.ts` | **Created** — server-side PostHog singleton (`posthog-node`) |
| `components/posthog-identify.tsx` | **Created** — auto-identifies authenticated users via `useSession` |
| `next.config.ts` | **Modified** — added `/ingest` reverse proxy rewrites |
| `app/layout.tsx` | **Modified** — added `PostHogIdentify` inside `SessionProvider` |
| `app/providers.tsx` | **Modified** — removed duplicate `posthog.init()` (now handled by `instrumentation-client.ts`) |
| `.env.local` | **Modified** — added `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` |

## Next steps

We've built a dashboard and 5 insights to keep an eye on user behavior:

- **Dashboard**: [Analytics basics (wizard)](https://us.posthog.com/project/470632/dashboard/1905784)
- **Order conversion funnel**: [menu_viewed → product_viewed → checkout_started → order_placed](https://us.posthog.com/project/470632/insights/cHbcwd91)
- **New signups per day**: [credentials + Google](https://us.posthog.com/project/470632/insights/Vrg4YCnU)
- **Orders placed per day** (by fulfillment type): [PICKUP vs DELIVERY](https://us.posthog.com/project/470632/insights/NvgFHpMr)
- **Signup → onboarding funnel**: [activation rate](https://us.posthog.com/project/470632/insights/DwWMtxd8)
- **Lead form submissions**: [marketing conversion](https://us.posthog.com/project/470632/insights/hlvsYAIB)

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — the `PostHogIdentify` component handles this via `useSession` on every authenticated render, but verify it fires correctly after a hard refresh.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
