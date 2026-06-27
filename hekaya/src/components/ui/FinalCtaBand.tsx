"use client";

import Link from "next/link";
import { Eyebrow } from "./Eyebrow";
import { FloralPattern } from "./FloralPattern";
import { Reveal } from "./Reveal";

/**
 * Reusable gold-gradient call-to-action band.
 * Used at the bottom of the Home page and the About page.
 */
export function FinalCtaBand({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <section className="safe-pb relative overflow-hidden bg-gradient-to-br from-[#d8b07a] via-[#c9a96e] to-[#c98a7a] py-20 sm:py-24">
      {/* Decorative radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.45), transparent 60%)",
        }}
      />
      <div aria-hidden className="noise-overlay absolute inset-0" />
      {/* Floral ornaments */}
      <FloralPattern
        className="absolute -top-20 ltr:-left-24 rtl:-right-24 h-[480px] w-[480px]"
        color="#ffffff"
        opacity={0.12}
      />
      <FloralPattern
        className="absolute -bottom-28 ltr:-right-24 rtl:-left-24 h-[520px] w-[520px]"
        color="#ffffff"
        opacity={0.1}
      />
      <div className="container-h relative text-center">
        <Reveal>
          {eyebrow && (
            <div className="mt-4">
              <Eyebrow tone="light">{eyebrow}</Eyebrow>
            </div>
          )}
          <h2 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
              {subtitle}
            </p>
          )}
          <Link
            href={ctaHref}
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1a1207] px-8 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary-light)] shadow-lg shadow-black/20 transition hover:bg-black hover:text-white"
          >
            {ctaLabel}
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
