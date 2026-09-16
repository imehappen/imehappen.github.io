# Designs by imehappen — v2

Personal portfolio + service-ordering platform for **Musa Gabriel (imehappen)** — systems developer & designer, Nairobi.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Mongoose (prepared) · Socket.IO (prepared) · jose JWT sessions · Custom Node server

---

## ⚠️ AI Maintenance Contract — READ FIRST

> **TO ANY AI AGENT MODIFYING THIS APP:**
>
> 1. **Read this README end-to-end before changing anything.** It is the source of truth for architecture and conventions.
> 2. **Update this README in the same change** whenever you add/modify routes, components, models, env vars, scripts, or behavior. An out-of-date README is a bug.
> 3. **Preserve the design system** (`app/globals.css` `@theme` tokens: colors `bg/surface/card/elevated/border/fg/accent`, fonts `Archivo` display / `Space Grotesk` body). Do not introduce raw hex values in components — use the tokens. It was generated with the [ui-ux-pro-max skill](https://github.com/imehappen/ui-ux-pro-max-skill) (portfolio/agency profile, dark high-contrast variant; brand red `#ED2C27` kept from v1).
> 4. **Accessibility is non-negotiable:** 4.5:1 contrast, visible focus states, `cursor-pointer` on clickables, 44px touch targets, labeled form fields, `aria` on icon buttons, and `prefers-reduced-motion` support for all animation.
> 5. **Responsive contract:** every page must hold at 375 / 768 / 1024 / 1440 px. Mobile is a first-class target — the hero is *vertical* (image top, text bottom) below `lg`.
> 6. **DB is dormant by design.** Do not "fix" the demo-mode fallbacks in `lib/works-data.ts`, `lib/home-slides-data.ts`, or the API routes — they are intentional. See *Enabling MongoDB* below before touching them.
> 7. **Socket.IO is wired but intentionally unused.** Do not remove the custom server, provider, or the `globalThis.__io` hook — real-time features will mount there.
> 8. **Verify your work:** run `npm run typecheck` and `npm run build` before finishing. The app must build clean in demo mode (no env vars set).
> 9. Keep the legacy v1 files (index.html, script.js, style.css) deleted — do not resurrect them.
> 10. When in doubt, match the existing patterns in neighboring files.

---

## Quick start

```bash
npm install
npm run dev        # custom server with Socket.IO on http://localhost:3000
```

Other scripts:

| Script | What it does |
|---|---|
| `npm run dev` | Dev server (Next.js + Socket.IO via `server.js`) |
| `npm run dev:next` | Dev server without Socket.IO (plain `next dev`) |
| `npm run build` | Production build |
| `npm start` | Production server (custom server + Socket.IO) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed` | Load demo catalog into MongoDB (requires `MONGODB_URI`) |

The app **runs with zero environment variables** in demo mode: content is served from `lib/seed-data.ts` and forms acknowledge without persisting.

---

## Project structure

```
├── server.js                  # Custom Next.js + Socket.IO server (dev & prod entry)
├── next.config.mjs
├── app/
│   ├── layout.tsx             # Fonts, SocketProvider, Navbar, Footer, skip-link
│   ├── globals.css            # Tailwind v4 @theme design tokens (source of truth)
│   ├── page.tsx               # Home: HeroSlider, InfiniteSlider, services, about, contact
│   ├── works/
│   │   ├── page.tsx           # Catalog grid (Amazon-style cards)
│   │   └── [slug]/page.tsx    # Product detail: gallery, buy box, spec table, related
│   ├── order/page.tsx         # Order form page
│   └── api/
│       ├── orders/route.ts    # POST create order
│       └── users/
│           ├── route.ts       # POST register · GET admin-only list
│           ├── login/route.ts # POST login (sets httpOnly JWT cookie)
│           ├── logout/route.ts# POST logout
│           └── me/route.ts    # GET current session
├── components/
│   ├── hero-slider.tsx        # 50/50 split hero (vertical on mobile), auto-advance
│   ├── infinite-slider.tsx    # Full-width seamless marquee (replaces v1 coverflow)
│   ├── work-gallery.tsx       # Amazon-style gallery: images + video, thumb rail
│   ├── order-form.tsx         # Validated order form with status feedback
│   ├── navbar.tsx             # Sticky glass nav, active section, mobile drawer
│   ├── footer.tsx
│   ├── logo.tsx
│   └── socket-provider.tsx    # Socket.IO client (prepared, unused)
├── lib/
│   ├── mongodb.ts             # Lazy mongoose connection (never connects unless URI set)
│   ├── models.ts              # User, Work, Order schemas (lazy registration)
│   ├── auth.ts                # jose JWT sessions in httpOnly cookies
│   ├── works-data.ts          # DB-or-seed reader + WorkView shape
│   ├── home-slides.ts         # Hero slide content
│   ├── home-slides-data.ts    # DB-or-seed reader for slides
│   └── seed-data.ts           # Demo catalog (source for /works without DB)
├── scripts/seed.mjs           # npm run seed
└── .github/workflows/deploy.yml # Build workflow (deploy step intentionally absent)
```

## Routes

### Pages
| Route | Description |
|---|---|
| `/` | Hero split-slider, full-width infinite slider, featured work, services, about, contact |
| `/works` | Catalog of all published works |
| `/works/[slug]` | Product detail — gallery (image/video), spec table, order CTA, related |
| `/order` | Order form (`/order?work=slug` preselects a service) |

### API
| Method | Route | Description |
|---|---|---|
| POST | `/api/orders` | Create an order. Body: `workSlug, name, email, phone?, company?, budget?, message?` → `{ ok, orderNumber }` |
| POST | `/api/users` | Register. First account becomes **admin**; others are clients. Body: `name, email, password, role?, company?, phone?` |
| GET | `/api/users` | Admin-only user list (requires session cookie) |
| POST | `/api/users/login` | `{ email, password }` → sets `imehappen_session` httpOnly cookie |
| POST | `/api/users/logout` | Clears the session cookie |
| GET | `/api/users/me` | Current session or `null` |

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

- **HeroSlider** (`components/hero-slider.tsx`) — the requested 50/50 slider: image half + text half (eyebrow → main headline → smaller subtitle → CTA button). Alternates image side per slide on `lg+`; **stacks vertically (image top, text bottom) below `lg`**. Auto-advances 6s, pauses on hover/focus/hidden tab, honors `prefers-reduced-motion`.
- **InfiniteSlider** (`components/infinite-slider.tsx`) — the new full-width seamless marquee that **replaces the v1 3D coverflow**. Duplicated track animating `translateX(-50%)`, pauses on hover, static scrollable row under reduced motion.
- **WorkGallery** (`components/work-gallery.tsx`) — Amazon-style product gallery supporting **both images and videos** with a thumbnail rail (this is how video work is showcased).

---

## Data layer (MongoDB + Mongoose) — currently dormant

Mongoose is fully configured but the app intentionally ships **without a database connection**. Content renders from `lib/seed-data.ts`; writes acknowledge without persisting.

### Models (`lib/models.ts`)
- **User** — `name, email (unique), passwordHash, role: "admin"|"client", company?, phone?` + timestamps
- **Work** — `slug (unique), title, category, summary, description, features[], tags[], media[{src, kind: image|video, alt}], priceFrom?, deliveryWeeks?, featured, published` + timestamps
- **Order** — `orderNumber (unique), work → Work, name, email, phone?, company?, budget?, message?, status: new|in_review|in_progress|delivered|cancelled` + timestamps

### Enabling MongoDB (when you're ready)
1. Get a connection string (local `mongod` or MongoDB Atlas).
2. `cp .env.example .env.local` and set:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/imehappen
   AUTH_SECRET=<64-hex>            # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. `npm run seed` — loads the demo catalog. Optionally create yourself as admin in one go:
   `npm run seed -- --with-admin "Musa Gabriel,imehappen@gmail.com,yourpassword"`
4. Restart the dev server. Routes now read/write Mongo; remove the fallbacks in `lib/works-data.ts` only if you want hard failures instead of graceful degradation.
5. Register flow: the **first account** via `POST /api/users` (or the seed flag) is the admin; subsequent ones are clients.

## Socket.IO (prepared, unused by design)

- `server.js` attaches Socket.IO at **`/api/socketio`** and exposes it on `globalThis.__io.io` for API-route access.
- `components/socket-provider.tsx` connects the browser client (disable with `NEXT_PUBLIC_SOCKET_ENABLED=false`).
- Suggested first uses: live order-status updates (`order:created`, `order:status`), chat, admin notifications.

---

## Conventions for future changes

- **Server components by default;** `"use client"` only for interactivity (sliders, forms, nav state).
- **Async params:** Next 15 page props are Promises — `const { slug } = await params;`.
- **Images** always via `next/image` with explicit `sizes`; media lives in `/public/images`.
- **Forms:** visible labels, inline validation errors near fields, loading → success/error feedback (see `components/order-form.tsx`).
- **Icons:** inline SVG (Heroicons/Lucide style), never emoji.
- **Commits:** imperative, e.g. `Add order status pipeline`.

## Deployment

`npm run build && npm start` (custom server required for Socket.IO — do not swap for `next start`). Any Node host works (VM + pm2, Docker, Railway, Render, Fly.io). The GitHub Pages workflow was **retired** — a server is required for API routes and WebSockets. `.github/workflows/deploy.yml` builds on push; wire the deploy step when a host is chosen.

---

© Musa Gabriel · imehappen@gmail.com · Nairobi, Kenya
