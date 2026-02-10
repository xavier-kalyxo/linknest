# LinkNest — Technical & Product Plan (v2)

> A production-grade link-in-bio SaaS that is faster, more elegant, more customizable, and more fun than Linktree. Free to launch, built to scale.

### Design Principle

**One killer loop drives the entire MVP: Sign up → Build a beautiful page fast → Publish → See value → Upgrade to Pro.**
Everything that doesn't directly strengthen that loop in 4 weeks is deferred. No exceptions.

### Proof Metrics (how we know it's working)

| Metric | Target | Why It Matters |
|--------|--------|---------------|
| **Time-to-first-publish** | < 5 minutes from sign-up | Core speed-to-value promise |
| **Median mobile LCP** (public pages) | < 800ms | Performance differentiator |
| **Free → Pro conversion by day 14** | > 3% | Business viability signal |

---

## 1) Product Definition

### Core Promise

**LinkNest is the link-in-bio tool that makes you look professional in seconds** — gorgeous templates, brand-level customization, and blazing performance, with a generous free tier that doesn't feel crippled.

### Target Users (Launch Focus)

| Persona | Description | Key Need |
|---------|-------------|----------|
| **Solo Creator** | Instagram/TikTok influencer, 1K–100K followers | Quick setup, beautiful page, basic analytics |
| **Freelancer / Consultant** | Designer, coach, photographer | Professional brand presence, clean design |
| **Small Business Owner** | Local shop, cafe, studio | Multiple links, SEO for local search |
| **Side Hustler** | Selling digital products, courses, newsletter | Payment links, email capture |

*Agency / Manager persona deferred until team features exist (Month 3+).*

### Key Differentiators vs Linktree (Launch-only — nothing deferred)

| # | Differentiator | Why It Matters |
|---|---------------|----------------|
| 1 | **6 genuinely good free templates** (Linktree: 0 themes on free, only basic customization) | Real design variety without paying |
| 2 | **Sub-second public page loads** via ISR + edge caching (Linktree averages 1.5–2.5s LCP) | Instagram tap → instant page |
| 3 | **Curated color palettes on free, full hex control on Pro** (Linktree locks all branding behind Pro) | Beautiful from day 1, upgrade for exact brand match |
| 4 | **Built-in SEO controls** — meta title + description per page (Linktree: minimal SEO) | Pages rank in Google, viable as micro-website |
| 5 | **Block-based editor** with drag-and-drop, not just a link list | Headers, text, images, dividers — not just links |
| 6 | **Live mobile preview** in the editor that updates in real-time | See exactly what visitors see while editing |
| 7 | **< 5 min sign-up-to-publish** with guided onboarding | Fastest time-to-value in category |
| 8 | **Open theming system** — customize any template, not locked into a rigid theme | Design quality without template lock-in |
| 9 | **Total page views on free tier** (7-day window) | Basic analytics without paying |
| 10 | **No account removal without warning** — clear TOS, 30-day grace, data export | Trust and reliability (major Linktree complaint) |

---

## 2) Feature Map (Free vs Pro)

*Launch with two tiers only. Business tier ships when custom domains, team seats, and API are built (Month 3+).*

| Feature | Free | Pro ($8/mo) | Notes |
|---------|------|-------------|-------|
| **Links** | Unlimited | Unlimited | Never gate the core action |
| **Pages** | 1 | 5 | Upgrade trigger for multi-brand users |
| **Templates** | 6 included | All (6 free + 2 premium) | Free templates must be excellent |
| **Colors** | 5 curated palettes per template | Custom hex codes (any color) | Curated palettes are beautiful; custom hex is a strong upgrade trigger — "match my exact brand" |
| **Fonts** | 6 system fonts | 30+ Google Fonts | Font variety is a strong upgrade trigger |
| **Logo upload** | Yes | Yes | Core branding, always free  |
| **Button styles** | 3 styles (filled, outline, pill) | 6 styles + animation (+ shadow, neon, glass) | Animated buttons drive upgrades |
| **Block types** | Link, Header, Text, Divider, Image | Same at launch (+ Embed, Video, Carousel in Month 2) | Advanced blocks deferred — not promised at launch |
| **Analytics** | Total views (last 7 days) | Click tracking, referrers, geo, 90-day history | PostHog web SDK on public pages (async, ~25KB); dashboard queries PostHog API |
| **SEO controls** | Meta title + description | Meta title + description (OG image upload in Month 2) | Static default OG image at MVP; upload deferred |
| **Remove LinkNest badge** | No | Yes | Vanity/professionalism |
| **Priority support** | Community/docs | Email (48h) | Support as premium feature |

**Deferred from launch (not in pricing or marketing):**

| Feature | Target |
|---------|--------|
| Custom domains | Month 2 |
| Advanced blocks (Embed, Video, Carousel) | Month 2 |
| OG image upload | Month 2 |
| Link scheduling | Month 2 |
| Pixel/tracking (FB, GA, TikTok) | Month 2 |
| Contact capture + forms | Month 2 |
| Password-protected pages | Month 2 |
| Team members / workspaces | Month 3 |
| API access | Month 3 |
| Business tier | Month 3 |

---

## 3) Templates & Theming System

### Template Catalog (8 at launch: 6 free, 2 premium)

*Quality over quantity. Every template must be genuinely appealing. No filler.*

**Free Templates (6):**

| # | Name | Style | Layout | Best For |
|---|------|-------|--------|----------|
| 1 | **Clean Slate** | Minimal, white/light | Centered stack | Default starting point, universally clean |
| 2 | **Midnight** | Dark mode, elegant | Centered stack | Creators, musicians, anyone who prefers dark |
| 3 | **Coral Reef** | Warm gradients, rounded corners | Centered stack | Lifestyle, wellness, warm brands |
| 4 | **Ink** | High contrast, bold typography | Left-aligned | Writers, journalists, text-heavy profiles |
| 5 | **Pastel Dream** | Soft pastels, playful | Centered, wide buttons | Gen-Z creators, colorful brands |
| 6 | **Neon Glow** | Dark with neon accents | Centered stack | DJs, nightlife, gaming, edgy brands |

**Premium Templates (2):**

| # | Name | Style | Layout | Why Premium |
|---|------|-------|--------|-------------|
| 7 | **Glass** | Glassmorphism, blur effects | Card grid | Advanced CSS effects, visually striking |
| 8 | **Bento Box** | Bento grid layout | Grid with varied sizes | Unique layout engine, high wow factor |

**Post-launch additions (Month 2):**

| Name | Style | Tier |
|------|-------|------|
| Magazine | Editorial, asymmetric grid | Premium |
| Storefront | E-commerce card layout | Premium |
| Monochrome | Grayscale, professional | Free |
| Forest | Earth tones, organic shapes | Free |

### Technical Representation

Templates are **NOT separate React component trees**. They are a combination of:

1. **Layout Component** — controls overall page structure (centered-stack, left-aligned, card-grid, bento-grid)
2. **Theme Tokens** — a JSON object of design tokens applied via CSS custom properties
3. **Block Components** — shared across all templates, render identically regardless of template

```typescript
// Template definition (stored in code, not DB)
interface TemplateDefinition {
  id: string;                    // "clean-slate"
  name: string;                  // "Clean Slate"
  description: string;
  category: "minimal" | "bold" | "playful" | "professional" | "creative";
  tier: "free" | "pro";
  layout: "centered-stack" | "left-aligned" | "card-grid" | "bento-grid";
  defaultTheme: ThemeTokens;     // Default colors/fonts/spacing for this template
  thumbnail: string;             // Preview image path
}

// Theme tokens (stored in DB per page, initialized from template default)
interface ThemeTokens {
  // Schema version — bump when adding/removing/renaming fields.
  // Migration logic reads this to upgrade stored tokens forward.
  version: 1;

  // Colors
  colorBackground: string;       // "#FFFFFF"
  colorSurface: string;          // "#F8F9FA"
  colorPrimary: string;          // "#1A1A2E"
  colorSecondary: string;        // "#6C63FF"
  colorText: string;             // "#1A1A1A"
  colorTextMuted: string;        // "#6B7280"
  colorAccent: string;           // "#FF6B6B"

  // Typography
  fontHeading: string;           // "Inter"
  fontBody: string;              // "Inter"
  fontSizeBase: number;          // 16 (px)
  fontWeightHeading: number;     // 700
  lineHeightBody: number;        // 1.5

  // Spacing & Layout
  spacingUnit: number;           // 8 (px, all spacing is multiples of this)
  contentMaxWidth: number;       // 680 (px)
  blockGap: number;              // 16 (px)
  pagePaddingX: number;          // 20 (px)
  pagePaddingY: number;          // 40 (px)

  // Borders & Shapes
  borderRadius: number;          // 12 (px)
  borderWidth: number;           // 0 (px)
  borderColor: string;           // "#E5E7EB"

  // Buttons
  buttonStyle: "filled" | "outline" | "ghost" | "pill" | "shadow" | "neon" | "glass" | "minimal";
  buttonRadius: number;          // 8 (px)
  buttonPaddingX: number;        // 24 (px)
  buttonPaddingY: number;        // 14 (px)

  // Effects
  shadow: "none" | "sm" | "md" | "lg";
  backgroundEffect: "none" | "gradient" | "pattern" | "blur";
  backgroundGradient?: string;   // "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
}
```

