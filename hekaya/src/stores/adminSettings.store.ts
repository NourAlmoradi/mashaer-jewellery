"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  setStore: (s: Partial<AdminStoreInfo>) => void;
  setShipping: (sh: Partial<AdminShipping>) => void;
};

const defaults: Pick<AdminSettingsState, "store" | "shipping"> = {
  store: {
    email: "hello@mashaer-jewellery.com",
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

export const useAdminSettings = create<AdminSettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setStore: (s) => set((cur) => ({ store: { ...cur.store, ...s } })),
      setShipping: (sh) =>
        set((cur) => ({ shipping: { ...cur.shipping, ...sh } })),
    }),
    {
      name: "mashaer-admin-settings",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // v1 had nameEn/nameAr/taglineEn/taglineAr/address, qr/notifications
      // slices, and a different shipping shape. Drop everything and re-seed
      // with the new defaults so persisted browsers don't crash on the new
      // schema.
      migrate: () => ({
        store: defaults.store,
        shipping: defaults.shipping,
      }),
    },
  ),
);
