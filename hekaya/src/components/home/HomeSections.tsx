"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldCheck, QrCode, Sparkles } from "lucide-react";
import { useT } from "@/lib/useT";
import type { TKey } from "@/lib/i18n";
import { useCollections } from "@/lib/useCollections";
import { useProducts } from "@/lib/useProducts";
import { ProductCard } from "@/components/products/ProductCard";
import { FinalCtaBand } from "@/components/ui/FinalCtaBand";
import { PlaceholderJewel } from "@/components/ui/PlaceholderJewel";
import { FloralPattern } from "@/components/ui/FloralPattern";
import { Logo } from "@/components/ui/Logo";

/* =============================================================================
 *  HERO — auto-rotating editorial slider (3 slides, text + jewel)
 * ============================================================================*/

type HeroSlide = {
  eyebrowKey: TKey;
  titleAKey: TKey;
  titleBKey: TKey;
  subKey: TKey;
  primaryCta: { href: string; labelAr: string; labelEn: string };
  secondaryCta: { href: string; labelAr: string; labelEn: string };
  haloFrom: string;
  haloTo: string;
  image: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrowKey: "hero_slide1_eyebrow",
    titleAKey: "hero_slide1_title_a",
    titleBKey: "hero_slide1_title_b",
    subKey: "hero_slide1_sub",
    primaryCta: {
      href: "/products",
      labelAr: "ابدأ التسوق",
      labelEn: "Start Shopping",
    },
    secondaryCta: { href: "/qr", labelAr: "اكتشف QR", labelEn: "Discover QR" },
    haloFrom: "rgba(244,228,220,0.55)",
    haloTo: "rgba(201,169,110,0.28)",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80&auto=format&fit=crop",
  },
  {
    eyebrowKey: "hero_slide2_eyebrow",
    titleAKey: "hero_slide2_title_a",
    titleBKey: "hero_slide2_title_b",
    subKey: "hero_slide2_sub",
    primaryCta: { href: "/qr", labelAr: "كيف تعمل", labelEn: "How It Works" },
    secondaryCta: { href: "/products", labelAr: "تصفّحي", labelEn: "Browse" },
    haloFrom: "rgba(201,169,110,0.32)",
    haloTo: "rgba(244,228,220,0.45)",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=80&auto=format&fit=crop",
  },
  {
    eyebrowKey: "hero_slide3_eyebrow",
    titleAKey: "hero_slide3_title_a",
    titleBKey: "hero_slide3_title_b",
    subKey: "hero_slide3_sub",
    primaryCta: { href: "/products", labelAr: "اكتشفي", labelEn: "Explore" },
    secondaryCta: { href: "/about", labelAr: "قصتنا", labelEn: "Our Story" },
    haloFrom: "rgba(232,201,189,0.5)",
    haloTo: "rgba(201,169,110,0.25)",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80&auto=format&fit=crop",
  },
];

