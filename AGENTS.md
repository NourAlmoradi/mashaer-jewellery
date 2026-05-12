# Repository Guide for AI Agents

> Read this **first** before making changes. It encodes the conventions and intentional gaps that have caused doc-drift in past sessions.

## What this repo is

**Hekaya Jewellery** — a bilingual (AR/EN) Next.js storefront with a unique "QR Memory" feature. The app is currently an **MVP**: real UI, no real backend.

## Tech baseline (do not change without good reason)

- **Next.js 15.5.15** (App Router, no Turbopack flag)
- **React 19.1.0**, **TypeScript 5**, **Tailwind CSS v4** (CSS `@theme`, no JS config)
- **Zustand 5** for _all_ client state (cart, locale, data, adminSettings, wishlist), `persist` middleware
- Working directory of the Next.js app: `hekaya/` (the workspace root contains docs/READMEs only)

## Things that look missing but are intentional

- **No `middleware.ts` / `proxy.ts`.** Locale is held in a Zustand store (`hekaya-locale`, default `ar`) + cookie. `<html lang/dir>` is updated client-side by `useT()`. Do **not** add a `[locale]` segment unless explicitly asked.
- **No real auth.** `/account` and `/admin` are gated by a localStorage flag (`hekaya-mock-user`). Treat all admin pages as open-by-design in MVP.
- **No real payment.** Checkout step 3 shows Card / Apple Pay / PayPal as visual choices. `placeOrder()` mints a local order after a 1.1s `setTimeout`. Do not point real customers at this.
- **No backend / database.** All persistence is `localStorage` via Zustand `persist`. There is a `safeStorage` wrapper in `data.store.ts` that drops memory photos on `QuotaExceededError` and retries.
- **No image uploads to cloud.** Memory photos are downscaled to ≤800 px JPEG q=0.7 and stored as data URLs.
- **`next-intl` is removed.** It used to be in `package.json` but was never wired. Do not re-add it.

## Storage keys (single source of truth)

| Key                     | Owner                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| `hekaya-cart`           | `stores/cart.store.ts`                                                                       |
| `hekaya-locale`         | `stores/locale.store.ts`                                                                     |
| `hekaya-data`           | `stores/data.store.ts` (orders, memories, collections, product overrides/customs/hidden ids) |
| `hekaya-admin-settings` | `stores/adminSettings.store.ts`                                                              |
| `hekaya-wishlist`       | `stores/wishlist.store.ts`                                                                   |
| `hekaya-mock-user`      | `app/account/page.tsx` (login flag)                                                          |
| `hekaya-mock-addresses` | `app/account/page.tsx` (address book)                                                        |

## Folder map (high-level)

```
docs/                   Long-form design + architecture docs (10 files)
hekaya/src/app/         App Router routes — see docs/03_PAGES_COMPONENTS.md
hekaya/src/components/  layout / cart / home / products / ui + Providers
hekaya/src/data/        Seed catalogue (products.ts) + helpers
hekaya/src/lib/         i18n, qr, useT, useProducts, useCollections, utils
hekaya/src/stores/      All Zustand stores
hekaya/src/types/       Shared TS types
```

## Conventions

- **Bilingual content** — strings of type `Bilingual = { ar; en }`. Locale comes from `useT()`. Never hardcode AR/EN text outside `lib/i18n.ts` unless the surrounding component already inlines bilingual ternaries.
- **Currency** — AED only, formatted via `formatPrice(value, locale)` in `lib/utils.ts`.
- **IDs / tokens** — `generateOrderId()` (`HK-XXXXXX`) and `generateToken()` (8-char ambiguity-free) from `lib/utils.ts`. Do not roll your own.
- **Icons** — `lucide-react` only. Brand social icons (Instagram/Facebook) are hand-coded SVGs.
- **No external images** — every product card falls back to `<PlaceholderJewel />` when `images[]` is empty.
- **Animations** — `framer-motion`. Toasts via `sonner`.
- **Styling** — Tailwind v4 CSS-only `@theme` in `globals.css`. Use the `--color-*` design tokens; do **not** create a `tailwind.config.ts`.
- **Address book on checkout** — `CheckoutClient.tsx` reads `hekaya-mock-addresses` to offer a saved-address picker on step 1. Keep the `SavedAddress` shape in sync with `account/page.tsx`.

## Workflow expectations

- Edit only what the user asks for. Don't add new features, refactors, comments, or docstrings to untouched code.
- Validate non-trivial edits with `get_errors` and (when relevant) `npm run build` from `hekaya/`.
- Never edit a file by running terminal commands; use the file edit tools.
- For the windows shell: PowerShell 5.1, separate commands with `;`, never `&&`.

## When docs and code disagree, code wins

The `docs/` folder mixes "current MVP" and "production target". Anything labelled 🔜 is aspirational. The READMEs at the repo root and at `hekaya/README.md` reflect the live feature set.

## Quick links

- Build pipeline & gotchas → [BUILD_GUIDE.md](BUILD_GUIDE.md)
- End-to-end workflow + status table → [PROJECT_WORKFLOW.md](PROJECT_WORKFLOW.md)
- Pages & components → [docs/03_PAGES_COMPONENTS.md](docs/03_PAGES_COMPONENTS.md)
- Architecture + stores → [docs/02_TECH_ARCHITECTURE.md](docs/02_TECH_ARCHITECTURE.md)
- QR Memory implementation → [docs/04_QR_MEMORY_SYSTEM.md](docs/04_QR_MEMORY_SYSTEM.md)
- Checkout flow → [docs/06_PAYMENT_CHECKOUT.md](docs/06_PAYMENT_CHECKOUT.md)
