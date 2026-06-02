# 🛠️ Tech Stack & Architecture

> Technologies, database schema, API routes, and project structure for MASHAER JEWELLERY

> **⚠️ MVP vs Production:** This document covers both the **current MVP** (frontend-only, mocked data in localStorage, no real backend or payments) and the **production target** (Supabase + Stripe + PayPal). Sections marked 🔜 describe the production goal, not the current build.

---

## 1. Technology Overview

### Frontend (Current MVP — Built)

| Technology          | Version              | Purpose                                                                                                                                                                                               | Cost |
| ------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **Next.js**         | 15.5.15 (App Router) | Full-stack React framework                                                                                                                                                                            | Free |
| **React**           | 19.1.0               | UI library                                                                                                                                                                                            | Free |
| **TypeScript**      | 5                    | Language                                                                                                                                                                                              | Free |
| **Tailwind CSS v4** | 4.x                  | Styling (CSS-only `@theme` in globals.css — no tailwind.config.ts)                                                                                                                                    | Free |
| **Zustand**         | 5.x                  | All client state: cart, locale, data (orders/memories/collections/product overrides/customs/hidden ids), admin settings, **wishlist**. Uses `persist` middleware with a custom `safeStorage` wrapper. | Free |
| **Custom i18n**     | —                    | Bilingual AR/EN via Zustand locale store + `src/lib/i18n.ts` + `useT()` hook. No `[locale]/` routing, no `next-intl` middleware.                                                                      | Free |
| **Lucide React**    | 1.x                  | Icons (brand social icons are hand-coded SVGs)                                                                                                                                                        | Free |
| **Sonner**          | 2.x                  | Toast Notifications                                                                                                                                                                                   | Free |
| **qrcode**          | 1.5.x                | QR PNG generation (gold `#c9a96e` colour default; size + bg colour pulled from admin settings)                                                                                                        | Free |
| **framer-motion**   | 12.x                 | Animations (whileInView, drawers, hero entrance, checkout step transitions)                                                                                                                           | Free |
| **recharts**        | 3.8.x                | Admin dashboard charts (Orders by Status bar chart, 12-month Revenue Trend area chart)                                                                                                                | Free |
| **react-hook-form** | 7.x                  | Form state for selected forms (admin settings, address book)                                                                                                                                          | Free |
| **zod**             | 4.x                  | Schema validation (companion to react-hook-form)                                                                                                                                                      | Free |

### Frontend (Production Target 🔜 — Not yet integrated)

| Technology               | Purpose                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Embla Carousel**       | Lightweight carousel                                                                                      |
| **TanStack React Query** | Server state management                                                                                   |
| **next-intl**            | Locale-segmented routing (currently installed but **not wired** — candidate for removal until production) |

---

## 1.5 MVP Project Structure (as built)

```
hekaya/src/
├── app/
│   ├── layout.tsx              Root HTML/body, fonts, mounts <Providers />
│   ├── page.tsx                Homepage → <HomeSections />
│   ├── globals.css             Tailwind v4 @theme tokens (gold palette, btn/badge utilities)
│   ├── about/                  Editorial story page
│   ├── account/                Demo-login dashboard — 5 tabs (Overview / Orders / Memories / Addresses CRUD / Wishlist)
│   ├── admin/                  Dark luxury admin shell
│   │   ├── layout.tsx          Sidebar + mobile drawer
│   │   ├── page.tsx            Dashboard (recharts trend + bar)
│   │   ├── collections/        CRUD + reorder
│   │   ├── orders/             Filter pills, status dropdown, detail drawer
│   │   ├── products/           CRUD table + add/edit modal
│   │   ├── qr/                 All generated tokens with status pill
│   │   └── settings/           2 tabs: Store / Shipping
│   ├── checkout/               3-step shipping → review → pay flow
│   ├── contact/                Form, WhatsApp banner, FAQ
│   ├── memory/[token]/         Public memory page (PIN setup / unlock / view / edit)
│   ├── my-memories/            Customer keepsakes list with rendered QR PNGs
│   ├── order-confirmation/[id] Per-token QR PNG cards
│   ├── policies/               Tabbed legal pages
│   ├── product/[slug]/         PDP with eyebrow, age/material chips, tabs, related
│   ├── products/               Catalogue page (ProductsExplorer)
│   └── qr/                     QR Memory marketing page
├── components/
│   ├── Providers.tsx           Locale init, <html lang/dir>, Sonner toaster
│   ├── cart/CartDrawer.tsx     Slide-in cart with checkout CTA
│   ├── home/HomeSections.tsx   All homepage sections in one composable file
│   ├── layout/                 Header, Footer, MobileMenu, LanguageSwitcher, FloatingActions
│   ├── products/               ProductCard, ProductDetail, ProductsExplorer
│   └── ui/                     Logo, Eyebrow, FinalCtaBand, PlaceholderJewel
├── data/products.ts            Seed catalogue + helpers (categories, collections, products, mock orders)
├── lib/
│   ├── i18n.ts                 Hand-rolled bilingual dictionary + t() lookup
│   ├── qr.ts                   qrcode wrapper → gold-on-white data-URL PNGs + memoryUrlFor()
│   ├── useCollections.ts       Hook — live (active, sorted) collections with one-time seed
│   ├── useProducts.ts          Hook — customs + seed + admin overrides − hidden ids
│   ├── useT.ts                 Hook — { t, tx, locale, dir, hydrated }; syncs <html lang/dir>
│   └── utils.ts                cn, formatPrice, formatDate, generateOrderId, generateToken, whatsappUrl
├── stores/                     Zustand stores (all persisted)
│   ├── adminSettings.store.ts  store info (contact/social) + per-emirate shipping
│   ├── cart.store.ts           items, qrChoice, drawer state, subtotal/count selectors
│   ├── data.store.ts           orders + memories + collections + product overrides/customs/hidden ids; safeStorage wrapper drops memory photos on quota errors
│   ├── locale.store.ts         current locale + cookie writer
│   └── wishlist.store.ts       persisted ids[] with toggle / has / clear
└── types/index.ts              Shared types (Locale, Product, Order, Memory, ShippingAddress, …)
```

