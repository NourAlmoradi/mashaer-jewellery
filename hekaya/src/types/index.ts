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
  name: Bilingual;
  description: Bilingual;
  tone: string; // hex colour used as a fallback when no image is set
  image?: string; // data URL or asset path
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
  stock?: number;
  variations?: ProductVariation[];
  createdAt?: string;
  // Visual placeholder colour for shimmer cards (no real images yet)
  placeholderTone?: string;
  // Suitable age range (shown as a chip on the product page)
  ageRange?: Bilingual;
  // Material label (shown as a chip on the product page); falls back to "18k Gold"
  material?: Bilingual;
  // Sizes the admin has marked as available for this product (customer picks one).
  // XS = newborn, S = 3–6, M = 7–9, L = 10–20, XL = above 20
  availableSizes?: ("XS" | "S" | "M" | "L" | "XL")[];
  // Suitable age groups the admin has marked as available (customer picks one)
  availableAges?: ("newborn" | "kids" | "tweens" | "teens" | "adults")[];
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

export type Memory = {
  token: string;
  orderId?: string;
  productId?: string;
  pin: string;
  title: string;
  message: string;
  photos: string[]; // data URLs (mock)
  createdAt: string;
  updatedAt: string;
};
