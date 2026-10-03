"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Pause,
  Play,
  QrCode,
  Shield,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useT } from "@/lib/useT";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./About.module.css";

export default function AboutPage() {
  const { t } = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const manuallyPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let visibleEnough = false;
    const playWhenAllowed = () => {
      if (
        visibleEnough &&
        !document.hidden &&
        !reduceMotion &&
        !manuallyPausedRef.current &&
        !video.ended
      ) {
        void video.play().catch(() => setIsPlaying(false));
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleEnough =
          entry.isIntersecting && entry.intersectionRatio >= 0.35;
        if (visibleEnough) {
          playWhenAllowed();
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        playWhenAllowed();
      }
    };

    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0;
      manuallyPausedRef.current = false;
      await video.play().catch(() => setIsPlaying(false));
      return;
    }

    manuallyPausedRef.current = true;
    video.pause();
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const values = [
    { Icon: Heart, title: t("value_crafted"), desc: t("value_crafted_d") },
    { Icon: Star, title: t("value_quality"), desc: t("value_quality_d") },
    { Icon: Shield, title: t("value_safe"), desc: t("value_safe_d") },
    { Icon: QrCode, title: t("value_heirloom"), desc: t("value_heirloom_d") },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroInner}>
          <Reveal className={styles.heroCopy}>
            <p className={styles.kicker}>
              <span aria-hidden>01</span>
              {t("about_eyebrow")}
            </p>
            <h1 id="about-title" className={styles.heroTitle}>
              <span>{t("about_hero_l1")}</span>
              <em>{t("about_hero_l2")}</em>
            </h1>
            <p className={styles.heroLead}>{t("about_hero_sub")}</p>
            <Link href="/products" className={styles.heroLink}>
              {t("cta_ready_btn")}
              <ArrowLeft className={styles.arrow} aria-hidden />
            </Link>
          </Reveal>

          <Reveal variant="scale" delay={0.08} className={styles.filmColumn}>
            <div className={styles.filmFrame}>
              <video
                ref={videoRef}
                className={styles.film}
                poster="/media/mashaer-story-poster.webp"
                preload="metadata"
                playsInline
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                aria-label={t("about_film_caption")}
              >
                <source src="/media/mashaer-story.mp4" type="video/mp4" />
                {t("about_film_caption")}
              </video>

              <div className={styles.filmControls}>
                <button
                  type="button"
                  className={styles.filmControl}
                  onClick={togglePlayback}
                  aria-label={
                    isPlaying ? t("about_film_pause") : t("about_film_play")
                  }
                >
                  {isPlaying ? <Pause aria-hidden /> : <Play aria-hidden />}
                </button>
                <button
                  type="button"
                  className={styles.filmControl}
                  onClick={toggleSound}
                  aria-label={
                    isMuted ? t("about_film_unmute") : t("about_film_mute")
                  }
                >
                  {isMuted ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
                </button>
              </div>
            </div>
            <div className={styles.filmNote}>
              <span aria-hidden />
              <p>{t("about_film_caption")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.manifesto} aria-labelledby="about-mission-title">
        <div className={styles.manifestoInner}>
          <Reveal className={styles.manifestoHeading}>
            <p className={styles.sectionKicker}>
              <span aria-hidden>02</span>
              {t("about_mission_eyebrow")}
            </p>
            <h2 id="about-mission-title" className={styles.sectionTitle}>
              {t("about_mission_title")}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className={styles.manifestoCopy}>{t("about_intro")}</p>
          </Reveal>
        </div>
      </section>

      <section className={styles.values} aria-labelledby="about-values-title">
        <div className={styles.valuesInner}>
          <Reveal className={styles.valuesHeader}>
            <p className={styles.sectionKicker}>
              <span aria-hidden>03</span>
              {t("about_values_eyebrow")}
            </p>
            <h2 id="about-values-title" className={styles.valuesTitle}>
              {t("about_values_title")}
            </h2>
          </Reveal>

          <div className={styles.valuesGrid}>
            {values.map((value, index) => (
              <Reveal
                key={value.title}
                delay={index * 0.05}
                className={styles.value}
              >
                <div className={styles.valueTop}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <value.Icon aria-hidden />
                </div>
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="about-cta-title">
        <div className={styles.ctaGlow} aria-hidden />
        <Reveal className={styles.ctaInner}>
          <p className={styles.ctaKicker}>{t("cta_about_eyebrow")}</p>
          <h2 id="about-cta-title">{t("cta_about_title")}</h2>
          <p>{t("cta_about_sub")}</p>
          <Link href="/products" className={styles.ctaLink}>
            {t("cta_ready_btn")}
            <ArrowLeft className={styles.arrow} aria-hidden />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
