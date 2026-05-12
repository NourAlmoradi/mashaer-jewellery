"use client";

import { useLocaleStore } from "@/stores/locale.store";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocaleStore();
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--color-border-strong)] bg-white/70 p-0.5 text-xs font-semibold backdrop-blur",
        className,
      )}
    >
      <button
        onClick={() => setLocale("ar")}
        className={cn(
          "rounded-full px-3 py-1.5 transition-all",
          locale === "ar"
            ? "bg-[var(--color-primary)] text-white shadow-sm"
            : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
        )}
        aria-pressed={locale === "ar"}
      >
        ع
      </button>
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-full px-3 py-1.5 tracking-wider transition-all",
          locale === "en"
            ? "bg-[var(--color-primary)] text-white shadow-sm"
            : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
        )}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
