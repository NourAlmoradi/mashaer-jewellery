"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AdminStoreInfo = {
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
};

export type AdminQrConfig = {
  defaultColor: string;
  bgColor: string;
  maxPhotos: number;
  maxMessageLength: number;
  autoGenerate: boolean;
  requirePin: boolean;
};

export type AdminShipping = {
  dubai: number;
  abuDhabi: number;
  sharjah: number;
  otherEmirates: number;
  gcc: number;
  processingDays: number;
};

export type AdminNotifications = {
  newOrder: boolean;
  qrCreated: boolean;
  lowStock: boolean;
  customerMessage: boolean;
  weeklyReport: boolean;
};

export type AdminSettingsState = {
  store: AdminStoreInfo;
  qr: AdminQrConfig;
  shipping: AdminShipping;
  notifications: AdminNotifications;
  setStore: (s: Partial<AdminStoreInfo>) => void;
  setQr: (q: Partial<AdminQrConfig>) => void;
  setShipping: (sh: Partial<AdminShipping>) => void;
  setNotifications: (n: Partial<AdminNotifications>) => void;
};

const defaults: Pick<
  AdminSettingsState,
  "store" | "qr" | "shipping" | "notifications"
> = {
  store: {
    nameEn: "Hekaya Jewellery",
    nameAr: "مجوهرات حكاية",
    taglineEn: "A Story in Every Piece",
    taglineAr: "في كل قطعة… حكاية",
    email: "hello@hekayajewellery.com",
    phone: "+971 50 000 0000",
    whatsapp: "+971 50 000 0000",
    instagram: "@hekayajewellery",
    address: "Dubai Design District (d3), Dubai, UAE",
  },
  qr: {
    defaultColor: "#C9A96E",
    bgColor: "#FAFAF8",
    maxPhotos: 3,
    maxMessageLength: 500,
    autoGenerate: true,
    requirePin: true,
  },
  shipping: {
    dubai: 0,
    abuDhabi: 15,
    sharjah: 10,
    otherEmirates: 25,
    gcc: 50,
    processingDays: 2,
  },
  notifications: {
    newOrder: true,
    qrCreated: true,
    lowStock: true,
    customerMessage: true,
    weeklyReport: false,
  },
};

export const useAdminSettings = create<AdminSettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setStore: (s) => set((cur) => ({ store: { ...cur.store, ...s } })),
      setQr: (q) => set((cur) => ({ qr: { ...cur.qr, ...q } })),
      setShipping: (sh) =>
        set((cur) => ({ shipping: { ...cur.shipping, ...sh } })),
      setNotifications: (n) =>
        set((cur) => ({ notifications: { ...cur.notifications, ...n } })),
    }),
    {
      name: "hekaya-admin-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
