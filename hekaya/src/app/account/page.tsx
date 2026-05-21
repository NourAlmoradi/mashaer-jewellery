"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogOut,
  Package,
  Heart,
  MapPin,
  QrCode,
  User,
  LayoutGrid,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useT } from "@/lib/useT";
import { useDataStore } from "@/stores/data.store";
import { useWishlistStore } from "@/stores/wishlist.store";
import { useCartStore } from "@/stores/cart.store";
import { products } from "@/data/products";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";

const LS_KEY = "mashaer-mock-user";
const ADDR_KEY = "mashaer-mock-addresses";

type Tab = "overview" | "orders" | "memories" | "addresses" | "wishlist";

type Address = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  country: string;
};

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: "addr-default",
    name: "Sara Al Maktoum",
    phone: "+971 50 123 4567",
    line1: "فيلا 12، شارع الجميرا",
    city: "دبي",
    country: "الإمارات",
  },
];

function loadAddresses(): Address[] {
  if (typeof window === "undefined") return DEFAULT_ADDRESSES;
  try {
    const raw = localStorage.getItem(ADDR_KEY);
    if (raw) return JSON.parse(raw) as Address[];
  } catch {
    /* ignore */
  }
  return DEFAULT_ADDRESSES;
}

function saveAddresses(addresses: Address[]) {
  try {
    localStorage.setItem(ADDR_KEY, JSON.stringify(addresses));
  } catch {
    /* ignore */
  }
}

const EMPTY_FORM: Omit<Address, "id"> = {
  name: "",
  phone: "",
  line1: "",
  city: "",
  country: "",
};

