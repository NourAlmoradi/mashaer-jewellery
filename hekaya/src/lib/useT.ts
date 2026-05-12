"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/stores/locale.store";
import { t as translate, type TKey } from "@/lib/i18n";
import type { Bilingual, Locale } from "@/types";

export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  const hydrated = useLocaleStore((s) => s.hydrated);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    }
  }, [locale]);

  const t = (key: TKey) => translate(key, locale);
  const tx = (b: Bilingual) => b[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";

  return { t, tx, locale: locale as Locale, dir, hydrated };
}
