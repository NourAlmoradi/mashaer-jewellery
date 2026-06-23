"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export type AdminStoreInfo = {
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
};

export type AdminShipping = {
  dubai: number;
  abuDhabi: number;
  sharjah: number;
  ajman: number;
  ummAlQuwain: number;
  rasAlKhaimah: number;
  fujairah: number;
};

export type AdminSettingsState = {
  store: AdminStoreInfo;
  shipping: AdminShipping;
  loaded: boolean;
  load: () => Promise<void>;
  setStore: (s: Partial<AdminStoreInfo>) => void;
  setShipping: (sh: Partial<AdminShipping>) => void;
};

const defaults: Pick<AdminSettingsState, "store" | "shipping"> = {
  store: {
    email: "hello@mashaerjewellery.com",
    phone: "+971 50 000 0000",
    whatsapp: "+971 50 000 0000",
    instagram: "@mashaerjewellery",
    facebook: "mashaerjewellery",
  },
  shipping: {
    dubai: 0,
    abuDhabi: 15,
    sharjah: 10,
    ajman: 20,
    ummAlQuwain: 25,
    rasAlKhaimah: 25,
    fujairah: 25,
  },
};

type SettingsData = Pick<AdminSettingsState, "store" | "shipping">;

/** Persist the current store + shipping to the single admin_settings row. */
async function persistSettings(data: SettingsData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("admin_settings")
    .update({ data })
    .eq("id", 1);
  if (error) throw error;
}

export const useAdminSettings = create<AdminSettingsState>()((set, get) => ({
  ...defaults,
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("admin_settings")
        .select("data")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      const saved = (data?.data ?? {}) as Partial<SettingsData>;
      set({
        store: { ...defaults.store, ...saved.store },
        shipping: { ...defaults.shipping, ...saved.shipping },
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },
  setStore: (s) =>
    set((cur) => {
      const store = { ...cur.store, ...s };
      void persistSettings({ store, shipping: cur.shipping });
      return { store };
    }),
  setShipping: (sh) =>
    set((cur) => {
      const shipping = { ...cur.shipping, ...sh };
      void persistSettings({ store: cur.store, shipping });
      return { shipping };
    }),
}));

// Public consumers (Footer, Contact, Checkout) read these values, so load the
// single settings row once as soon as the store is first used in the browser.
if (typeof window !== "undefined") {
  void useAdminSettings.getState().load();
}
