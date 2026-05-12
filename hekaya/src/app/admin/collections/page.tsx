"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/useT";
import { useDataStore } from "@/stores/data.store";
import { collections as initialCollections } from "@/data/products";
import { products as allProducts } from "@/data/products";
import { PlaceholderJewel } from "@/components/ui/PlaceholderJewel";
import { cn } from "@/lib/utils";
import type { Collection } from "@/types";

const DEFAULT_TONE = "#e8dfcc";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminCollections() {
  const { t, locale } = useT();
  const collections = useDataStore((s) => s.collections);
  const seedCollections = useDataStore((s) => s.seedCollections);
  const addCollection = useDataStore((s) => s.addCollection);
  const updateCollection = useDataStore((s) => s.updateCollection);
  const cascadeDeleteCollection = useDataStore(
    (s) => s.cascadeDeleteCollection,
  );
  const reorderCollections = useDataStore((s) => s.reorderCollections);
  const hiddenProductIds = useDataStore((s) => s.hiddenProductIds);

  const [editing, setEditing] = useState<Collection | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Seed once on mount if empty
  useEffect(() => {
    if (collections.length === 0) seedCollections(initialCollections);
  }, [collections.length, seedCollections]);

  const sorted = useMemo(
    () => [...collections].sort((a, b) => a.sortOrder - b.sortOrder),
    [collections],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.name.en.toLowerCase().includes(q) ||
        c.name.ar.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );
  }, [sorted, query]);

  const productCount = (id: string) =>
    allProducts.filter(
      (p) => p.collection === id && !hiddenProductIds.includes(p.id),
    ).length;

  const openNew = () => {
    setEditing({
      id: "",
      name: { ar: "", en: "" },
      description: { ar: "", en: "" },
      tone: DEFAULT_TONE,
      isActive: true,
      sortOrder: collections.length,
      createdAt: new Date().toISOString(),
    });
    setOpen(true);
  };

  const openEdit = (c: Collection) => {
    setEditing({ ...c });
    setOpen(true);
  };

  const isExisting = editing
    ? collections.some((c) => c.id === editing.id)
    : false;

  const save = () => {
    if (!editing) return;
    if (!editing.name.ar || !editing.name.en) {
      toast.error(locale === "ar" ? "أكمل الاسم" : "Name is required");
      return;
    }
    const id = editing.id || slugify(editing.name.en) || `col-${Date.now()}`;
    if (!isExisting && collections.some((c) => c.id === id)) {
      toast.error(
        locale === "ar"
          ? "المعرّف مستخدم بالفعل"
          : "A collection with this ID already exists",
      );
      return;
    }
    if (isExisting) {
      updateCollection(editing.id, editing);
    } else {
      addCollection({ ...editing, id });
    }
    setOpen(false);
    setEditing(null);
    toast.success(locale === "ar" ? "تم الحفظ" : "Saved");
  };

  const remove = (c: Collection) => {
    const linkedIds = allProducts
      .filter((p) => p.collection === c.id && !hiddenProductIds.includes(p.id))
      .map((p) => p.id);
    const count = linkedIds.length;
    const msg =
      count > 0
        ? locale === "ar"
          ? `سيتم حذف المجموعة و‏${count} منتج مرتبط بها. هل أنت متأكد؟`
          : `This will also delete ${count} linked product${count > 1 ? "s" : ""}. Continue?`
        : locale === "ar"
          ? "هل أنت متأكد من الحذف؟"
          : "Are you sure you want to delete?";
    if (!confirm(msg)) return;
    cascadeDeleteCollection(c.id, linkedIds);
    toast.success(
      count > 0
        ? locale === "ar"
          ? `تم حذف المجموعة و‏${count} منتج`
          : `Deleted collection and ${count} product${count > 1 ? "s" : ""}`
        : locale === "ar"
          ? "تم الحذف"
          : "Deleted",
    );
  };

  const move = (id: string, dir: -1 | 1) => {
    const ids = sorted.map((c) => c.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    reorderCollections(ids);
  };

  const toggleActive = (c: Collection) =>
    updateCollection(c.id, { isActive: !c.isActive });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            {locale === "ar" ? "المجموعات" : "Collections"}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {collections.length} {locale === "ar" ? "مجموعة" : "collections"}
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-[#c9a96e] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] shadow-[0_4px_14px_rgba(201,169,110,0.25)] transition hover:bg-[#b8944d]"
        >
          <Plus className="h-4 w-4" />
          {locale === "ar" ? "إضافة مجموعة" : "Add Collection"}
        </button>
      </div>

      <div className="mt-6 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === "ar" ? "ابحث..." : "Search collections..."}
            className="w-full rounded-md border border-white/10 bg-[#141414] py-3 ps-10 pe-3 text-sm text-white placeholder:text-white/40 focus:border-[#c9a96e]/40 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => {
          const count = productCount(c.id);
          return (
            <div
              key={c.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-[#141414] transition",
                c.isActive
                  ? "border-white/10 hover:border-white/20"
                  : "border-white/5 opacity-60",
              )}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image}
                    alt={locale === "ar" ? c.name.ar : c.name.en}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PlaceholderJewel kind="gem" tone={c.tone} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute end-2 top-2 flex gap-1">
                  <button
                    onClick={() => toggleActive(c)}
                    className="grid h-8 w-8 place-items-center rounded-md bg-black/60 text-white/80 backdrop-blur transition hover:bg-black/80"
                    title={c.isActive ? "Deactivate" : "Activate"}
                  >
                    {c.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="absolute start-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur">
                  <Layers className="h-3 w-3" />
                  {count} {locale === "ar" ? "منتج" : "products"}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-semibold text-white">
                      {locale === "ar" ? c.name.ar : c.name.en}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-white/40">
                      /{c.id}
                    </p>
                  </div>
                  <span
                    className="inline-block h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10"
                    style={{ background: c.tone }}
                  >
                    {c.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-white/50">
                  {locale === "ar" ? c.description.ar : c.description.en}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="inline-flex rounded-md ring-1 ring-white/10">
                    <button
                      onClick={() => move(c.id, -1)}
                      disabled={i === 0}
                      className="grid h-8 w-8 place-items-center text-white/70 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => move(c.id, 1)}
                      disabled={i === filtered.length - 1}
                      className="grid h-8 w-8 place-items-center text-white/70 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="inline-flex gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="grid h-8 w-8 place-items-center rounded-md text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.06]"
                      aria-label={t("edit")}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(c)}
                      className="grid h-8 w-8 place-items-center rounded-md text-rose-400 ring-1 ring-rose-400/20 transition hover:bg-rose-500/10"
                      aria-label={t("delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-white/5 bg-[#141414] p-10 text-center text-sm text-white/40">
            {locale === "ar"
              ? "لا توجد نتائج."
              : "No collections match your search."}
          </div>
        )}
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
                  {isExisting
                    ? locale === "ar"
                      ? "تعديل المجموعة"
                      : "Edit Collection"
                    : locale === "ar"
                      ? "إضافة مجموعة"
                      : "Add Collection"}
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/[0.06]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
                <Field
                  label={locale === "ar" ? "الاسم (عربي)" : "Name (AR)"}
                  value={editing.name.ar}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      name: { ...editing.name, ar: v },
                    })
                  }
                />
                <Field
                  label={locale === "ar" ? "الاسم (إنجليزي)" : "Name (EN)"}
                  value={editing.name.en}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      name: { ...editing.name, en: v },
                    })
                  }
                />

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar" ? "المعرّف (slug)" : "ID / Slug"}
                  </label>
                  <input
                    dir="ltr"
                    value={editing.id}
                    placeholder={
                      slugify(editing.name.en) || "auto-generated-from-name"
                    }
                    disabled={isExisting}
                    onChange={(e) =>
                      setEditing({ ...editing, id: slugify(e.target.value) })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none disabled:opacity-60"
                  />
                  <p className="mt-1 text-[11px] text-white/40">
                    {isExisting
                      ? locale === "ar"
                        ? "لا يمكن تغيير المعرّف بعد الإنشاء."
                        : "ID cannot be changed after creation."
                      : locale === "ar"
                        ? "يستخدم في الروابط مثل /products?collection=..."
                        : "Used in links like /products?collection=..."}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar" ? "الوصف (عربي)" : "Description (AR)"}
                  </label>
                  <textarea
                    rows={2}
                    value={editing.description.ar}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        description: {
                          ...editing.description,
                          ar: e.target.value,
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
                    rows={2}
                    dir="ltr"
                    value={editing.description.en}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        description: {
                          ...editing.description,
                          en: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
                  />
                </div>

                {/* Image upload */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar" ? "صورة المجموعة" : "Collection Image"}
                  </label>
                  {editing.image ? (
                    <div className="relative overflow-hidden rounded-lg ring-1 ring-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editing.image}
                        alt=""
                        className="aspect-[16/9] w-full object-cover"
                      />
                      <div className="absolute end-2 top-2 flex gap-1">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/85">
                          <Upload className="h-3.5 w-3.5" />
                          {locale === "ar" ? "استبدال" : "Replace"}
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f)
                                readAsDataUrl(f).then((url) =>
                                  setEditing({ ...editing, image: url }),
                                );
                              e.currentTarget.value = "";
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setEditing({ ...editing, image: undefined })
                          }
                          className="grid h-8 w-8 place-items-center rounded-md bg-black/70 text-white backdrop-blur transition hover:bg-rose-500/80"
                          aria-label={t("delete")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-[#0a0a0a] text-sm text-white/60 transition hover:border-[#c9a96e]/50 hover:text-white">
                      <Upload className="h-6 w-6" />
                      <span className="font-medium">
                        {locale === "ar" ? "ارفع صورة" : "Upload image"}
                      </span>
                      <span className="text-[11px] text-white/40">
                        {locale === "ar"
                          ? "يفضل بأبعاد أفقية (16:9)"
                          : "Wide / landscape (16:9) recommended"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f)
                            readAsDataUrl(f).then((url) =>
                              setEditing({ ...editing, image: url }),
                            );
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Active toggle */}
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center justify-between rounded-md border border-white/10 bg-[#0a0a0a] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {locale === "ar" ? "نشطة" : "Active"}
                      </p>
                      <p className="mt-0.5 text-xs text-white/50">
                        {locale === "ar"
                          ? "تظهر للعملاء على الصفحة الرئيسية والمتجر."
                          : "Visible to customers on the storefront."}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editing.isActive}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          isActive: e.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-[#c9a96e]"
                    />
                  </label>
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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
      />
    </div>
  );
}
