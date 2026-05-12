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

export function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HK-${ts}-${rnd}`;
}

export function generateToken(len = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
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
