"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Diamond, QrCode, LockKeyhole } from "lucide-react";
import { useT } from "@/lib/useT";
import { useCollections } from "@/lib/useCollections";
import { useProducts } from "@/lib/useProducts";
import { ProductCard } from "@/components/products/ProductCard";
import { Logo } from "@/components/ui/Logo";
import necklaces from "../../../public/necklaces.png";
import bracelets from "../../../public/bracelets.png";
import earrings from "../../../public/earrings.png";
import packaging from "../../../public/page.png";
import styles from "./HomeSections.module.css";
import brandDesktop from "../../../public/hero/brand-desktop.webp";
import brandMobile from "../../../public/hero/brand-mobile.webp";
import giftingDesktop from "../../../public/hero/gifting-desktop.webp";
import giftingMobile from "../../../public/hero/gifting-mobile.webp";
import firstsDesktop from "../../../public/hero/firsts-desktop.webp";
import firstsMobile from "../../../public/hero/firsts-mobile.webp";

const HERO_SLIDES = [
  {
    desktop: brandDesktop,
    mobile: brandMobile,
    alt: "home_hero_image1_alt",
    titleA: "home_hero1_title_a",
    titleB: "home_hero1_title_b",
    description: "home_hero1_desc",
    label: "home_slide1_label",
    primary: { href: "/products", key: "home_shop" },
    secondary: { href: "/qr", key: "home_discover_memory" },
  },
  {
    desktop: giftingDesktop,
    mobile: giftingMobile,
    alt: "home_hero_image2_alt",
    titleA: "home_hero2_title_a",
    titleB: "home_hero2_title_b",
    description: "home_hero2_desc",
    label: "home_slide2_label",
    primary: { href: "/qr", key: "home_discover_memory" },
    secondary: { href: "/products", key: "home_shop" },
  },
  {
    desktop: firstsDesktop,
    mobile: firstsMobile,
    alt: "home_hero_image3_alt",
    titleA: "home_hero3_title_a",
    titleB: "home_hero3_title_b",
    description: "home_hero3_desc",
    label: "home_slide3_label",
    primary: { href: "/products", key: "home_shop" },
    secondary: { href: "/about", key: "home_about" },
  },
] as const;

const COLLECTION_IMAGES = [necklaces, bracelets, earrings];
const HERO_SLIDE_DURATION_MS = 7000;
// Matches the .heroMedia opacity transition in HomeSections.module.css.
const HERO_FADE_MS = 850;

function DirectionArrow() {
  return <ArrowRight className={styles.arrow} size={18} strokeWidth={1.5} aria-hidden />;
}

