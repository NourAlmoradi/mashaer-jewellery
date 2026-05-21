"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  CreditCard,
  Smartphone,
  Wallet,
  QrCode,
  MapPin,
} from "lucide-react";
import { useT } from "@/lib/useT";
import { useCartStore } from "@/stores/cart.store";
import { useDataStore } from "@/stores/data.store";
import { useAdminSettings } from "@/stores/adminSettings.store";
import { formatPrice, generateOrderId, generateToken, cn } from "@/lib/utils";
import type { OrderItem, ShippingAddress } from "@/types";
import { toast } from "sonner";
import {
  PlaceholderJewel,
  kindFromCategory,
} from "@/components/ui/PlaceholderJewel";
import { findProduct } from "@/data/products";

const EMIRATES = [
  { ar: "أبوظبي", en: "Abu Dhabi" },
  { ar: "دبي", en: "Dubai" },
  { ar: "الشارقة", en: "Sharjah" },
  { ar: "عجمان", en: "Ajman" },
  { ar: "أم القيوين", en: "Umm Al Quwain" },
  { ar: "رأس الخيمة", en: "Ras Al Khaimah" },
  { ar: "الفجيرة", en: "Fujairah" },
];

// Saved-address shape mirrors the one in account/page.tsx
type SavedAddress = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  country: string;
};
const ADDR_KEY = "mashaer-mock-addresses";

function loadSavedAddresses(): SavedAddress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADDR_KEY);
    return raw ? (JSON.parse(raw) as SavedAddress[]) : [];
  } catch {
    return [];
  }
}