### Preventing Template Lock-in

The key insight: **templates set initial theme tokens, but users own the tokens after that.**

1. User picks a template → `ThemeTokens` are copied to the page record in DB
2. User customizes tokens (colors, fonts, spacing) → stored independently
3. User switches template → **only the layout changes**; tokens are preserved unless user explicitly resets
4. This means: you can start with "Midnight" (dark, centered), customize colors to pink, switch to "Bento Box" layout, and keep your pink palette

**Implementation:**
- `TemplateRenderer` component receives `layout: string` + `theme: ThemeTokens` + `blocks: Block[]`
- Layout components are pure structure (CSS Grid/Flexbox patterns)
- Theme tokens are injected as CSS custom properties on the root element
- Block components read from CSS custom properties, never from template-specific styles

---

## 4) Tech Stack Recommendation

### Primary Stack (Free to Launch)

| Layer | Choice | Why | Free Tier Limits |
|-------|--------|-----|-----------------|
| **Framework** | Next.js 15 (App Router) | RSC for zero-JS public pages, ISR for caching, streaming for editor, edge middleware for routing | N/A (open source) |
| **Language** | TypeScript | Type safety across stack, Drizzle ORM inference, better DX | N/A |
| **Hosting** | Vercel (Hobby → Pro) | Best Next.js integration, edge network, preview deploys. Start on Hobby for dev, move to Pro ($20/mo) before commercial launch | Hobby: 100GB bandwidth, 100h serverless |
| **Database** | Neon Serverless Postgres | No auto-pause (unlike Supabase free), serverless scale-to-zero, branching for dev, Drizzle integration | 0.5GB storage, 100 CU-hours/mo, 5GB egress |
| **ORM** | Drizzle ORM | Lightweight (no Rust binary like Prisma), edge-compatible, type-safe SQL, better cold starts | N/A (open source) |
| **Auth** | Auth.js v5 | Unlimited MAU (free forever), Google/GitHub OAuth at launch (magic link deferred to Month 2 when Resend ships), Next.js native | Unlimited |
| **File Storage** | Cloudflare R2 | 10GB free, zero egress fees at any scale, S3-compatible API | 10GB storage, 1M Class A ops, 10M Class B ops |
| **Payments** | Stripe | Industry standard, Stripe Billing for subscriptions, webhooks, customer portal | Pay only on revenue: 2.9% + $0.30 + 0.7% |
| **Email** | Resend (Month 2) | Developer-friendly, React email templates. Not needed at MVP — no automated emails until downgrade notifications ship. | 3,000 emails/mo, 100/day |
| **KV Store** | Vercel KV | Rate limiting counters on serverless. Required because in-memory state doesn't survive across invocations. See capacity note below. | 30K requests/day, 256MB |
| **Analytics** | PostHog (sole source of truth) | 1M events free, feature flags, session replay for debugging. No custom DB analytics tables at MVP. | 1M events/mo |
| **Error Tracking** | Sentry | Stack traces, performance monitoring, source maps, Next.js SDK | 5K errors/mo, 10K transactions |
| **CSS** | Tailwind CSS 4 | Utility-first, small bundle (purged), design token mapping via CSS variables | N/A (open source) |
| **UI Components** | Radix UI + custom | Accessible primitives, unstyled, composable; no heavy component library | N/A (open source) |

### Fallback Stack

If Neon free tier is insufficient or we want an all-in-one platform:

| Layer | Fallback | Trade-off |
|-------|----------|-----------|
| Database + Auth + Storage | Supabase Pro ($25/mo) | Costs $25/mo but gives 8GB DB, 100GB storage, 50K MAU auth, no auto-pause |
| Hosting | Cloudflare Pages | Free commercial use, unlimited bandwidth; requires OpenNext adapter, slightly worse DX than Vercel |

### Cost Model

| Phase | Monthly Cost | Trigger |
|-------|-------------|---------|
| **Dev/Pre-launch** | $0 | Vercel Hobby + Neon Free + R2 Free |
| **Launch (0–1K users)** | $0–$20 | Vercel Pro when commercial ($20), everything else free |
| **Growth (1K–10K users)** | $45–$70 | Neon Launch ($19), Vercel Pro ($20), Resend Pro ($20 if needed) |
| **Scale (10K+ users)** | $200+ | Neon Scale, higher Vercel tier, dedicated support |

Revenue at 3% conversion of 5K users = 150 paying users × $8/mo = **$1,200/mo** vs ~$45/mo costs.

**Vercel KV capacity note**: Free tier is 30K requests/day. KV is used for:
- Auth rate limiting: ~5 reads per auth attempt (low volume)
- Mutation rate limiting: ~1 read + 1 write per Server Action (dashboard-only traffic)

With PostHog web SDK handling analytics directly (no custom `/api/analytics/collect` endpoint at MVP), KV usage is limited to dashboard-only traffic. Even at 10K users, dashboard mutation rate limiting generates ~5K KV reads/day — well within the 30K/day free tier. **Upgrade trigger**: only needed if Server Action traffic exceeds ~25K/day, which requires ~25K active dashboard sessions/day — far beyond Month 3+ projections.

---

## 5) High-Level Architecture

### System Diagram (Text)

```
┌─────────────────────────────────────────────────────────────┐
│                        EDGE LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Vercel Edge Middleware                    │   │
│  │  • Route detection (/@username → public, /dashboard)  │   │
│  │  • Auth session check (dashboard routes only)         │   │
│  │  • Lightweight — NO rate limiting in render path      │   │
│  └──────────────┬──────────────┬────────────────────────┘   │
│                 │              │                              │
│     ┌──────────▼───┐   ┌─────▼──────────┐                  │
│     │ Public Pages │   │  Dashboard App  │                  │
│     │ (ISR/cached) │   │ (SSR, authed)   │                  │
│     └──────┬───────┘   └──────┬──────────┘                  │
└────────────┼──────────────────┼──────────────────────────────┘
             │                  │
┌────────────▼──────────────────▼──────────────────────────────┐
│                      SERVER LAYER                             │
│  ┌─────────────────┐  ┌──────────────────┐                   │
│  │  Server Actions  │  │  API Routes      │                  │
│  │  (mutations)     │  │  /api/webhooks   │                  │
│  │  • createBlock   │  │  /api/upload     │                  │
│  │  • updateTheme   │  │                  │                  │
│  │  • publishPage   │  │                  │                  │
│  └────────┬────────┘  └────────┬─────────┘                   │
│           │                    │                              │
│  ┌────────▼────────────────────▼─────────┐                   │
│  │         Entitlements Check            │                    │
│  │  (code-defined plan matrix;           │                    │
│  │   DB override for manual exceptions)  │                    │
│  └────────┬──────────────────────────────┘                   │
└───────────┼──────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────┐
│                      DATA LAYER                               │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐              │
│  │  Neon    │  │ Cloudflare   │  │  Stripe   │              │
│  │ Postgres │  │     R2       │  │ Billing   │              │
│  │ (Drizzle)│  │  (assets)    │  │ (webhooks)│              │
│  └──────────┘  └──────────────┘  └───────────┘              │
│                                                               │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐              │
│  │ PostHog  │  │   Resend     │  │  Sentry   │              │
│  │(analytics│  │  (email)     │  │ (errors)  │              │
│  │ sole SoT)│  └──────────────┘  └───────────┘              │
│  └──────────┘                                                │
└──────────────────────────────────────────────────────────────┘
```

