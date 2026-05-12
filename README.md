# ✨ Hekaya Jewellery | مجوهرات حكاية

> **Children's Jewellery with Dynamic QR Memory Codes**  
> _"A Story in Every Piece" / "في كل قطعة… حكاية"_

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

| Path                       | Purpose                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                        | Hero, trust strip, collections, featured products, QR explainer, story, testimonials, **gold "Ready to Create a Memory?" CTA band**                              |
| `/products`                | Filter + sort catalogue (sidebar + mobile drawer). Cards show category eyebrow tag.                                                                              |
| `/product/[slug]`          | Detail with category eyebrow, **age + material chips**, gallery, variations, **Description / Shipping / Jewellery Care tabs**, related                           |
| `/checkout`                | 3-step flow + **sticky Order Summary**. Shipping fee wired to `adminSettings.shipping` (per-emirate). Each QR token stores its product name for labeling.        |
| `/order-confirmation/[id]` | Gold QR codes generated as PNG. Each card shows the product thumbnail + item name so customer and admin know which QR belongs to which piece. Download per card. |
| `/memory/[token]`          | **The differentiator** — PIN-protected memory page (setup, unlock, view, edit). Uploads up to 3 photos as data-URLs (mock storage)                               |
| `/account`                 | Mock-login dashboard with **Overview tab (4 stat tiles + recent orders + quick actions)**, Orders, Memories, Addresses, Wishlist                                 |
| `/my-memories`             | Dedicated keepsakes page — reads real `data.store.memories`, renders gold QR PNG per card with masked PIN and View / Edit actions                                |
| `/admin`                   | Dark luxury dashboard with 4 trend stat cards, Orders by Status bar chart, 12-month Revenue Trend area chart (recharts), recent orders table                     |
| `/admin/products`          | Dark CRUD table with search, status toggle switch, add/edit modal (in-memory)                                                                                    |
| `/admin/orders`            | Search + filter pills, inline status dropdown, dark detail drawer with QR token chips                                                                            |
| `/admin/qr`                | QR Memories — 3 stat cards (Total Generated / Set Up / Pending), search, table of every generated token with status pill                                         |
| `/admin/settings`          | 4 tabs: Store info / QR Memory config / Shipping rates / Email Notifications — persisted via Zustand                                                             |
| `/qr`                      | Marketing/explainer page for QR Memory                                                                                                                           |
| `/about`                   | Dark editorial hero ("More Than Jewellery. A Legacy.") + Our Values 4-card grid + gold "Be Part of the Story" CTA band                                           |
| `/contact`                 | Topic dropdown, 0/500 character counter, **WhatsApp banner**, **Showroom card**, contact cards, **FAQ accordion** (4 Qs)                                         |
| `/policies`                | Tabbed legal pages (Shipping / Returns / Privacy / Terms)                                                                                                        |

### Tech

- **Next.js 15.5** (App Router, TypeScript, no Turbopack)
- **Tailwind CSS v4** — pure CSS `@theme` config, no `tailwind.config.ts`
- **Zustand** with `persist` middleware (cart, locale, orders, memories). Custom `safeStorage` wrapper handles `localStorage` quota errors.
- **framer-motion** for entrance + drawer animations
- **lucide-react** + custom inline brand SVGs (no brand icons — Instagram/Facebook are hand-coded SVGs)
- **qrcode** for real QR PNG generation (gold `#c9a96e` colour)
- **sonner** for toasts
- All product imagery via in-house `<PlaceholderJewel />` SVGs (no external assets)
- Logo as scalable SVG (`<Logo />` in `hekaya/src/components/ui/Logo.tsx`)
- `next.config.ts` sets `outputFileTracingRoot` to silence multiple-lockfile warning

### i18n

- Single set of routes (no `[locale]` folder)
- Locale lives in a Zustand store (`hekaya-locale`), default `ar`
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
├── docs/                       # Full design + architecture docs (10 files)
├── hekaya/                     # Next.js application
│   ├── src/
│   │   ├── app/                # App Router routes
│   │   ├── components/         # layout, home, products, cart, ui
│   │   ├── data/products.ts    # Mock catalogue + mock orders
│   │   ├── lib/                # i18n, qr, useT, utils
│   │   ├── stores/             # Zustand stores (locale/cart/data)
│   │   └── types/index.ts
│   └── package.json
├── BUILD_GUIDE.md
├── PROJECT_WORKFLOW.md
└── README.md                   # ← you are here
```

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

© Hekaya Jewellery. All rights reserved.
