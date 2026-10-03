"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useT } from "@/lib/useT";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu({
  open,
  onClose,
  isAdmin = false,
  returnFocusRef,
}: MobileMenuProps) {
  const { t, dir, locale } = useT();
  const pathname = usePathname();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const fromSide = dir === "rtl" ? "-100%" : "100%";
  const closeLabel = locale === "ar" ? "إغلاق القائمة" : "Close menu";

  const links: { href: string; key: Parameters<typeof t>[0] }[] = [
    { href: "/", key: "nav_home" },
    { href: "/products", key: "nav_shop" },
    { href: "/collections", key: "nav_collections" },
    { href: "/qr", key: "nav_qr" },
    { href: "/about", key: "nav_about" },
    { href: "/contact", key: "nav_contact" },
    { href: "/account", key: "nav_account" },
    ...(isAdmin ? ([{ href: "/admin", key: "nav_admin" }] as const) : []),
  ];

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const returnFocus = returnFocusRef?.current;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

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

  const trapFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab" || !drawerRef.current) return;
    const items = Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
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

  const isCurrent = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-[#130d09]/55 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            ref={drawerRef}
            id="site-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-navigation-title"
            initial={{ x: fromSide }}
            animate={{ x: 0 }}
            exit={{ x: fromSide }}
            transition={{
              type: "tween",
              duration: 0.32,
              ease: [0.4, 0, 0.2, 1],
            }}
            onKeyDown={trapFocus}
            className="fixed inset-y-0 z-[61] flex w-[88%] max-w-[400px] flex-col bg-[var(--color-bg)] shadow-2xl"
            style={dir === "rtl" ? { left: 0 } : { right: 0 }}
          >
            <div className="flex min-h-[72px] items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <Logo />
              <span id="site-navigation-title" className="sr-only">
                {t("nav_menu")}
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="inline-grid h-11 w-11 place-items-center rounded-full transition hover:bg-[var(--color-bg-secondary)]"
                aria-label={closeLabel}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav
              className="flex-1 overflow-y-auto px-5 py-6"
              aria-label={t("nav_menu")}
            >
              <ul className="space-y-1">
                {links.map((link, index) => {
                  const current = isCurrent(link.href);
                  return (
                    <motion.li
                      key={link.key}
                      initial={{ opacity: 0, x: dir === "rtl" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 + index * 0.035 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        aria-current={current ? "page" : undefined}
                        className="group flex min-h-12 items-center justify-between rounded-md px-3 py-3 text-[15px] font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-primary-dark)] aria-[current=page]:bg-[var(--color-primary-soft)] aria-[current=page]:text-[var(--color-primary-dark)]"
                      >
                        <span>{t(link.key)}</span>
                        <span
                          className="text-[var(--color-primary)] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 group-aria-[current=page]:opacity-100"
                          aria-hidden
                        >
                          {dir === "rtl" ? "←" : "→"}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <div className="safe-pb border-t border-[var(--color-border)] px-5 py-4">
              <LanguageSwitcher />
              <p className="mt-4 text-xs text-[var(--color-ink-faint)]">
                © {new Date().getFullYear()} Mashaer Jewellery
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
