"use client";

import { useLocale } from "@/components/LocaleProvider";
import { t as translate, type TKey } from "@/lib/i18n";
import type { Bilingual } from "@/types";

export function useT() {
  const { locale } = useLocale();

  const t = (key: TKey) => translate(key, locale);
  const tx = (b: Bilingual) => b[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";

  return { t, tx, locale, dir };
}
