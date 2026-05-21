# ✨ MASHAER JEWELLERY | مجوهرات مشاعر

> **Children's Jewellery with Dynamic QR Memory Codes**  
> _"Feelings That Last, In Every Piece" / "في كل قطعة… مشاعر تبقى"_

A bilingual (Arabic-default, English-secondary), mobile-first, premium jewellery e-commerce experience for the UAE market — featuring a one-of-a-kind **QR Memory keepsake** system embedded into every piece.

This repository contains:

- 📚 Full project documentation in [`docs/`](./docs)
- 💻 The Next.js application in [`hekaya/`](./hekaya)

---

## 🚀 Quick Start

```bash
cd hekaya
npm install
npm run dev          # → http://localhost:3000
npm run build        # production build
```

> Default language is **Arabic (RTL)**. Toggle to English from the header.

---

## ✅ What's Built (Frontend MVP)

The current build is a **frontend-only walkthrough** — backend / authentication / real payments are deliberately **mocked** so the entire flow can be demoed end-to-end without external services.

### Pages

| Path                       | Purpose                                                                                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------------------ | ------------------------------------------------------------------------------------------ | --- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `/`                        | Hero, trust strip, collections, featured products, QR explainer, story, testimonials, **gold "Ready to Create a Memory?" CTA band**                                        |
| `/products`                | Filter + sort catalogue (sidebar + mobile drawer). Cards show category eyebrow tag.                                                                                        |
| `/product/[slug]`          | Detail with category eyebrow, **age + material chips**, gallery, variations, **Description / Shipping / Jewellery Care tabs**, related                                     |
| `/checkout`                | 3-step flow + **sticky Order Summary**. Shipping fee wired to `adminSettings.shipping` (per-emirate). Each QR token stores its product name for labeling.                  |
| `/order-confirmation/[id]` | Gold QR codes generated as PNG. Each card shows the product thumbnail + item name so customer and admin know which QR belongs to which piece. Download per card.           |
| `/memory/[token]`          | **The differentiator** — PIN-protected memory page (setup, unlock, view, edit). Uploads up to 3 photos as data-URLs (mock storage)                                         |
| `/account`                 | Mock-login dashboard with **Overview** (4 stat tiles + recent orders + quick actions), **Orders**, **Memories**, **Addresses (full CRUD)**, **Wishlist (live, persisted)** |
| `/my-memories`             | Dedicated keepsakes page — reads real `data.store.memories`, renders gold QR PNG per card with masked PIN and View / Edit actions                                          |
| `/admin`                   | Dark luxury dashboard with 4 trend stat cards, Orders by Status bar chart, 12-month Revenue Trend area chart (recharts), recent orders table                               |
| `/admin/products`          | Dark CRUD table with search, status toggle switch, add/edit modal (in-memory)                                                                                              |
| `/admin/collections`       | Create / edit / reorder / delete collections (persisted Zustand)                                                                                                           |
| `/admin/orders`            | Search + filter pills, inline status dropdown, dark detail drawer with QR token chips                                                                                      |     | `/admin/customers` | Aggregated from orders by email — stat tiles, search, table with order count & total spent |     | `/admin/qr` | QR Memories — 3 stat cards (Total Generated / Set Up / Pending), search, table of every generated token with status pill |
| `/admin/settings`          | 4 tabs: Store info / QR Memory config / Shipping rates / Email Notifications — persisted via Zustand                                                                       |
| `/qr`                      | Marketing/explainer page for QR Memory                                                                                                                                     |
| `/about`                   | Dark editorial hero ("More Than Jewellery. A Legacy.") + Our Values 4-card grid + gold "Be Part of the Story" CTA band                                                     |
| `/contact`                 | Topic dropdown, 0/500 character counter, **WhatsApp banner**, **Showroom card**, contact cards, **FAQ accordion** (4 Qs)                                                   |
| `/policies`                | Tabbed legal pages (Shipping / Returns / Privacy / Terms)                                                                                                                  |

### Tech

- **Next.js 15.5.15** (App Router, TypeScript, no Turbopack)
- **React 19** · **TypeScript 5**
- **Tailwind CSS v4** — pure CSS `@theme` config, no `tailwind.config.ts`
- **Zustand 5** with `persist` middleware. Stores: `cart`, `locale`, `data` (orders + memories + collections + product overrides), `adminSettings`, **`wishlist`**. Custom `safeStorage` wrapper drops memory photos on `localStorage` quota errors.
- **framer-motion 12** for entrance + drawer animations
- **lucide-react** icons + custom inline brand SVGs (Instagram/Facebook hand-coded)
- **qrcode** for real QR PNG generation (gold `#c9a96e` default)
- **recharts** for the admin dashboard charts
- **sonner** for toasts
- **react-hook-form** + **zod** for forms (available; selectively used)
- All product imagery via in-house `<PlaceholderJewel />` SVGs (no external assets)
- Logo as scalable SVG (`<Logo />` in `hekaya/src/components/ui/Logo.tsx`)
- `next.config.ts` sets `outputFileTracingRoot` to silence multiple-lockfile warning

