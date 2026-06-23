"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useWishlistStore } from "@/stores/wishlist.store";
import { useT } from "@/lib/useT";

/**
 * Shared wishlist toggle logic used by ProductCard and ProductDetail.
 * Returns the current membership flag and a memoised toggle handler
 * that also fires the add/remove toast.
 */
export function useWishlistToggle(productId: string) {
  const { t } = useT();
  const inWishlist = useWishlistStore((s) => s.ids.includes(productId));
  const toggleStore = useWishlistStore((s) => s.toggle);
  const loaded = useWishlistStore((s) => s.loaded);
  const load = useWishlistStore((s) => s.load);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const toggle = useCallback(() => {
    void toggleStore(productId);
    toast(inWishlist ? t("wishlist_removed") : t("wishlist_added"));
  }, [toggleStore, productId, inWishlist, t]);

  return { inWishlist, toggle };
}
