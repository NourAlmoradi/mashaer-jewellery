"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import {
  createOrder as dbCreateOrder,
  fetchOrders,
  updateOrderStatus as dbUpdateOrderStatus,
} from "@/lib/supabase/orders";
import type { Order } from "@/types";

type OrdersState = {
  orders: Order[];
  loaded: boolean;
  loading: boolean;
  /** Load orders visible to the current user (RLS-scoped). */
  load: () => Promise<void>;
  /** Force a re-fetch. */
  refresh: () => Promise<void>;
  /** Persist a new order (requires sign-in). Returns false if not signed in. */
  addOrder: (order: Order) => Promise<boolean>;
  /** Admin: change an order's status. */
  setStatus: (id: string, status: Order["status"]) => Promise<void>;
};

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  loaded: false,
  loading: false,
  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const orders = await fetchOrders(createClient());
      set({ orders, loaded: true, loading: false });
    } catch {
      set({ loaded: true, loading: false });
    }
  },
  refresh: async () => {
    try {
      const orders = await fetchOrders(createClient());
      set({ orders, loaded: true });
    } catch {
      /* ignore */
    }
  },
  addOrder: async (order) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    await dbCreateOrder(supabase, order);
    // Re-fetch so the store holds the server-authoritative order
    // (status 'pending' + totals recomputed by place_order).
    await get().refresh();
    return true;
  },
  setStatus: async (id, status) => {
    await dbUpdateOrderStatus(createClient(), id, status);
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
  },
}));

// Reload orders when auth changes (sign-in shows your orders, sign-out clears).
if (typeof window !== "undefined") {
  const supabase = createClient();
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      useOrdersStore.setState({ orders: [], loaded: true });
    } else {
      void useOrdersStore.getState().refresh();
    }
  });
}
