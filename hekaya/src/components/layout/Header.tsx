"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingBag, User } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useT } from "@/lib/useT";
import { useCartStore } from "@/stores/cart.store";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const { t } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-5 bg-white/85 shadow-[0_1px_0_rgba(0,0,0,0.05)] backdrop-blur-xl">
        <div className="container-h flex h-[72px] items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-full p-2 text-[var(--color-ink)] transition hover:bg-[var(--color-bg-secondary)] lg:hidden"
            aria-label={t("nav_menu")}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 transition hover:opacity-85"
            aria-label="Mashaer"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] font-display text-base font-bold text-white shadow-[var(--shadow-soft)] ring-1 ring-[var(--color-primary-dark)]/40">
              M
            </span>
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            <NavLink href="/">{t("nav_home")}</NavLink>
            <NavLink href="/products">{t("nav_shop")}</NavLink>
            <NavLink href="/collections">{t("nav_collections")}</NavLink>
            <NavLink href="/qr">{t("nav_qr")}</NavLink>
            <NavLink href="/about">{t("nav_about")}</NavLink>
            <NavLink href="/contact">{t("nav_contact")}</NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <Link
              href="/account"
              className="hidden rounded-full p-2 text-[var(--color-ink)] transition hover:bg-[var(--color-bg-secondary)] sm:inline-flex"
              aria-label={t("nav_account")}
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2 text-[var(--color-ink)] transition hover:bg-[var(--color-bg-secondary)]"
              aria-label={t("nav_cart")}
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 ltr:-right-1 rtl:-left-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white shadow">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="h-[72px]" aria-hidden />
    </>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-block py-1 text-[var(--color-ink-soft)] transition hover:text-[var(--color-primary-dark)]"
    >
      {children}
      <span className="absolute inset-x-0 -bottom-0.5 h-px origin-center scale-x-0 bg-[var(--color-primary)] transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}
