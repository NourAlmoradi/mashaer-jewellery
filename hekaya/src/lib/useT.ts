"use client";

import { useCallback } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { t as translate, type TKey } from "@/lib/i18n";
import type { Bilingual } from "@/types";

export function useT() {
  const { locale } = useLocale();

  // Stable per locale, so memos and callbacks keyed on `t` can cache.
  const t = useCallback((key: TKey) => translate(key, locale), [locale]);
  const tx = (b: Bilingual) => b[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";

  return { t, tx, locale, dir };
}
