"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, QrCode, Pencil, Eye, Calendar } from "lucide-react";
import { useT } from "@/lib/useT";
import { useDataStore } from "@/stores/data.store";
import { useAdminSettings } from "@/stores/adminSettings.store";
import { findProduct } from "@/data/products";
import { generateQrDataUrl, memoryUrlFor } from "@/lib/qr";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { formatDate } from "@/lib/utils";
import type { Memory } from "@/types";

export default function MyMemoriesPage() {
  const { t, locale, tx } = useT();
  const memories = useDataStore((s) => s.memories);
  const qrColor = useAdminSettings((s) => s.qr.defaultColor);

  const entries = useMemo(
    () =>
      Object.entries(memories).sort(
        ([, a], [, b]) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [memories],
  );

  return (
    <div className="container-h py-12 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow align="start">{t("my_memories_eyebrow")}</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            {t("my_memories_title")}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            {entries.length} {locale === "ar" ? "ذكرى نشطة" : "active memories"}
          </p>
        </div>
        <Link href="/products" className="btn btn-gold">
          <Plus className="h-4 w-4" />
          {t("my_memories_new")}
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="mt-12 rounded-xl bg-white p-12 text-center ring-1 ring-[var(--color-border)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
            <QrCode className="h-7 w-7" />
          </div>
          <p className="mx-auto mt-5 max-w-md text-sm text-[var(--color-ink-muted)]">
            {t("my_memories_empty")}
          </p>
          <Link href="/products" className="btn btn-gold mt-6">
            {t("account_quick_shop")}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(([token, m], i) => (
            <MemoryCard
              key={token}
              token={token}
              memory={m}
              qrColor={qrColor}
              index={i}
              locale={locale}
              tx={tx}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemoryCard({
  token,
  memory,
  qrColor,
  index,
  locale,
  tx,
  t,
}: {
  token: string;
  memory: Memory;
  qrColor: string;
  index: number;
  locale: "ar" | "en";
  tx: (b: { ar: string; en: string }) => string;
  t: ReturnType<typeof useT>["t"];
}) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateQrDataUrl(memoryUrlFor(token), 200, { dark: qrColor })
      .then((url) => {
        if (!cancelled) setQrUrl(url);
      })
      .catch(() => {
        /* ignore — placeholder shows */
      });
    return () => {
      cancelled = true;
    };
  }, [token, qrColor]);

  const product = memory.productId ? findProduct(memory.productId) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="overflow-hidden rounded-xl bg-white ring-1 ring-[var(--color-border)] transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 flex-1">
          <span className="badge badge-new">
            {t("my_memories_status_active")}
          </span>
          <h3 className="mt-2 truncate font-display text-lg font-semibold">
            {memory.title}
          </h3>
          {product && (
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              {t("memory_linked_product")}{" "}
              <span className="font-medium text-[var(--color-ink)]">
                {tx(product.name)}
              </span>
            </p>
          )}
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-ink-faint)]">
            <Calendar className="h-3 w-3" />
            {formatDate(memory.createdAt, locale)}
          </p>
        </div>
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-md bg-white ring-1 ring-[var(--color-border)]">
          {qrUrl ? (
            <Image
              src={qrUrl}
              alt={`QR ${token}`}
              width={80}
              height={80}
              unoptimized
            />
          ) : (
            <QrCode className="h-8 w-8 text-[var(--color-ink-faint)]" />
          )}
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-5 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--color-ink-muted)]">
            {t("memory_pin_label")}:{" "}
            <span className="font-mono tracking-widest text-[var(--color-ink)]">
              ●●●●
            </span>
          </span>
          <span className="font-mono text-[var(--color-ink-faint)]">
            {token}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 pt-2">
        <Link href={`/memory/${token}`} className="btn btn-outline btn-sm">
          <Eye className="h-3.5 w-3.5" />
          {t("memory_view")}
        </Link>
        <Link href={`/memory/${token}?edit=1`} className="btn btn-gold btn-sm">
          <Pencil className="h-3.5 w-3.5" />
          {t("memory_edit")}
        </Link>
      </div>
    </motion.div>
  );
}
