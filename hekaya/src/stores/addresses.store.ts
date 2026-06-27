"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type Address,
  type AddressInput,
} from "@/lib/supabase/addresses";

type AddressesState = {
  addresses: Address[];
  loaded: boolean;
  /** Guards against overlapping loads (e.g. page effect + auth listener). */
  loading: boolean;
  /** Pull the signed-in user's address book from Supabase. */
  load: () => Promise<void>;
  /** Add a new address (requires sign-in). */
  add: (input: AddressInput) => Promise<void>;
  /** Update an address by id. */
  edit: (id: string, input: AddressInput) => Promise<void>;
  /** Remove an address by id (optimistic). */
  remove: (id: string) => Promise<void>;
  clear: () => void;
};

export const useAddressesStore = create<AddressesState>()((set, get) => ({
  addresses: [],
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
        set({ addresses: [], loaded: true });
        return;
      }
      const addresses = await fetchAddresses(supabase);
      set({ addresses, loaded: true });
    } catch {
      set({ loaded: true });
    } finally {
      set({ loading: false });
    }
  },
  add: async (input) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    await createAddress(supabase, session.user.id, input);
    await get().load();
  },
  edit: async (id, input) => {
    await updateAddress(createClient(), id, input);
    await get().load();
  },
  remove: async (id) => {
    set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) }));
    await deleteAddress(createClient(), id);
  },
  clear: () => set({ addresses: [], loaded: false }),
}));

// Keep the address book in sync with auth: reload on sign-in, clear on sign-out.
// The callback runs while Supabase holds its auth lock, so any Supabase call
// made directly here would deadlock until the lock times out. Defer with
// setTimeout(0) so the work runs after the lock is released.
if (typeof window !== "undefined") {
  const supabase = createClient();
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      useAddressesStore.setState({ addresses: [], loaded: true });
    } else if (event === "SIGNED_IN") {
      setTimeout(() => void useAddressesStore.getState().load(), 0);
    }
  });
}
