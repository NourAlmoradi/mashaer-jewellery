"use client";

import { useEffect, useMemo } from "react";
import { useCatalogStore } from "@/stores/catalog.store";
import type { Product } from "@/types";

/**
 * Returns the product list fetched from Supabase. Loads the catalog once on
 * mount; all admin writes go straight to the database.
 */
export function useProducts(): Product[] {
  const products = useCatalogStore((s) => s.products);
  const load = useCatalogStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  return products;
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

/** True while the catalog is still loading from Supabase for the first time. */
export function useCatalogLoading(): boolean {
  const status = useCatalogStore((s) => s.status);
  return status === "idle" || status === "loading";
}
