"use client";

import { motion } from "framer-motion";
import { Heart, Star, Shield, QrCode } from "lucide-react";
import { useT } from "@/lib/useT";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FinalCtaBand } from "@/components/ui/FinalCtaBand";

export default function AboutPage() {
  const { t } = useT();

  const values = [
    { Icon: Heart, title: t("value_crafted"), desc: t("value_crafted_d") },
    { Icon: Star, title: t("value_quality"), desc: t("value_quality_d") },
    { Icon: Shield, title: t("value_safe"), desc: t("value_safe_d") },
    { Icon: QrCode, title: t("value_heirloom"), desc: t("value_heirloom_d") },
  ];

  return (
    <>
      {/* Dark hero — matches About screenshot 1 */}
      <section className="relative overflow-hidden bg-[#1a1508] py-24 sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(212,176,106,0.45), transparent 65%), radial-gradient(circle at 50% 100%, rgba(184,147,90,0.25), transparent 60%)",
          }}
        />
        <div className="container-h relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Eyebrow tone="light">{t("about_eyebrow")}</Eyebrow>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
              <span className="block text-white">{t("about_hero_l1")}</span>
              <span className="mt-1 block bg-gradient-to-r from-[#e6c98a] via-[#d4b06a] to-[#b8935a] bg-clip-text text-transparent">
                {t("about_hero_l2")}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              {t("about_hero_sub")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision narrative */}
      <section className="section-pad">
        <div className="container-h mx-auto max-w-3xl text-center">
          <p className="font-display text-2xl leading-relaxed text-[var(--color-ink-soft)] sm:text-3xl">
            {t("about_intro")}
          </p>
        </div>
      </section>

      {/* Our Values — light cream bg, 4 cards (matches screenshot 2) */}
      <section className="section-pad bg-[var(--color-bg-secondary)]">
        <div className="container-h">
          <div className="mb-12 text-center">
            <Eyebrow>{t("about_values_eyebrow")}</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              {t("about_values_title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.06 }}
                className="rounded-lg bg-white p-7 ring-1 ring-[var(--color-border)] transition hover:shadow-md"
              >
                <div className="grid h-12 w-12 place-items-center rounded-md ring-1 ring-[var(--color-primary)]/40">
                  <v.Icon className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA band (matches screenshot 3) */}
      <FinalCtaBand
        eyebrow={t("cta_about_eyebrow")}
        title={t("cta_about_title")}
        subtitle={t("cta_about_sub")}
        ctaLabel={t("cta_ready_btn")}
        ctaHref="/products"
      />
    </>
  );
}
