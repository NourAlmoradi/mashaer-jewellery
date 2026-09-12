"use client";

import { useEffect, useMemo } from "react";
import { useCatalogStore } from "@/stores/catalog.store";
import type { Collection } from "@/types";

/**
 * Live collections, sorted by sortOrder; active only unless `includeInactive`.
 * Memoised — a fresh array each render would retrigger consumers' effects.
 */
export function useCollections(opts?: {
  includeInactive?: boolean;
}): Collection[] {
  const collections = useCatalogStore((s) => s.collections);
  const load = useCatalogStore((s) => s.load);
  // Destructured so the memo depends on the boolean, not on a fresh `opts`
  // object literal that callers re-create each render.
  const includeInactive = opts?.includeInactive ?? false;

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () =>
      [...collections]
        .filter((c) => includeInactive || c.isActive)
        // createdAt breaks ties, so rows sharing a sortOrder keep a stable
        // order across refetches.
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
        ),
    [collections, includeInactive],
  );
}
