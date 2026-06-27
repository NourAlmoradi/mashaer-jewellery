"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/useT";
import { useCollections } from "@/lib/useCollections";
import { useProducts } from "@/lib/useProducts";
import { PlaceholderJewel } from "@/components/ui/PlaceholderJewel";
import { FloralPattern } from "@/components/ui/FloralPattern";
import { Reveal } from "@/components/ui/Reveal";

export function CollectionsGallery() {
  const { t, tx, dir } = useT();
  const collections = useCollections();
  const products = useProducts();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[var(--color-cream)] via-white to-[var(--color-cream)]">
      <FloralPattern
        className="absolute top-10 ltr:right-0 rtl:left-0 h-[360px] w-[360px]"
        opacity={0.05}
      />
      <FloralPattern
        className="absolute bottom-10 ltr:left-0 rtl:right-0 h-[300px] w-[300px]"
        color="#c98a7a"
        opacity={0.04}
      />

      <div className="container-h relative py-14 lg:py-20">
        {/* Page header */}
        <Reveal className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center sm:mb-16">
          <span className="eyebrow">{t("collections_page_eyebrow")}</span>
          <h1 className="fs-display-lg font-display font-semibold">
            {t("collections_page_title")}
          </h1>
          <div className="divider-gold w-20" />
          <p className="text-[var(--color-ink-muted)]">
            {t("collections_page_sub")}
          </p>
        </Reveal>

        {collections.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center">
            <p className="font-display text-xl font-semibold">
              {t("no_collections")}
            </p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c, i) => {
              const count = products.filter(
                (p) => p.collection === c.id && p.isActive,
              ).length;
              const baseDelay = i * 0.08;
              return (
                <Reveal key={c.id} delay={baseDelay} className="group">
                  <Link
                    href={`/products?collection=${c.id}`}
                    className="relative block h-[420px] w-full overflow-hidden rounded-3xl shadow-[0_10px_40px_-18px_rgba(26,18,7,0.35)] ring-1 ring-[var(--color-blush-deep)]/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_-15px_rgba(168,133,63,0.45)] hover:ring-[var(--color-primary)]/60"
                  >
                    {/* Image — slow CSS zoom-in (decorative, SSR-safe) */}
                    <div
                      className="kenburns-in absolute inset-0"
                      style={
                        { "--reveal-delay": `${baseDelay}s` } as CSSProperties
                      }
                    >
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.image}
                          alt={tx(c.name)}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <PlaceholderJewel kind="gem" tone={c.tone} />
                      )}
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1207]/92 via-[#1a1207]/40 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--color-primary)]/15 to-transparent opacity-80" />

                    {/* Index numeral */}
                    <span
                      className="absolute top-5 font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-white/75 ltr:left-6 rtl:right-6"
                      style={{
                        direction: dir === "rtl" ? "rtl" : "ltr",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Pieces count pill */}
                    <span className="absolute top-5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md ltr:right-6 rtl:left-6">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                      {count} {t("collection_pieces")}
                    </span>

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                      <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                        {tx(c.name)}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-white/80">
                        {tx(c.description)}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] transition group-hover:gap-3">
                        {t("view_collection")}
                        <ArrowRight
                          className={`h-4 w-4 transition ${
                            dir === "rtl" ? "rotate-180" : ""
                          }`}
                        />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
