"use client";

import { cn } from "@/lib/utils";

const Sparkle = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    className={className}
    fill="currentColor"
  >
    <path d="M12 2.5l1.6 5.4 5.4 1.6-5.4 1.6L12 16.5l-1.6-5.4L5 9.5l5.4-1.6L12 2.5z" />
    <path
      d="M19 14l.7 2.3 2.3.7-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14z"
      opacity="0.7"
    />
  </svg>
);

/**
 * Centered or inline eyebrow label with two flanking sparkle marks.
 * Used in About hero, Final CTA band, and other premium section headers.
 */
export function Eyebrow({
  children,
  className,
  tone = "gold",
  align = "center",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "gold" | "light";
  align?: "center" | "start";
}) {
  const color =
    tone === "light" ? "text-[#d4b06a]" : "text-[var(--color-primary-dark)]";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3",
        align === "center" && "justify-center",
        className,
      )}
    >
      <Sparkle className={cn("h-3.5 w-3.5", color)} />
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.32em]",
          color,
        )}
      >
        {children}
      </span>
      <Sparkle className={cn("h-3.5 w-3.5", color)} />
    </div>
  );
}