export function Hero() {
  const { t, locale, dir } = useT();
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % HERO_SLIDES.length),
    [],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length),
    [],
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!pausedRef.current) next();
    }, 6000);
    return () => window.clearInterval(id);
  }, [next]);

  const slide = HERO_SLIDES[index];

  return (
    <section
      className="relative -mt-[72px] overflow-hidden bg-[#1a1207] pt-[72px] text-white"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
    >
      {/* FULL-BLEED BACKGROUND IMAGE (crossfade + Ken-Burns zoom) */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={`bg-${index}`}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{
              opacity: { duration: 1.1, ease: [0.4, 0, 0.2, 1] },
              scale: { duration: 6.5, ease: "linear" },
            }}
            className="absolute inset-0"
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark gradient overlays for legibility */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[#1a1207]/40 via-[#1a1207]/55 to-[#1a1207]/85"
        />
        <div
          aria-hidden
          className="absolute inset-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-[#1a1207]/85 via-[#1a1207]/50 to-transparent"
        />
      </div>

      {/* Slide-keyed halo accents (static layers, CSS colour crossfade) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
      >
        <div
          className="absolute -left-20 top-1/3 h-[480px] w-[480px] rounded-full blur-[100px] transition-[background] duration-1000"
          style={{ background: slide.haloFrom }}
        />
        <div
          className="absolute -right-20 bottom-0 h-[420px] w-[420px] rounded-full blur-[100px] transition-[background] duration-1000"
          style={{ background: slide.haloTo }}
        />
      </div>

      {/* Prev / Next arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="group absolute top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/30 text-white/90 backdrop-blur-md transition-all hover:scale-110 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:shadow-[var(--shadow-gold)] ltr:left-4 rtl:right-4 sm:h-12 sm:w-12 md:ltr:left-8 md:rtl:right-8"
      >
        <ArrowRight
          className={`h-5 w-5 transition-transform group-hover:-translate-x-0.5 ${dir === "rtl" ? "" : "rotate-180"}`}
        />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="group absolute top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/30 text-white/90 backdrop-blur-md transition-all hover:scale-110 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:shadow-[var(--shadow-gold)] ltr:right-4 rtl:left-4 sm:h-12 sm:w-12 md:ltr:right-8 md:rtl:left-8"
      >
        <ArrowRight
          className={`h-5 w-5 transition-transform group-hover:translate-x-0.5 ${dir === "rtl" ? "rotate-180" : ""}`}
        />
      </button>

      {/* CONTENT */}
      <div className="container-h relative flex min-h-[calc(100svh-72px)] items-center py-16 sm:py-20">
        <div className="relative w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${index}`}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
            >
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.32em] text-[var(--color-primary)]">
                <Sparkles className="h-3.5 w-3.5" />
                {t(slide.eyebrowKey)}
              </span>

              <h1 className="mt-5 font-display font-semibold">
                <span className="fs-display-xl block text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)]">
                  {t(slide.titleAKey)}
                </span>
                <span
                  className="fs-display-xl block drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)]"
                  style={{
                    background:
                      "linear-gradient(135deg,#f4e4dc 0%,#e0c078 35%,#c9a96e 70%,#a8853f 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {t(slide.titleBKey)}
                </span>
              </h1>

              <p className="fs-body-lg mt-5 max-w-lg text-white/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
                {t(slide.subKey)}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={slide.primaryCta.href}
                  className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--color-primary)] px-7 text-[13px] font-semibold uppercase tracking-[0.22em] text-white shadow-[var(--shadow-gold)] transition hover:bg-[var(--color-primary-dark)]"
                >
                  {locale === "ar"
                    ? slide.primaryCta.labelAr
                    : slide.primaryCta.labelEn}
                  <ArrowRight
                    className={`h-4 w-4 transition group-hover:translate-x-1 ${dir === "rtl" ? "flip-rtl group-hover:-translate-x-1" : ""}`}
                  />
                </Link>
                <Link
                  href={slide.secondaryCta.href}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 text-[13px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur transition hover:border-[var(--color-primary)] hover:bg-white/10 hover:text-white"
                >
                  {locale === "ar"
                    ? slide.secondaryCta.labelAr
                    : slide.secondaryCta.labelEn}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* SLIDE CONTROLS (bottom bar) */}
      <div className="absolute inset-x-0 bottom-6 z-10 sm:bottom-10">
        <div className="container-h flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group relative h-1.5 w-12 overflow-hidden rounded-full bg-white/20 sm:w-16"
              >
                <span
                  key={`fill-${index}-${i}`}
                  className={`absolute inset-y-0 ltr:left-0 rtl:right-0 bg-[var(--color-primary)] ${
                    i === index
                      ? "animate-[heroProgress_6s_linear_forwards]"
                      : i < index
                        ? "w-full"
                        : "w-0"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/70">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(HERO_SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}

/* =============================================================================
 *  TRUST BADGES — blush wash, pills row + 2 quality cards
 * ============================================================================*/

export function TrustBadges() {
  const { t } = useT();
  const items = [
    { Icon: ShieldCheck, t: t("trust_quality"), d: t("trust_quality_d") },
    { Icon: QrCode, t: t("trust_qr"), d: t("trust_qr_d") },
  ];
  return (
    <section className="bg-blush-wash relative overflow-hidden border-y border-[var(--color-border)]">
      <FloralPattern
        className="absolute -top-16 ltr:-left-20 rtl:-right-20 h-[420px] w-[420px]"
        opacity={0.07}
      />
      <FloralPattern
        className="absolute -bottom-24 ltr:-right-24 rtl:-left-24 h-[480px] w-[480px]"
        color="#c98a7a"
        opacity={0.06}
      />
      <div className="container-h relative py-14 sm:py-20">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {items.map(({ Icon, t: title, d }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="group relative flex items-start gap-5 rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-[var(--color-border)] transition hover:shadow-[var(--shadow-lift)] sm:p-8"
            >
              {/* Dual ring icon */}
              <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[var(--color-blush-soft)] ring-1 ring-[var(--color-blush-deep)]/60 sm:h-20 sm:w-20">
                <span className="absolute inset-1.5 rounded-full ring-1 ring-[var(--color-primary)]/40" />
                <Icon
                  className="relative h-7 w-7 text-[var(--color-primary-dark)] sm:h-8 sm:w-8"
                  strokeWidth={1.5}
                />
              </span>
              <div className="min-w-0">
                <h3 className="fs-display-md font-display font-semibold text-[var(--color-ink)]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {d}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =============================================================================
 *  COLLECTIONS — 4-up grid, warm cards
 * ============================================================================*/

export function CollectionShowcase() {
  const { t, tx, locale, dir } = useT();
  const collections = useCollections();
  const products = useProducts();

  // Editorial asymmetric layout (lg+): first card large, others varied
  const layout = [
    "lg:col-span-2 lg:row-span-2", // hero card (square)
    "lg:col-span-2 lg:row-span-1", // wide top-right
    "lg:col-span-1 lg:row-span-1", // small bottom-right left
    "lg:col-span-1 lg:row-span-1", // small bottom-right right
  ];

  const inViewOnce = { once: true, margin: "-80px" } as const;

  return (
    <section className="section-fluid relative overflow-hidden bg-gradient-to-b from-[var(--color-cream)] via-white to-[var(--color-cream)]">
      <FloralPattern
        className="absolute top-10 ltr:right-0 rtl:left-0 h-[360px] w-[360px]"
        opacity={0.05}
      />
      <FloralPattern
        className="absolute bottom-10 ltr:left-0 rtl:right-0 h-[300px] w-[300px]"
        color="#c98a7a"
        opacity={0.04}
      />

      <div className="container-h relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.6 }}
          className="mb-14 flex flex-col items-center gap-3 text-center sm:mb-16"
        >
          <span className="eyebrow">{t("collections_title")}</span>
          <h2 className="fs-display-lg font-display font-semibold">
            {t("collections_title")}
          </h2>
          <div className="divider-gold w-20" />
          <p className="max-w-xl text-[var(--color-ink-muted)]">
            {t("collections_sub")}
          </p>
        </motion.div>

        {/* Editorial grid */}
        <div className="mx-auto grid max-w-7xl auto-rows-[260px] grid-cols-1 gap-5 sm:grid-cols-2 sm:auto-rows-[280px] sm:gap-6 lg:grid-cols-4 lg:auto-rows-[280px]">
          {collections.map((c, i) => {
            const count = products.filter(
              (p) => p.collection === c.id && p.isActive,
            ).length;
            const isFeatured = i === 0;
            const baseDelay = i * 0.12;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={inViewOnce}
                transition={{
                  duration: 0.8,
                  delay: baseDelay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group ${layout[i] ?? ""}`}
              >
                <Link
                  href={`/products?collection=${c.id}`}
                  className="relative block h-full w-full overflow-hidden rounded-3xl shadow-[0_10px_40px_-18px_rgba(26,18,7,0.35)] ring-1 ring-[var(--color-blush-deep)]/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_-15px_rgba(168,133,63,0.45)] hover:ring-[var(--color-primary)]/60"
                >
                  {/* Image — slow Ken-Burns zoom on scroll-in */}
                  <motion.div
                    initial={{ scale: 1.18 }}
                    whileInView={{ scale: 1 }}
                    viewport={inViewOnce}
                    transition={{
                      duration: 2.2,
                      delay: baseDelay,
                      ease: "easeOut",
                    }}
                    className="absolute inset-0"
                  >
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt={tx(c.name)}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PlaceholderJewel kind="gem" tone={c.tone} />
                    )}
                  </motion.div>

                  {/* Dark gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1207]/90 via-[#1a1207]/30 to-transparent" />
                  {/* Subtle gold glow at top */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--color-primary)]/15 to-transparent opacity-80" />

                  {/* Index numeral */}
                  <motion.span
                    initial={{ opacity: 0, x: dir === "rtl" ? 10 : -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={inViewOnce}
                    transition={{ duration: 0.6, delay: baseDelay + 0.25 }}
                    className="absolute top-5 font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-white/75 ltr:left-6 rtl:right-6"
                  >
                    {String(i + 1).padStart(2, "0")} —
                  </motion.span>

                  {/* Featured / count badge */}
                  <motion.span
                    initial={{ opacity: 0, y: -8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={inViewOnce}
                    transition={{ duration: 0.5, delay: baseDelay + 0.35 }}
                    className={`absolute top-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ltr:right-6 rtl:left-6 ${
                      isFeatured
                        ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-gold)]"
                        : "bg-white/95 text-[var(--color-ink)] backdrop-blur"
                    }`}
                  >
                    <Sparkles
                      className={`h-3 w-3 ${isFeatured ? "" : "text-[var(--color-primary)]"}`}
                    />
                    {isFeatured
                      ? locale === "ar"
                        ? "مميز"
                        : "Featured"
                      : count}
                  </motion.span>

                  {/* Gold corner brackets — animate in when in view */}
                  {[
                    "left-3 top-3 border-l-2 border-t-2",
                    "right-3 top-3 border-r-2 border-t-2",
                    "bottom-3 left-3 border-b-2 border-l-2",
                    "bottom-3 right-3 border-b-2 border-r-2",
                  ].map((cls, idx) => (
                    <span
                      key={idx}
                      aria-hidden
                      className={`pointer-events-none absolute h-7 w-7 border-[var(--color-primary)] opacity-90 ${cls}`}
                    />
                  ))}

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                    <motion.h3
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={inViewOnce}
                      transition={{ duration: 0.6, delay: baseDelay + 0.3 }}
                      className={`font-display font-semibold leading-tight ${
                        isFeatured
                          ? "text-2xl sm:text-3xl lg:text-4xl"
                          : "text-xl sm:text-2xl"
                      }`}
                    >
                      {tx(c.name)}
                    </motion.h3>

                    {/* Gold underline grows when in view */}
                    <motion.span
                      aria-hidden
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={inViewOnce}
                      transition={{
                        duration: 0.9,
                        delay: baseDelay + 0.5,
                        ease: "easeOut",
                      }}
                      className="mt-3 block h-[2px] w-16 origin-left bg-[var(--color-primary)] rtl:origin-right sm:w-24"
                    />

                    {/* Description fades in */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={inViewOnce}
                      transition={{ duration: 0.7, delay: baseDelay + 0.55 }}
                      className="mt-3 line-clamp-2 max-w-md text-sm text-white/85"
                    >
                      {tx(c.description)}
                    </motion.p>

                    {/* CTA pill */}
                    <motion.span
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={inViewOnce}
                      transition={{ duration: 0.6, delay: baseDelay + 0.7 }}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-[var(--shadow-gold)] transition group-hover:bg-[var(--color-primary-dark)]"
                    >
                      {t("view_all")}
                      <ArrowRight
                        className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${dir === "rtl" ? "rotate-180 group-hover:-translate-x-0.5" : ""}`}
                      />
                    </motion.span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inViewOnce}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/40 bg-white/70 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink)] backdrop-blur transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:shadow-[var(--shadow-gold)]"
          >
            {t("view_all")}
            <ArrowRight
              className={`h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`}
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* =============================================================================
 *  FEATURED — soft cream-blush gradient section
 * ============================================================================*/

export function FeaturedProducts() {
  const { t } = useT();
  const all = useProducts();
  const featured = all.filter((p) => p.isActive).slice(0, 4);
  return (
    <section className="bg-cream-diagonal section-fluid relative overflow-hidden">
      <FloralPattern
        className="absolute -top-20 ltr:-left-20 rtl:-right-20 h-[460px] w-[460px]"
        opacity={0.06}
      />
      <FloralPattern
        className="absolute -bottom-20 ltr:-right-20 rtl:-left-20 h-[420px] w-[420px]"
        color="#c98a7a"
        opacity={0.05}
      />
      <div className="container-h relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="w-full text-center sm:text-start">
            <span className="eyebrow">{t("featured_title")}</span>
            <h2 className="fs-display-lg mt-2 font-display font-semibold">
              {t("featured_title")}
            </h2>
            <p className="mt-3 max-w-xl text-[var(--color-ink-muted)]">
              {t("featured_sub")}
            </p>
          </div>
          <Link
            href="/products"
            className="btn btn-outline-gold inline-flex shrink-0 self-center sm:self-end"
          >
            {t("view_all")} →
          </Link>
        </motion.div>

        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4 lg:gap-7">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* =============================================================================
 *  QR BANNER — dark warm espresso with rose + gold halos
 * ============================================================================*/

export function QRBanner() {
  const { t, dir } = useT();
  return (
    <section className="section-fluid relative overflow-hidden bg-[#1f1610] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_25%_45%,rgba(201,169,110,0.22),transparent_55%),radial-gradient(circle_at_80%_25%,rgba(201,138,122,0.18),transparent_55%)]" />
      <div className="container-h relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <motion.div
          initial={{ opacity: 0, x: dir === "rtl" ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="eyebrow text-[var(--color-primary)]">
            {t("qr_section_eyebrow")}
          </span>
          <h2 className="fs-display-lg mt-3 font-display font-semibold leading-tight">
            {t("qr_section_title")}
          </h2>
          <p className="fs-body-lg mt-5 max-w-xl text-white/70">
            {t("qr_section_desc")}
          </p>

          <ol className="mt-8 space-y-5">
            {[
              { n: "01", t: t("qr_step1_t"), d: t("qr_step1_d") },
              { n: "02", t: t("qr_step2_t"), d: t("qr_step2_d") },
              { n: "03", t: t("qr_step3_t"), d: t("qr_step3_d") },
            ].map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, x: dir === "rtl" ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] font-display text-sm font-bold text-[#1f1610] sm:h-13 sm:w-13">
                  {s.n}
                </span>
                <div>
                  <h4 className="font-display text-lg font-semibold">{s.t}</h4>
                  <p className="text-sm text-white/60">{s.d}</p>
                </div>
              </motion.li>
            ))}
          </ol>

          <Link
            href="/qr"
            className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] px-7 text-[13px] font-semibold uppercase tracking-[0.22em] text-[#1f1610] shadow-[var(--shadow-gold)] transition hover:brightness-110"
          >
            {t("qr_section_cta")}
            <ArrowRight
              className={`h-4 w-4 ${dir === "rtl" ? "flip-rtl" : ""}`}
            />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto w-full max-w-[300px] sm:max-w-sm"
        >
          <div className="relative aspect-[3/4] rotate-0 rounded-2xl bg-gradient-to-br from-white to-[#f5efe2] p-8 shadow-2xl ring-1 ring-white/10 transition-transform duration-500 lg:rotate-[-2deg] lg:hover:rotate-0">
            <div className="flex flex-col items-center text-center text-[var(--color-ink)]">
              <Logo color="dark" variant="mark" className="h-12 w-12" />
              <p className="mt-3 font-display text-sm tracking-wider">
                MASHAER
              </p>
              <div className="my-6 h-44 w-44 rounded-md bg-white p-3 shadow-inner ring-1 ring-[var(--color-border)]">
                <FakeQR />
              </div>
              <p className="font-display text-lg font-semibold">
                {t("memory_title")}
              </p>
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                mashaerjewellery.com/memory
              </p>
              <div className="divider-gold w-12" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-primary-dark)]">
                Scan • Share • Keep
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FakeQR() {
  const cells = Array.from({ length: 15 * 15 }, (_, i) => {
    const x = i % 15;
    const y = Math.floor(i / 15);
    const corner =
      (x < 3 && y < 3) ||
      (x > 11 && y < 3) ||
      (x < 3 && y > 11) ||
      (x === 1 && y === 1) ||
      (x === 13 && y === 1) ||
      (x === 1 && y === 13);
    const fill = corner || (x * 7 + y * 13) % 5 < 2;
    return fill;
  });
  return (
    <div
      className="grid h-full w-full gap-px"
      style={{ gridTemplateColumns: "repeat(15, 1fr)" }}
    >
      {cells.map((on, i) => (
        <div
          key={i}
          className={on ? "bg-[var(--color-ink)]" : "bg-transparent"}
        />
      ))}
    </div>
  );
}

/* =============================================================================
 *  STORY STRIP — blush wash, editorial quote
 * ============================================================================*/

export function StoryStrip() {
  const { t } = useT();
  return (
    <section className="bg-blush-wash section-fluid relative overflow-hidden">
      <FloralPattern
        className="absolute top-1/2 left-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2"
        opacity={0.05}
      />
      <div className="container-h relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="divider-rose mx-auto">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em]">
              Mashaer — مشاعر
            </span>
          </div>
          <h2 className="fs-display-lg mt-3 font-display font-semibold">
            {t("story_title")}
          </h2>
          <div className="relative mt-6">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 font-display text-6xl leading-none text-[var(--color-primary)]/40"
            >
              “
            </span>
            <p className="fs-body-lg relative italic text-[var(--color-ink-soft)]">
              {t("story_text")}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="badge btn-outline-rose !rounded-full !border !px-3 !py-1 !text-[11px]">
              {t("value_meaning")}
            </span>
            <span className="badge btn-outline-rose !rounded-full !border !px-3 !py-1 !text-[11px]">
              {t("value_timeless")}
            </span>
            <span className="badge btn-outline-rose !rounded-full !border !px-3 !py-1 !text-[11px]">
              {t("value_quiet")}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* =============================================================================
 *  FINAL CTA — wrapper around shared band
 * ============================================================================*/

export function HomeFinalCta() {
  const { t } = useT();
  return (
    <FinalCtaBand
      eyebrow={t("cta_ready_eyebrow")}
      title={t("cta_ready_title")}
      subtitle={t("cta_ready_sub")}
      ctaLabel={t("cta_ready_btn")}
      ctaHref="/products"
    />
  );
}
