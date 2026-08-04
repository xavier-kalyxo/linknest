# LinkNest

A link-in-bio SaaS. Users build a public page at `linknest.click/@username` from
drag-and-drop blocks (links, headers, text, images, dividers), style it with a
token-based theme system, publish it, and see view/click analytics.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Database | Neon serverless Postgres via Drizzle ORM (WebSocket driver) |
| Auth | Auth.js / NextAuth v5 — Google, GitHub, magic link, email+password |
| Storage | Cloudflare R2 (images re-encoded to WebP with sharp) |
| Payments | Stripe Billing (Free / Pro) |
| Analytics | PostHog |
| Rate limiting | Upstash Redis |
| Styling | Tailwind CSS 4 |
| Errors | Sentry |

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill it in
pnpm db:push                 # push the Drizzle schema
pnpm dev
```

Open http://localhost:3000.

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm db:push` | Push schema to the database |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm db:seed` | Seed development data |

## Architecture notes

**Routing.** Middleware (`src/middleware.ts`) rewrites `/@slug` to `/slug`, which
serves `src/app/(public)/[username]/page.tsx`, and 301s bare `/slug` back to the
canonical `/@slug`. Build in-app links with `getPublicPageUrl()` from
`src/lib/slugs.ts` so they never take that redirect. Slugs are stored normalized
(lowercased, trimmed) — always write `normalizeSlug()` output, never raw input,
because lookups are case-sensitive.

**Caching.** The public route renders dynamically, so `revalidatePath` does not
apply to it. Page data is cached at the data layer with `unstable_cache` and
invalidated by tag; call `updateTag(publicPageTag(slug))` after any mutation
that changes what a visitor sees.

**Theming.** Templates are code-defined (`src/lib/templates/index.ts`) and supply
default `ThemeTokens`. `pages.theme` stores only the user's *overrides*; the
effective theme is `{...template.defaultTheme, ...page.theme}`. Never persist the
merged theme — doing so shadows every future template switch. Tokens become CSS
custom properties, so `updateTheme` validates them against a closed schema
(values reach a `style` attribute, where a stray `;` injects declarations).

**Entitlements.** `src/lib/entitlements.ts` is the single source of plan limits;
`src/lib/pricing.ts` derives customer-facing copy from it so marketing cannot
drift from what the code enforces. Gates are enforced server-side in the actions
and API routes — client checks are hints only.

**URLs.** User-supplied URLs go through `normalizeUrl()` in
`src/lib/safe-browsing.ts`, which allowlists `http/https/mailto/tel` on the
*parsed* protocol and returns the normalized href. Do not reintroduce pattern
matching: the URL parser strips tabs and newlines, so `java\tscript:` defeats any
anchored regex.

**Reconciliation.** `/api/cron/reconcile` (daily, see `vercel.json`) re-derives
`workspaces.plan` from the canonical `subscriptions` table, enforces page limits
after a downgrade grace period, rescans URLs queued when Safe Browsing timed out,
and prunes old Stripe dedup rows. It requires `CRON_SECRET`.

## Known gaps

Not yet implemented: account deletion, data export, password reset, resend
verification, an admin/moderation UI over `page_reports`, and custom domains.
