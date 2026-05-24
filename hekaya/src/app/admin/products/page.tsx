"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Pencil, Trash2, Search, QrCode } from "lucide-react";
import { useT } from "@/lib/useT";
import { products as initialProducts, categories } from "@/data/products";
import { useCollections } from "@/lib/useCollections";
import { useDataStore } from "@/stores/data.store";
import { useProducts } from "@/lib/useProducts";
import {
  PlaceholderJewel,
  kindFromCategory,
} from "@/components/ui/PlaceholderJewel";
import { formatPrice, cn } from "@/lib/utils";
import type { Product } from "@/types";
import { toast } from "sonner";

export default function AdminProducts() {
  const { t, locale } = useT();
  const allCollections = useCollections({ includeInactive: true });
  const merged = useProducts();
  const upsertProduct = useDataStore((s) => s.upsertProduct);
  const removeProduct = useDataStore((s) => s.removeProduct);
  const toggleActiveStore = useDataStore((s) => s.toggleProductActive);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isSeed = (id: string) => initialProducts.some((p) => p.id === id);

  const visible = merged;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter(
      (p) =>
        p.name.en.toLowerCase().includes(q) ||
        p.name.ar.toLowerCase().includes(q) ||
        p.categoryId.toLowerCase().includes(q),
    );
  }, [visible, query]);

  const openNew = () => {
    setEditing({
      id: `p${Date.now()}`,
      slug: `new-${Date.now()}`,
      name: { ar: "", en: "" },
      description: { ar: "", en: "" },
      price: 0,
      categoryId: categories[0]?.id ?? "cat-rings",
      collection: "everyday",
      images: [],
      placeholderTone: "gold",
      isActive: true,
      isQrEligible: true,
      isFeatured: false,
      ageRange: { ar: "", en: "" },
      material: { ar: "", en: "" },
      availableSizes: ["M"],
      availableAges: ["adults"],
      createdAt: new Date().toISOString(),
    });
    setOpen(true);
  };

  const onPickImages = async (files: FileList | null) => {
    if (!editing || !files || files.length === 0) return;
    const slots = Math.max(0, 4 - editing.images.length);
    const picked = Array.from(files).slice(0, slots);
    const dataUrls = await Promise.all(
      picked.map(
        (f) =>
          new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result));
            r.onerror = reject;
            r.readAsDataURL(f);
          }),
      ),
    );
    setEditing({ ...editing, images: [...editing.images, ...dataUrls] });
  };

  const removeImage = (idx: number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      images: editing.images.filter((_, i) => i !== idx),
    });
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p });
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.ar || !editing.name.en || !editing.price) {
      toast.error(locale === "ar" ? "أكمل الحقول" : "Complete required fields");
      return;
    }
    upsertProduct(editing, isSeed(editing.id));
    setOpen(false);
    setEditing(null);
    toast.success(locale === "ar" ? "تم الحفظ" : "Saved");
  };

  const remove = (id: string) => {
    if (!confirm(locale === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return;
    removeProduct(id, isSeed(id));
    toast.success(locale === "ar" ? "تم الحذف" : "Deleted");
  };

  const toggleActive = (id: string) => {
    const p = merged.find((x) => x.id === id);
    if (!p) return;
    toggleActiveStore(id, isSeed(id), p.isActive);
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            {locale === "ar" ? "المنتجات" : "Products"}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {visible.length} {t("admin_products_count")}
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-[#c9a96e] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] shadow-[0_4px_14px_rgba(201,169,110,0.25)] transition hover:bg-[#b8944d]"
        >
          <Plus className="h-4 w-4" />
          {t("add_product")}
        </button>
      </div>

      {/* Search */}
      <div className="mt-6 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("admin_search_products")}
            className="w-full rounded-md border border-white/10 bg-[#141414] py-3 ps-10 pe-3 text-sm text-white placeholder:text-white/40 focus:border-[#c9a96e]/40 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-[#141414]">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-4 py-4 text-start font-medium">
                  {t("product_name")}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("category")}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("product_price")}
                </th>
                <th className="px-4 py-4 text-start font-medium">QR</th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("status")}
                </th>
                <th className="px-4 py-4 text-end font-medium">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10">
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0]}
                            alt={p.name.en || p.name.ar}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PlaceholderJewel
                            kind={kindFromCategory(p.categoryId)}
                            tone={p.placeholderTone}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {p.name.en || p.name.ar}
                        </p>
                        <p className="truncate text-xs text-white/40">
                          {p.name.ar}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 capitalize text-white/60">
                    {p.categoryId}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">
                      {formatPrice(p.price, locale)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {p.isQrEligible ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#c9a96e]">
                        <QrCode className="h-3.5 w-3.5" />
                        {locale === "ar" ? "نعم" : "Yes"}
                      </span>
                    ) : (
                      <span className="text-xs text-white/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleActive(p.id)}
                      role="switch"
                      aria-checked={p.isActive}
                      className={cn(
                        "relative inline-flex h-5 w-10 items-center rounded-full transition",
                        p.isActive
                          ? "bg-emerald-500/80 ring-1 ring-emerald-400/60"
                          : "bg-white/10 ring-1 ring-white/15",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-3.5 w-3.5 rounded-full bg-white transition",
                          p.isActive ? "translate-x-5" : "translate-x-1",
                          locale === "ar" &&
                            (p.isActive ? "-translate-x-5" : "-translate-x-1"),
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-end">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="grid h-8 w-8 place-items-center rounded-md text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                        aria-label={t("edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        className="grid h-8 w-8 place-items-center rounded-md text-rose-400 transition hover:bg-rose-500/10"
                        aria-label={t("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-white/40"
                  >
                    {locale === "ar"
                      ? "لا توجد نتائج."
                      : "No products match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="divide-y divide-white/5 md:hidden">
          {filtered.map((p) => (
            <li key={p.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={p.name.en || p.name.ar}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PlaceholderJewel
                      kind={kindFromCategory(p.categoryId)}
                      tone={p.placeholderTone}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">
                    {p.name.en || p.name.ar}
                  </p>
                  <p className="truncate text-xs text-white/40">{p.name.ar}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="capitalize text-white/60">
                      {p.categoryId}
                    </span>
                    <span className="font-semibold text-white">
                      {formatPrice(p.price, locale)}
                    </span>
                    {p.isQrEligible && (
                      <span className="inline-flex items-center gap-1 text-[#c9a96e]">
                        <QrCode className="h-3 w-3" /> QR
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => toggleActive(p.id)}
                  role="switch"
                  aria-checked={p.isActive}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition",
                    p.isActive
                      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
                      : "bg-white/[0.04] text-white/50 ring-1 ring-white/10",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      p.isActive ? "bg-emerald-300" : "bg-white/40",
                    )}
                  />
                  {p.isActive ? t("active") : t("inactive")}
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(p)}
                    className="grid h-9 w-9 place-items-center rounded-md text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.06]"
                    aria-label={t("edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="grid h-9 w-9 place-items-center rounded-md text-rose-400 ring-1 ring-rose-400/20 transition hover:bg-rose-500/10"
                    aria-label={t("delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-8 text-center text-sm text-white/40">
              {locale === "ar"
                ? "لا توجد نتائج."
                : "No products match your search."}
            </li>
          )}
        </ul>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl border border-white/10 bg-[#141414] text-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                <h3 className="font-display text-2xl font-semibold">
                  {initialProducts.find((x) => x.id === editing.id)
                    ? t("edit")
                    : t("add_product")}
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/[0.06]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
                <FieldDark
                  label={`${t("product_name")} (AR)`}
                  value={editing.name.ar}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      name: { ...editing.name, ar: v },
                    })
                  }
                />
                <FieldDark
                  label={`${t("product_name")} (EN)`}
                  value={editing.name.en}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      name: { ...editing.name, en: v },
                    })
                  }
                />
                <FieldDark
                  label={`${t("product_price")} (AED)`}
                  type="number"
                  forceLtr
                  value={String(editing.price)}
                  onChange={(v) => setEditing({ ...editing, price: Number(v) })}
                />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {t("category")}
                  </label>
                  <select
                    value={editing.categoryId}
                    onChange={(e) =>
                      setEditing({ ...editing, categoryId: e.target.value })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {locale === "ar" ? c.name.ar : c.name.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar" ? "المجموعة" : "Collection"}
                  </label>
                  <select
                    value={editing.collection}
                    onChange={(e) =>
                      setEditing({ ...editing, collection: e.target.value })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
                  >
                    {allCollections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {locale === "ar" ? c.name.ar : c.name.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar" ? "الوصف (عربي)" : "Description (AR)"}
                  </label>
                  <textarea
                    rows={3}
                    value={editing.description?.ar ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        description: {
                          ar: e.target.value,
                          en: editing.description?.en ?? "",
                        },
                      })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar" ? "الوصف (إنجليزي)" : "Description (EN)"}
                  </label>
                  <textarea
                    rows={3}
                    dir="ltr"
                    value={editing.description?.en ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        description: {
                          ar: editing.description?.ar ?? "",
                          en: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
                  />
                </div>

                {/* Suitable Age (multi-select) */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar"
                      ? "الفئات العمرية المتاحة"
                      : "Suitable Ages (multi-select)"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AGE_CHOICES.map((a) => {
                      const checked =
                        editing.availableAges?.includes(a.key) ?? false;
                      return (
                        <button
                          key={a.key}
                          type="button"
                          onClick={() => {
                            const cur = editing.availableAges ?? [];
                            const next = checked
                              ? cur.filter((k) => k !== a.key)
                              : [...cur, a.key];
                            setEditing({ ...editing, availableAges: next });
                          }}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                            checked
                              ? "border-[#c9a96e] bg-[#c9a96e]/15 text-[#c9a96e]"
                              : "border-white/10 bg-[#0a0a0a] text-white/60 hover:border-white/25 hover:text-white",
                          )}
                        >
                          {locale === "ar" ? a.label.ar : a.label.en}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-white/40">
                    {locale === "ar"
                      ? "اختر فئة واحدة أو أكثر — سيختار العميل من بينها."
                      : "Pick one or more — the customer will choose from these."}
                  </p>
                </div>

                {/* Sizes (multi-select) */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar"
                      ? "المقاسات المتاحة"
                      : "Available Sizes (multi-select)"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SIZE_CHOICES.map((s) => {
                      const checked =
                        editing.availableSizes?.includes(s.key) ?? false;
                      return (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => {
                            const cur = editing.availableSizes ?? [];
                            const next = checked
                              ? cur.filter((k) => k !== s.key)
                              : [...cur, s.key];
                            setEditing({ ...editing, availableSizes: next });
                          }}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                            checked
                              ? "border-[#c9a96e] bg-[#c9a96e]/15 text-[#c9a96e]"
                              : "border-white/10 bg-[#0a0a0a] text-white/60 hover:border-white/25 hover:text-white",
                          )}
                        >
                          <span className="font-semibold">{s.key}</span>
                          <span className="ms-1 text-[10px] opacity-70">
                            {locale === "ar" ? s.label.ar : s.label.en}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-white/40">
                    {locale === "ar"
                      ? "اختر مقاسًا واحدًا أو أكثر — سيختار العميل من بينها."
                      : "Pick one or more — the customer will choose from these."}
                  </p>
                </div>

                {/* Material */}
                <FieldDark
                  label={locale === "ar" ? "الخامة (عربي)" : "Material (AR)"}
                  value={editing.material?.ar ?? ""}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      material: {
                        ar: v,
                        en: editing.material?.en ?? "",
                      },
                    })
                  }
                />
                <FieldDark
                  label={locale === "ar" ? "الخامة (إنجليزي)" : "Material (EN)"}
                  value={editing.material?.en ?? ""}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      material: {
                        ar: editing.material?.ar ?? "",
                        en: v,
                      },
                    })
                  }
                />

                {/* Includes Memory toggle */}
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center justify-between rounded-md border border-white/10 bg-[#0a0a0a] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {locale === "ar"
                          ? "يتضمن ذاكرة QR"
                          : "Includes QR Memory"}
                      </p>
                      <p className="mt-0.5 text-xs text-white/50">
                        {locale === "ar"
                          ? "يسمح للعميل بربط رسالة وصور بالقطعة"
                          : "Lets the customer attach a message & photos to this piece"}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editing.isQrEligible}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          isQrEligible: e.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-[#c9a96e]"
                    />
                  </label>
                </div>

                {/* Image upload (1–4) */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar"
                      ? `صور المنتج (${editing.images.length}/4)`
                      : `Product Images (${editing.images.length}/4)`}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {editing.images.map((src, i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-md ring-1 ring-white/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white hover:bg-rose-500/80"
                          aria-label={t("delete")}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {editing.images.length < 4 && (
                      <label className="grid aspect-square cursor-pointer place-items-center rounded-md border border-dashed border-white/15 bg-[#0a0a0a] text-xs text-white/50 transition hover:border-[#c9a96e]/50 hover:text-white">
                        <span className="text-center leading-tight">
                          <Plus className="mx-auto h-5 w-5" />
                          <span className="mt-1 block">
                            {locale === "ar" ? "إضافة" : "Add"}
                          </span>
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={(e) => {
                            onPickImages(e.target.files);
                            e.currentTarget.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-white/40">
                    {locale === "ar"
                      ? "ارفع من صورة واحدة حتى 4 صور."
                      : "Upload 1 to 4 images."}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-white/5 px-6 py-4">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/[0.06]"
                >
                  {t("back")}
                </button>
                <button
                  onClick={save}
                  className="rounded-md bg-[#c9a96e] px-5 py-2 text-sm font-semibold text-[#1a1a1a] hover:bg-[#b8944d]"
                >
                  {locale === "ar" ? "حفظ" : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FieldDark({
  label,
  value,
  onChange,
  type = "text",
  forceLtr = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  forceLtr?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={forceLtr ? "ltr" : undefined}
        inputMode={type === "number" ? "decimal" : undefined}
        lang={forceLtr ? "en" : undefined}
        className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
      />
    </div>
  );
}

const AGE_CHOICES: {
  key: "newborn" | "kids" | "tweens" | "teens" | "adults";
  label: { ar: string; en: string };
}[] = [
  { key: "newborn", label: { ar: "حديثو الولادة (0–2)", en: "Newborn (0–2)" } },
  { key: "kids", label: { ar: "أطفال (3–6)", en: "Kids (3–6)" } },
  { key: "tweens", label: { ar: "ناشئون (7–9)", en: "Tweens (7–9)" } },
  { key: "teens", label: { ar: "مراهقون (10–20)", en: "Teens (10–20)" } },
  { key: "adults", label: { ar: "بالغون (فوق 20)", en: "Adults (above 20)" } },
];

const SIZE_CHOICES: {
  key: "XS" | "S" | "M" | "L" | "XL";
  label: { ar: string; en: string };
}[] = [
  { key: "XS", label: { ar: "0–2", en: "0–2" } },
  { key: "S", label: { ar: "3–6", en: "3–6" } },
  { key: "M", label: { ar: "7–9", en: "7–9" } },
  { key: "L", label: { ar: "10–20", en: "10–20" } },
  { key: "XL", label: { ar: "فوق 20", en: "20+" } },
];
