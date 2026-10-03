"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { useAuth } from "@/lib/supabase/useAuth";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";

type HeaderProps = {
  /** Let the home hero sit behind the header at the top of the page. */
  overlay?: boolean;
};

export function Header({ overlay = false }: HeaderProps) {
  const { t } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const count = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.qty, 0),
  );
  const { profile } = useAuth();
  const isAdmin = profile?.isAdmin ?? false;
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    if (!overlay) {
      setScrolled(false);
      return;
    }

    const syncHeader = () => setScrolled(window.scrollY > 24);
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    return () => window.removeEventListener("scroll", syncHeader);
  }, [overlay]);

  const overHero = overlay && !scrolled;
  const actionClass = cn(
    "relative inline-grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-300",
    overHero
      ? "text-white hover:bg-white/12"
      : "text-[var(--color-ink)] hover:bg-[var(--color-bg-secondary)]",
  );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500",
          overHero
            ? "border-transparent bg-gradient-to-b from-[#170e09]/60 via-[#170e09]/22 to-transparent"
            : "border-[var(--color-border)]/70 bg-[#faf8f3]/92 shadow-[0_1px_12px_rgba(35,23,16,0.06)] backdrop-blur-xl",
        )}
      >
        <div className="mx-auto flex h-[72px] w-full max-w-[1480px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="flex min-w-0 items-center transition-opacity hover:opacity-85"
            aria-label={t("brandFull")}
          >
            <Logo color={overHero ? "light" : "gold"} />
          </Link>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              ref={searchButtonRef}
              type="button"
              onClick={() => setSearchOpen(true)}
              className={actionClass}
              aria-label={t("nav_search")}
              aria-controls="site-search-dialog"
              aria-expanded={searchOpen}
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>

            <Link
              href="/account"
              className={cn(actionClass, "hidden sm:inline-grid")}
              aria-label={t("nav_account")}
            >
              <User className="h-[19px] w-[19px]" strokeWidth={1.6} />
            </Link>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className={actionClass}
              aria-label={t("nav_cart")}
            >
              <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.6} />
              {count > 0 && (
                <span className="absolute end-0.5 top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                  {count}
                </span>
              )}
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              className={actionClass}
              aria-label={t("nav_menu")}
              aria-controls="site-navigation-drawer"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        isAdmin={isAdmin}
        returnFocusRef={menuButtonRef}
      />
      <SearchOverlay
        open={searchOpen}
        onClose={closeSearch}
        returnFocusRef={searchButtonRef}
      />

      {!overlay && <div className="h-[72px]" aria-hidden />}
    </>
  );
}
