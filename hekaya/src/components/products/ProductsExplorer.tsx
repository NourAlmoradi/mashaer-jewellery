"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useT } from "@/lib/useT";
import { categories } from "@/data/products";
import { useCollections } from "@/lib/useCollections";
import { useProducts } from "@/lib/useProducts";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";

export function ProductsExplorer() {
  const { t, tx } = useT();
  const collections = useCollections();
  const products = useProducts();
  const params = useSearchParams();
  const router = useRouter();
  const initialCollection = params.get("collection") || "";
  const initialCategory = params.get("category") || "";

  const [collection, setCollection] = useState(initialCollection);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<"new" | "low" | "high" | "pop">("new");
  const [openFilters, setOpenFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.isActive);
    if (collection) list = list.filter((p) => p.collection === collection);
    if (category) list = list.filter((p) => p.categoryId === category);
    switch (sort) {
      case "low":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "high":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "pop":
        list = [...list].sort(
          (a, b) => Number(b.isBestseller) - Number(a.isBestseller),
        );
        break;
    }
    return list;
  }, [products, collection, category, sort]);

  const clearAll = () => {
    setCollection("");
    setCategory("");
    setSort("new");
    router.replace("/products");
  };

  return (
    <div className="container-h py-10 lg:py-14">
      {/* header */}
      <div className="mb-8 text-center">
        <span className="eyebrow">{t("nav_shop")}</span>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
          {t("nav_shop")}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          {filtered.length} {t("results")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* Filters — desktop sidebar / mobile drawer */}
        <aside
          className={cn(
            "lg:sticky lg:top-24 lg:block",
            openFilters
              ? "fixed inset-0 z-50 overflow-y-auto bg-white p-6 lg:static lg:p-0"
              : "hidden",
          )}
        >
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <h3 className="font-display text-xl font-semibold">
              {t("filters")}
            </h3>
            <button onClick={() => setOpenFilters(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          <FilterGroup label={t("collections_title")}>
            <FilterChip active={!collection} onClick={() => setCollection("")}>
              {t("all")}
            </FilterChip>
            {collections.map((c) => (
              <FilterChip
                key={c.id}
                active={collection === c.id}
                onClick={() => setCollection(c.id)}
              >
                {tx(c.name)}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label={t("category")}>
            <FilterChip active={!category} onClick={() => setCategory("")}>
              {t("all")}
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c.id}
                active={category === c.id}
                onClick={() => setCategory(c.id)}
              >
                {tx(c.name)}
              </FilterChip>
            ))}
          </FilterGroup>

          {(collection || category) && (
            <button
              onClick={clearAll}
              className="mt-4 text-sm font-medium text-[var(--color-primary-dark)] underline-offset-4 hover:underline"
            >
              {t("clear_filters")}
            </button>
          )}
        </aside>

        <div>
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              onClick={() => setOpenFilters(true)}
              className="btn btn-outline btn-sm lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("filters")}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="input ms-auto max-w-[220px] text-sm"
            >
              <option value="new">{t("sort_new")}</option>
              <option value="pop">{t("sort_pop")}</option>
              <option value="low">{t("sort_low")}</option>
              <option value="high">{t("sort_high")}</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center">
              <p className="font-display text-xl font-semibold">
                {t("no_results")}
              </p>
              <button onClick={clearAll} className="btn btn-outline mt-4">
                {t("clear_filters")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] lg:gap-7">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-muted)]">
        {label}
      </h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
          : "border-[var(--color-border)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary-dark)]",
      )}
    >
      {children}
    </button>
  );
}
