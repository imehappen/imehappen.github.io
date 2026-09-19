# Designs by imehappen — v2

Personal portfolio + service-ordering platform for **Musa Gabriel (imehappen)** — systems developer & designer, Nairobi.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Mongoose · Socket.IO (prepared) · jose JWT sessions · Custom Node server · **pnpm**

---

## ⚠️ AI Maintenance Contract — READ FIRST

> **TO ANY AI AGENT MODIFYING THIS APP:**
>
> 1. **Read this README end-to-end before changing anything.** It is the source of truth for architecture and conventions.
> 2. **Update this README in the same change** whenever you add/modify routes, components, models, env vars, scripts, or behavior. An out-of-date README is a bug.
> 3. **Preserve the design system** (`app/globals.css` `@theme` tokens: colors `bg/surface/card/elevated/border/fg/accent`, fonts `Archivo` display / `Space Grotesk` body). Do not introduce raw hex values in components — use the tokens. It was generated with the [ui-ux-pro-max skill](https://github.com/imehappen/ui-ux-pro-max-skill) (portfolio/agency profile, dark high-contrast variant; brand red `#ED2C27` kept from v1).
> 4. **Accessibility is non-negotiable:** 4.5:1 contrast, visible focus states, `cursor-pointer` on clickables, 44px touch targets, labeled form fields, `aria` on icon buttons, and `prefers-reduced-motion` support for all animation. Never leave focusable elements inside `aria-hidden` slides (see Swiper clone rules under *Motion system*).
> 5. **Responsive contract:** every page must hold at 375 / 768 / 1024 / 1440 px. Mobile is a first-class target — the hero is *vertical* (image top, text bottom) below `lg`.
> 5b. **Images live in `public/images/`** (the old root-level `images/` folder was merged into it — do not recreate it). Free placeholder photos for admin use live in `public/images/samples/`; admin-managed uploads go to the folder configured in Site Settings (default `public/images/uploads/`). Route protection lives in **`proxy.ts`** (Next 16 renamed `middleware.ts`; the exported function is `proxy`).
> 6. **DB is dormant by design.** Do not "fix" the demo-mode fallbacks in `lib/works-data.ts`, `lib/home-slides-data.ts`, `lib/services-data.ts`, `lib/ticker-data.ts`, or `lib/site-content.ts` — they are intentional. See *Enabling MongoDB* below before touching them.
> 7. **Socket.IO is wired but intentionally unused.** Do not remove the custom server, provider, or the `globalThis.__io` hook — real-time features will mount there.
> 8. **Verify your work:** run `pnpm run typecheck` and `pnpm run build` before finishing. The app must build clean in demo mode (no env vars set).
> 9. Keep the legacy v1 files (index.html, script.js, style.css) deleted — do not resurrect them.
> 10. When in doubt, match the existing patterns in neighboring files.
> 11. **Roles:** `superadmin` > `admin` > `client`. Admin + superadmin have full CRUD everywhere; the API enforces role guards (last-staff and self-delete protections in `/api/admin/users`). Do not weaken them.

---

## Quick start

```bash
pnpm install
pnpm run dev       # custom server with Socket.IO on http://localhost:3000
```

Other scripts:

| Script | What it does |
|---|---|
| `pnpm run dev` | Dev server (Next.js + Socket.IO via `server.js`) |
| `pnpm run dev:next` | Dev server without Socket.IO (plain `next dev`) |
| `pnpm run build` | Production build |
| `pnpm start` | Production server (custom server + Socket.IO) |
| `pnpm run typecheck` | `tsc --noEmit` |
| `pnpm run seed` | Seed catalog, slides, logos, services, content into MongoDB (requires `MONGODB_URI`) |

The app **runs with zero environment variables** in demo mode: content is served from `lib/seed-data.ts`, `lib/services-data.ts`, `lib/ticker-data.ts`, and the defaults in `lib/site-content.ts`; forms acknowledge without persisting.

---

## Project structure

```
├── server.js                  # Custom Next.js + Socket.IO server (dev & prod entry)
├── proxy.ts                   # Route protection (Next 16 "proxy", ex-middleware): /admin, /account
├── next.config.mjs
├── app/
│   ├── layout.tsx             # Fonts, SocketProvider, Navbar, Footer, skip-link
│   ├── globals.css            # Tailwind v4 @theme design tokens (source of truth)
│   ├── template.tsx           # Remounts per navigation → page fade-up transition
│   ├── page.tsx               # Home: hero, ticker, marquee, featured, services, about, contact
│   ├── about/page.tsx         # About page (editable content)
│   ├── services/page.tsx      # Services page (editable)
│   ├── contact/page.tsx       # Contact page + message form
│   ├── order/page.tsx         # Order form (`/order?work=slug` preselects)
│   ├── login/page.tsx         # Sign in / register
│   ├── account/page.tsx       # Client/staff account overview
│   ├── works/
│   │   ├── page.tsx           # Catalog grid (Amazon-style cards)
│   │   └── [slug]/page.tsx    # Product detail: gallery, buy box, spec table, related
│   ├── admin/                 # PANEL — one page per editable section
│   │   ├── layout.tsx         # Sidebar shell (staff only, proxy-guarded)
│   │   ├── page.tsx           # Dashboard: counts + quick links
│   │   ├── sliders/page.tsx   # Hero carousel + work marquee CRUD (incl. all CTAs)
│   │   ├── media/page.tsx     # Media library: uploads + free samples, import/delete
│   │   ├── ticker/page.tsx    # Trusted-by logos CRUD
│   │   ├── services/page.tsx  # Services CRUD (icon or card image)
│   │   ├── works/page.tsx     # Works CRUD (media, features, tags, pricing)
│   │   ├── about/page.tsx     # About section editor
│   │   ├── contact/page.tsx   # Contact section editor
│   │   ├── settings/page.tsx  # Site settings (identity, toggles, media folders, footer contact)
│   │   ├── orders/page.tsx    # Order pipeline (status + delete)
│   │   ├── messages/page.tsx  # Contact inbox (read/archived + delete)
│   │   └── users/page.tsx     # User & role management
│   └── api/
│       ├── orders/route.ts    # POST create order
│       ├── contact/route.ts   # POST contact message
│       ├── users/…            # register · login · logout · me
│       └── admin/…            # staff-guarded CRUD: hero, ticker, services,
│                              #   works, content, orders, messages, users, overview
├── components/
│   ├── hero-slider.tsx        # 50/50 split hero (vertical on mobile), auto-advance
│   ├── infinite-slider.tsx    # Full-width seamless marquee
│   ├── trusted-ticker.tsx     # "Trusted by" strip — grayscale logos, color on hover
│   ├── typed-heading.tsx      # Two-tone clipped headings (split + gradient) + typewriter
│   ├── works-grid.tsx         # Client-side category filter for the works catalog
│   ├── reveal.tsx             # Scroll-reveal wrapper (IntersectionObserver, once-only)
│   ├── scroll-ui.tsx          # Scroll progress bar + back-to-top button
│   ├── work-gallery.tsx       # Amazon-style gallery: images + video, thumb rail
│   ├── order-form.tsx         # Validated order form with status feedback
│   ├── contact-form.tsx       # Contact message form
│   ├── navbar.tsx             # Sticky glass nav, session-aware menu, mobile drawer
│   ├── footer.tsx             # Page links, socials, editable site name/tagline + contact
│   ├── logo.tsx
│   ├── socket-provider.tsx    # Socket.IO client (prepared, unused)
│   └── admin/
│       ├── admin-ui.tsx       # Shared panel primitives + ContentSection helper
│       └── media-picker.tsx   # Image field with library browser (uploads + samples)
├── lib/
│   ├── mongodb.ts             # Lazy mongoose connection (never connects unless URI set)
│   ├── models.ts              # User, Work, Order, HomeSlide, TrustedLogo, Service, Content, Message, MarqueeSlide
│   ├── auth.ts                # jose JWT sessions; roles superadmin/admin/client
│   ├── admin-api.ts           # Shared admin route guard + body helpers
│   ├── works-data.ts          # DB-or-seed reader + WorkView shape
│   ├── pricing.ts             # Pure formatPrice helper (client-safe — no server imports here)
│   ├── home-slides.ts(x)      # Hero slide seed content + DB reader
│   ├── services-data.ts       # Services seed + DB reader
│   ├── ticker-data.ts         # Trusted-by logos seed + DB reader
│   ├── marquee-data.ts        # Marquee slides reader (falls back to works)
│   ├── media.ts               # Media library: list/copy/delete public image files
│   ├── site-content.ts        # about/contact/settings defaults + DB reader
│   └── seed-data.ts           # Demo catalog (source for /works without DB)
├── scripts/seed.mjs           # pnpm run seed
└── .github/workflows/deploy.yml
```

## Routes

### Pages
| Route | Access | Description |
|---|---|---|
| `/` | public | Hero split-slider, trusted-by ticker, marquee, featured work, services, about, contact |
| `/works` | public | Catalog of all published works |
| `/works/[slug]` | public | Product detail — gallery (image/video), spec table, order CTA, related |
| `/services` | public | All services (editable) |
| `/about` | public | About page (editable) |
| `/contact` | public | Contact details (editable) + message form |
| `/order` | public | Order form (`/order?work=slug` preselects a service) |
| `/login` | public | Sign in / register (`?next=` redirect supported) |
| `/account` | session | Account overview (middleware-guarded) |
| `/admin` + 10 sections | staff | Admin panel (middleware-guarded; sidebar navigation) |

### API
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | public | Create an order. Body: `workSlug, name, email, phone?, company?, budget?, message?` |
| POST | `/api/contact` | public | Contact message. Body: `name, email, subject?, message` |
| POST | `/api/users` | public | Register. **First account becomes superadmin**; others are clients |
| GET | `/api/users` | staff | User list |
| POST | `/api/users/login` | public | `{ email, password }` → sets `imehappen_session` httpOnly cookie |
| POST | `/api/users/logout` | public | Clears the session cookie |
| GET | `/api/users/me` | public | Current session or `null` |
| GET | `/api/admin/overview` | staff | Dashboard counts |
| GET | `/api/admin/media` | staff | List uploads + sample images (folders from settings) |
| POST | `/api/admin/media` | staff | Import a sample image into the media folder. Body: `{ src }` |
| DELETE | `/api/admin/media?src=` | staff | Delete an uploaded file (samples are protected) |
| GET/POST/PUT/DELETE | `/api/admin/sliders?type=hero\|marquee` | staff | Both sliders' CRUD (hero: full CTA fields; marquee: src/alt) |
| GET/POST/PUT/DELETE | `/api/admin/ticker` | staff | Trusted-by logos CRUD |
| GET/POST/PUT/DELETE | `/api/admin/services` | staff | Services CRUD |
| GET/POST/PUT/DELETE | `/api/admin/works` | staff | Works CRUD (slug auto-generated, unique) |
| GET/PUT | `/api/admin/content?section=about\|contact\|settings` | staff | Singleton section editors |
| GET/PUT/DELETE | `/api/admin/orders` | staff | List · status update · delete |
| GET/PUT/DELETE | `/api/admin/messages` | staff | List · read/archived · delete |
| GET/POST/PUT/DELETE | `/api/admin/users` | staff | Users CRUD with role protections (see below) |

### Roles & protections
- **superadmin** — everything, including granting the `superadmin` role and deleting superadmins.
- **admin** — full CRUD on all content sections, orders, messages, users (except superadmin-only actions).
- **client** — sign-in and `/account` only.
- Guards: `requireStaffSession()` (API) + `middleware.ts` (pages). Last staff member cannot be demoted/deleted; you cannot delete your own account; only superadmin grants `superadmin`.

### WebSocket
`/api/socketio` — Socket.IO endpoint served by `server.js`. **No events are consumed yet.** To emit later from anywhere:

```ts
globalThis.__io?.io?.emit("order:created", { orderNumber });
```

Client access (already wired in `components/socket-provider.tsx`, unused):

```tsx
const { socket, connected } = useSocket();
```

---

## Design system

Generated with the **ui-ux-pro-max** skill (design-system query, portfolio/agency profile). Tokens live in `app/globals.css` under `@theme` and are consumed as Tailwind utilities (`bg-bg`, `text-fg-muted`, `border-border`, `bg-accent`, …).

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#020617` | Page background |
| `--color-surface` | `#0f172a` | Alternate section background |
| `--color-card` | `#0e1223` | Cards |
| `--color-elevated` | `#1a1f33` | Hover/elevated surfaces |
| `--color-border` / `-strong` | `#1e293b` / `#334155` | Hairlines |
| `--color-fg` / `-muted` / `-faint` | `#f8fafc` / `#94a3b8` / `#64748b` | Text tiers |
| `--color-accent` | `#ED2C27` | Brand red — CTAs, highlights (kept from v1) |
| Display / Body fonts | `Archivo` / `Space Grotesk` | Per skill pairing for design portfolios |

Key components:
<!-- https://lmgonzalves.github.io/momentum-slider/portfolio-carousel/ 
https://github.com/lmgonzalves/momentum-slider -->

- **HeroSlider** — Portfolio-Carousel hero built on a local port of [lmgonzalves/momentum-slider](https://github.com/lmgonzalves/momentum-slider) (`lib/momentum-slider.js`). Four interleaved sliders share one gesture: a centered image track (interactive) plus synced huge-index watermark, vertical title column and vertical CTA column. The track follows the pointer 1:1, rubber-bands past the edges, then throws with the hand's velocity and eases out (easeOutQuad, ~500ms) to the nearest slide, wrapping **infinitely** in both directions (`loop: 1` clones each side). Copy is deliberately minimal — small eyebrow, big title, one CTA row; the subtitle is kept `sr-only` for SEO. Line pagination, prev/next controls, autoplay (pauses on hover/focus/drag), reduced-motion safe. Every slide — image, eyebrow, title, subtitle, and **both CTAs (label + href)** — is editable in `/admin/sliders`.
- **TrustedTicker** — "Trusted by" strip: logos render **grayscale at 50% opacity; the hovered logo transitions to full color**. Continuous Swiper marquee (linear autoplay) with edge fades; drag it and it glides back into the drift. Pauses on hover. Label + logos editable in `/admin/ticker`; strip on/off in `/admin/settings`.
- **InfiniteSlider** — full-width seamless work marquee with prev/next controls and edge fades. Admin-curated slides (image + alt) from `/admin/sliders` → *Work marquee* win; otherwise it derives from each published work's first image. On/off in `/admin/settings`.
- **Slider controls** — shared `.slider-nav-btn` style (globals.css) used by all sliders; the hero wires it through the momentum engine's `prevEl`/`nextEl`, the marquees via Swiper `Navigation` with refs in `onBeforeInit`. Marquees ease with `linear` on `.swiper-wrapper` so release-after-drag returns to a continuous drift instead of snapping.

### Motion system

The whole site shares one motion language: the **expo-out curve** (`--ease-out-expo`) with ~280ms for micro-interactions and longer, larger movements for entrances. Nothing on the site should ever use Tailwind's stock `ease`.

| Layer | Implementation | Notes |
|---|---|---|
| **Default easing (all transitions)** | `@theme` overrides in globals.css: `--default-transition-timing-function: var(--ease-out-expo)`, `--default-transition-duration: var(--duration-fast)` | Every `transition-*` utility site-wide inherits the expo curve — don't add per-element `ease-*` classes |
| **Duration scale (5 tiers)** | `--duration-fast .3s · --duration-medium .45s · --duration-slow .65s · --duration-slower .9s · --duration-slowest 1.2s` in globals.css `@theme`; applied via `duration-fast/medium/slow/slower/slowest` utilities | Change one variable → whole tier follows. `fast` = micro-interactions (buttons, links, tabs, inputs); `medium` = hover moves (card lifts, controls, page transition); `slow` = entrances & image treatments (reveals, zooms, filters); `slower` = hero copy rise; `slowest` = reserved for oversized editorial entrances. Tailwind's `duration-100…700` are retired — never reintroduce them |
| **Page transitions** | `app/template.tsx` remounts per navigation → `.page-transition` fade-up (0.4s, 12px) | Inherited by every route automatically; don't add per-page wrappers |
| **Scroll reveals** | `<Reveal>` (`components/reveal.tsx`): fade-up 0.65s/20px on first viewport entry, once-only | Wrap section headers/cards; stagger grids with `delay={(i % 3) * 70}`; safe for SSR, `<noscript>` fallback in layout |
| **Card lift** | `.lift-card` (lift 0.35s + layered shadow 0.45s) and `.lift-zoom` (image scale 0.7s expo) | Physical feel: shadow eases slower than the lift |

| **Slider glide** | Hero: the momentum engine's rAF decel (`easeOutQuad`, `animDuration`). Marquees/ticker: `.marquee-ticker-glide .swiper-wrapper` easing (Swiper transitions the **wrapper**, not slides) | Drag-release glides instead of snapping |
| **Marquee drift** | `.marquee-ticker-glide .swiper-wrapper` stays `linear` (delay-0 autoplay) | Continuous glide, no per-slide pulse |
| **Scroll affordances** | `ScrollProgress` (rAF + `scaleX`, GPU-composited) and `BackToTop` (appears past ~85% viewport, `tabIndex=-1` when hidden) | Both in `components/scroll-ui.tsx`, mounted in layout |
| **Reduced motion** | Global kill-switch in globals.css zeroes every animation/transition; typed cursor, reveals, page transition, hero autoplay/anim all disabled | Never ship an animation without checking it lands under this rule. Autoplay must also be stopped **synchronously in `onSwiper`** (pre-paint) — an effect-based stop runs after first paint and flashes a frame of motion |

**Transition pitfalls — studied & fixed, do not regress:**
- **Swiper 14 loop-mode math:** loop only works when `slides.length ≥ slidesPerView + slidesPerGroup + loopAdditionalSlides`. The marquee/ticker pre-duplicate their track, which satisfies the requirement. (The hero no longer uses Swiper — it runs the momentum engine with its own `loop: 1` clones.)
- **Swiper 14 React ignores custom nav elements** wired via `onBeforeInit` (`needsNavigation` only true when `navigation` has no els). Custom prev/next buttons must call `swiperRef.current?.slidePrev()/slideNext()` directly in `onClick` — the Navigation module is not even imported for them.
- **Stale dev-server lock + Windows PID reuse:** `.next/dev/lock` stores a PID; after a crash, Windows can hand that PID to an unrelated process, and `next dev` then refuses to start ("Another next dev server is already running") or another project silently serves port 3000. Fix: `rm -rf .next/dev/lock` (or `.next`) and start on a different `PORT`.
- **Swiper transitions `.swiper-wrapper`, not the slides.** Per-slide easing overrides silently do nothing; that was the cause of the "snappy release" bug. Glide easing lives on the wrapper (`.hero-swiper`); marquees keep `linear` there.
- **Never tie copy opacity/transform to the active slide on a translate slider** — during travel both slides are visible, so per-slide fades read as text evaporating mid-motion. Hero copy animates once on mount and stays visible.
- **Always-on CSS animation beats class-toggled animation for continuous effects** — the Ken Burns zoom is a pure-CSS alternate loop precisely so it never snaps between scales when the active slide changes.
- **Timers that re-type/re-animate must wait for transition end** (`onSlideChangeTransitionEnd`, not `onSlideChange`), and the first activation must also wait out the copy entrance (~1.25s) or the typewriter reflows text inside a still-transforming element.
- **Bubble-based focus pause jitters**: React fires `blur` before the next `focus`, so pausing on every `onFocus`/`onBlur` stop/starts autoplay on each tab between CTAs. Gate on `:focus-visible` and on `relatedTarget` still being inside the section.
- **`.reveal` must not keep `will-change` after revealing** — it would pin a compositor layer for every revealed element site-wide. GPU promotion belongs on the animating state (hover/fire), not the resting state.
- **Fixed site-wide widgets (scroll progress, back-to-top) overlap the admin panel** — the admin layout sets `data-admin-ui` on `<html>` and globals.css hides them under it.
- **Focusable elements inside `aria-hidden` clone slides are an a11y violation** — clones render no links; hero CTAs carry `tabIndex={-1}` unless their slide is active.

**Swiper a11y rules (do not regress):**
- Looped Swiper clones duplicate slides — never render links/buttons inside `aria-hidden` clones (see `trusted-ticker.tsx`), and hero CTAs get `tabIndex={-1}` unless their slide is active (`hero-slider.tsx`).
- Draggable strips set `cursor: grab`/`:active grabbing` on the whole swiper (`.marquee-swiper`, `.ticker-swiper`) or track (`.pc-images`), not just the container.
- Tailwind v4 emits the individual `translate` / `scale` / `rotate` CSS properties, not `transform`. Any hand-written `transition` list that is meant to animate a `hover:-translate-y-*` / `hover:scale-*` utility must list those properties too (see the global `:where(...)` rule, `.lift-card`, `.lift-zoom`).

**Admin components:**
- **MediaPicker** (`components/admin/media-picker.tsx`) — image field used across admin forms: type a path/URL or browse the library (uploads tab + samples tab; clicking a sample imports it into the uploads folder and selects it).
- **WorkGallery** — product gallery supporting images and video with a thumbnail rail.

---

## Data layer (MongoDB + Mongoose) — dormant until enabled

Mongoose is fully configured but the app intentionally ships **without a database connection**. Content renders from seed modules; writes acknowledge without persisting. The admin panel loads and explains this state.

### Models (`lib/models.ts`)
- **User** — `name, email (unique), passwordHash, role: "superadmin"|"admin"|"client", company?, phone?` + timestamps
- **Work** — `slug (unique), title, category, summary, description, features[], tags[], media[{src, kind, alt}], priceFrom?, deliveryWeeks?, featured, published` + timestamps
- **Order** — `orderNumber (unique), work → Work, name, email, phone?, company?, budget?, message?, status: new|in_review|in_progress|delivered|cancelled` + timestamps
- **HomeSlide** — `image, alt, eyebrow, title, subtitle, ctaLabel, ctaHref, secondaryLabel?, secondaryHref?, order, published` + timestamps
- **TrustedLogo** — `name, image, url?, order, published` + timestamps
- **Service** — `title, description, iconPath (24×24 SVG path body), order, published` + timestamps
- **Content** — singleton key/value docs: `key: "about"|"contact"|"settings"`, `data: Record<string,string>` + timestamps
- **Message** — `name, email, subject?, message, status: new|read|archived` + timestamps
- **MarqueeSlide** — `src, alt, order, published` + timestamps (empty → strip derives from works)
- **Service** also supports an optional `image` (card image shown instead of the SVG icon)

### Enabling MongoDB (when you're ready)
1. Get a connection string (local `mongod` or MongoDB Atlas).
2. `cp .env.example .env.local` and set:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/imehappen
   AUTH_SECRET=<64-hex>            # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. `pnpm run seed` — loads works, hero slides, ticker logos, services, and content defaults. Create your superadmin in one go:
   `pnpm run seed --with-admin "Musa Gabriel,imehappen@gmail.com,yourpassword"`
4. Restart the dev server, sign in at `/login`, and open `/admin`. Every section of the site is now editable there and changes render immediately (all pages are dynamic).
5. Register flow: the **first account** created via `POST /api/users` becomes **superadmin** if the users collection is empty.
6. **Media & samples:** the admin *Media Library* (`/admin/media`) lists your uploads and the bundled free sample photos in `public/images/samples/` (10 CC0 images from picsum.photos, downloaded at setup). Click **Import** to copy a sample into your media folder (default `public/images/uploads/`, configurable in Site Settings), then select it anywhere via the **Browse** picker. Files dropped directly into the media folder appear automatically.
7. Ticker logos: add entries in `/admin/ticker` pointing `image` at files under `public/images/logos/` (SVG recommended). Demo placeholders ship in that folder.

## Socket.IO (prepared, unused by design)

- `server.js` attaches Socket.IO at **`/api/socketio`** and exposes it on `globalThis.__io.io` for API-route access.
- `components/socket-provider.tsx` connects the browser client (disable with `NEXT_PUBLIC_SOCKET_ENABLED=false`).
- Suggested first uses: live order-status updates (`order:created`, `order:status`), chat, admin notifications.

---

## Conventions for future changes

- **Server components by default;** `"use client"` only for interactivity (sliders, forms, nav state, admin pages).
- **Async params:** Next 15 page props are Promises — `const { slug } = await params;`.
- **Images** always via `next/image` with explicit `sizes`; media lives in `/public/images`.
- **Forms:** visible labels, inline validation errors near fields, loading → success/error feedback (see `components/order-form.tsx`).
- **Admin CRUD routes** all go through `lib/admin-api.ts` `guard()` — never bypass the staff check.
- **Editable content** reads through the `lib/*-data.ts` / `lib/site-content.ts` readers; keep their DB-or-fallback contract intact.
- **Icons:** inline SVG (Heroicons/Lucide style), never emoji.
- **Commits:** imperative, e.g. `Add order status pipeline`.
- **Motion:** use the shared curve/defaults from the *Motion system* table — never raw `ease`, never new one-off durations without a reason. Entrances belong in globals.css keyframes; scroll-triggered visibility goes through `<Reveal>`, not scroll listeners.

## Deployment

`pnpm run build && pnpm start` (custom server required for Socket.IO — do not swap for `next start`). Any Node host works (VM + pm2, Docker, Railway, Render, Fly.io). `.github/workflows/deploy.yml` builds with pnpm on push; wire the deploy step when a host is chosen.

---

© Musa Gabriel · imehappen@gmail.com · Nairobi, Kenya
