export type Locale = "ar" | "en";

export type Bilingual = { ar: string; en: string };

export type Category = {
  id: string;
  slug: string;
  name: Bilingual;
  description?: Bilingual;
  image?: string;
};

export type Collection = {
  id: string;
  slug?: string; // URL-safe key derived from the name; auto-filled on save
  name: Bilingual;
  description: Bilingual;
  tone: string; // hex colour used as a fallback when no image is set
  image?: string; // public Storage URL (legacy rows may still hold a base64 data URL)
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

export type ProductVariation = {
  id: string;
  size?: string;
  material?: string;
  priceOverride?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: Bilingual;
  shortDescription?: Bilingual;
  description?: Bilingual;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  collection: string;
  images: string[];
  isQrEligible: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isActive: boolean;
  // No `stock` field: every piece is made to order (see migration 0003).
  variations?: ProductVariation[];
  createdAt?: string;
  // Visual placeholder colour for shimmer cards (no real images yet)
  placeholderTone?: string;
  // Suitable age group, admin-editable, shown as a chip on the product page
  // ("مناسب للفئة العمرية"). The store is fixed-size, so there is no size picker.
  ageRange?: Bilingual;
  // Material label (shown as a chip on the product page); falls back to "18k Gold"
  material?: Bilingual;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: Bilingual;
  price: number;
  qty: number;
  image?: string;
  variationId?: string;
  variationLabel?: Bilingual;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Every status, in lifecycle order. Iterate this rather than hardcoding a
 *  subset — the admin dashboard chart used to omit `paid` and `cancelled`, so
 *  paid orders silently vanished from it (M3). */
export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

/**
 * Which statuses an order may move to. Mirrors the `guard_order_status`
 * trigger (migration 0009), which is the real enforcement point; this only
 * keeps the UI from offering a move the server will reject.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "processing", "cancelled"],
  paid: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

/** Status pill classes for the admin surfaces; the storefront uses `badge-*`. */
export const ORDER_STATUS_PILL: Record<OrderStatus, string> = {
  pending: "bg-amber-200/15 text-amber-300 ring-amber-300/30",
  paid: "bg-violet-300/15 text-violet-300 ring-violet-300/30",
  processing: "bg-blue-300/15 text-blue-300 ring-blue-300/30",
  shipped: "bg-purple-400/15 text-purple-300 ring-purple-400/30",
  delivered: "bg-emerald-300/15 text-emerald-300 ring-emerald-300/30",
  cancelled: "bg-rose-300/15 text-rose-300 ring-rose-300/30",
};

export type OrderItem = {
  productId: string;
  name: Bilingual;
  qty: number;
  price: number;
  variationLabel?: Bilingual;
};

export type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  emirate: string;
  postalCode?: string;
  notes?: string;
};

export type Order = {
  id: string;
  /** Owning account. Absent only on legacy rows placed before it was required. */
  userId?: string;
  customerName: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  qrChoice: "per_order" | "per_piece";
  qrTokens: string[];
  qrTokenLabels?: string[]; // human-readable label per token (same index)
  qrTokenProductIds?: string[]; // productId per token (same index)
  shippingAddress: ShippingAddress;
  paymentMethod: "card" | "apple_pay" | "paypal";
  createdAt: string;
};

// Memory rows are modelled by `PublicMemory` / `MemoryMeta` in
// src/lib/supabase/memories.ts (the PIN never leaves the database, so the app
// type deliberately has no `pin` field).