### Zustand stores at a glance

| Store           | localStorage key         | Notes                                                                                                                                                                 |
| --------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cart`          | `mashaer-cart`           | Cart items + per-order/per-piece QR choice + drawer open state                                                                                                        |
| `locale`        | `mashaer-locale`         | Current `Locale` (`ar` default), syncs to a cookie for SSR-friendly fallback                                                                                          |
| `data`          | `mashaer-data`           | Orders (capped at 30), memories (by token), collections, product overrides/customs/hidden ids. **safeStorage** evicts memory photos on quota errors and retries once. |
| `adminSettings` | `mashaer-admin-settings` | Store info, QR colour/limits, per-emirate shipping rates, notification toggles                                                                                        |
| `wishlist`      | `mashaer-wishlist`       | Persisted `ids: string[]` with `toggle / has / clear`                                                                                                                 |

### Address book (mock)

Not a Zustand store — saved addresses live in `localStorage` directly under the key **`mashaer-mock-addresses`**, written by `account/page.tsx`. Demo login flag is **`mashaer-mock-user`**.

### Backend — Current MVP (Mocked)

| Technology                 | Purpose                                                                                        | Cost |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ---- |
| **Zustand + localStorage** | All data persisted client-side via `persist` middleware and a `safeStorage` quota-safe wrapper | Free |
| **No API routes**          | All data is mocked in-memory and in localStorage. No server-side logic yet.                    | —    |

### Backend — Production Target 🔜

| Technology              | Purpose                             | Cost          |
| ----------------------- | ----------------------------------- | ------------- |
| **Next.js API Routes**  | Serverless backend                  | Free (Vercel) |
| **Supabase**            | Database + Auth                     | Free tier     |
| **Supabase Auth**       | User authentication                 | Free          |
| **Supabase PostgreSQL** | All data                            | Free (500MB)  |
| **Supabase Storage**    | Image storage (products + memories) | Free tier     |

### Payment — Current MVP (Mocked)

| Method                        | Notes                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Card / Apple Pay / PayPal** | UI radio buttons exist but no real processing. Clicking "Pay" always succeeds and creates a local order. |

### Payment — Production Target 🔜

| Technology | Purpose                | Cost                 |
| ---------- | ---------------------- | -------------------- |
| **Stripe** | Apple Pay & Mastercard | 2.9% + 1 AED/tx      |
| **PayPal** | PayPal Checkout        | ~3.9% + fixed AED/tx |

### Hosting

| Technology | Purpose             | Cost      |
| ---------- | ------------------- | --------- |
| **Vercel** | Hosting + CDN + SSL | Free tier |
| **GitHub** | Code repository     | Free      |

> **Note:** Real payment processing will use Stripe for Apple Pay/Mastercard and PayPal for PayPal balances. Prices will be strictly calculated server-side.

---

## 2. Database Schema 🔜 (Production Target)

> **Current MVP:** No database. All data (orders, memories, cart) lives in `localStorage` via Zustand `persist`.
> **Production target:** 10 Supabase PostgreSQL tables listed below.

> **10 tables total** — kept simple and clean, no unnecessary complexity.

### `profiles` — User profiles (extends Supabase auth.users)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager')),
  total_storage_used_mb DECIMAL(10,2) DEFAULT 0,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  region TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'AE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `categories` — Product categories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  description_ar TEXT,
  description_en TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES categories(id),
  is_kids BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `products` — Product catalog

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  currency TEXT DEFAULT 'AED',
  category_id UUID REFERENCES categories(id),
  images TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_kids BOOLEAN DEFAULT false,
  has_qr_memory BOOLEAN DEFAULT true,
  purchase_count INT DEFAULT 0,
  weight_grams INT,
  material TEXT,
  age_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Note:** No `stock_quantity` — inventory tracking is not used.

### `product_variations` — Size/material options per product

```sql
CREATE TABLE product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT,
  material TEXT,
  price_override DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `orders` — Customer orders

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'AED',
  payment_method TEXT,
  payment_id TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_region TEXT,
  shipping_postal TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Note:** `discount` column removed — no coupon system.

