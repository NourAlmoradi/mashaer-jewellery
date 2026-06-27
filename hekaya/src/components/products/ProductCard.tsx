"use client";

import { memo } from "react";
import Link from "next/link";
import { Heart, QrCode } from "lucide-react";
import type { Product } from "@/types";
import { useT } from "@/lib/useT";
import { formatPrice } from "@/lib/utils";
import {
  PlaceholderJewel,
  kindFromCategory,
} from "@/components/ui/PlaceholderJewel";
import { useCategory } from "@/lib/useCategories";
import { useWishlistToggle } from "@/lib/useWishlistToggle";
import { Reveal } from "@/components/ui/Reveal";

function ProductCardBase({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { tx, locale } = useT();
  const category = useCategory(product.categoryId);
  const { inWishlist, toggle } = useWishlistToggle(product.id);

  return (
    <Reveal
      delay={Math.min(index * 0.05, 0.4)}
      className="product-card group relative"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="product-card-img relative aspect-[4/5] overflow-hidden rounded-xl bg-[var(--color-blush-soft)] ring-1 ring-[var(--color-blush-deep)]/40">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name.en || product.name.ar}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PlaceholderJewel
              kind={kindFromCategory(product.categoryId)}
              tone={product.placeholderTone ?? "#f4e4dc"}
            />
          )}
          {/* badges */}
          <div className="absolute top-3 ltr:left-3 rtl:right-3 flex flex-col gap-1.5">
            {product.isQrEligible && (
              <span className="badge badge-gold inline-flex items-center gap-1">
                <QrCode className="h-3 w-3" />
                QR
              </span>
            )}
          </div>
          {/* wishlist (always visible on touch, fades in on hover for desktop) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle();
            }}
            className="absolute top-3 ltr:right-3 rtl:left-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`h-4 w-4 transition ${inWishlist ? "fill-rose-500 text-rose-500" : "text-[var(--color-ink)]"}`}
            />
          </button>
        </div>

        <div className="px-1 pt-4">
          {category && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary-dark)]">
              {tx(category.name)}
            </p>
          )}
          <h3 className="mt-1 line-clamp-1 font-display text-lg font-semibold text-[var(--color-ink)] transition group-hover:text-[var(--color-primary-dark)]">
            {tx(product.name)}
          </h3>
          {product.material && (
            <p className="mt-0.5 line-clamp-1 text-sm text-[var(--color-ink-muted)]">
              {tx(product.material)}
            </p>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-base font-semibold text-[var(--color-primary-dark)]">
              {formatPrice(product.price, locale)}
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export const ProductCard = memo(ProductCardBase);
