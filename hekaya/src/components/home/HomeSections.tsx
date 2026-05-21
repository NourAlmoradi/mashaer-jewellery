"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, QrCode, Star } from "lucide-react";
import { useT } from "@/lib/useT";
import { useCollections } from "@/lib/useCollections";
import { useProducts } from "@/lib/useProducts";
import { ProductCard } from "@/components/products/ProductCard";
import { FinalCtaBand } from "@/components/ui/FinalCtaBand";
import { PlaceholderJewel } from "@/components/ui/PlaceholderJewel";
import { Logo } from "@/components/ui/Logo";

export function Hero() {
  const { t, locale, dir } = useT();
  return (
    <section className="relative -mt-[72px] flex min-h-[100svh] items-center overflow-hidden bg-[#1a1508] pt-[72px]">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c9a96e] opacity-[0.07] blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-[#c9a96e] opacity-[0.05] blur-[100px]" />
      </div>
      {/* Decorative circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute ltr:-left-16 rtl:-right-16 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full border border-[#c9a96e]/08" />
        <div className="absolute ltr:right-[15%] rtl:left-[15%] top-[30%] h-3 w-3 rounded-full bg-[#c9a96e]/30" />
        <div className="absolute ltr:right-[40%] rtl:left-[40%] bottom-[20%] h-2 w-2 rounded-full bg-[#c9a96e]/20" />
      </div>

      <div className="container-h relative grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20">
        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="mb-6 inline-block text-[18px] font-semibold uppercase tracking-[0.28em] text-[#c9a96e]">
            {t("hero_eyebrow")}
          </span>

          <h1 className="font-display font-semibold leading-[1.08]">
            <span className="block text-5xl text-white sm:text-6xl lg:text-7xl">
              {locale === "ar" ? "في كل قطعة " : "Feelings That Last,"}
            </span>
            <span
              className="block text-5xl sm:text-6xl lg:text-7xl"
              style={{
                background:
                  "linear-gradient(135deg,#e0c078 0%,#c9a96e 40%,#a07840 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {locale === "ar" ? " مشاعر تبقى" : "Every Piece"}
            </span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
            {t("hero_subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-none border border-[#c9a96e] bg-[#c9a96e] px-5 py-3.5 text-[15px] font-semibold uppercase tracking-[0.28em] text-white transition hover:bg-[#b8935a] hover:border-[#b8935a]"
            >
              {locale === "ar" ? "ابدأ التسوق" : "Start Shopping"}
              <ArrowRight
                className={`h-5.5 w-7.5 ${dir === "rtl" ? "flip-rtl" : ""}`}
              />
            </Link>
            <Link
              href="/qr"
              className="inline-flex items-center gap-2 rounded-none border border-white/20 px-7 py-3.5 text-[14px] font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-white/50 hover:text-white"
            >
              {locale === "ar" ? "اكتشف QR" : "Discover QR"}
            </Link>
          </div>

          {/* Floating QR badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-10 inline-flex items-center gap-3 rounded-md bg-[#c9a96e] px-7 py-3.5"
          >
            <QrCode className="h-5 w-5 text-white" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                {t("qr_eligible")}
              </p>
              <p className="text-[11px] text-white/80">
                {locale === "ar" ? "مضمّن مع كل قطعة" : "Included"}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Image side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative">
            {/* Circle image */}
            <div className="relative h-[340px] w-[340px] overflow-hidden rounded-full ring-1 ring-[#c9a96e]/20 sm:h-[420px] sm:w-[420px]">
              <div className="relative h-full w-full bg-gradient-to-br from-[#2a2010] to-[#1a1508]">
                <Image
                  src="/Logo.png"
                  alt="Mashaer Jewellery"
                  fill
                  priority
                  sizes="(min-width: 640px) 420px, 340px"
                  className="object-cover"
                />
              </div>
              {/* Shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
            </div>

            {/* Outer ring */}
            <div className="pointer-events-none absolute -inset-4 rounded-full border border-[#c9a96e]/15" />
            <div className="pointer-events-none absolute -inset-8 rounded-full border border-[#c9a96e]/08" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function TrustBadges() {
  const { t } = useT();
  const items = [
    { Icon: ShieldCheck, t: t("trust_quality"), d: t("trust_quality_d") },
    { Icon: QrCode, t: t("trust_qr"), d: t("trust_qr_d") },
  ];
  return (
    <section className="relative border-y border-[var(--color-border)] bg-gradient-to-b from-white to-[var(--color-bg-secondary)]">
      <div className="container-h py-14 sm:py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-14">
          {items.map(({ Icon, t: title, d }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <span className="relative grid h-20 w-20 place-items-center rounded-full bg-[var(--color-primary)]/8 ring-1 ring-[var(--color-primary)]/25 sm:h-24 sm:w-24">
                <span className="absolute inset-0 rounded-full bg-[var(--color-primary)]/5 blur-md" />
                <Icon
                  className="relative h-9 w-9 text-[var(--color-primary-dark)] sm:h-10 sm:w-10"
                  strokeWidth={1.4}
                />
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
                {title}
              </h3>
              <span className="mx-auto mt-3 h-px w-10 bg-[var(--color-primary)]/60" />
              <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
                {d}
              </p>
            </motion.div>
          ))}
          {/* Vertical gold divider — desktop only, slotted between the two columns */}
          <div
            aria-hidden
            className="pointer-events-none order-2 hidden h-full w-px self-stretch bg-gradient-to-b from-transparent via-[var(--color-primary)]/40 to-transparent md:block md:[grid-column:2] md:[grid-row:1]"
          />
        </div>
      </div>
    </section>
  );
}

export function CollectionShowcase() {
  const { t, tx } = useT();
  const collections = useCollections();
  return (
    <section className="section-pad">
      <div className="container-h">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="eyebrow">{t("collections_title")}</span>
          <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            {t("collections_title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--color-ink-muted)]">
            {t("collections_sub")}
          </p>
          <div className="divider-gold mx-auto w-20" />
        </motion.div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] lg:gap-7">
          {collections.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                href={`/products?collection=${c.id}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-lg ring-1 ring-[var(--color-border)] transition hover:shadow-[var(--shadow-lift)]"
              >
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image}
                    alt={tx(c.name)}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <PlaceholderJewel kind="gem" tone={c.tone} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="font-display text-2xl font-semibold">
                    {tx(c.name)}
                  </h3>
                  <p className="mt-1 text-sm text-white/80">
                    {tx(c.description)}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                    {t("view_all")} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProducts() {
  const { t } = useT();
  const all = useProducts();
  const featured = all.filter((p) => p.isActive).slice(0, 4);
  return (
    <section className="section-pad bg-[var(--color-bg-secondary)]">
      <div className="container-h">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col items-end justify-between gap-4 md:flex-row"
        >
          <div className="w-full text-center md:text-start">
            <span className="eyebrow">{t("featured_title")}</span>
            <h2 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
              {t("featured_title")}
            </h2>
            <p className="mt-3 max-w-xl text-[var(--color-ink-muted)]">
              {t("featured_sub")}
            </p>
          </div>
          <Link href="/products" className="btn btn-outline shrink-0">
            {t("view_all")} →
          </Link>
        </motion.div>

        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] lg:gap-7">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function QRBanner() {
  const { t, dir } = useT();
  return (
    <section className="section-pad relative overflow-hidden bg-[var(--color-bg-dark)] text-white">
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_30%_50%,#c9a96e33,transparent_50%),radial-gradient(circle_at_80%_30%,#c9a96e22,transparent_50%)]" />
      <div className="container-h relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: dir === "rtl" ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="eyebrow text-[var(--color-primary)]">
            {t("qr_section_eyebrow")}
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {t("qr_section_title")}
          </h2>
          <p className="mt-5 max-w-xl text-white/70">{t("qr_section_desc")}</p>

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
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--color-primary)] font-display text-sm font-semibold text-[var(--color-primary)]">
                  {s.n}
                </span>
                <div>
                  <h4 className="font-display text-lg font-semibold">{s.t}</h4>
                  <p className="text-sm text-white/60">{s.d}</p>
                </div>
              </motion.li>
            ))}
          </ol>

          <Link href="/qr" className="btn btn-gold btn-lg mt-8">
            {t("qr_section_cta")}
            <ArrowRight
              className={`h-4 w-4 ${dir === "rtl" ? "flip-rtl" : ""}`}
            />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto w-full max-w-sm"
        >
          {/* QR card mockup */}
          <div className="relative aspect-[3/4] rounded-2xl bg-gradient-to-br from-white to-[#f5efe2] p-8 shadow-2xl ring-1 ring-white/10">
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
                mashaer-jewellery.com/memory
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
  // Decorative QR-like grid (purely visual)
  const cells = Array.from({ length: 15 * 15 }, (_, i) => {
    // pseudo-random fixed pattern
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
      className="grid h-full w-full grid-cols-15 gap-px"
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

export function StoryStrip() {
  const { t } = useT();
  return (
    <section className="section-pad">
      <div className="container-h">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="eyebrow">Mashaer — مشاعر</span>
          <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            {t("story_title")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--color-ink-muted)]">
            “{t("story_text")}”
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="badge badge-soft">{t("value_meaning")}</span>
            <span className="badge badge-soft">{t("value_timeless")}</span>
            <span className="badge badge-soft">{t("value_quiet")}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const { t, locale } = useT();
  const items = [
    {
      ar: "اشتريت سلسلة بمناسبة ولادة بنتي. الـ QR كان أحلى مفاجأة — كأني سجّلت لحظة الولادة معها للأبد.",
      en: "I bought a necklace for my daughter's birth. The QR was the loveliest surprise — it felt like sealing that moment forever.",
      name: { ar: "ليلى م.", en: "Layla M." },
    },
    {
      ar: "الجودة فخمة بهدوء. التغليف بحد ذاته يستحق. أوصي فيها بشدة.",
      en: "Quietly luxurious. The packaging alone is worth it. Highly recommend.",
      name: { ar: "مريم ك.", en: "Maryam K." },
    },
    {
      ar: "هدية لأمي في عيد ميلادها… بكت لما شافت الذكرى المرفوعة بالـ QR. تجربة لا تنسى.",
      en: "A gift for my mother's birthday… she cried when she saw the QR memory I uploaded. Unforgettable.",
      name: { ar: "سارة ع.", en: "Sara A." },
    },
  ];
  return (
    <section className="section-pad bg-[var(--color-bg-secondary)]">
      <div className="container-h">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="eyebrow">{t("testimonials_title")}</span>
          <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            {t("testimonials_title")}
          </h2>
          <p className="mt-3 text-[var(--color-ink-muted)]">
            {t("testimonials_sub")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-lg bg-white p-7 shadow-sm ring-1 ring-[var(--color-border)]"
            >
              <div className="mb-4 flex gap-1 text-[var(--color-primary)]">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="font-display text-lg leading-relaxed text-[var(--color-ink-soft)]">
                “{locale === "ar" ? it.ar : it.en}”
              </blockquote>
              <figcaption className="mt-5 text-sm font-semibold text-[var(--color-primary-dark)]">
                — {it.name[locale]}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
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
