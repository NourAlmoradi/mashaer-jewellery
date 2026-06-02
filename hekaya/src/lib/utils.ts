import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  amount: number,
  locale: "ar" | "en" = "en",
): string {
  const symbol = locale === "ar" ? "د.إ" : "AED";
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return locale === "ar" ? `${formatted} ${symbol}` : `${symbol} ${formatted}`;
}

export function formatDate(
  date: Date | string,
  locale: "ar" | "en" = "en",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Cryptographically-strong random bytes with a graceful fallback.
 * Uses Web Crypto (browser + Node 19+); falls back to Math.random only when
 * `crypto.getRandomValues` is unavailable (very old runtimes).
 */
function randomValues(len: number): Uint8Array {
  const out = new Uint8Array(len);
  const c = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (c?.getRandomValues) {
    c.getRandomValues(out);
  } else {
    for (let i = 0; i < len; i++) out[i] = Math.floor(Math.random() * 256);
  }
  return out;
}

export function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const bytes = randomValues(3);
  const rnd = Array.from(bytes, (b) => b.toString(36).toUpperCase())
    .join("")
    .slice(0, 4)
    .padEnd(4, "0");
  return `HK-${ts}-${rnd}`;
}

export function generateToken(len = 8): string {
  // Ambiguity-free alphabet (no 0/o/1/l/i) for human-readable QR tokens.
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomValues(len);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

/** Default WhatsApp number (digits only, international format, no leading +). */
export const DEFAULT_WHATSAPP = "971500000000";

/** Strip non-digits from a phone string and build a wa.me deep link. */
export function whatsappUrl(phone?: string, message?: string): string {
  const digits =
    (phone || DEFAULT_WHATSAPP).replace(/\D/g, "") || DEFAULT_WHATSAPP;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
