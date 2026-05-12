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

## 4. Component Inventory

### Layout Components

| Component          | Description                                       |
| ------------------ | ------------------------------------------------- |
| `LanguageSwitcher` | AR/EN toggle button                               |
| `Header`           | Logo-centered sticky header with language support |
| `Footer`           | 3-column footer + payment bar                     |
| `MobileMenu`       | Full-screen slide-out menu                        |
| `Container`        | Max-width wrapper (1280px)                        |
| `CartDrawer`       | Side-panel cart overlay                           |

### Product Components

| Component             | Description                                     |
| --------------------- | ----------------------------------------------- |
| `ProductCard`         | Minimalist card: image + name + price           |
| `ProductGrid`         | Responsive grid with generous spacing           |
| `ProductCarousel`     | Horizontal scrollable row with arrows           |
| `ProductImageGallery` | Main image + thumbnails with zoom               |
| `QuantitySelector`    | +/- stepper for quantity                        |
| `SortDropdown`        | Sorting options dropdown                        |
| `ProductBadge`        | Elegant 'new' / 'sale' / 'qr' / 'soldout' badge |

### Home Components

| Component            | Description                         |
| -------------------- | ----------------------------------- |
| `HeroSection`        | Powerful single hero image and CTA  |
| `BrandStoryStrip`    | Elegant typography section          |
| `CollectionShowcase` | Highlighted collections             |
| `QRMemoryBanner`     | The core memory feature CTA section |
| `TestimonialCards`   | Minimal customer review cards       |

### Memory Components

| Component          | Description                                        |
| ------------------ | -------------------------------------------------- |
| `MemoryPageViewer` | PIN-protected QR memory display                    |
| `MemoryEditor`     | Parent edit interface (3 photos + title + message) |
| `PhotoUploader`    | Photo upload (max 3 images)                        |
| `PINEntry`         | 4-digit PIN input for viewers                      |
| `QRCodeDisplay`    | QR code image renderer                             |

### UI Components

| Component       | Description                                             |
| --------------- | ------------------------------------------------------- |
| `Button`        | Primary, secondary, ghost variants (quiet luxury style) |
| `Badge`         | Subtle pill badges                                      |
| `Modal`         | Overlay dialog                                          |
| `Input`         | Styled form input with label/error                      |
| `Spinner`       | Loading indicator                                       |
| `Toast`         | Notification popups                                     |
| `WhatsAppFloat` | Floating WhatsApp CTA                                   |
| `BackToTop`     | Scroll-to-top button                                    |
| `Breadcrumbs`   | Navigation breadcrumbs                                  |
| `EmptyState`    | Empty page placeholder                                  |
| `Eyebrow`       | Sparkle-flanked eyebrow label (About hero, CTA bands)   |
| `FinalCtaBand`  | Reusable gold-gradient CTA band (Home, About)           |

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
