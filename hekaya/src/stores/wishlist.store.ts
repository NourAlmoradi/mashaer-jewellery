"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

type WishlistState = {
  ids: string[];
  loaded: boolean;
  /** Guards against overlapping loads (e.g. page effect + auth listener). */
  loading: boolean;
  /** Pull the signed-in user's wishlist from Supabase. */
  load: () => Promise<void>;
  /** Add/remove a product (optimistic local update + DB write). */
  toggle: (id: string) => Promise<void>;
  has: (id: string) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  ids: [],
  loaded: false,
  loading: false,
  load: async () => {
    // Skip if a load is already in flight so two callers don't both fetch.
    if (get().loading) return;
    set({ loading: true });
    try {
      const supabase = createClient();
      // getSession() reads the cached session locally (no network round-trip),
      // unlike getUser() which revalidates with the auth server every call.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ ids: [], loaded: true });
        return;
      }
      const { data } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", session.user.id);
      set({
        ids: (data ?? []).map((r) => r.product_id as string),
        loaded: true,
      });
    } finally {
      set({ loading: false });
    }
  },
  toggle: async (id) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    const has = get().ids.includes(id);
    // Optimistic local update so the heart flips instantly.
    set((s) => ({
      ids: has ? s.ids.filter((i) => i !== id) : [...s.ids, id],
    }));
    if (!user) return; // wishlist persistence requires sign-in
    if (has) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", id);
    } else {
      await supabase
        .from("wishlist")
        .insert({ user_id: user.id, product_id: id });
    }
  },
  has: (id) => get().ids.includes(id),
  clear: () => set({ ids: [], loaded: false }),
}));

// Keep the wishlist in sync with auth: reload on sign-in, clear on sign-out.
// The callback runs while Supabase holds its auth lock, so any Supabase call
// made directly here would deadlock until the lock times out. Defer with
// setTimeout(0) so the work runs after the lock is released.
if (typeof window !== "undefined") {
  const supabase = createClient();
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      useWishlistStore.setState({ ids: [], loaded: true });
    } else {
      setTimeout(() => void useWishlistStore.getState().load(), 0);
    }
  });
}
