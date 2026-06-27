import type { CSSProperties, ElementType, ReactNode } from "react";
import clsx from "clsx";

type RevealVariant = "up" | "left" | "right" | "scale";

const VARIANT_CLASS: Record<RevealVariant, string> = {
  up: "",
  left: "reveal-left",
  right: "reveal-right",
  scale: "reveal-scale",
};

type RevealProps = {
  children: ReactNode;
  /** Element/tag to render. Defaults to a `div`. */
  as?: ElementType;
  /** Entrance direction. Horizontal variants flip automatically in RTL. */
  variant?: RevealVariant;
  /** Stagger delay in seconds. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * SSR-safe entrance animation.
 *
 * The content renders **visible by default** and fades/slides in via a
 * self-contained CSS animation defined in `globals.css`. Because the animation
 * runs from the stylesheet — not the React/Framer-Motion bundle — the text is
 * never hidden while waiting for JavaScript to hydrate. This is what prevents
 * the "blank page until the JS loads" flash on a slow first load (notably the
 * first visit on a phone, before the bundle and fonts are cached).
 *
 * Replaces the previous `motion.div` reveals that started at `opacity: 0` and
 * only became visible once Framer Motion hydrated.
 */
export function Reveal({
  children,
  as: Tag = "div",
  variant = "up",
  delay = 0,
  className,
  style,
}: RevealProps) {
  const mergedStyle = delay
    ? ({ ...style, "--reveal-delay": `${delay}s` } as CSSProperties)
    : style;

  return (
    <Tag className={clsx("reveal", VARIANT_CLASS[variant], className)} style={mergedStyle}>
      {children}
    </Tag>
  );
}
