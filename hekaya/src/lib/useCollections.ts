"use client";

import { useEffect } from "react";
import { useDataStore } from "@/stores/data.store";
import { collections as initialCollections } from "@/data/products";
import type { Collection } from "@/types";

/**
 * Returns the live collections list from the data store, seeded once
 * from the initial constant in `data/products.ts` if the store is empty.
 * Sorted by sortOrder; only active collections by default.
 */
export function useCollections(opts?: {
  includeInactive?: boolean;
}): Collection[] {
  const collections = useDataStore((s) => s.collections);
  const seed = useDataStore((s) => s.seedCollections);

  useEffect(() => {
    if (collections.length === 0) seed(initialCollections);
  }, [collections.length, seed]);

  const list = collections.length === 0 ? initialCollections : collections;
  return [...list]
    .filter((c) => opts?.includeInactive || c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