export function Hero() {
  const { t } = useT();
  const heroRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [inView, setInView] = useState(true);
  const [imageStates, setImageStates] = useState<Array<"loading" | "ready" | "error">>(["loading", "loading", "loading"]);
  const [visibleImage, setVisibleImage] = useState(0);
  const [fadingImage, setFadingImage] = useState<number | null>(null);
  const nextIndex = [1, 2]
    .map((offset) => (index + offset) % HERO_SLIDES.length)
    .find((candidate) => imageStates[candidate] !== "error") ?? index;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setMotionAllowed(!media.matches);
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncMotion();
    syncVisibility();
    media.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.15),
      { threshold: [0, 0.15], rootMargin: "-72px 0px 0px" },
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => {
      media.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (imageStates[index] === "ready" && visibleImage !== index) {
      setFadingImage(visibleImage);
      setVisibleImage(index);
    } else if (imageStates[index] === "error" && nextIndex !== index) setIndex(nextIndex);
  }, [index, imageStates, nextIndex, visibleImage]);

  useEffect(() => {
    if (fadingImage === null) return;
    const timer = window.setTimeout(() => setFadingImage(null), HERO_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [fadingImage]);

  const running = motionAllowed && pageVisible && inView
    && nextIndex !== index && imageStates[index] === "ready" && imageStates[nextIndex] === "ready";

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      aria-labelledby="home-hero-title"
    >
      {HERO_SLIDES.map((slide, i) => {
        // Keep the active scene and the next scene ready without fetching the
        // entire campaign before a visitor reaches those slides.
        if (i !== index && i !== nextIndex && i !== visibleImage && i !== fadingImage) return null;

        const imageQuality = i === 2 ? 92 : 90;
        const { props: mobileImage } = getImageProps({
          src: slide.mobile,
          alt: "",
          fill: true,
          sizes: "100vw",
          quality: imageQuality,
        });

        return (
          <div key={slide.desktop.src} className={styles.heroMedia} data-scene={i} data-active={visibleImage === i && imageStates[i] !== "error"} aria-hidden={index !== i}>
            <picture className={styles.heroPicture}>
              <source
                media="(orientation: portrait)"
                srcSet={mobileImage.srcSet}
                sizes={mobileImage.sizes}
              />
              <Image
                src={slide.desktop}
                alt={t(slide.alt)}
                fill
                sizes="100vw"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                quality={imageQuality}
                className={styles.heroImage}
                onLoad={() => setImageStates((images) => images.map((state, n) => n === i ? "ready" : state))}
                onError={() => setImageStates((images) => images.map((state, n) => n === i ? "error" : state))}
              />
            </picture>
          </div>
        );
      })}
      <div className={styles.heroShade} aria-hidden />
      <div className={styles.heroInner}>
        <div className={styles.heroCopy} aria-live={running ? "off" : "polite"} aria-atomic="true">
          {HERO_SLIDES.map((slide, i) => {
            const Heading = index === i ? "h1" : "h2";
            return (
              <div key={slide.label} className={styles.heroPanel} data-active={index === i} aria-hidden={index !== i} inert={index !== i}>
                <p className={styles.eyebrow}>{t("home_hero_eyebrow")}</p>
                <Heading id={index === i ? "home-hero-title" : undefined} className={styles.heroTitle}>
                  <span>{t(slide.titleA)}</span>
                  <span>{t(slide.titleB)}</span>
                </Heading>
                <p className={styles.heroDescription}>{t(slide.description)}</p>
                <div className={styles.actions}>
                  <Link href={slide.primary.href} className={styles.primaryButton}>
                    {t(slide.primary.key)} <DirectionArrow />
                  </Link>
                  <Link href={slide.secondary.href} className={styles.lightLink}>
                    {t(slide.secondary.key)}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.heroNavigation} role="group" aria-label={t("home_slider_navigation")}>
          {HERO_SLIDES.map((item, i) => (
            <button
              type="button"
              key={item.label}
              disabled={imageStates[i] === "error"}
              onClick={() => { setIndex(i); setCycle((value) => value + 1); }}
              aria-pressed={index === i}
              aria-controls="home-hero-title"
              className={styles.slideButton}
            >
              <span className={styles.slideTrack} aria-hidden>
                {index === i && (
                  <span
                    key={`${index}-${cycle}`}
                    className={styles.slideProgress}
                    style={{ animationDuration: `${HERO_SLIDE_DURATION_MS}ms`, animationPlayState: running ? "running" : "paused" }}
                    onAnimationEnd={() => setIndex(nextIndex)}
                  />
                )}
              </span>
              <span className={styles.slideNumber} aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.slideLabel}>{t(item.label)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustBadges() {
  const { t } = useT();
  return (
    <section className={styles.trust}>
      <div className={styles.trustInner}>
        <div className={styles.trustItem}>
          <Diamond size={28} strokeWidth={1.25} aria-hidden />
          <div>
            <h2>{t("home_quality_title")}</h2>
            <p>{t("home_quality_desc")}</p>
          </div>
        </div>
        <div className={styles.trustItem}>
          <QrCode size={28} strokeWidth={1.25} aria-hidden />
          <div>
            <h2>{t("home_memory_title")}</h2>
            <p>{t("home_memory_desc")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CollectionShowcase() {
  const { t, tx } = useT();
  const collections = useCollections();
  const products = useProducts();

  if (!collections.length) return null;

  return (
    <section className={styles.catalogSection} aria-labelledby="home-collections-title">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>{t("home_collections_eyebrow")}</p>
            <h2 id="home-collections-title" className={styles.title}>{t("home_collections_title")}</h2>
            <p className={styles.description}>{t("home_collections_desc")}</p>
          </div>
          <Link href="/collections" className={styles.textLink}>{t("view_all")} <DirectionArrow /></Link>
        </div>
        <div className={styles.collections}>
          {collections.map((collection, i) => {
            const count = products.filter((product) => product.isActive && product.collection === collection.id).length;
            return (
              <Link
                key={collection.id}
                href={`/products?collection=${encodeURIComponent(collection.id)}`}
                className={styles.collection}
              >
                <div className={styles.collectionImage}>
                  <Image
                    src={collection.image || COLLECTION_IMAGES[i % COLLECTION_IMAGES.length]}
                    alt={tx(collection.name)}
                    fill
                    sizes="(max-width: 639px) 85vw, (max-width: 1023px) 45vw, 400px"
                    quality={75}
                  />
                  <span className={styles.collectionNumber} aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className={styles.collectionCaption}>
                  <div>
                    <h3>{tx(collection.name)}</h3>
                    <p>{count} {t("products_count_label")}</p>
                  </div>
                  <span className={styles.roundArrow}><DirectionArrow /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProducts() {
  const { t } = useT();
  const all = useProducts();
  const featured = useMemo(() => {
    const active = all.filter((product) => product.isActive);
    const flagged = active.filter((product) => product.isFeatured);
    return (flagged.length ? flagged : active).slice(0, 8);
  }, [all]);

  if (!featured.length) return null;

  return (
    <section className={styles.featuredSection} aria-labelledby="home-featured-title">
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>{t("home_featured_eyebrow")}</p>
            <h2 id="home-featured-title" className={styles.title}>{t("home_featured_title")}</h2>
            <p className={styles.description}>{t("home_featured_desc")}</p>
          </div>
          <Link href="/products" className={styles.textLink}>{t("view_all")} <DirectionArrow /></Link>
        </div>
        <div className={styles.products}>
          {featured.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
        </div>
      </div>
    </section>
  );
}

export function QRBanner() {
  const { t } = useT();
  const steps = [
    { title: "home_qr_step1_title", description: "home_qr_step1_desc" },
    { title: "home_qr_step2_title", description: "home_qr_step2_desc" },
    { title: "home_qr_step3_title", description: "home_qr_step3_desc" },
  ] as const;

  return (
    <section className={styles.memory} aria-labelledby="home-memory-title">
      <div className={styles.memoryInner}>
        <div className={styles.memoryVisual}>
          <Image src={packaging} alt={t("home_qr_image_alt")} fill sizes="(max-width: 767px) 100vw, 50vw" quality={75} />
          <div className={styles.memoryCard}>
            <Logo color="dark" />
            <span className={styles.cardRule} aria-hidden />
            <QrCode size={42} strokeWidth={1} aria-hidden />
            <p className={styles.cardLabel}>{t("home_qr_card_label")}</p>
            <p className={styles.cardTitle}>{t("home_qr_card_title")}</p>
            <p className={styles.cardDescription}>{t("home_qr_card_desc")}</p>
          </div>
        </div>
        <div className={styles.memoryCopy}>
          <p className={styles.eyebrow}>{t("home_qr_eyebrow")}</p>
          <h2 id="home-memory-title" className={styles.title}>{t("home_qr_title")}</h2>
          <p className={styles.description}>{t("home_qr_desc")}</p>
          <ol className={styles.steps}>
            {steps.map((step, i) => (
              <li key={step.title}>
                <span className={styles.stepNumber} aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{t(step.title)}</h3>
                  <p>{t(step.description)}</p>
                </div>
                {i === 2 && <LockKeyhole size={16} strokeWidth={1.5} aria-hidden />}
              </li>
            ))}
          </ol>
          <Link href="/qr" className={styles.darkButton}>{t("home_qr_cta")} <DirectionArrow /></Link>
        </div>
      </div>
    </section>
  );
}

export function StoryStrip() {
  const { t } = useT();
  return (
    <section className={styles.story} aria-labelledby="home-story-title">
      <div className={styles.container}>
        <div className={styles.storyText}>
          <div>
            <p className={styles.eyebrow}>{t("home_story_eyebrow")}</p>
            <h2 id="home-story-title" className={styles.title}>{t("home_story_title")}</h2>
          </div>
          <p className={styles.storyQuote}>{t("home_story_text")}</p>
        </div>
        <ul className={styles.values}>
          {(["home_value1", "home_value2", "home_value3"] as const).map((key, i) => (
            <li key={key}><span aria-hidden>{String(i + 1).padStart(2, "0")}</span>{t(key)}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeFinalCta() {
  const { t } = useT();
  return (
    <section className={styles.finalCta} aria-labelledby="home-cta-title">
      <Image src={earrings} alt="" fill sizes="100vw" quality={70} className={styles.ctaImage} />
      <div className={styles.ctaShade} aria-hidden />
      <div className={styles.ctaContent}>
        <p className={styles.eyebrow}>{t("home_cta_eyebrow")}</p>
        <h2 id="home-cta-title" className={styles.title}>{t("home_cta_title")}</h2>
        <p>{t("home_cta_desc")}</p>
        <Link href="/products" className={styles.primaryButton}>{t("home_shop")} <DirectionArrow /></Link>
      </div>
    </section>
  );
}