export default function AccountPage() {
  const { t, locale } = useT();
  const searchParams = useSearchParams();
  const orders = useDataStore((s) => s.orders);
  const memories = useDataStore((s) => s.memories);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const addItemToCart = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.setOpen);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrForm, setAddrForm] = useState<Omit<Address, "id">>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null); // null = new
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => {
    setLoggedIn(localStorage.getItem(LS_KEY) === "1");
    setAddresses(loadAddresses());
  }, []);

  // Deep-link support: /account?tab=wishlist|orders|memories|addresses|overview
  useEffect(() => {
    const q = searchParams.get("tab");
    if (
      q === "overview" ||
      q === "orders" ||
      q === "memories" ||
      q === "addresses" ||
      q === "wishlist"
    ) {
      setTab(q);
    }
  }, [searchParams]);

  const login = () => {
    localStorage.setItem(LS_KEY, "1");
    setLoggedIn(true);
  };
  const logout = () => {
    localStorage.removeItem(LS_KEY);
    setLoggedIn(false);
  };

  // Address helpers
  const openNewForm = () => {
    setAddrForm(EMPTY_FORM);
    setEditingId(null);
    setShowAddrForm(true);
  };
  const openEditForm = (addr: Address) => {
    setAddrForm({
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      city: addr.city,
      country: addr.country,
    });
    setEditingId(addr.id);
    setShowAddrForm(true);
  };
  const cancelForm = () => {
    setShowAddrForm(false);
    setEditingId(null);
    setAddrForm(EMPTY_FORM);
  };
  const saveAddr = () => {
    if (!addrForm.name.trim() || !addrForm.line1.trim()) return;
    let updated: Address[];
    if (editingId) {
      updated = addresses.map((a) =>
        a.id === editingId ? { ...a, ...addrForm } : a,
      );
    } else {
      updated = [...addresses, { id: `addr-${Date.now()}`, ...addrForm }];
    }
    setAddresses(updated);
    saveAddresses(updated);
    cancelForm();
  };
  const deleteAddr = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    saveAddresses(updated);
  };

  if (!loggedIn) {
    return (
      <div className="container-h py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md rounded-xl bg-white p-8 text-center shadow-md ring-1 ring-[var(--color-border)]"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
            <User className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold">
            {t("login")}
          </h1>
          <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
            {t("login_demo_note")}
          </p>
          <button onClick={login} className="btn btn-gold btn-lg mt-6 w-full">
            {t("login_demo_btn")}
          </button>
        </motion.div>
      </div>
    );
  }

  const memoryEntries = Object.entries(memories);
  const itemsPurchased = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, it) => s + it.qty, 0),
    0,
  );
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="container-h py-12 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--color-ink-muted)]">
            {t("welcome_back")}
          </p>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            Sara Al Maktoum
          </h1>
        </div>
        <button onClick={logout} className="btn btn-ghost">
          <LogOut className="h-4 w-4" /> {t("logout")}
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-[var(--color-border)]">
        {(
          [
            { id: "overview", label: t("account_overview"), Icon: LayoutGrid },
            { id: "orders", label: t("my_orders"), Icon: Package },
            { id: "memories", label: t("my_memories"), Icon: QrCode },
            { id: "addresses", label: t("my_addresses"), Icon: MapPin },
            { id: "wishlist", label: t("my_wishlist"), Icon: Heart },
          ] as const
        ).map((it) => (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className={cn(
              "relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition",
              tab === it.id
                ? "text-[var(--color-primary-dark)]"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
            )}
          >
            <it.Icon className="h-4 w-4" />
            {it.label}
            {tab === it.id && (
              <span className="absolute -bottom-px start-0 h-0.5 w-full bg-[var(--color-primary)]" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "overview" && (
          <div className="space-y-8">
            {/* Stat tiles */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile
                Icon={Package}
                label={t("account_stat_orders")}
                value={orders.length}
              />
              <StatTile
                Icon={ShoppingBag}
                label={t("account_stat_items")}
                value={itemsPurchased}
              />
              <StatTile
                Icon={QrCode}
                label={t("account_stat_memories")}
                value={memoryEntries.length}
              />
              <StatTile
                Icon={Heart}
                label={t("account_stat_wishlist")}
                value={wishlistIds.length}
              />
            </div>

            {/* Recent orders */}
            <div>
              <h2 className="mb-3 font-display text-xl font-semibold">
                {t("account_recent_orders")}
              </h2>
              {orders.length === 0 ? (
                <Empty
                  label={
                    locale === "ar" ? "لا توجد طلبات بعد" : "No orders yet"
                  }
                />
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((o) => (
                    <div
                      key={o.id}
                      className="rounded-lg bg-white p-5 ring-1 ring-[var(--color-border)] sm:flex sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-mono text-sm font-bold">{o.id}</p>
                        <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                          {formatDate(o.createdAt, locale)} · {o.items.length}{" "}
                          {locale === "ar" ? "قطعة" : "items"}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-3 sm:mt-0">
                        <span className={cn("badge", statusBadge(o.status))}>
                          {t(`status_${o.status}` as never)}
                        </span>
                        <span className="font-semibold">
                          {formatPrice(o.total, locale)}
                        </span>
                        <Link
                          href={`/order-confirmation/${o.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          {t("view")}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link href="/products" className="btn btn-gold">
                <ShoppingBag className="h-4 w-4" />
                {t("account_quick_shop")}
              </Link>
              <Link href="/my-memories" className="btn btn-outline">
                <QrCode className="h-4 w-4" />
                {t("account_quick_memories")}
              </Link>
              <button
                onClick={() => setTab("addresses")}
                className="btn btn-outline"
              >
                <MapPin className="h-4 w-4" />
                {t("account_quick_addresses")}
              </button>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 && (
              <Empty
                label={locale === "ar" ? "لا توجد طلبات بعد" : "No orders yet"}
              />
            )}
            {orders.map((o) => (
              <div
                key={o.id}
                className="rounded-lg bg-white p-5 ring-1 ring-[var(--color-border)] sm:flex sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono text-sm font-bold">{o.id}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                    {formatDate(o.createdAt, locale)} · {o.items.length}{" "}
                    {locale === "ar" ? "قطعة" : "items"}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-3 sm:mt-0">
                  <span className={cn("badge", statusBadge(o.status))}>
                    {t(`status_${o.status}` as never)}
                  </span>
                  <span className="font-semibold">
                    {formatPrice(o.total, locale)}
                  </span>
                  <Link
                    href={`/order-confirmation/${o.id}`}
                    className="btn btn-outline btn-sm"
                  >
                    {t("view")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "memories" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-ink-muted)]">
                {memoryEntries.length} {locale === "ar" ? "ذكرى" : "memories"}
              </p>
              <Link href="/my-memories" className="btn btn-outline btn-sm">
                {locale === "ar" ? "عرض الكل" : "View all"} →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {memoryEntries.length === 0 && (
                <Empty
                  label={
                    locale === "ar" ? "لا توجد ذكريات بعد" : "No memories yet"
                  }
                />
              )}
              {memoryEntries.slice(0, 6).map(([token, m]) => (
                <Link
                  key={token}
                  href={`/memory/${token}`}
                  className="rounded-lg bg-white p-5 ring-1 ring-[var(--color-border)] transition hover:shadow-md"
                >
                  <p className="font-display text-lg font-semibold">
                    {m.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--color-ink-muted)]">
                    {m.message}
                  </p>
                  <p className="mt-3 font-mono text-xs text-[var(--color-ink-faint)]">
                    {token}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tab === "addresses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-ink-muted)]">
                {addresses.length}{" "}
                {locale === "ar" ? "عنوان محفوظ" : "saved address(es)"}
              </p>
              {!showAddrForm && (
                <button onClick={openNewForm} className="btn btn-gold btn-sm">
                  <Plus className="h-4 w-4" />
                  {locale === "ar" ? "إضافة عنوان" : "Add Address"}
                </button>
              )}
            </div>

            {/* Inline address form */}
            {showAddrForm && (
              <div className="rounded-xl bg-white p-6 ring-1 ring-[var(--color-border)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">
                    {editingId
                      ? locale === "ar"
                        ? "تعديل العنوان"
                        : "Edit Address"
                      : locale === "ar"
                        ? "عنوان جديد"
                        : "New Address"}
                  </h3>
                  <button
                    onClick={cancelForm}
                    className="rounded-full p-1 hover:bg-[var(--color-bg-secondary)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                      {locale === "ar" ? "الاسم الكامل" : "Full Name"} *
                    </label>
                    <input
                      className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      value={addrForm.name}
                      onChange={(e) =>
                        setAddrForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder={
                        locale === "ar" ? "الاسم الكامل" : "Full Name"
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                      {locale === "ar" ? "رقم الهاتف" : "Phone"}
                    </label>
                    <input
                      className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      value={addrForm.phone}
                      onChange={(e) =>
                        setAddrForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="+971 50 000 0000"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                      {locale === "ar" ? "العنوان" : "Address Line"} *
                    </label>
                    <input
                      className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      value={addrForm.line1}
                      onChange={(e) =>
                        setAddrForm((f) => ({ ...f, line1: e.target.value }))
                      }
                      placeholder={
                        locale === "ar" ? "الشارع والمبنى" : "Street, Building"
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                      {locale === "ar" ? "المدينة" : "City"}
                    </label>
                    <input
                      className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      value={addrForm.city}
                      onChange={(e) =>
                        setAddrForm((f) => ({ ...f, city: e.target.value }))
                      }
                      placeholder={locale === "ar" ? "دبي" : "Dubai"}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]">
                      {locale === "ar" ? "الدولة" : "Country"}
                    </label>
                    <input
                      className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      value={addrForm.country}
                      onChange={(e) =>
                        setAddrForm((f) => ({ ...f, country: e.target.value }))
                      }
                      placeholder={locale === "ar" ? "الإمارات" : "UAE"}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={saveAddr}
                    disabled={!addrForm.name.trim() || !addrForm.line1.trim()}
                    className="btn btn-gold btn-sm disabled:opacity-50"
                  >
                    {locale === "ar" ? "حفظ" : "Save"}
                  </button>
                  <button onClick={cancelForm} className="btn btn-ghost btn-sm">
                    {locale === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </div>
            )}

            {/* Address cards */}
            {addresses.length === 0 && !showAddrForm && (
              <Empty
                label={
                  locale === "ar"
                    ? "لا توجد عناوين محفوظة"
                    : "No saved addresses"
                }
              />
            )}
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="rounded-lg bg-white p-5 ring-1 ring-[var(--color-border)] flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-semibold">{addr.name}</p>
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    {addr.line1}
                  </p>
                  {(addr.city || addr.country) && (
                    <p className="text-sm text-[var(--color-ink-muted)]">
                      {[addr.city, addr.country].filter(Boolean).join("، ")}
                    </p>
                  )}
                  {addr.phone && (
                    <p className="text-sm text-[var(--color-ink-muted)]">
                      {addr.phone}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => openEditForm(addr)}
                    className="grid h-8 w-8 place-items-center rounded-md text-[var(--color-ink-muted)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-primary-dark)] transition"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteAddr(addr.id)}
                    className="grid h-8 w-8 place-items-center rounded-md text-[var(--color-ink-muted)] hover:bg-rose-50 hover:text-rose-500 transition"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "wishlist" && (
          <div className="space-y-4">
            {wishlistProducts.length === 0 ? (
              <div className="rounded-lg bg-white p-10 text-center ring-1 ring-[var(--color-border)]">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-400">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  {locale === "ar"
                    ? "قائمة المفضلة فارغة"
                    : "Your wishlist is empty"}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                  {locale === "ar"
                    ? "اضغط على القلب في أي منتج لحفظه هنا."
                    : "Tap the heart on any product to save it here."}
                </p>
                <Link
                  href="/products"
                  className="btn btn-gold btn-md mt-5 inline-flex"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {locale === "ar" ? "تصفح المنتجات" : "Browse products"}
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    {locale === "ar"
                      ? `${wishlistProducts.length} منتج في المفضلة`
                      : `${wishlistProducts.length} item${wishlistProducts.length === 1 ? "" : "s"} saved`}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        wishlistProducts.forEach((p) => {
                          addItemToCart({
                            productId: p.id,
                            slug: p.slug,
                            name: p.name,
                            price: p.price,
                            qty: 1,
                            image: p.images?.[0],
                          });
                        });
                        openCart(true);
                        toast.success(
                          locale === "ar"
                            ? "تمت إضافة الكل إلى السلة"
                            : "Added all to cart",
                        );
                      }}
                      className="btn btn-gold btn-sm"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {locale === "ar"
                        ? "أضف الكل إلى السلة"
                        : "Add all to cart"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg bg-white p-4 ring-1 ring-[var(--color-border)] flex items-center gap-4"
                    >
                      <Link
                        href={`/product/${p.slug}`}
                        className="shrink-0 h-16 w-16 rounded-md overflow-hidden ring-1 ring-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                      >
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0]}
                            alt={p.name.en || p.name.ar}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="h-full w-full"
                            style={{
                              background: p.placeholderTone ?? "#f5efe2",
                            }}
                          />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${p.slug}`}
                          className="font-display font-semibold text-sm line-clamp-1 hover:text-[var(--color-primary-dark)] transition"
                        >
                          {locale === "ar" ? p.name.ar : p.name.en}
                        </Link>
                        <p className="mt-0.5 text-sm text-[var(--color-primary-dark)] font-semibold">
                          {formatPrice(p.price, locale)}
                        </p>
                      </div>
                      <button
                        onClick={() => wishlistToggle(p.id)}
                        className="shrink-0 grid h-8 w-8 place-items-center rounded-md text-rose-400 hover:bg-rose-50 transition"
                        aria-label="Remove from wishlist"
                      >
                        <Heart className="h-4 w-4 fill-rose-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-[var(--color-border)]">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-display text-2xl font-bold tabular-nums">
          {value}
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
        {label}
      </p>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-lg bg-white p-10 text-center text-sm text-[var(--color-ink-muted)] ring-1 ring-[var(--color-border)]">
      {label}
    </div>
  );
}

function statusBadge(status: string) {
  switch (status) {
    case "paid":
    case "processing":
      return "badge-gold";
    case "shipped":
      return "badge-dark";
    case "delivered":
      return "badge-new";
    case "cancelled":
      return "badge-sale";
    default:
      return "";
  }
}
