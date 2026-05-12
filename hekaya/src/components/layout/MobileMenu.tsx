"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useT } from "@/lib/useT";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, dir } = useT();
  const fromSide = dir === "rtl" ? "100%" : "-100%";

  const links: { href: string; key: Parameters<typeof t>[0] }[] = [
    { href: "/", key: "nav_home" },
    { href: "/products", key: "nav_shop" },
    { href: "/products", key: "nav_collections" },
    { href: "/qr", key: "nav_qr" },
    { href: "/about", key: "nav_about" },
    { href: "/contact", key: "nav_contact" },
    { href: "/account", key: "nav_account" },
    { href: "/admin", key: "nav_admin" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            initial={{ x: fromSide }}
            animate={{ x: 0 }}
            exit={{ x: fromSide }}
            transition={{
              type: "tween",
              duration: 0.32,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="fixed inset-y-0 z-[61] flex w-[88%] max-w-sm flex-col bg-[var(--color-bg)] shadow-2xl lg:hidden"
            style={dir === "rtl" ? { right: 0 } : { left: 0 }}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <Logo />
              <button
                onClick={onClose}
                className="rounded-full p-2 transition hover:bg-[var(--color-bg-secondary)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-6">
              <ul className="space-y-1">
                {links.map((l, idx) => (
                  <motion.li
                    key={l.key}
                    initial={{ opacity: 0, x: dir === "rtl" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + idx * 0.04 }}
                  >
                    <Link
                      href={l.href}
                      onClick={onClose}
                      className="flex items-center justify-between rounded-md px-3 py-3 text-[15px] font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-primary-dark)]"
                    >
                      <span>{t(l.key)}</span>
                      <span className="text-[var(--color-primary)] opacity-0 transition group-hover:opacity-100">
                        →
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-[var(--color-border)] px-5 py-4">
              <LanguageSwitcher />
              <p className="mt-4 text-xs text-[var(--color-ink-faint)]">
                © {new Date().getFullYear()} Hekaya Jewellery
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
