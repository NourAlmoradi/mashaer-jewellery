import type { Locale } from "@/types";

export const BESPOKE_BUCKET = "bespoke-references";
export const MAX_REFERENCE_BYTES = 1024 * 1024;
export const MAX_REFERENCES = 3;

export const PIECES = [
  { id: "necklace", ar: "قلادة", en: "Necklace" },
  { id: "bracelet", ar: "سوار", en: "Bracelet" },
  { id: "earrings", ar: "أقراط", en: "Earrings" },
  { id: "other", ar: "فكرة أخرى", en: "Something else" },
] as const;
export const BUDGETS = [
  { id: "guidance", ar: "أحتاج اقتراحكم", en: "I'd like your guidance" },
  { id: "under1500", ar: "أقل من ١٬٥٠٠ د.إ", en: "Under AED 1,500" },
  { id: "1500to3000", ar: "١٬٥٠٠ – ٣٬٠٠٠ د.إ", en: "AED 1,500–3,000" },
  { id: "3000plus", ar: "أكثر من ٣٬٠٠٠ د.إ", en: "Over AED 3,000" },
] as const;
export const BESPOKE_STATUSES = [
  { id: "new", ar: "جديد", en: "New" },
  { id: "discussing", ar: "قيد المناقشة", en: "Discussing" },
  { id: "quoted", ar: "تم إرسال العرض", en: "Proposal sent" },
  { id: "production", ar: "قيد التنفيذ", en: "In production" },
  { id: "completed", ar: "مكتمل", en: "Completed" },
  { id: "closed", ar: "مغلق", en: "Closed" },
] as const;
export type BespokeStatus = (typeof BESPOKE_STATUSES)[number]["id"];
export type BespokeBrief = {
  piece: string;
  idea: string;
  budget: string;
  occasion: string;
  desiredDate: string;
  name: string;
  phone: string;
  email: string;
  emirate: string;
  contactMethod: "whatsapp" | "email";
  locale: Locale;
  productSlug: string;
};
// Reuses the existing private contact inbox; no schema migration is needed.
// Storage paths belong to one request. They are never public URLs.
export type StoredBespokeBrief = BespokeBrief & {
  source: "mashaer-bespoke-v1";
  references: string[];
  status: BespokeStatus;
  fingerprint?: string;
  notificationStatus?: "pending" | "sent" | "failed";
  consentAt?: string;
};
export function parseBespokeBrief(message: string): StoredBespokeBrief | null {
  try {
    const parsed = JSON.parse(message);
    const brief = validateBrief(parsed, true);
    if (!brief || parsed.source !== "mashaer-bespoke-v1" || !Array.isArray(parsed.references) || parsed.references.length > MAX_REFERENCES || !parsed.references.every((path: unknown) => typeof path === "string" && path.length <= 100) || !BESPOKE_STATUSES.some((status) => status.id === parsed.status)) return null;
    if (parsed.fingerprint !== undefined && (typeof parsed.fingerprint !== "string" || !/^[a-f0-9]{64}$/.test(parsed.fingerprint))) return null;
    if (parsed.notificationStatus !== undefined && !["pending", "sent", "failed"].includes(parsed.notificationStatus)) return null;
    if (parsed.consentAt !== undefined && (typeof parsed.consentAt !== "string" || !Number.isFinite(Date.parse(parsed.consentAt)))) return null;
    return { ...brief, source: parsed.source, references: parsed.references, status: parsed.status, fingerprint: parsed.fingerprint, notificationStatus: parsed.notificationStatus, consentAt: parsed.consentAt };
  } catch { return null; }
}
export function requestReference(id: string) { return `MS-${id.slice(0, 8).toUpperCase()}`; }
export function normalizeBespokePhone(value: string) {
  const latin = latinDigits(value);
  const digits = latin.replace(/\D/g, "").replace(/^00/, "");
  if (/^05\d{8}$/.test(digits)) return `+971${digits.slice(1)}`;
  // UAE mobile typed without its 0 ("50 123 4567"); a number typed with + or 00 is kept as international.
  if (/^5\d{8}$/.test(digits) && !/^\s*(\+|00)/.test(latin)) return `+971${digits}`;
  // "+971 (0) 50 …": drop the 0 after the country code.
  if (/^97105\d{8}$/.test(digits)) return `+971${digits.slice(4)}`;
  return `+${digits}`;
}
function latinDigits(value: string) {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => String(digit.charCodeAt(0) - (digit >= "۰" ? 0x06f0 : 0x0660)));
}
export function uaeToday() {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)?.value).join("-");
}
export const isBespokeId = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export function optionLabel(options: ReadonlyArray<{ id: string; ar: string; en: string }>, id: string, locale: Locale) {
  return options.find((option) => option.id === id)?.[locale] ?? id;
}

export function validateBespokeBrief(input: unknown): BespokeBrief | null {
  return validateBrief(input, false);
}
function validateBrief(input: unknown, allowPastDate: boolean): BespokeBrief | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  const limits: Record<string, number> = { piece: 20, idea: 600, budget: 30, occasion: 60, desiredDate: 10, name: 100, phone: 24, email: 180, emirate: 20, productSlug: 100 };
  const text: Record<string, string> = {};
  for (const [key, max] of Object.entries(limits)) {
    if (typeof value[key] !== "string") return null;
    text[key] = (value[key] as string).trim();
    if (text[key].length > max) return null;
  }
  if (!PIECES.some((p) => p.id === text.piece) || !BUDGETS.some((p) => p.id === text.budget)) return null;
  text.phone = latinDigits(text.phone);
  if (text.idea.length < 10 || !text.name || !/^\+?[\d\s()-]{7,24}$/.test(text.phone)) return null;
  text.phone = normalizeBespokePhone(text.phone);
  const phoneDigits = text.phone.replace(/\D/g, "");
  if (phoneDigits.length < 8 || phoneDigits.length > 15) return null;
  if (value.contactMethod !== "whatsapp" && value.contactMethod !== "email") return null;
  if (text.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.email)) return null;
  if (value.contactMethod === "email" && !text.email) return null;
  if (text.desiredDate) {
    const date = new Date(`${text.desiredDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text.desiredDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== text.desiredDate || (!allowPastDate && text.desiredDate < uaeToday())) return null;
  }
  const emirates = ["", "abuDhabi", "dubai", "sharjah", "ajman", "ummAlQuwain", "rasAlKhaimah", "fujairah"];
  if (!emirates.includes(text.emirate)) return null;
  return { ...text, contactMethod: value.contactMethod, locale: value.locale === "en" ? "en" : "ar" } as BespokeBrief;
}
