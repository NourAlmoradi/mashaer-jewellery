"use client";

import { useEffect } from "react";
import { useCatalogStore } from "@/stores/catalog.store";
import type { Category } from "@/types";

/** Returns all categories from Supabase, sorted by sort order. */
export function useCategories(): Category[] {
  const categories = useCatalogStore((s) => s.categories);
  const load = useCatalogStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  return categories;
}

/** Look up a single category by id from the loaded catalog. */
export function useCategory(id: string | undefined): Category | undefined {
  const categories = useCategories();
  if (!id) return undefined;
  return categories.find((c) => c.id === id);
}