### i18n

- Single set of routes (no `[locale]` folder)
- Locale lives in a Zustand store (`mashaer-locale`), default `ar`
- `<html dir>` is updated client-side via the `useT` hook
- Bilingual translations centralised in [`hekaya/src/lib/i18n.ts`](./hekaya/src/lib/i18n.ts)

### Mocked / Skipped (intentional)

- ❌ No Supabase / database — orders + memories persist in `localStorage`
- ❌ No real auth — Account page uses a "Sign in as demo user" button
- ❌ No real payment — Stripe/PayPal/Apple Pay are visual choices only
- ❌ No image upload to cloud — photos for memories are stored as data-URLs

---

## 📁 Repository Layout

```
Hekaya_Jewerlley/
├── docs/                            # Design + architecture docs (10 files)
├── hekaya/                          # Next.js application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── app/                     # App Router routes (see below)
│   │   ├── components/              # UI components (see below)
│   │   ├── data/products.ts         # Seed catalogue + helpers
│   │   ├── lib/                     # i18n, qr, hooks, utils
│   │   ├── stores/                  # Zustand stores
│   │   └── types/index.ts           # Shared TS types
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
├── BUILD_GUIDE.md
├── PROJECT_WORKFLOW.md
└── README.md                        # ← you are here
```

### `hekaya/src/app/` — routes

| File                                                | Purpose                                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `layout.tsx`                                        | Root HTML/body, fonts, locale-cookie read, mounts `Providers`                                  |
| `page.tsx`                                          | Homepage, composes `HomeSections.tsx`                                                          |
| `globals.css`                                       | Tailwind v4 `@theme` tokens (gold palette, fonts, btn/badge utilities)                         |
| `about/page.tsx`                                    | Dark editorial hero · Vision · Values · final CTA band                                         |
| `account/page.tsx`                                  | Demo-login dashboard — Overview / Orders / Memories / **Addresses CRUD** / **Wishlist (live)** |
| `admin/layout.tsx`                                  | Dark sidebar shell with mobile drawer + sign-out                                               |
| `admin/page.tsx`                                    | Dashboard — 4 trend cards, recharts bar/area, recent orders                                    |
| `admin/collections/page.tsx`                        | Collections CRUD with reorder                                                                  |
| `admin/orders/page.tsx`                             | Orders table, filter pills, status dropdown, detail drawer                                     |
| `admin/products/page.tsx`                           | Products CRUD table, status toggle, add/edit modal                                             |
| `admin/qr/page.tsx`                                 | Every generated QR token with status pill                                                      |
| `admin/settings/page.tsx`                           | 4-tab settings (Store / QR / Shipping / Notifications)                                         |
| `checkout/page.tsx` + `CheckoutClient.tsx`          | 3-step shipping → review → pay flow with sticky summary                                        |
| `contact/page.tsx`                                  | Form with topic + char counter, WhatsApp banner, showroom, FAQ                                 |
| `memory/[token]/page.tsx`                           | Public memory page — setup / PIN unlock / view / edit                                          |
| `my-memories/page.tsx`                              | Keepsakes list with rendered gold QR PNGs                                                      |
| `order-confirmation/[id]/page.tsx`                  | Per-token QR PNG cards with product thumbnails                                                 |
| `policies/page.tsx`                                 | Tabbed Shipping / Returns / Privacy / Terms                                                    |
| `product/[slug]/page.tsx` + `ProductPageClient.tsx` | PDP with eyebrow, age/material chips, tabs, related                                            |
| `products/page.tsx`                                 | Catalogue page wrapping `ProductsExplorer`                                                     |
| `qr/page.tsx`                                       | QR Memory marketing/explainer page                                                             |

### `hekaya/src/components/`

| File                            | Purpose                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| `Providers.tsx`                 | Seeds locale store, sets `<html lang/dir>`, mounts Sonner toaster                    |
| `cart/CartDrawer.tsx`           | Slide-in cart with quantity controls and checkout CTA                                |
| `home/HomeSections.tsx`         | Homepage sections — hero, trust, collections, featured, QR, story, testimonials, CTA |
| `layout/FloatingActions.tsx`    | Floating WhatsApp + scroll-to-top buttons                                            |
| `layout/Footer.tsx`             | Bilingual footer; WhatsApp icon wired to admin settings                              |
| `layout/Header.tsx`             | Sticky header — logo, nav, cart count, language switcher, mobile menu trigger        |
| `layout/LanguageSwitcher.tsx`   | AR/EN toggle that updates locale cookie + store                                      |
| `layout/MobileMenu.tsx`         | Slide-in mobile drawer (uses translation key for unique React keys)                  |
| `products/ProductCard.tsx`      | Product tile — image, badges, **wishlist heart toggle**, eyebrow                     |
| `products/ProductDetail.tsx`    | PDP body — gallery, variations, add-to-cart, tabs, related grid                      |
| `products/ProductsExplorer.tsx` | Filter sidebar + sort + grid for `/products`                                         |
| `ui/Eyebrow.tsx`                | Sparkle-flanked uppercase label used above section titles                            |
| `ui/FinalCtaBand.tsx`           | Gold-gradient CTA band reused on Home + About                                        |
| `ui/Logo.tsx`                   | Pure SVG Mashaer wordmark (gold/dark/light variants)                                  |
| `ui/PlaceholderJewel.tsx`       | SVG fallback graphic per category (ring/necklace/bracelet/earring/gem)               |

