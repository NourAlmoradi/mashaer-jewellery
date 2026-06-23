import type { Locale } from "@/types";

/**
 * The seven UAE emirates, with a stable `key` used as the canonical value in
 * the database (matches the shipping-rate keys in admin_settings) and bilingual
 * labels for the UI. Keep in sync with the shipping keys in place_order().
 */
export const EMIRATES = [
  { key: "abuDhabi", ar: "أبوظبي", en: "Abu Dhabi" },
  { key: "dubai", ar: "دبي", en: "Dubai" },
  { key: "sharjah", ar: "الشارقة", en: "Sharjah" },
  { key: "ajman", ar: "عجمان", en: "Ajman" },
  { key: "ummAlQuwain", ar: "أم القيوين", en: "Umm Al Quwain" },
  { key: "rasAlKhaimah", ar: "رأس الخيمة", en: "Ras Al Khaimah" },
  { key: "fujairah", ar: "الفجيرة", en: "Fujairah" },
] as const;

export type EmirateKey = (typeof EMIRATES)[number]["key"];

/** Resolve any stored value (key, AR label or EN label) to a localized label. */
export function emirateLabel(value: string, locale: Locale): string {
  const v = value.trim().toLowerCase();
  const found = EMIRATES.find(
    (e) =>
      e.key.toLowerCase() === v ||
      e.ar.toLowerCase() === v ||
      e.en.toLowerCase() === v,
  );
  return found ? found[locale] : value;
}

/** Normalise any label/key to the canonical key we store in the database. */
export function emirateKeyFrom(value: string): EmirateKey | string {
  const v = value.trim().toLowerCase();
  const found = EMIRATES.find(
    (e) =>
      e.key.toLowerCase() === v ||
      e.ar.toLowerCase() === v ||
      e.en.toLowerCase() === v,
  );
  return found ? found.key : value;
}
