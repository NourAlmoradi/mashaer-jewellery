"use client";

import { useEffect } from "react";
import { useOrdersStore } from "@/stores/orders.store";
import type { Order } from "@/types";

/**
 * Returns the orders visible to the current user (RLS-scoped) and loads them
 * once on mount. Mirrors `useProducts` so consumers don't re-wire the load
 * effect at every call site.
 */
export function useOrders(): Order[] {
  const orders = useOrdersStore((s) => s.orders);
  const loaded = useOrdersStore((s) => s.loaded);
  const load = useOrdersStore((s) => s.load);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  return orders;
}
