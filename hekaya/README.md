This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Mashaer — App Notes

This is the Next.js app for **MASHAER JEWELLERY** (see the repo root [`README.md`](../README.md) for the full overview).

### Routes

| Route                      | Type   | Notes                                                                                       |
| -------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| `/`                        | Static | Hero · Trust · Collections · Featured · QR banner · Story · Testimonials · Final CTA band   |
| `/about`                   | Static | Dark editorial hero · Vision · Our Values 4-card grid · Final CTA band                      |
| `/products`                | Static | Filterable catalogue (sidebar + mobile drawer)                                              |
| `/product/[slug]`          | SSG    | Eyebrow + age/material chips + Description / Shipping / Care tabs                           |
| `/checkout`                | Static | 3-step flow with sticky Order Summary (rates from admin Settings)                           |
| `/order-confirmation/[id]` | Dyn    | Per-token QR PNGs                                                                           |
| `/memory/[token]`          | Dyn    | PIN setup / unlock / view / edit                                                            |
| `/account`                 | Static | Overview · Orders · Memories · **Addresses (CRUD)** · **Wishlist (live, persisted)**        |
| `/my-memories`             | Static | Real keepsakes from `data.store.memories` with rendered QR PNGs                             |
| `/contact`                 | Static | Form (topic + counter) · WhatsApp banner · Showroom · FAQ                                   |
| `/policies`                | Static | Tabbed Shipping / Returns / Privacy / Terms                                                 |
| `/qr`                      | Static | QR Memory marketing page                                                                    |
| `/admin/*`                 | Static | Dashboard · Products · **Collections** · Orders · **Customers** · QR · Settings (`noindex`) |
| `/api/upload`              | API    | Dev-only multipart image upload stub (same-origin + rate-limited); returns 503 on Vercel    |
| `/sitemap.xml`             | Static | Generated from products + active collections                                                |
| `/robots.txt`              | Static | Allows public routes, disallows `/admin /account /checkout /api` etc.                       |
| `/manifest.webmanifest`    | Static | PWA manifest (gold theme, RTL)                                                              |

### Stack

- **Next.js 15.5.15** · React 19 · TypeScript 5
- Tailwind CSS v4 (CSS `@theme`, no JS config)
- Zustand 5 with `persist` (cart / locale / data / adminSettings / **wishlist**) — quota-safe `localStorage` wrapper drops memory photos on overflow
- Framer Motion 12 · lucide-react · `qrcode` · `recharts` · `sonner`
- `react-hook-form` + `zod` available for forms (planned for Phase 2)
- Bilingual via `src/lib/i18n.ts` + `useT()` (default locale `ar`, full RTL)

### Key files added / updated in the latest iteration

- `src/stores/wishlist.store.ts` — persisted wishlist with `toggle / has / clear`
- `src/components/products/ProductCard.tsx` — heart button wired to wishlist store
- `src/app/account/page.tsx` — Address book CRUD + live Wishlist tab
- `src/app/admin/collections/page.tsx` — Collections CRUD with reorder
- `src/app/admin/layout.tsx` — fixed duplicate title in mobile drawer
- `src/components/layout/MobileMenu.tsx` — unique React keys (translation key, not href)
- `src/lib/useProducts.ts` / `src/lib/useCollections.ts` — merge seed + admin-store data
- `src/components/ui/Eyebrow.tsx` — sparkle-flanked eyebrow label
- `src/components/ui/FinalCtaBand.tsx` — gold-gradient CTA band (Home + About)
- `src/app/my-memories/page.tsx` — keepsakes list with rendered QR images
- `src/lib/utils.ts` — `whatsappUrl()` helper

### Phase 2 readiness audit (latest)

Hardening + SEO pass completed before the Supabase integration:

- **SEO / metadata** — `metadataBase`, title template, canonicals, Open Graph + Twitter,
  Organization + per-product **JSON-LD**; new `sitemap.ts`, `robots.ts`, `manifest.ts`.
- **Route boundaries** — added `loading.tsx`, `error.tsx`, `not-found.tsx`.
- **Per-page metadata** — marketing pages split into server `page.tsx` (metadata) + `*Client.tsx`;
  `checkout` and `admin` marked `noindex`.
- **Security** — `generateOrderId` / `generateToken` now use `crypto.getRandomValues`
  (ambiguity-free alphabet); `/api/upload` adds same-origin (CSRF) check + in-memory rate limit.
- **Performance** — `ProductCard` wrapped in `React.memo`; cart totals exposed as
  `useCartCount` / `useCartSubtotal` selectors (no whole-store subscriptions).
- **A11y** — global `:focus-visible` ring + `prefers-reduced-motion` reset; stable list keys.
- **DX / cleanup** — removed unused `embla-carousel-react` + `nanoid`; shared `useWishlistToggle`
  hook; `data.store` surfaces a toast when `localStorage` quota evicts photos.
- **Images** — all remote Unsplash URLs stripped from seed data (`images: []`); UI falls back to
  `PlaceholderJewel` / tone colours until local assets are added.

### Payments (planned, not yet wired)

- **Stripe** — Apple Pay + Mastercard
- **PayPal** — PayPal balances
- Currently visual-only on the checkout step; no real charges.

### Build

```bash
npm run build   # TypeScript + production build, 32 routes (product pages SSG)
```

---

Original Next.js scaffold notes:

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
