# 📄 Pages & Components

> Every page and reusable UI component mapped out for Hekaya Jewellery

---

## 1. Complete Page Map (Bilingual AR/EN)

> **Note:** The current MVP uses a **flat route structure** — no `[locale]/` prefix. Language is toggled client-side via a Zustand locale store. The production target may add locale-prefixed routes later.

```
hekaya-Jewellery.com/
├── /                           Homepage (Hero · Trust · Collections · Featured · QR · Story · Testimonials · Final CTA band)
├── /products                   Shop All (cards now show category eyebrow tag)
├── /product/[slug]             Product detail (eyebrow + age/material chips + Description / Shipping / Care tabs)
├── /checkout                   3-step checkout flow with sticky Order Summary; rates from admin Settings
├── /order-confirmation/[id]    Thank you + QR delivery (gold QR cards with product labels)
├── /memory/[slug]              Public QR Memory page (PIN-protected)
├── /account                    User dashboard — Overview · Orders · Memories · Addresses · Wishlist
├── /my-memories                Keepsakes list (real memories from data.store with rendered QR PNGs)
├── /about                      Dark editorial hero · Vision · Our Values 4-card · Final CTA band
├── /contact                    Form (topic + counter) · WhatsApp banner · Showroom · FAQ accordion
├── /policies                   Tabbed Shipping / Returns / Privacy / Terms
├── /qr                         QR Memory system marketing page
├── /admin                      Admin dashboard (dark luxury theme)
├── /admin/products             Manage products (CRUD with status toggle)
├── /admin/orders               Manage orders + status update
├── /admin/qr                   QR Memories — every generated token + status
└── /admin/settings             Store / QR / Shipping / Notifications tabs
```

### Production target routes \ud83d\udd1c (planned)

```
├── /category/[slug]            Category page
├── /account/orders             Order history (currently a tab)
├── /account/wishlist           Saved items (currently a tab)
├── /account/addresses          Manage addresses (currently a tab)
├── /account/settings           Profile settings
└── /my-memories/[id]/edit      Dedicated edit screen (currently `/memory/[token]?edit=1`)
```

---

## 2. Homepage Sections (Simplified for Quiet Luxury)

We've simplified the homepage from 13 sections to 7 focused, elegant sections to provide breathing room and highlight the products and stories.

| #   | Section                  | Layout                                                           | Background         |
| --- | ------------------------ | ---------------------------------------------------------------- | ------------------ |
| 1   | **Sticky Header**        | Clean logo, cart, user, AR/EN language switcher                  | Warm White         |
| 2   | **Hero Section**         | Powerful hero image with elegant CTA, not an overwhelming slider | Image              |
| 3   | **Brand Story Strip**    | "A Story in Every Piece" + vision (subtle, elegant typography)   | Charcoal           |
| 4   | **Featured Collections** | 3-4 collection cards (elegant layout, not dense grids)           | Warm White         |
| 5   | **Memory Feature CTA**   | The QR memory system explained elegantly with a visual           | Warm Gold Gradient |
| 6   | **Testimonials**         | 3 minimal cards emphasizing emotional connection                 | Warm White         |
| 7   | **Footer**               | Clean, minimal, bilingual links                                  | Charcoal           |

### Floating Elements

- **WhatsApp Button** — Bottom-right
- **Back to Top** — Bottom-left, appears on scroll

---

## 3. Product Detail Page Layout

```
┌──────────────────────────────────────────────────┐
│ Breadcrumbs: Home > Kids > Sunrise Set          │
├────────────────────┬─────────────────────────────┤
│                    │ Product Name                 │
│   IMAGE GALLERY    │                               │
│   (main + thumbs)  │ 85 AED  ̶1̶0̶9̶ ̶A̶E̶D̶           │
│   (Elegant space)  │ 📦 Available                 │
│                    │ 👶 Ages: 3-8 years           │
│                    │ 📐 Size / Material selector  │
│                    │ Qty: [-] 1 [+]              │
│                    │ [🛒 Add to Cart] [💳 Buy]    │
│                    │ ❤️ Wishlist | 📤 Share        │
│                    │ ┌────────────────────────┐  │
│                    │ │🎁 Includes QR Memory! │  │
│                    │ └────────────────────────┘  │
├────────────────────┴─────────────────────────────┤
│ [Description] [Shipping]                         │
├──────────────────────────────────────────────────┤
│ Related Products — horizontal slider             │
└──────────────────────────────────────────────────┘
```

---

## 4. Component Inventory (as built)

> File paths are workspace-relative under `hekaya/src/components/`.

### Layout (`components/layout/`)

| Component          | File                   | Description                                                                              |
| ------------------ | ---------------------- | ---------------------------------------------------------------------------------------- |
| `Header`           | `Header.tsx`           | Sticky header — logo, primary nav, cart count, language switcher, mobile menu trigger    |
| `Footer`           | `Footer.tsx`           | Bilingual footer; WhatsApp icon wired to `adminSettings.store`                           |
| `MobileMenu`       | `MobileMenu.tsx`       | Slide-in mobile drawer; uses translation key (not href) as React key to avoid duplicates |
| `LanguageSwitcher` | `LanguageSwitcher.tsx` | AR/EN toggle that updates locale store + cookie                                          |
| `FloatingActions`  | `FloatingActions.tsx`  | Floating WhatsApp + scroll-to-top buttons                                                |

