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
      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", session.user.id);
      if (error) throw error;
      set({
        ids: (data ?? []).map((r) => r.product_id as string),
        loaded: true,
      });
    } catch {
      // Never reject into the `void load()` call sites, and never leave
      // `loaded` false. Keep the previous ids: a failed read isn't an empty
      // wishlist. Same shape as addresses.store.load.
      set({ loaded: true });
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
    const had = get().ids.includes(id);
    // Optimistic local update so the heart flips instantly.
    set((s) => ({
      ids: had ? s.ids.filter((i) => i !== id) : [...s.ids, id],
    }));
    if (!user) return; // wishlist persistence requires sign-in
    // Supabase resolves with `{ error }` instead of rejecting, so the result
    // has to be read: roll back and rethrow so the caller can report it.
    const { error } = had
      ? await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", id)
      : await supabase
          .from("wishlist")
          .insert({ user_id: user.id, product_id: id });
    // 23505 (unique violation) on an add means the row is already in the state
    // this click asked for.
    if (!error || (!had && error.code === "23505")) return;
    set((s) => ({
      // Restore the pre-click membership without duplicating an id an
      // overlapping toggle may have put back.
      ids: had
        ? s.ids.includes(id)
          ? s.ids
          : [...s.ids, id]
        : s.ids.filter((i) => i !== id),
    }));
    throw error;
  },
  has: (id) => get().ids.includes(id),
  clear: () => set({ ids: [], loaded: false }),
}));

// Reload on sign-in, clear on sign-out. setTimeout(0) defers past the auth
// lock Supabase holds here — calling into Supabase inside it deadlocks.
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
