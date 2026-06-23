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
  load: async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ addresses: [], loaded: true });
      return;
    }
    try {
      const addresses = await fetchAddresses(supabase);
      set({ addresses, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
  add: async (input) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await createAddress(supabase, user.id, input);
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
if (typeof window !== "undefined") {
  const supabase = createClient();
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      useAddressesStore.setState({ addresses: [], loaded: true });
    } else if (event === "SIGNED_IN") {
      void useAddressesStore.getState().load();
    }
  });
}