### Tenancy Model

- **Workspace-based isolation**: All data belongs to a workspace. Users are members of workspaces. At MVP, 1 user = 1 workspace (multi-workspace deferred). **Intentional design**: pages are attached to workspaces, never directly to users — even though it's 1:1 at launch. This ensures Month 3 team features ("Team Access" with shared workspace) ship without rewriting the query layer.
- **Row-level filtering**: All queries include `WHERE workspace_id = ?`. No separate schemas/databases per tenant.
- **URL isolation**: Each page has a unique `slug` (e.g., `/@johndoe`). Custom domains deferred.
- **Asset isolation**: R2 keys are prefixed with `workspace_id/` to namespace files.

### Public Page Rendering Strategy

```
Request: linknest.com/@johndoe
  → Edge Middleware: detect /@<slug> pattern, strip the '@', rewrite to /johndoe
  → Matches route: src/app/(public)/[username]/page.tsx (route group '(public)' is invisible in URL)
  → ISR Page: serve cached HTML (no time-based revalidation — on-demand only)
  → Cache HIT: ~50ms response (edge-cached static HTML)
  → Cache MISS: Server Component fetches from Neon, renders HTML, caches result
  → Zero client-side JS for static pages (links, text, headers)
  → Client JS only for: PostHog web SDK (~25KB gzipped, loaded async, see below)
```

**Canonical URL policy**:
- **User-facing/shareable URL**: `linknest.com/@johndoe` (with `@`) — this is what users copy, share, and put in their Instagram bio
- **Internal route path**: `/johndoe` (without `@`) — this is what `src/app/(public)/[username]/page.tsx` serves
- **Middleware**: strips `@` prefix → rewrites `/@johndoe` to `/johndoe`
- **SEO redirect**: if someone visits `/johndoe` directly (without `@`), middleware issues a 301 redirect to `/@johndoe` so there is exactly one canonical URL per page
- **`revalidatePath`**: must use the internal path `/${slug}` (without `@`), since that's the path Next.js ISR cache knows about
- **Internal link discipline**: All in-app links to public pages (e.g., "View my page" button in dashboard, share modal URL) must use the `/@slug` format, never `/slug`. If a `<Link>` points to `/slug`, the middleware will 301 redirect it — wasting a round-trip — or worse, bypass the rewrite logic depending on ordering. Enforce this with a helper: `getPublicPageUrl(slug: string) => \`/@${slug}\``

**Revalidation strategy**: Cache is invalidated **only when the user clicks "Publish"** (or re-publishes after edits). The `publishPage` Server Action calls `revalidatePath(`/${slug}`)` (without `@`). No revalidation on every save — edits are draft-only until explicitly published. This keeps DB load minimal and cache hit rate high.

**Draft preview bypass**: The dashboard's "View my page" link and the editor's live preview open the public URL with a `?preview=true` query parameter. When the public page route detects this parameter **and** the request has a valid authenticated session matching the page owner, it bypasses the ISR cache and fetches the current draft state directly from the DB. This ensures the user always sees their latest unpublished edits — without it, they'd see the stale cached version and think the app is broken. Unauthenticated requests with `?preview=true` are ignored (served from cache as normal) to prevent cache bypass abuse. Implementation: in `src/app/(public)/[username]/page.tsx`, check for the search param + session, and if both valid, use `{ cache: 'no-store' }` on the DB query instead of relying on ISR.

**Analytics strategy (MVP)**: Use PostHog's **web SDK** (~25KB gzipped, loaded async) directly on public pages. This is the pragmatic MVP choice — saves ~4 days of custom beacon development and gives us battle-tested analytics out of the box.
- PostHog web SDK is loaded **async** on public pages — does not block rendering or LCP
- Automatically captures `$pageview` events; we add custom `link_click` events via `posthog.capture()` on button clicks (with `block_id` and `url` as event properties)
- PostHog handles bot filtering, rate limiting, and event batching — no custom `/api/analytics/collect` endpoint needed at MVP
- PostHog is configured with `persistence: 'memory'` (no cookies, GDPR-friendly) and `autocapture: false` (only explicit events)
- PostHog web SDK is also loaded in the dashboard for session replay and feature flags
- **Trade-off**: Public page JS increases from near-zero to ~25KB gzipped (loaded async). LCP is unaffected because the SDK loads after initial paint. This is acceptable for MVP.
- **Known limitation**: `persistence: 'memory'` means the in-memory anonymous ID is lost on navigation (back button, new tab). Since public pages use standard `<a>` tags (not SPA navigation), each visit generates a new anonymous ID — inflating "unique visitor" counts. This is acceptable: **total views** and **click-through rate** are the metrics that matter for link-in-bio. "Unique visitors" is a vanity metric at MVP. Documented so we don't chase phantom user growth.
- **Month 2 optimization**: Build custom server-side beacon (~500 bytes client, events forwarded via PostHog Node SDK) to reduce public page JS back to near-zero. This becomes the performance differentiator after MVP validation.

### Edge Middleware: Keep It Thin

The middleware does **only** these things:
1. **Route detection**: `/@slug` → strip `@`, rewrite to `/slug` (which matches `src/app/(public)/[username]/page.tsx`)
2. **SEO canonicalization**: `/slug` (without `@`) → 301 redirect to `/@slug` — **only if the path is not a known app route or system path** (see exclusion list below)
3. **Auth check**: `/dashboard/*` → verify session, redirect to login if missing
4. **Nothing else at launch**. No rate limiting, no bot detection, no A/B testing, **no device detection** in the render path. Device detection (User-Agent sniffing) in middleware would fragment the edge cache — one cached version per device class instead of one universal cache. All responsive behavior is handled via CSS media queries, never middleware.

**Route collision prevention**: Since `/@slug` rewrites to `/slug` which serves `src/app/(public)/[username]/page.tsx`, a user claiming slug `dashboard` would collide with the real `/dashboard` route. Two safeguards:

1. **Reserved slug denylist** (enforced in slug validation on page/workspace creation):
```typescript
// src/lib/slugs.ts — checked on create + update
// System routes — hard block, cannot be claimed by anyone
const SYSTEM_SLUGS = new Set([
  'dashboard', 'login', 'signup', 'pricing', 'api',
  'admin', 'settings', 'billing', 'auth', 'callback',
  'help', 'support', 'about', 'terms', 'privacy',
  'blog', 'docs', 'status', 'health', 'robots.txt',
  'sitemap.xml', 'favicon.ico', '_next', 'static',
]);

// High-value slugs — reserved for future manual assignment or premium tiers.
// Don't let a random free user grab @john or @pizza on day 1.
// Load from a static JSON file (top 500 common first names + generic nouns).
// Checked at creation: "This username is reserved. Try another."
const PREMIUM_SLUGS = loadPremiumSlugs(); // ~500 entries from src/lib/premium-slugs.json

const RESERVED_SLUGS = new Set([...SYSTEM_SLUGS, ...PREMIUM_SLUGS]);
```

2. **Middleware exclusion list** (the `/@slug → /slug` rewrite and `/slug → /@slug` redirect only run for paths that are NOT in the exclusion set):
```typescript
// src/middleware.ts — matcher config + runtime check
export const config = {
  matcher: [
    // Skip _next, api, static files entirely
    '/((?!_next|api|static|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};

// Runtime: known app route prefixes that must never be treated as user slugs
const APP_ROUTES = new Set([
  '/dashboard', '/login', '/signup', '/pricing',
  '/auth', '/admin', '/settings', '/billing',
  '/help', '/support', '/about', '/terms', '/privacy',
  '/blog', '/docs', '/status',
]);

function isAppRoute(pathname: string): boolean {
  return APP_ROUTES.has(pathname) ||
         [...APP_ROUTES].some(route => pathname.startsWith(route + '/'));
}

// In middleware handler:
// 1. If path starts with /@, strip @ and rewrite — ONLY if remaining slug is not in APP_ROUTES
// 2. If path is a bare /slug (no @), redirect to /@slug — ONLY if not an app route
// 3. If path matches /dashboard/*, check auth
```

The denylist (checked at slug creation) is the primary guard. The middleware exclusion is the defense-in-depth layer. Both must agree.

**Middleware Truth Table** (must pass as integration tests before Week 2 milestone):

