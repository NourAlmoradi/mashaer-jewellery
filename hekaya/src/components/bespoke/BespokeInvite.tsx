"use client";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { useT } from "@/lib/useT";
import { FloralPattern } from "@/components/ui/FloralPattern";
import styles from "./BespokeExperience.module.css";

const monogram = Cormorant_Garamond({ subsets: ["latin"], weight: "600", style: "italic", display: "swap" });

export function BespokeInvite() {
  const { locale } = useT();
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeft : ArrowRight;
  return <section className={styles.invite} aria-labelledby="home-bespoke-title">
    <div className={styles.inviteImage}><Image src="/bespoke/atelier.webp" alt={ar ? "صورة توضيحية لفكرة قلادة تتحول من رسمة إلى قطعة" : "Illustration of a pendant idea, from sketch to jewellery"} fill sizes="(max-width: 800px) 100vw, 50vw" quality={90} /></div>
    <div className={styles.inviteCopy}><p className={styles.eyebrow}>{ar ? "تصميم خاص من مشاعر" : "Bespoke by Mashaer"}</p><h2 id="home-bespoke-title">{ar ? "قطعة تبدأ منك." : "It begins with you."}<br /><em>{ar ? "وتحمل حكايتك." : "It becomes your story."}</em></h2><p>{ar ? "لديك فكرة لا تجدها بين القطع؟ صورة، اسم، أو تفصيلة تحمل معنى. شاركنا ما تتخيّله، ولنرسم الباقي معًا." : "Have an idea you haven't found in our collection? A photo, a name, a meaningful detail. Share what you imagine. Let's shape the rest together."}</p><Link href="/bespoke" className={styles.primary}>{ar ? "لنبدأ بفكرتك" : "Share your idea"}<Arrow size={17} /></Link><p className={styles.privacy}><LockKeyhole size={14} />{ar ? "طلب خاص · بدون التزام بالشراء" : "A private request · No commitment to buy"}</p></div>
  </section>;
}

export function BespokeBridge() {
  return <div className={styles.bridge} aria-hidden="true">
    <span className={`noise-overlay ${styles.bridgeGrain}`} />
    <span className={styles.bridgeRibbon} />
    <FloralPattern className={styles.bridgeRosette} color="#a8854c" opacity={1} stem={false} />
    <span className={styles.bridgeSeal}><span className={`${monogram.className} ${styles.sealMark}`}>M</span></span>
  </div>;
}
