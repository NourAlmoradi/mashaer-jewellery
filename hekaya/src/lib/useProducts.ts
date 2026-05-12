"use client";

import { useMemo } from "react";
import { products as seedProducts } from "@/data/products";
import { useDataStore } from "@/stores/data.store";
import type { Product } from "@/types";

/**
 * Returns the merged product list:
 *   customProducts (admin-added) + seedProducts with overrides applied,
 *   minus any hidden ids.
 */
export function useProducts(): Product[] {
  const overrides = useDataStore((s) => s.productOverrides);
  const customs = useDataStore((s) => s.customProducts);
  const hidden = useDataStore((s) => s.hiddenProductIds);

  return useMemo(() => {
    const seedMerged = seedProducts.map((p) => {
      const ov = overrides[p.id];
      return ov ? ({ ...p, ...ov } as Product) : p;
    });
    const all = [...customs, ...seedMerged];
    if (hidden.length === 0) return all;
    const hiddenSet = new Set(hidden);
    return all.filter((p) => !hiddenSet.has(p.id));
  }, [overrides, customs, hidden]);
}

/** Lookup helper that respects the merged store. */
export function useProductBySlug(slug: string): Product | undefined {
  const all = useProducts();
  return useMemo(() => all.find((p) => p.slug === slug), [all, slug]);
}

export function useProductById(id: string): Product | undefined {
  const all = useProducts();
  return useMemo(() => all.find((p) => p.id === id), [all, id]);
}