### `hekaya/src/data/`

| File          | Purpose                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| `products.ts` | Seed catalogue — categories, collections, products, mock orders + `findProduct` / `findCategory` helpers |

### `hekaya/src/lib/`

| File                | Purpose                                                                              |
| ------------------- | ------------------------------------------------------------------------------------ |
| `i18n.ts`           | Single bilingual translations dictionary + `t()` lookup                              |
| `qr.ts`             | Wraps `qrcode` to produce gold-on-white data-URL PNGs + `memoryUrlFor(token)`        |
| `useCollections.ts` | Hook — live collections (seeded once, sorted, active-only by default)                |
| `useProducts.ts`    | Hook — merged catalogue: customs + seed + admin overrides − hidden ids               |
| `useT.ts`           | Hook returning `{ t, tx, locale, dir, hydrated }`; syncs `<html lang/dir>`           |
| `utils.ts`          | `cn`, `formatPrice`, `formatDate`, `generateOrderId`, `generateToken`, `whatsappUrl` |

### `hekaya/src/stores/` (Zustand)

| File                     | Purpose                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `adminSettings.store.ts` | Store info + QR config + per-emirate shipping rates + email-notification toggles                                      |
| `cart.store.ts`          | Cart items, `qrChoice` (per-order/per-piece), drawer open state, subtotal/count selectors                             |
| `data.store.ts`          | Orders + memories + collections + product overrides + custom products + hidden ids; quota-safe `localStorage` wrapper |
| `locale.store.ts`        | Current locale + cookie writer; SSR-safe `init()`                                                                     |
| `wishlist.store.ts`      | **NEW** — persisted wishlist `ids[]` with `toggle / has / clear`                                                      |

### `hekaya/src/types/`

| File       | Purpose                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts` | Shared types — `Locale`, `Bilingual`, `Category`, `Collection`, `Product`, `ProductVariation`, `CartItem`, `Order`, `OrderStatus`, `Memory`, etc. |

---

## 🧪 Try the Full Flow (Demo Walkthrough)

1. **Browse** → `/` then `/products`, filter by collection.
2. **Add to cart** → drawer slides in.
3. **Checkout** → fill shipping (any data), review, pick QR option (one for order / one per piece), pick a mocked payment.
4. **Order confirmed** → QR cards appear, each labeled with its product name and thumbnail → click "Open Memory Page" on any card.
5. **Memory setup** → upload up to 3 photos (auto-compressed), write a title + message, set a 4-digit PIN, save.
6. **Re-open the QR link** → enter PIN to view; edit anytime.
7. **Admin walkthrough**: visit `/admin`
   - See stats + recent orders
   - `/admin/orders` → update status of any order you placed
   - `/admin/products` → add/edit/delete products in-memory
   - `/admin/qr` → see every generated QR (yours + mock-data orders)
   - `/admin/settings` → edit store info, QR config, shipping rates and email notifications
8. **Keepsakes view**: visit `/my-memories` — every memory you set up appears as a card with a real gold QR PNG, masked PIN, View/Edit links and the linked product name.

---

## 🆕 Latest Additions

These features were added in the most recent iteration to close the gap with the design reference:

- **Final CTA band** on Home + About (`<FinalCtaBand />` shared component)
- **Footer WhatsApp icon** wired to admin Settings (number lives in `adminSettings.store.whatsapp`)
- **Product card category tag** + **PDP category eyebrow**
- **PDP age + material chips** (driven by new `Product.ageRange` / `Product.material` fields)
- **PDP Description / Shipping / Jewellery Care tabs**
- **Contact**: topic dropdown, character counter, WhatsApp banner, showroom card, FAQ accordion
- **About** restyle: dark editorial hero, Our Values 4-card grid, gold "Be Part of the Story" CTA band
- **Checkout** sticky Order Summary; shipping fee comes from `adminSettings.shipping` per emirate
- **Account Overview tab** (4 stat tiles + recent orders + quick actions) and tab reorder
- **`/my-memories` route** — dedicated keepsakes page rendering real QR codes for every saved memory

---

## 📖 Documentation

See [`docs/`](./docs) for full design, architecture, and roadmap.

---

© MASHAER JEWELLERY. All rights reserved.
