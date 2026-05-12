"use client";

import { create } from "zustand";
import type { Locale } from "@/types";

const COOKIE_NAME = "hekaya-locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

function writeCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

type LocaleState = {
  locale: Locale;
  hydrated: boolean;
  setLocale: (l: Locale) => void;
  init: (l: Locale) => void;
};

export const useLocaleStore = create<LocaleState>()((set, get) => ({
  // Default matches what the server sends when no cookie is present.
  locale: "ar",
  hydrated: false,
  setLocale: (locale) => {
    writeCookie(locale);
    set({ locale });
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    }
  },
  init: (locale) => {
    if (get().hydrated) return;
    set({ locale, hydrated: true });
  },
}));