| Request Path | Middleware Action | Expected Result | Why |
|---|---|---|---|
| `/@johndoe` | Strip `@`, rewrite to `/johndoe` | 200 — public page renders | Normal public page access |
| `/johndoe` (bare slug, not an app route) | 301 redirect to `/@johndoe` | Redirect — canonical URL enforced | SEO: one canonical URL per page |
| `/dashboard` | Pass-through, auth check | 200 (authed) or 302 to `/login` | App route, never treated as slug |
| `/dashboard/editor/abc` | Pass-through, auth check | 200 (authed) or 302 to `/login` | Nested app route |
| `/_next/static/chunk.js` | Immediate exit (matcher excludes) | 200 — static asset served | Never enters middleware logic |
| `/api/webhooks/stripe` | Immediate exit (matcher excludes) | 200 — API route | Never enters middleware logic |
| `/@dashboard` | Strip `@` → check `isAppRoute('/dashboard')` → **hard 404** (return `NextResponse.rewrite(new URL('/not-found', req.url))`) | 404 — always, deterministically | Reserved slug cannot be a public page. Denylist prevents creation; middleware guarantees 404 even if denylist is bypassed. Must be asserted in integration tests. |
| `/favicon.ico` | Immediate exit (matcher excludes) | 200 — static file | Never enters middleware logic |
| `/@johndoe?preview=true` | Strip `@`, rewrite to `/johndoe?preview=true` | 200 — draft preview (if authed + owner) or cached page | Preview param passes through rewrite |
| `/robots.txt` | Immediate exit (matcher excludes) | 200 — static file | SEO file, never slug-matched |

**Redirect loop prevention**: The middleware must **never** rewrite a path that it would then re-match and redirect. The flow is strictly one-directional: `/@slug` → rewrite to `/slug` (terminal, no further middleware processing). The 301 redirect from `/slug` → `/@slug` only fires for paths that are NOT app routes AND NOT already prefixed with `@`. Next.js does not re-run middleware on internal rewrites, so the rewrite from `/@slug` to `/slug` is terminal by design.

