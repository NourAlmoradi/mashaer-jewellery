"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Locale } from "@/types";

const COOKIE_NAME = "mashaer-locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

export type LocaleValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

const LocaleContext = createContext<LocaleValue | null>(null);

/**
 * App-wide locale, seeded from the same cookie the root layout used for
 * `<html lang/dir>`. Context, not zustand: zustand feeds React the store's
 * creation-time state as the server snapshot, so a seed arrives too late.
 */
export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    // The cookie is what the next server render reads.
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    // <html> came from the server and survives until a full reload.
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    setLocaleState(next);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

/** Read the shared locale. Must be used under <LocaleProvider>. */
export function useLocale(): LocaleValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within <LocaleProvider>");
  }
  return ctx;
}