### `order_items` — Items within orders

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variation_id UUID REFERENCES product_variations(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  qr_memory_id UUID REFERENCES qr_memories(id)
);
```

### `qr_memories` — QR Memory pages (UNIQUE FEATURE)

```sql
CREATE TABLE qr_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  order_item_id UUID,
  qr_code_url TEXT,
  public_slug TEXT UNIQUE NOT NULL,
  title TEXT,
  message TEXT,
  pin_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Note:** Simplified from previous version. No child profile fields (name/birthdate/photo) — just title, message, PIN, and photos. Privacy is PIN-only (no public/private toggle).

### `memory_photos` — Photos for QR memories (max 3 per memory)

```sql
CREATE TABLE memory_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES qr_memories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Note:** Renamed from `memory_media`. Photos only (no video/text types). Max 3 photos per memory enforced at API level.

### `wishlist` — User saved products

```sql
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

### `addresses` — User saved shipping addresses

```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'AE',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. API Routes 🔜 (Production Target)

> **Current MVP:** No API routes exist. All operations are handled client-side with mocked data.

```
src/app/api/
├── auth/           POST register, login, reset-password
├── products/       GET list (with filters), GET [id] detail
├── categories/     GET list
├── cart/           GET/POST/PUT/DELETE operations
├── orders/         GET user orders, POST create, GET [id] detail
├── payment/
│   ├── stripe/     POST create Stripe PaymentIntent
│   ├── paypal/     POST create PayPal Order
│   └── webhook/    POST payment callback (Stripe webhook)
├── qr-memory/
│   ├── [slug]/     GET view (requires PIN)
│   ├── [slug]/edit PUT update (owner only)
│   └── [slug]/photos POST upload (max 3), GET list, DELETE
├── wishlist/       GET/POST/DELETE
├── upload/         POST file upload (to Supabase Storage)
└── admin/          CRUD for products, orders
```

---

## 4. Environment Variables 🔜 (Production Target)

> **Current MVP:** No environment variables required. The only active setting is `outputFileTracingRoot` in `next.config.ts` to silence a multiple-lockfiles warning.

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # ⚠️ Server-only! No NEXT_PUBLIC_

# Stripe
STRIPE_SECRET_KEY=                  # ⚠️ Server-only!
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=               # ⚠️ Server-only! No NEXT_PUBLIC_

# Supabase Storage uses NEXT_PUBLIC_SUPABASE_URL

# Site
NEXT_PUBLIC_SITE_URL=https://mashaerjewellery.com
NEXT_PUBLIC_SITE_NAME=MASHAER JEWELLERY
NEXT_PUBLIC_WHATSAPP_NUMBER=+971XXXXXXXXX
ADMIN_EMAIL=admin@mashaerjewellery.com
```

---

## 5. Key Dependencies

### Currently Installed (MVP)

```json
{
  "dependencies": {
    "next": "^15.5.15",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "lucide-react": "^1.0.0",
    "sonner": "^2.0.0",
    "qrcode": "^1.5.0",
    "zustand": "^5.0.0",
    "framer-motion": "^12.0.0",
    "recharts": "^3.8.1",
    "react-hook-form": "^7.0.0",
    "zod": "^4.0.0",
    "@hookform/resolvers": "^5.0.0",
    "nanoid": "^5.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^3.0.0"
  }
}
```

> `next-intl` is also currently in `package.json` but **not wired** (no middleware, no `[locale]` segment). It is a candidate for removal until production locale-segmented routing is needed.

### To Add for Production 🔜

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.5.0",
    "@stripe/stripe-js": "^5.0.0",
    "stripe": "^17.0.0",
    "@paypal/react-paypal-js": "^8.0.0",
    "embla-carousel-react": "^8.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^4.0.0",
    "@tanstack/react-query": "^5.0.0",
    "sharp": "^0.34.0"
  }
}
```
