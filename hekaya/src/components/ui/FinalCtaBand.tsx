"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eyebrow } from "./Eyebrow";

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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#d4b06a] via-[#c9a96e] to-[#b8935a] py-20 sm:py-24">
      {/* Decorative radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 mix-blend-soft-light"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.45), transparent 60%)",
        }}
      />
      <div className="container-h relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Centered sparkle icon */}
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="mx-auto h-9 w-9 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
            fill="currentColor"
          >
            <path d="M12 2l1.9 6.4 6.4 1.9-6.4 1.9L12 18.6l-1.9-6.4L3.7 10.3l6.4-1.9L12 2z" />
          </svg>
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
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-[#1a1508] px-8 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-lg shadow-black/20 transition hover:bg-black"
          >
            {ctaLabel}
            <span aria-hidden>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