### Cart (`components/cart/`)

| Component    | File             | Description                                                                  |
| ------------ | ---------------- | ---------------------------------------------------------------------------- |
| `CartDrawer` | `CartDrawer.tsx` | Slide-in cart with quantity controls, per-order/per-piece QR choice, and CTA |

### Home (`components/home/`)

| Component      | File               | Description                                                                                                             |
| -------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `HomeSections` | `HomeSections.tsx` | One file composing all homepage sections: hero, trust strip, collections, featured, QR banner, story, testimonials, CTA |

### Products (`components/products/`)

| Component          | File                   | Description                                                                                         |
| ------------------ | ---------------------- | --------------------------------------------------------------------------------------------------- |
| `ProductCard`      | `ProductCard.tsx`      | Tile with image / placeholder, badges, **wishlist heart toggle** wired to `wishlist.store`, eyebrow |
| `ProductDetail`    | `ProductDetail.tsx`    | PDP body — gallery, variations, add-to-cart, tabs, related grid                                     |
| `ProductsExplorer` | `ProductsExplorer.tsx` | `/products` page — filter sidebar (mobile drawer), sort dropdown, responsive grid                   |

### UI primitives (`components/ui/`)

| Component          | File                   | Description                                                            |
| ------------------ | ---------------------- | ---------------------------------------------------------------------- |
| `Logo`             | `Logo.tsx`             | Pure SVG Hekaya wordmark (gold / dark / light variants)                |
| `Eyebrow`          | `Eyebrow.tsx`          | Sparkle-flanked uppercase label used above section titles              |
| `FinalCtaBand`     | `FinalCtaBand.tsx`     | Gold-gradient CTA band reused on Home + About                          |
| `PlaceholderJewel` | `PlaceholderJewel.tsx` | SVG fallback per category (ring / necklace / bracelet / earring / gem) |

### Top-level (`components/`)

| Component   | File            | Description                                                       |
| ----------- | --------------- | ----------------------------------------------------------------- |
| `Providers` | `Providers.tsx` | Seeds locale store, sets `<html lang/dir>`, mounts Sonner toaster |

### Hooks & helpers (`lib/`)

| File                | Purpose                                                                               |
| ------------------- | ------------------------------------------------------------------------------------- |
| `useT.ts`           | `{ t, tx, locale, dir, hydrated }`; syncs `<html lang/dir>` with the locale store     |
| `useProducts.ts`    | Merged catalogue: `customProducts + seedProducts (with overrides) − hiddenProductIds` |
| `useCollections.ts` | Active, sorted collections — seeds the data store once from `data/products.ts`        |
| `i18n.ts`           | Hand-rolled bilingual dictionary + `t()` lookup                                       |
| `qr.ts`             | `qrcode` wrapper — gold-on-white data-URL PNGs + `memoryUrlFor(token)`                |
| `utils.ts`          | `cn`, `formatPrice`, `formatDate`, `generateOrderId`, `generateToken`, `whatsappUrl`  |

### Stores (`stores/`)

| Store                    | localStorage key        | Purpose                                                                                 |
| ------------------------ | ----------------------- | --------------------------------------------------------------------------------------- |
| `cart.store.ts`          | `hekaya-cart`           | Items, `qrChoice`, drawer state, subtotal/count selectors                               |
| `locale.store.ts`        | `hekaya-locale`         | Current locale + cookie writer; SSR-safe `init()`                                       |
| `data.store.ts`          | `hekaya-data`           | Orders + memories + collections + product overrides + customs + hidden ids; safeStorage |
| `adminSettings.store.ts` | `hekaya-admin-settings` | Store info + QR config + per-emirate shipping + notifications                           |
| `wishlist.store.ts`      | `hekaya-wishlist`       | Persisted `ids[]` with `toggle / has / clear`                                           |

> Saved addresses live in plain `localStorage` under **`hekaya-mock-addresses`**, written by `account/page.tsx`. Demo login flag is **`hekaya-mock-user`**.

### Components / hooks **planned** but not yet built

| Item                  | Status                                     |
| --------------------- | ------------------------------------------ |
| `Modal` primitive     | Inlined per page for now                   |
| `Breadcrumbs`         | Inlined where needed                       |
| `EmptyState`          | Each page renders its own empty state      |
| `ProductCarousel`     | Replaced by `ProductsExplorer` filter grid |
| `ProductImageGallery` | Inlined inside `ProductDetail.tsx`         |
| `Modal` / `Toast` etc | Sonner provides toasts; modals are inline  |

---

## 5. Responsive Breakpoints

```css
@media (min-width: 480px) {
  /* Large mobile  */
}
@media (min-width: 768px) {
  /* Tablet        */
}
@media (min-width: 1024px) {
  /* Desktop       */
}
@media (min-width: 1280px) {
  /* Large desktop */
}
```

| Element      | Mobile    | Tablet    | Desktop   |
| ------------ | --------- | --------- | --------- |
| Product grid | 2 cols    | 3 cols    | 4 cols    |
| Header       | Hamburger | Hamburger | Full nav  |
| Footer       | Stacked   | Stacked   | 3 columns |