Rate limiting is handled at the **Server Action / API route level** (not edge), using **Vercel KV** counters (not in-memory — in-memory doesn't survive across serverless invocations). Vercel KV free tier: 30K requests/day, 256MB storage — more than enough for rate limit checks. This keeps the critical public page render path as fast as possible.

### Abuse Prevention (Existential Threat for UGC Platforms)

LinkNest hosts user-generated pages with outbound links — this makes it a prime target for phishing, malware distribution, and SEO spam. If our domain gets flagged by Google Safe Browsing, **all** LinkNest pages get a browser interstitial warning, which is existential. This is MVP-critical, not a Month 2 nice-to-have.

**URL Scanning (on publish)**:
- Integrate **Google Safe Browsing Lookup API** (free, 10K lookups/day) in the `publishPage` Server Action
- Before publishing, check all outbound URLs on the page against Safe Browsing
- If any URL is flagged: **block publish**, show user a clear error ("This URL has been flagged as unsafe. Remove or replace it to publish.")
- **Timeout handling**: Wrap the Safe Browsing API call in a **2-second timeout**. If Google is slow or unreachable, **fail open** (allow the publish) but log the event to Sentry with the unchecked URLs. A background task (or the daily cron) can re-scan these pages asynchronously. Never block a legitimate user because Google is having a bad day.
- Also check URLs on block create/update (non-blocking warning: "This URL may be unsafe") — only hard-block on publish

**Banned URL patterns** (checked client-side + server-side):
- Meta-refresh redirects in any content field
- `javascript:` protocol URLs
- Known URL shortener chains (bit.ly → bit.ly → phishing)
- Data URIs in link blocks

**Reactive abuse handling**:
- "Report this page" link in the LinkNest badge footer on every public page (even Pro pages — badge is removable but report link remains as a tiny text link)
- Reports go to a simple `page_reports` table (`page_id`, `reporter_ip`, `reason`, `created_at`) — reviewed manually at MVP scale
- Manual takedown capability: admin sets `pages.is_published = false` + sends reason (email in Month 2, in-app notice at MVP)

**Async rescan (fail-open safety net)**: When a publish is allowed due to Safe Browsing timeout (fail-open), the page ID + unchecked URLs are logged to Sentry **and** added to a `pending_url_scans` queue (simple DB table: `page_id`, `url`, `created_at`). The daily reconciliation cron re-scans all pending URLs. If any URL is now flagged:
- Auto-unpublish the page (`pages.is_published = false`)
- Record the reason in a new `page_moderation_log` table (for transparency)
- Dashboard shows a banner: "Your page was unpublished because a link was flagged as unsafe. Remove the flagged link and re-publish."
- This closes the fail-open gap: malicious URLs cannot stay live indefinitely even if Google was down at publish time.

**Future (Month 2+)**: Scheduled re-scanning of all published pages (not just fail-open), integration with PhishTank API for broader coverage, automated takedown for repeat offenders.

### Performance Strategy

| Technique | Application |
|-----------|-------------|
| **ISR + on-demand revalidation** | Public pages cached at edge, purged only on publish |
| **Server Components** | All public page content rendered server-side, zero client JS for static blocks |
| **Image optimization** | Serve images from R2 public URL with aggressive `Cache-Control` headers (1 year immutable). Use `next/image` with `unoptimized` prop for ISR pages to avoid Vercel Image Optimization costs ($5/1K source images). Pre-resize uploads server-side (max 1200px width, WebP conversion) on upload to R2. This gives us optimized images without per-request billing. |
| **Critical CSS inlining** | Tailwind purges unused CSS; theme tokens as CSS vars (tiny payload) |
| **Font loading** | `font-display: swap`, preload primary font, limit to 2 font families |
| **Bundle splitting** | Editor components lazy-loaded; public pages ship almost no JS |
| **Connection pooling** | Neon serverless driver with HTTP-based queries (no persistent connections needed) |

---

## 6) Data Model (First Draft)

### Entity Relationship Overview

```
User ──< WorkspaceMember >── Workspace ──< Page ──< Block
                                │                  │
                                ├──< Asset         ├──< PageReport
                                │                  └──< PageModerationLog
                                └── Subscription
                                     (plan field → code-defined entitlements)

Template (code-defined, not in DB)
Theme (embedded in Page as JSONB column)
EntitlementOverride (DB table, manual exceptions only)
```

*Removed from MVP schema: `analytics_events` (PostHog is sole source), `custom_domains` (deferred), `contact_submissions` (deferred). These tables will be added when the features ship.*

### Entity Definitions

#### `users`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
email           VARCHAR(255) UNIQUE NOT NULL
name            VARCHAR(255)
avatar_url      TEXT
email_verified  TIMESTAMP
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```
*Index: `email` (unique)*

#### `workspaces`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            VARCHAR(255) NOT NULL
slug            VARCHAR(63) UNIQUE NOT NULL
plan            VARCHAR(20) DEFAULT 'free'           -- 'free' | 'pro' — DERIVED CACHE, not source of truth
stripe_customer_id   VARCHAR(255) UNIQUE
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```
*Indexes: `slug` (unique), `stripe_customer_id` (unique)*

**Billing source of truth**: The `subscriptions` table is canonical. `workspaces.plan` is a **derived cache** for fast reads (avoids joining subscriptions on every entitlement check). It is updated **in the same database transaction** as the subscription row, never independently. If they ever drift, `subscriptions` wins — a background reconciliation job (cron, runs daily) re-derives `workspaces.plan` from `subscriptions.status`.

#### `workspace_members`
```sql
workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE
user_id         UUID REFERENCES users(id) ON DELETE CASCADE
role            VARCHAR(20) DEFAULT 'owner'          -- 'owner' only at MVP
created_at      TIMESTAMP DEFAULT NOW()
PRIMARY KEY (workspace_id, user_id)
```

#### `pages`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL
slug            VARCHAR(63) UNIQUE NOT NULL           -- the /@slug in the URL
title           VARCHAR(255) NOT NULL
bio             TEXT
avatar_url      TEXT
template_id     VARCHAR(63) NOT NULL DEFAULT 'clean-slate'
theme           JSONB NOT NULL DEFAULT '{}'           -- ThemeTokens object
seo_title       VARCHAR(70)
seo_description VARCHAR(160)
is_published    BOOLEAN DEFAULT FALSE
published_at    TIMESTAMP
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```
*Indexes: `slug` (unique), `workspace_id`, `is_published`*

#### `blocks`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id         UUID REFERENCES pages(id) ON DELETE CASCADE NOT NULL
type            VARCHAR(30) NOT NULL                  -- MVP: 'link' | 'header' | 'text' | 'divider' | 'image'
position        INTEGER NOT NULL                      -- sort order
label           VARCHAR(255)
url             TEXT
content         JSONB DEFAULT '{}'                    -- type-specific data (thumbnail_url, description, etc.)
is_visible      BOOLEAN DEFAULT TRUE
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```
*Indexes: `page_id, position` (composite)*

*Removed from MVP: `schedule_start`, `schedule_end` (scheduling deferred), `click_count` (PostHog tracks clicks, no DB denormalization needed)*

#### `assets`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL
filename        VARCHAR(255) NOT NULL
r2_key          TEXT UNIQUE NOT NULL                  -- "workspace_id/filename"
url             TEXT NOT NULL                         -- public CDN URL
mime_type       VARCHAR(100) NOT NULL
size_bytes      INTEGER NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
```
*Indexes: `workspace_id`, `r2_key` (unique)*

#### `subscriptions` (CANONICAL billing source of truth)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE UNIQUE NOT NULL
stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL
stripe_price_id VARCHAR(255) NOT NULL
status          VARCHAR(30) NOT NULL                  -- 'active' | 'past_due' | 'canceled' | 'trialing'
current_period_start TIMESTAMP NOT NULL
current_period_end   TIMESTAMP NOT NULL
cancel_at_period_end BOOLEAN DEFAULT FALSE
downgraded_at   TIMESTAMP                    -- set to NOW() when workspace.plan transitions from 'pro' to 'free'; reset to NULL on re-upgrade (checkout.session.completed or subscription reactivation). Used for 7-day grace period. Decoupled from updated_at because Stripe metadata updates, billing portal visits, and cron reconciliation all touch updated_at — using it for grace period lets users reset the clock indefinitely.
last_stripe_event_created TIMESTAMP          -- event.created from last processed Stripe event; used for ordering guard
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```
*Indexes: `workspace_id` (unique), `stripe_subscription_id` (unique), `status`*

**Webhook idempotency & ordering**: Stripe can replay events and deliver them out of order. To handle this:
1. Store every processed `event.id` in a `stripe_processed_events` table (just `event_id VARCHAR(255) PRIMARY KEY, processed_at TIMESTAMP`). Reject any event whose ID is already present.
2. For subscription updates, compare the incoming event's `created` timestamp against the subscription row's `last_stripe_event_created` field (a dedicated timestamp column — NOT `updated_at`, which can be modified by non-Stripe operations like cron reconciliation). If the event is older, skip it (stale/out-of-order).
3. All subscription writes happen in a single DB transaction that also updates `workspaces.plan` and sets `last_stripe_event_created` to the event's `created` timestamp. This prevents partial state drift.

**Reconciliation**: A daily cron job (Vercel Cron, free tier includes 2 cron jobs):
- Queries all workspaces where `plan = 'pro'` but no active subscription exists → sets them back to `'free'`
- Queries all free workspaces with > 1 published page where `subscriptions.downgraded_at` is > 7 days ago → auto-unpublishes all pages except the **single oldest** (determined by `published_at ASC`, tie-broken by `created_at ASC`, then `id ASC` for absolute determinism). This ensures reruns are idempotent — the same page always survives.
- Re-scans all `pending_url_scans` rows where `scanned_at IS NULL` via Google Safe Browsing API. If flagged: auto-unpublish the page, log to `page_moderation_log`. If safe: mark `is_safe = true`.
- Cleans up `stripe_processed_events` rows older than 30 days and `pending_url_scans` rows older than 7 days where `is_safe = true`

#### `entitlement_overrides` (manual exceptions only)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL
feature         VARCHAR(63) NOT NULL                  -- e.g. 'max_pages', 'premium_templates'
value           JSONB NOT NULL                        -- {"limit": 10} or {"enabled": true}
reason          TEXT                                  -- "beta tester", "support comp", etc.
created_at      TIMESTAMP DEFAULT NOW()
UNIQUE (workspace_id, feature)
```
*This table is empty in normal operation. It exists only so we can grant exceptions without code deploys.*

#### `page_reports` (abuse reports from public visitors)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id         UUID REFERENCES pages(id) ON DELETE CASCADE NOT NULL
reporter_ip     VARCHAR(45) NOT NULL                  -- IPv4 or IPv6
reason          VARCHAR(30) NOT NULL                  -- 'phishing' | 'malware' | 'spam' | 'other'
details         TEXT                                  -- optional free-text from reporter
created_at      TIMESTAMP DEFAULT NOW()
```
*Indexes: `page_id`, `created_at`. Reviewed manually at MVP scale. Rate limit: max 3 reports per IP per day (Vercel KV counter).*

#### `pending_url_scans` (fail-open safety net for Safe Browsing timeouts)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id         UUID REFERENCES pages(id) ON DELETE CASCADE NOT NULL
url             TEXT NOT NULL                          -- the URL that wasn't scanned due to timeout
created_at      TIMESTAMP DEFAULT NOW()
scanned_at      TIMESTAMP                             -- set when cron re-scans; NULL = pending
is_safe         BOOLEAN                               -- result of re-scan; NULL = pending
```
*Indexes: `scanned_at` (partial index WHERE scanned_at IS NULL for efficient cron query). Cleaned up by cron: rows older than 7 days where `is_safe = true` are deleted.*

#### `page_moderation_log` (audit trail for automated and manual takedowns)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
page_id         UUID REFERENCES pages(id) ON DELETE CASCADE NOT NULL
action          VARCHAR(30) NOT NULL                  -- 'unpublished' | 'warning' | 'reinstated'
reason_code     VARCHAR(30) NOT NULL                  -- 'safe_browsing_flagged' | 'manual_review' | 'spam_report' | 'phishing'
source          VARCHAR(30) NOT NULL                  -- 'cron_rescan' | 'publish_block' | 'admin_manual' | 'report_threshold'
details         TEXT                                  -- human-readable explanation shown in dashboard banner
raw_api_response JSONB                                -- Safe Browsing API response (for appeals/debugging); NULL for manual actions
created_at      TIMESTAMP DEFAULT NOW()
```
*Indexes: `page_id`, `created_at`. Dashboard query: latest row per `page_id` where `action = 'unpublished'` → drives the "Your page was unpublished because..." banner. The `raw_api_response` field preserves evidence for user appeals — if a URL was a false positive, admin can reinstate and log a `'reinstated'` row.*

#### `stripe_processed_events` (webhook deduplication)
```sql
event_id        VARCHAR(255) PRIMARY KEY              -- Stripe event ID, e.g. "evt_1234..."
processed_at    TIMESTAMP DEFAULT NOW()
```
*Cleaned up by daily cron: rows older than 30 days are deleted. No indexes needed beyond primary key.*

### Entitlements: Code-Defined Plan Matrix (Source of Truth)

```typescript
// src/lib/entitlements.ts — the ONLY place plan limits are defined

const PLAN_MATRIX = {
  free: {
    max_pages: 1,
    max_blocks_per_page: 50,
    premium_templates: false,
    custom_colors: false,         // curated palettes only; no hex input
    google_fonts: false,
    animated_buttons: false,
    analytics_days: 7,
    remove_badge: false,
    max_asset_bytes: 50_000_000,  // 50MB total
  },
  pro: {
    max_pages: 5,
    max_blocks_per_page: 100,
    premium_templates: true,
    custom_colors: true,          // full hex color picker
    google_fonts: true,
    animated_buttons: true,
    analytics_days: 90,
    remove_badge: true,
    max_asset_bytes: 500_000_000, // 500MB total
  },
  // NOTE: advanced_blocks and og_image_upload intentionally absent —
  // they are deferred to Month 2 and will be added to this matrix then.
} as const;

// Check: read workspace.plan → look up matrix → check entitlement_overrides for exceptions
function getEntitlement(workspace: Workspace, feature: string): EntitlementValue {
  const override = getOverride(workspace.id, feature); // DB query, cached
  if (override) return override.value;
  return PLAN_MATRIX[workspace.plan][feature];
}
```

**Why this approach**: No need to sync DB rows every time a plan changes. Add a new feature gate = add a line to the matrix + deploy. The `entitlement_overrides` table handles edge cases (beta users, support comps) without polluting the core logic.

### Key Constraints

- `pages.slug` is globally unique (one namespace for all users)
- `workspaces.slug` is globally unique
- `entitlement_overrides (workspace_id, feature)` is unique
- `subscriptions.workspace_id` is unique — one active subscription per workspace
- All foreign keys use `ON DELETE CASCADE`

---

## 7) Public Page Builder UX

### The Core Loop (every screen serves this)

```
Sign Up → Claim Slug → Pick Template → Edit Page → Publish → Share → See Views → (Upgrade)
  1min      30sec        30sec         2min       5sec     10sec    day 2+
```

### Primary Screens & Flows

```
Onboarding Flow (new user, < 5 min target):
  Sign Up (Google or GitHub one-click)
    → "Claim your link" — type username, instant availability check → /@yourname
    → Choose a template (visual grid, 6 free + 2 premium grayed with "Pro" badge)
    → Editor opens with template applied + 3 sample blocks pre-filled
    → Prominent "Add your first link!" CTA
    → User adds/edits links
    → Tap "Publish" → confetti → share modal with copy link + QR

Main Dashboard (simple — one page for most users):
  ┌────────────────────────────────────────┐
  │  LinkNest                    [Avatar]  │
  │  ────────────────────────────────────  │
  │                                        │
  │  Your Page:                            │
  │  ┌──────────────────────────────────┐  │
  │  │ @johndoe     [Edit] [Share]     │  │
  │  │ 142 views this week             │  │
  │  └──────────────────────────────────┘  │
  │                                        │
  │  [+ New Page]  (gated if at limit)     │
  │                                        │
  │  ┌──────────────────────────────────┐  │
  │  │ Views (7 days): ▁▃▅▇▆▄▂        │  │
  │  │ Total: 892                       │  │
  │  └──────────────────────────────────┘  │
  │                                        │
  │  [Upgrade to Pro — unlock analytics,   │
  │   premium templates, more pages]       │
  └────────────────────────────────────────┘

Page Editor (the core experience):
  ┌──────────────────────────┬─────────────────┐
  │  Editor Panel            │  Live Preview   │
  │  ┌────────────────────┐  │  ┌─────────────┐│
  │  │ Page Settings    ▾ │  │  │  Mobile     ││
  │  │ • Title, Bio       │  │  │  Frame      ││
  │  │ • Avatar           │  │  │  (real-time ││
  │  └────────────────────┘  │  │   updates)  ││
  │  ┌────────────────────┐  │  │             ││
  │  │ Template & Style ▾ │  │  │             ││
  │  │ • Switch template  │  │  │             ││
  │  │ • Colors (palette/ │  │  │             ││
│  │     hex if Pro)     │  │  │             ││
  │  │ • Fonts (dropdown) │  │  │             ││
  │  │ • Button style     │  │  │             ││
  │  │ • Spacing          │  │  │             ││
  │  └────────────────────┘  │  │             ││
  │  ┌────────────────────┐  │  │             ││
  │  │ Blocks (drag-drop) │  │  │             ││
  │  │ ≡ Link: Portfolio  │  │  │             ││
  │  │ ≡ Header: Social   │  │  │             ││
  │  │ ≡ Link: Twitter    │  │  │             ││
  │  │ ≡ Link: YouTube    │  │  │             ││
  │  │ [+ Add Block]      │  │  │             ││
  │  └────────────────────┘  │  └─────────────┘│
  │  ┌────────────────────┐  │                  │
  │  │ SEO (collapsed)  ▸ │  │                  │
  │  └────────────────────┘  │                  │
  │                          │                  │
  │  [Publish]               │  [Desktop|Mobile]│
  └──────────────────────────┴─────────────────┘
```

### Mobile-First Builder

On mobile (< 768px), the editor switches to a **single-panel stacked layout**:
- Full-width editing controls
- Floating "Preview" button → slides up a phone-frame preview overlay
- Block reordering via **up/down arrow buttons** (tap to move) — not drag-and-drop. Mobile DnD (touch event handling, scroll interference, long-press conflicts) is complex and unreliable. Arrows are faster to build and more accessible. Drag-and-drop remains on desktop only.
- Theme controls in a bottom sheet
- "Publish" button always visible in sticky footer

### "Fun" Elements (Performance-Safe)

| Element | Where | Implementation | Performance Impact |
|---------|-------|---------------|-------------------|
| **Confetti on first publish** | Publish button | `canvas-confetti` (2KB, client-only, lazy loaded) | None |
| **Smooth block reorder** | Editor block list | CSS transitions on position change | Editor-only |
| **Live preview updates** | Preview panel | React state propagation (no network), CSS transition on token changes | Zero |
| **Skeleton loading** | Dashboard, editor | Tailwind `animate-pulse` (CSS only) | None |
| **Link hover animations** | Public page buttons | CSS-only `transform: scale(1.02)` + `box-shadow` transition. All `<a>` tags in `LinkBlock` render with `rel="noopener noreferrer me"` and `data-link-id={block.id}` — `rel="me"` supports IndieWeb identity verification, and `data-link-id` enables the Month 2 server-side click redirector (`/api/l/{block_id}`) without any public page markup changes. | None (GPU) |
| **Avatar upload preview** | Editor | `URL.createObjectURL` instant preview before upload | None |
| **Share modal with QR code** | After publish | `qrcode` library (3KB, lazy loaded) | None (on-demand) |

---

## 8) Pricing Strategy

### Two Tiers at Launch

| | **Free** | **Pro** |
|---|---------|---------|
| **Price** | $0 | **$8/mo** or **$72/yr** ($6/mo, save 25%) |
| **Target** | Anyone getting started | Serious creators & freelancers |
| **Pages** | 1 | 5 |
| **Templates** | 6 | All 8 (+ future additions) |
| **Colors** | 5 curated palettes per template | Custom hex codes (any color) |
| **Fonts** | 6 system fonts | 30+ Google Fonts |
| **Button styles** | 3 basic | 6 + animated |
| **Block types** | 5 (link, header, text, divider, image) | Same at launch (advanced blocks Month 2) |
| **Analytics** | 7-day total views | 90-day views + clicks + referrers + geo |
| **Badge** | "Made with LinkNest" shown | Removable |
| **SEO** | Title + description | Title + description (OG image upload Month 2) |
| **Storage** | 50MB | 500MB |
| **Support** | Docs | Email (48h) |

*Business tier ($24/mo) ships in Month 3 when custom domains, team seats, and API are ready. We do not market or mention it until then.*

### Upgrade Triggers (conversion strategy)

These are the moments where free users see the value of Pro:

| Trigger | Where | Emotion |
|---------|-------|---------|
| **"Match your exact brand"** | Color picker — curated palettes shown, hex input locked with "Pro" badge | Aspiration |
| **Grayed premium templates** | Template picker — visible but locked with "Pro" badge | Desire |
| **"See who's clicking"** | Analytics tab — blurred referrer/geo data visible but unreadable | Curiosity |
| **"Create another page"** | "New Page" button when at 1-page limit | Growth |
| **"More fonts"** | Font picker — Google Fonts shown grayed | Aspiration |
| **"Try Pro free for 14 days"** | Banner after 7 days of active use | Low risk |

### Downgrade Behavior (clear rules, documented to user)

When a Pro user's subscription ends (cancellation or payment failure):
- **Immediate**: Stripe webhook sets `workspace.plan = 'free'` and `subscriptions.downgraded_at = NOW()` (in same transaction as subscription status update). `downgraded_at` is the sole source of truth for grace period — never `updated_at`.
- **Pages**: The daily reconciliation cron checks for free workspaces with > 1 published page. After a **7-day grace period** post-downgrade (checked via `subscriptions.downgraded_at`), it auto-unpublishes all pages except the single oldest (by `published_at ASC`, then `created_at ASC`, then `id ASC` — deterministic and idempotent on rerun). Dashboard shows an informational banner ("Your plan was downgraded — only your oldest page remains published"). No interactive prompt at MVP — keeps Week 4 scope focused on abuse prevention instead.
- **Colors**: Page **keeps its current colors** (theme tokens preserved in DB). User cannot enter new custom hex codes — color picker reverts to curated palettes only. Published page continues to display existing custom colors until next publish.
- **Templates**: Page **keeps its current design** (theme tokens preserved). User cannot switch to another premium template. No public badge — we don't punish.
- **Fonts**: Google Fonts revert to closest system font on next publish.
- **Analytics**: History beyond 7 days becomes inaccessible (not deleted — if they re-upgrade within 90 days, it's back via PostHog retention).
- **All changes are documented in an in-app "What changes on Free" explainer** accessible from the pricing page and Stripe Customer Portal link.

### Revenue Model

| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Total users | 500 | 2,000 | 8,000 |
| Free→Pro conversion (14-day) | 3% | 4% | 5% |
| Paying users | 15 | 80 | 400 |
| MRR | $120 | $640 | $3,200 |
| Infra costs | $0 | $45 | $150 |

---

## 9) MVP Plan (4 Weeks)

### Guiding Principle

Every deliverable must directly serve the core loop: **Sign up → Build beautiful page → Publish → See value → Upgrade**. If it doesn't, it's deferred.

### Week 1: Foundation — Auth, DB, First Deploy

**Goal: A deployed app where you can sign up, create a page slug, and see a dashboard.**

| Day | Deliverable |
|-----|-------------|
| Mon | Project scaffold: `create-next-app` with Next.js 15, TypeScript, Tailwind 4, pnpm. Folder structure: `src/app/(auth)`, `src/app/(dashboard)`, `src/app/(public)`, `src/lib`, `src/components` |
| Mon | Neon DB provisioned. Drizzle schema: `users`, `workspaces`, `workspace_members`, `pages`, `blocks`, `assets`. Push schema. |
| Tue | Auth.js v5: Google + GitHub OAuth only (magic link deferred — requires email provider). Session management. Login/signup pages. |
| Tue | Edge middleware: auth guard for `/dashboard/*` → redirect to login. Public routes pass through. |
| Wed | Post-signup flow: auto-create workspace, prompt for page name + slug (real-time uniqueness check). |
| Wed | Dashboard shell: page card showing name + slug + published status. |
| Thu | Deploy to Vercel. Neon connected via env vars. Auth working end-to-end on production URL. |
| Thu | Seed script: test user + workspace + page + sample blocks for development. |
| Fri | **Milestone**: Sign up with Google → land on dashboard → create page with slug → see it listed. Deployed and working. |

### Week 2: Editor + Public Page — The Core Experience

**Goal: A working page editor with live preview, and a public page that renders at `/@username`.**

| Day | Deliverable |
|-----|-------------|
| Mon | Block CRUD: Server Actions for create, update, reorder (optimistic), delete. Zod validation on all inputs. |
| Mon | Block components: `LinkBlock`, `HeaderBlock`, `TextBlock`, `DividerBlock`, `ImageBlock`. All as Server Components for public, Client Components for editor. |
| Tue | Page editor layout: left panel (settings + blocks), right panel (live mobile-frame preview). |
| Tue | Drag-and-drop block reordering with `@dnd-kit/core`. |
| Wed | Theme editor: color controls (5 curated palettes on free, hex picker gated to Pro), font selector (6 system fonts on free), button style picker (3 styles), spacing controls. |
| Wed | `ThemeTokens` → CSS custom properties pipeline. Live preview updates instantly on token change. |
| Thu | Template system: define 4 templates in code (`Clean Slate`, `Midnight`, `Coral Reef`, `Ink`). `TemplateRenderer` Server Component. |
| Thu | Template picker modal with visual thumbnails. Switching template changes layout, preserves tokens. |
| Fri | Public page route: `src/app/(public)/[username]/page.tsx`. ISR with on-demand revalidation (triggered by Publish button only). Draft preview bypass: `?preview=true` + authenticated session → fetch from DB, skip ISR cache. |
| Fri | Middleware verification: integration tests covering the full truth table (see Edge Middleware section). Confirm: `/@slug` rewrites, `/slug` redirects, app routes pass through, static assets excluded, reserved slugs blocked, no redirect loops. |
| Fri | **Milestone**: Edit page with blocks → customize theme → see live preview → click Publish → visit `/@username` and see the page. < 800ms LCP. Middleware truth table passes. |

### Week 3: Assets, Remaining Templates, Analytics, SEO, Share

**Goal: Complete the free-tier experience. Image uploads, all 8 templates, basic analytics, SEO, sharing.**

| Day | Deliverable |
|-----|-------------|
| Mon | Cloudflare R2 integration: signed upload URL API route, avatar upload component, block image upload. Server-side MIME + size validation (5MB max, images only). |
| Mon | Image serving: R2 public URLs with `Cache-Control: public, max-age=31536000, immutable`. Server-side resize on upload (max 1200px width, WebP conversion via `sharp`). Use `next/image` with `unoptimized` prop on public pages to avoid Vercel Image Optimization costs. |
| Tue | Remaining 2 free templates (`Pastel Dream`, `Neon Glow`) + 2 premium templates (`Glass`, `Bento Box`). "Pro" badge on premium templates in picker. |
| Wed | SEO: `generateMetadata` on public page route — title, description, `og:image` (static default). |
| Wed | Analytics: PostHog web SDK on public pages (async load, `autocapture: false`, `persistence: 'memory'`). Custom `link_click` capture on button clicks. No custom API route needed — PostHog handles event delivery. |
| Thu | Analytics in dashboard: PostHog API query → total views (7 days) sparkline chart. Simple, no custom DB tables. |
| Thu | Share modal: copy link button, QR code generation (`qrcode` lib, lazy loaded), social share links. |
| Fri | Publish flow polish: confetti on first publish, "Published" / "Draft" status indicators, "Unpublish" option. |
| Fri | **Milestone**: Full editor with all 8 templates, image uploads working, analytics showing views, SEO tags rendering, share modal with QR code. |

### Week 4: Monetization, Feature Gating, Production Hardening

**Goal: Stripe payments work, features are properly gated, app is production-ready.**

*Downgrade policy: On cancellation, the Stripe webhook sets `workspace.plan = 'free'` immediately (same DB transaction). The daily reconciliation cron auto-unpublishes excess pages after a 7-day grace period (keeps oldest published page). No interactive dashboard prompt at MVP — the cron handles it automatically. Email notifications ship in Month 2 with Resend.*

| Day | Deliverable |
|-----|-------------|
| Mon | Stripe setup: create Product + 2 Prices (monthly $8, yearly $72). Checkout session API route. Success/cancel pages. |
| Mon | Stripe webhook handler: verify signature, check `stripe_processed_events` for dedup, then `checkout.session.completed` → in single DB transaction: insert event ID + create subscription row + set `workspace.plan = 'pro'` + set `subscriptions.downgraded_at = NULL`. |
| Tue | Webhook handlers for `customer.subscription.updated` and `customer.subscription.deleted`: same dedup pattern, compare event `created` timestamp to reject stale/out-of-order events, single-transaction writes. |
| Tue | `src/lib/entitlements.ts`: code-defined `PLAN_MATRIX`, `getEntitlement()` function, `entitlement_overrides` table migration. |
| Wed | Apply gates: template picker (lock premium), color picker (curated palettes on free, hex input on Pro), font picker (lock Google Fonts), animated button styles, "New Page" button (check page count limit). |
| Wed | Upgrade flow: `/pricing` page, "Upgrade to Pro" buttons at each gate point → Stripe Checkout. Stripe Customer Portal link for billing management (cancel, change card). |
| Thu | Abuse prevention: Google Safe Browsing API integration in `publishPage` Server Action (block publish if URLs flagged). Banned URL pattern checks on block create/update. "Report this page" link on public pages → `page_reports` table. `page_moderation_log` table + dashboard banner query: latest `action = 'unpublished'` row per page drives the "Your page was unpublished because..." notification — no silent unpublishes. |
| Thu | Rate limiting: Vercel KV-backed counters on Server Actions (auth: 5/min, mutations: 30/min per user, reports: 3/day per IP). NOT in edge middleware. |
| Fri | Error handling: Sentry integration, React error boundaries on editor + dashboard, custom 404/500 pages. |
| Fri | Production checklist: Lighthouse audit (target > 95 mobile), test on real phones (iOS Safari, Android Chrome), verify all gates work, verify Stripe test-mode end-to-end. |
| Fri | **Milestone: MVP complete. Core loop works: sign up → build → publish → view → analytics → upgrade.** |

### What's Deferred (and When)

| Feature | When | Prerequisite |
|---------|------|-------------|
| Custom server-side analytics beacon + click redirector | Month 2 | Replace PostHog web SDK with ~500B custom beacon → server-side forwarding; reduces public page JS to < 5KB. Server-side click redirector (`/api/l/{block_id}`) captures clicks before outbound redirect — uses `data-link-id` attributes already on link blocks at MVP. |
| Custom domains | Month 2 | DNS verification flow, Vercel domain API |
| Advanced blocks (Embed, Video, Carousel) | Month 2 | Performance testing for embedded iframes |
| OG image upload | Month 2 | R2 upload + `og_image_url` field on pages |
| Dynamic OG images | Month 2 | `@vercel/og` or Satori |
| Contact capture / forms | Month 2 | New block type + `contact_submissions` table |
| Link scheduling | Month 2 | Add `schedule_start/end` to blocks |
| Pixel/tracking integrations | Month 2 | Script injection safety review |
| Password-protected pages | Month 2 | Auth middleware for public pages |
| Email magic link auth | Month 2 | Resend integration for sending magic links |
| Downgrade email notifications | Month 2 | Resend integration for automated emails |
| Team members / workspaces | Month 3 | RBAC system, invitation flow |
| API access | Month 3 | Rate-limited API keys, documentation |
| Business tier | Month 3 | After custom domains + teams + API exist |

### Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| **Neon free tier compute limits** | ISR means DB hits are rare for public pages (cache serves most traffic). Monitor CU usage. If hitting limits, upgrade to Neon Launch ($19/mo) — first scaling cost. |
| **Auth.js v5 complexity** | Auth is Week 1 priority. If stuck after 1 day, fall back to Clerk (10K MAU free, pre-built UI). |
| **Template design quality** | 8 templates is the max. If quality suffers, ship 6 and add more in Month 2. Use proven color palettes (Tailwind defaults, Radix Colors). Get external feedback before launch. |
| **Scope creep** | Hard scope freeze: only features in the weekly plan above. If behind schedule, cut analytics dashboard (Week 3 Thu) and link directly to PostHog's built-in dashboard instead. |
| **Phishing/abuse flagging** | Google Safe Browsing integration in Week 4. If our domain gets flagged before launch, all pages get browser warnings — existential risk. Block flagged URLs on publish. |
| **Vercel Hobby commercial restriction** | Upgrade to Vercel Pro ($20/mo) before Stripe goes live in Week 4. This is the first and only required cost. |

---

## 10) Quality Control Checklist

### Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| **LCP** (Largest Contentful Paint) | < 800ms | Public pages on mobile 4G |
| **CLS** (Cumulative Layout Shift) | < 0.05 | No layout shifts after initial paint |
| **TTFB** (Time to First Byte) | < 200ms | Edge-cached ISR pages |
| **INP** (Interaction to Next Paint) | < 100ms | Editor interactions |
| **Total JS on public page** | < 30KB gzipped | PostHog web SDK (~25KB async, non-blocking) + link click handlers. Month 2: custom server-side beacon reduces this to < 5KB. |
| **Total HTML payload** | < 50KB | Server-rendered, no client-side hydration bloat |
| **Lighthouse score** | > 95 (mobile) | All four categories |
| **Time-to-first-publish** | < 5 min | From sign-up button to published page |

### Security Baseline

| Area | Requirement |
|------|------------|
| **Authentication** | Auth.js v5 with CSRF protection, secure HTTP-only cookies, session rotation |
| **Input validation** | Zod schemas on all Server Actions and API routes; sanitize user content |
| **File uploads** | Server-side MIME type validation, max 5MB, image-only; signed upload URLs; R2 keys namespaced by workspace |
| **SQL injection** | Drizzle ORM parameterized queries (never raw SQL with user input) |
| **XSS** | React auto-escapes by default; CSP headers; no `dangerouslySetInnerHTML` |
| **Rate limiting** | Server Action level via Vercel KV counters: auth routes (5/min), mutation routes (30/min per user), abuse reports (3/day per IP). NOT in-memory (doesn't survive across serverless invocations). NOT in edge middleware. |
| **Abuse prevention** | Google Safe Browsing API check on publish (block if flagged). Banned URL patterns (`javascript:`, meta-refresh, data URIs). "Report this page" on all public pages. Manual takedown capability. |
| **Secrets** | All keys in environment variables; `.env` in `.gitignore`; Vercel encrypted env vars |
| **HTTPS** | Enforced via Vercel (automatic) |

### Accessibility Baseline (WCAG 2.1 AA)

| Requirement | Implementation |
|-------------|---------------|
| **Color contrast** | All text meets 4.5:1 ratio; theme editor warns if user-chosen colors fail contrast |
| **Keyboard navigation** | All interactive elements focusable; visible focus rings; skip-to-content link |
| **Screen reader** | Semantic HTML (`nav`, `main`, `article`, `button`); ARIA labels on icon-only buttons |
| **Form labels** | All inputs have associated labels; error messages linked via `aria-describedby` |
| **Responsive text** | No text below 14px; supports 200% zoom without horizontal scroll |
| **Motion** | Respect `prefers-reduced-motion`; disable confetti/animations when set |

### Testing Strategy

| Type | Tool | Scope |
|------|------|-------|
| **Unit tests** | Vitest | Entitlements logic, theme token → CSS conversion, slug validation |
| **Integration tests** | Vitest + Testing Library | Server Actions (block CRUD), Stripe webhook handling |
| **E2E tests** | Playwright | Core loop: sign up → create page → add blocks → customize → publish → view public page → upgrade |
| **Performance** | Lighthouse CI | Run on public page route; fail build if LCP > 1000ms or score < 90 |
| **Accessibility** | axe-core via Playwright | Run on public page + editor; zero critical/serious violations |

### Definition of Done for MVP

- [ ] Core loop works end-to-end: sign up → create page → edit → publish → view at `/@username` → share
- [ ] < 5 minutes from sign-up to published page (tested with real user)
- [ ] Published page LCP < 800ms on mobile 4G (Lighthouse)
- [ ] 8 templates render correctly (6 free, 2 premium gated)
- [ ] Theme customization (colors, fonts, buttons, spacing) works with live preview
- [ ] Image uploads (avatar + block images) stored in R2, served optimized
- [ ] PostHog analytics: page views visible in dashboard (7-day chart)
- [ ] Stripe checkout: Free → Pro upgrade works (test mode)
- [ ] Feature gates enforced: premium templates, custom hex colors, fonts, animated buttons, page count
- [ ] Downgrade: cron safety net auto-unpublishes excess pages after 7-day grace period
- [ ] Abuse prevention: Safe Browsing check blocks publish of flagged URLs, "Report this page" works
- [ ] Lighthouse mobile score > 95 on public pages
- [ ] Zero critical accessibility violations (axe-core)
- [ ] E2E tests cover the core loop
- [ ] Sentry error tracking active
- [ ] Deployed to Vercel with production environment variables
- [ ] SEO meta tags (title, description) render correctly on public pages
- [ ] Reserved slugs rejected at creation (e.g., "dashboard", "login", "api" cannot be claimed)
- [ ] Middleware correctly excludes app routes from `/@slug` rewrite and `/slug` redirect

---

## Critical Files (Implementation Starting Points)

| Priority | File | Purpose |
|----------|------|---------|
| 1 | `src/lib/db/schema.ts` | Drizzle ORM schema — all entities, the foundation |
| 2 | `src/middleware.ts` | Edge Middleware — routing + auth check only, kept thin |
| 3 | `src/lib/entitlements.ts` | Code-defined `PLAN_MATRIX` + `getEntitlement()` — all feature gating |
| 4 | `src/components/templates/TemplateRenderer.tsx` | Core rendering engine — theme tokens + blocks → HTML |
| 5 | `src/app/(public)/[username]/page.tsx` | Public page route — ISR, Server Component, performance-critical |
| 6 | `src/app/(dashboard)/editor/[pageId]/page.tsx` | Page editor — blocks, theme, live preview |
| 7 | `src/lib/templates/index.ts` | Template definitions (8 `TemplateDefinition` objects) |
| 8 | `src/app/api/webhooks/stripe/route.ts` | Stripe webhook — subscription lifecycle, idempotent, single-transaction writes |
| 9 | `src/lib/safe-browsing.ts` | Google Safe Browsing API integration — URL scanning on publish, abuse prevention |
| 10 | `src/lib/slugs.ts` | Reserved slug denylist + validation — prevents route collisions with app routes |