export default function CheckoutClient() {
  const { t, locale, dir } = useT();
  const router = useRouter();
  const { items, subtotal, qrChoice, setQrChoice, clear } = useCartStore();
  const addOrder = useDataStore((s) => s.addOrder);
  const shippingRates = useAdminSettings((s) => s.shipping);

  // Map an emirate label (AR or EN) to the admin-configured rate.
  const rateForEmirate = (em: string): number => {
    const k = em.toLowerCase();
    if (k.includes("دبي") || k.includes("dubai")) return shippingRates.dubai;
    if (
      k.includes("أبوظبي") ||
      k.includes("أبو ظبي") ||
      k.includes("abu dhabi")
    )
      return shippingRates.abuDhabi;
    if (k.includes("الشارقة") || k.includes("sharjah"))
      return shippingRates.sharjah;
    if (k.includes("عجمان") || k.includes("ajman")) return shippingRates.ajman;
    if (k.includes("أم القيوين") || k.includes("umm al quwain"))
      return shippingRates.ummAlQuwain;
    if (k.includes("رأس الخيمة") || k.includes("ras al khaimah"))
      return shippingRates.rasAlKhaimah;
    if (k.includes("الفجيرة") || k.includes("fujairah"))
      return shippingRates.fujairah;
    return shippingRates.dubai;
  };

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    emirate: locale === "ar" ? "دبي" : "Dubai",
    postalCode: "",
    notes: "",
  });
  const [payment, setPayment] = useState<"card" | "apple_pay" | "paypal">(
    "card",
  );
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false); // guard: order submitted, cart cleared

  // Saved addresses (read once after hydration to avoid SSR/CSR mismatch)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [usedAddressId, setUsedAddressId] = useState<string | null>(null);

  const applySavedAddress = (a: SavedAddress) => {
    // Map free-text "city" onto the emirate <select> when it obviously matches.
    const cityLower = a.city.toLowerCase();
    const matchedEmirate = EMIRATES.find(
      (em) =>
        cityLower.includes(em.ar) || cityLower.includes(em.en.toLowerCase()),
    );
    setShipping((s) => ({
      ...s,
      fullName: a.name,
      phone: a.phone,
      addressLine: a.line1,
      city: a.city,
      emirate: matchedEmirate
        ? locale === "ar"
          ? matchedEmirate.ar
          : matchedEmirate.en
        : s.emirate,
    }));
    setUsedAddressId(a.id);
  };

  // Wait for Zustand persist to hydrate from localStorage to avoid
  // flashing the "empty cart" screen before items load.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    setSavedAddresses(loadSavedAddresses());
  }, []);

  const sub = subtotal();
  // Free over 500 AED; otherwise use the admin-configured emirate rate.
  const ship = sub > 500 ? 0 : rateForEmirate(shipping.emirate);
  const total = sub + ship;

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#f2f0ec] py-20">
        <div className="container-h flex flex-col items-center justify-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#c9a96e]/30 border-t-[#c9a96e]" />
          <p className="text-sm text-[var(--color-ink-muted)]">
            {locale === "ar" ? "جارٍ التحميل…" : "Loading…"}
          </p>
        </div>
      </div>
    );
  }

  // After placing, show a spinner while router.push navigates —
  // this prevents the empty-cart screen from flashing.
  if (placed) {
    return (
      <div className="min-h-screen bg-[#f2f0ec] py-20">
        <div className="container-h flex flex-col items-center justify-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#c9a96e]/30 border-t-[#c9a96e]" />
          <p className="text-sm text-[var(--color-ink-muted)]">
            {locale === "ar" ? "جارٍ تأكيد طلبك…" : "Confirming your order…"}
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-h py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">
          {t("cart_empty")}
        </h1>
        <p className="mt-3 text-[var(--color-ink-muted)]">
          {t("cart_empty_d")}
        </p>
        <Link href="/products" className="btn btn-gold btn-lg mt-6">
          {t("cart_continue")}
        </Link>
      </div>
    );
  }

  const goNext = () => {
    if (step === 1) {
      if (
        !shipping.fullName ||
        !shipping.email ||
        !shipping.phone ||
        !shipping.addressLine ||
        !shipping.city
      ) {
        toast.error(
          locale === "ar"
            ? "يرجى تعبئة كل الحقول"
            : "Please complete all required fields",
        );
        return;
      }
    }
    setStep((s) => (s === 3 ? s : ((s + 1) as 1 | 2 | 3)));
  };

  const placeOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      const id = generateOrderId();
      const orderItems: OrderItem[] = items.map((i) => ({
        productId: i.productId,
        name: i.name,
        qty: i.qty,
        price: i.price,
        variationLabel: i.variationLabel,
      }));

      let tokens: string[];
      let tokenLabels: string[];
      let tokenProductIds: string[];

      if (qrChoice === "per_order") {
        tokens = [generateToken()];
        tokenLabels = [locale === "ar" ? "جميع المنتجات" : "All Items"];
        tokenProductIds = ["all"];
      } else {
        tokens = [];
        tokenLabels = [];
        tokenProductIds = [];
        items.forEach((i) => {
          const baseName = i.name[locale];
          const variation = i.variationLabel?.[locale];
          for (let n = 1; n <= i.qty; n++) {
            tokens.push(generateToken());
            const label =
              i.qty > 1
                ? `${baseName}${variation ? ` · ${variation}` : ""} #${n}`
                : `${baseName}${variation ? ` · ${variation}` : ""}`;
            tokenLabels.push(label);
            tokenProductIds.push(i.productId);
          }
        });
      }

      addOrder({
        id,
        customerName: shipping.fullName,
        email: shipping.email,
        items: orderItems,
        subtotal: sub,
        shipping: ship,
        total,
        status: "paid",
        qrChoice,
        qrTokens: tokens,
        qrTokenLabels: tokenLabels,
        qrTokenProductIds: tokenProductIds,
        shippingAddress: shipping,
        paymentMethod: payment,
        createdAt: new Date().toISOString(),
      });
      clear();
      setPlaced(true);
      // replace() so the back button doesn't return to the checkout flow
      router.replace(`/order-confirmation/${id}`);
    }, 1100);
  };

  const steps = [t("step_shipping"), t("step_review"), t("step_payment")];

  return (
    <div className="min-h-screen bg-[#f2f0ec] py-10 lg:py-14">
      <div className="container-h">
        {/* Stepper */}
        <div className="mx-auto mb-10 flex max-w-xl items-center justify-center">
          {steps.map((label, idx) => {
            const n = (idx + 1) as 1 | 2 | 3;
            const done = step > n;
            const active = step === n;
            return (
              <div
                key={label}
                className="flex flex-1 items-center last:flex-none"
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-full text-sm font-semibold transition-all",
                      active &&
                        "bg-[#b8955a] text-white shadow-md shadow-[#b8955a]/30",
                      done && "bg-[#b8955a] text-white",
                      !active &&
                        !done &&
                        "border-2 border-gray-300 bg-white text-gray-400",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : n}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      active ? "text-[#b8955a]" : "text-gray-400",
                    )}
                  >
                    {label}
                  </span>
                </div>
                {n < 3 && (
                  <div
                    className={cn(
                      "mx-3 mb-5 h-px flex-1 transition",
                      done ? "bg-[#b8955a]" : "bg-gray-200",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          {/* Main panel */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* ── Step 1: Shipping ── */}
            {step === 1 && (
              <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 font-display text-2xl font-semibold text-gray-900">
                  {t("step_shipping")}
                </h2>

                {/* Saved addresses picker */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6 rounded-lg border border-[#e5ddd0] bg-[#f9f6f1] p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8a6840]">
                      <MapPin className="h-3.5 w-3.5" />
                      {locale === "ar"
                        ? "العناوين المحفوظة"
                        : "Saved addresses"}
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {savedAddresses.map((a) => {
                        const active = usedAddressId === a.id;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => applySavedAddress(a)}
                            className={cn(
                              "rounded-md border px-3 py-2.5 text-start text-xs transition",
                              active
                                ? "border-[#b8955a] bg-white shadow-sm"
                                : "border-[#e5ddd0] bg-white/60 hover:border-[#b8955a]/60 hover:bg-white",
                            )}
                          >
                            <p className="font-semibold text-gray-800">
                              {a.name}
                            </p>
                            <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                              {a.line1}
                              {a.city ? `، ${a.city}` : ""}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {a.phone}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label={t("full_name")}
                    value={shipping.fullName}
                    onChange={(v) => setShipping({ ...shipping, fullName: v })}
                  />
                  <Field
                    label={t("email")}
                    type="email"
                    value={shipping.email}
                    onChange={(v) => setShipping({ ...shipping, email: v })}
                  />
                  <Field
                    label={t("phone")}
                    value={shipping.phone}
                    onChange={(v) => setShipping({ ...shipping, phone: v })}
                  />
                  <Field
                    label={t("city")}
                    value={shipping.city}
                    onChange={(v) => setShipping({ ...shipping, city: v })}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label={t("address_line")}
                      value={shipping.addressLine}
                      onChange={(v) =>
                        setShipping({ ...shipping, addressLine: v })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">{t("emirate")}</label>
                    <select
                      value={shipping.emirate}
                      onChange={(e) =>
                        setShipping({ ...shipping, emirate: e.target.value })
                      }
                      className="input"
                    >
                      {EMIRATES.map((em) => (
                        <option
                          key={em.en}
                          value={locale === "ar" ? em.ar : em.en}
                        >
                          {locale === "ar" ? em.ar : em.en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Field
                    label={t("postal_code")}
                    value={shipping.postalCode || ""}
                    onChange={(v) =>
                      setShipping({ ...shipping, postalCode: v })
                    }
                  />
                  <div className="sm:col-span-2">
                    <label className="label">{t("notes")}</label>
                    <textarea
                      rows={3}
                      value={shipping.notes || ""}
                      onChange={(e) =>
                        setShipping({ ...shipping, notes: e.target.value })
                      }
                      className="input resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Review ── */}
            {step === 2 && (
              <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 font-display text-2xl font-semibold text-gray-900">
                  {t("step_review")}
                </h2>

                {/* Items */}
                <ul className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const p = findProduct(item.slug);
                    return (
                      <li
                        key={`${item.productId}-${item.variationId ?? ""}`}
                        className="flex items-center gap-4 py-4"
                      >
                        {/* Thumbnail */}
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f5f0ea]">
                          {p?.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.images[0]}
                              alt={item.name[locale]}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <PlaceholderJewel
                              kind={kindFromCategory(p?.categoryId ?? "")}
                              tone={p?.placeholderTone ?? "#c9a96e"}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {item.name[locale]}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {item.variationLabel?.[locale]} ·{" "}
                            {locale === "ar" ? "الكمية" : "Qty"} {item.qty}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-gray-900">
                          {formatPrice(item.price * item.qty, locale)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* Shipping info */}
                <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
                  <p className="font-semibold text-gray-800">
                    {shipping.fullName}
                  </p>
                  <p>
                    {shipping.addressLine}, {shipping.city}, {shipping.emirate}
                  </p>
                  <p>
                    {shipping.phone} · {shipping.email}
                  </p>
                </div>

                {/* QR Memory Option */}
                <div className="mt-6 rounded-xl border border-[#e5ddd0] bg-[#f5efe6] p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <QrCode className="h-4 w-4 text-[#b8955a]" />
                    {locale === "ar" ? "خيار ذاكرة QR" : "QR Memory Option"}
                  </div>
                  <div className="space-y-3">
                    <label className="flex cursor-pointer items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#b8955a]">
                        {qrChoice === "per_order" && (
                          <span className="h-2.5 w-2.5 rounded-full bg-[#b8955a]" />
                        )}
                      </span>
                      <input
                        type="radio"
                        className="sr-only"
                        checked={qrChoice === "per_order"}
                        onChange={() => setQrChoice("per_order")}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {locale === "ar"
                            ? "رمز QR واحد للطلب كله"
                            : "One QR for the entire order"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {locale === "ar"
                            ? "صفحة ذاكرة واحدة لكل المنتجات"
                            : "One memory page for all items"}
                        </p>
                      </div>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-300">
                        {qrChoice === "per_piece" && (
                          <span className="h-2.5 w-2.5 rounded-full bg-[#b8955a]" />
                        )}
                      </span>
                      <input
                        type="radio"
                        className="sr-only"
                        checked={qrChoice === "per_piece"}
                        onChange={() => setQrChoice("per_piece")}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {locale === "ar"
                            ? "رمز QR لكل قطعة"
                            : "One QR per item"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {locale === "ar"
                            ? "صفحة ذاكرة منفصلة لكل قطعة"
                            : "Separate memory page per piece"}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Payment ── */}
            {step === 3 && (
              <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 font-display text-2xl font-semibold text-gray-900">
                  {t("step_payment")}
                </h2>
                <div className="space-y-3">
                  <PayOption
                    icon={<CreditCard className="h-5 w-5" />}
                    label={t("pay_card")}
                    active={payment === "card"}
                    onClick={() => setPayment("card")}
                  />
                  <PayOption
                    icon={<Smartphone className="h-5 w-5" />}
                    label={t("pay_apple")}
                    active={payment === "apple_pay"}
                    onClick={() => setPayment("apple_pay")}
                  />
                  <PayOption
                    icon={<Wallet className="h-5 w-5" />}
                    label={t("pay_paypal")}
                    active={payment === "paypal"}
                    onClick={() => setPayment("paypal")}
                  />
                </div>
                <p className="mt-5 rounded-lg bg-[#f5efe6] px-4 py-3 text-xs text-[#8a6840]">
                  ⓘ {t("pay_mock_note")}
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="grid grid-cols-2 gap-3">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <ChevronLeft
                    className={`h-4 w-4 ${dir === "rtl" ? "flip-rtl" : ""}`}
                  />
                  {t("back")}
                </button>
              ) : (
                <Link
                  href="/products"
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  ← {locale === "ar" ? "تابع التسوق" : "Continue shopping"}
                </Link>
              )}
              {step < 3 ? (
                <button
                  onClick={goNext}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#b8955a] py-3.5 text-sm font-semibold text-white transition hover:bg-[#a07840]"
                >
                  {locale === "ar" ? "التالي" : "Continue to"}{" "}
                  {step === 1
                    ? locale === "ar"
                      ? "المراجعة"
                      : "Review"
                    : locale === "ar"
                      ? "الدفع"
                      : "Payment"}
                  <span className="ltr:inline rtl:hidden">›</span>
                </button>
              ) : (
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="flex items-center justify-center rounded-xl bg-[#b8955a] py-3.5 text-sm font-semibold text-white transition hover:bg-[#a07840] disabled:opacity-60"
                >
                  {placing
                    ? t("loading")
                    : `${t("pay_now")} — ${formatPrice(total, locale)}`}
                </button>
              )}
            </div>
          </motion.div>

          {/* ── Order Summary ── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-gray-900">
                {t("order_summary")}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.variationId ?? ""}`}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate max-w-[160px] text-gray-500">
                      {item.name[locale]}…
                    </span>
                    <span className="shrink-0 font-medium text-gray-800">
                      {formatPrice(item.price * item.qty, locale)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="my-4 h-px bg-gray-100" />
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-400">{t("cart_subtotal")}</span>
                  <span className="text-gray-700">
                    {formatPrice(sub, locale)}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">{t("cart_shipping")}</span>
                  <span className="text-gray-700">
                    {ship === 0
                      ? locale === "ar"
                        ? "مجاني"
                        : "Free"
                      : formatPrice(ship, locale)}
                  </span>
                </li>
              </ul>
              <div className="my-4 h-px bg-gray-100" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-gray-900">
                  {t("cart_total")}
                </span>
                <span className="font-display text-xl font-bold text-gray-900">
                  {formatPrice(total, locale)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
}

function PayOption({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 rounded-md border p-4 text-start transition",
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
          : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]",
      )}
    >
      <span
        className={cn(
          "grid h-10 w-10 place-items-center rounded-md",
          active
            ? "bg-[var(--color-primary)] text-white"
            : "bg-[var(--color-bg-secondary)] text-[var(--color-ink)]",
        )}
      >
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <span
        className={cn(
          "h-5 w-5 rounded-full border-2",
          active
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
            : "border-[var(--color-border-strong)]",
        )}
      />
    </button>
  );
}
