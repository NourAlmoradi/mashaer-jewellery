"use client";

import { useEffect } from "react";
import { useCatalogStore } from "@/stores/catalog.store";
import type { Collection } from "@/types";

/**
 * Returns the live collections list fetched from Supabase.
 * Sorted by sortOrder; only active collections unless `includeInactive`.
 */
export function useCollections(opts?: {
  includeInactive?: boolean;
}): Collection[] {
  const collections = useCatalogStore((s) => s.collections);
  const load = useCatalogStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  return [...collections]
    .filter((c) => opts?.includeInactive || c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
