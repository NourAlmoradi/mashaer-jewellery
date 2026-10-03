"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, X } from "lucide-react";
import { useT } from "@/lib/useT";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
};

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SearchOverlay({
  open,
  onClose,
  returnFocusRef,
}: SearchOverlayProps) {
  const { t, locale, dir } = useT();
  const router = useRouter();
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const closeLabel = locale === "ar" ? "إغلاق البحث" : "Close search";

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const returnFocus = returnFocusRef?.current;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocus?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    onClose();
    router.push(value ? `/products?q=${encodeURIComponent(value)}` : "/products");
  };

  const trapFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const items = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] bg-[#130d09]/65 px-4 pt-[max(92px,env(safe-area-inset-top))] backdrop-blur-md sm:px-8 sm:pt-28"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            ref={dialogRef}
            id="site-search-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-search-title"
            onKeyDown={trapFocus}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto w-full max-w-2xl border border-white/15 bg-[#fbf8f2] p-5 shadow-[0_24px_80px_rgba(16,10,7,0.35)] sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[var(--color-primary-dark)]">
                  MASHAER
                </p>
                <h2
                  id="site-search-title"
                  className="mt-1 font-display text-2xl font-medium text-[var(--color-ink)] sm:text-3xl"
                >
                  {t("nav_search")}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-grid h-11 w-11 place-items-center rounded-full text-[var(--color-ink)] transition hover:bg-[var(--color-bg-secondary)]"
                aria-label={closeLabel}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submit} role="search">
              <div className="flex min-h-14 items-center border-b border-[var(--color-border-strong)] focus-within:border-[var(--color-primary-dark)]">
                <Search
                  className="mx-3 h-5 w-5 shrink-0 text-[var(--color-primary-dark)]"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("search_placeholder")}
                  aria-label={t("nav_search")}
                  autoComplete="off"
                  enterKeyHint="search"
                  className="min-w-0 flex-1 bg-transparent px-1 py-4 text-base text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)] sm:text-lg"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center gap-2 px-3 text-sm font-semibold text-[var(--color-ink)] transition hover:text-[var(--color-primary-dark)] sm:px-5"
                >
                  <span className="hidden sm:inline">{t("nav_search")}</span>
                  <ArrowRight
                    className={`h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
              </div>
            </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
