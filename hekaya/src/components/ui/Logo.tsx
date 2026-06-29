import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "full" | "mark" | "inline";
  color?: "gold" | "dark" | "light";
};

/**
 * Mashaer Logo — elegant wordmark with subtle accent. Pure SVG, scalable, no external assets.
 */
export function Logo({
  className,
  variant = "inline",
  color = "gold",
}: LogoProps) {
  const accent = color === "light" ? "#ffffff" : "#c9a96e";
  const text = color === "light" ? "#ffffff" : "#1a1a1a";

  if (variant === "full") {
    return (
      <svg
        viewBox="0 0 220 240"
        className={cn("h-32 w-auto", className)}
        aria-hidden
      >
        <text
          x="110"
          y="180"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, serif"
          fontSize="30"
          fontWeight="600"
          letterSpacing="6"
          fill={text}
        >
          MASHAER
        </text>
        <line
          x1="40"
          y1="195"
          x2="80"
          y2="195"
          stroke={accent}
          strokeWidth="1"
        />
        <text
          x="110"
          y="201"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="11"
          letterSpacing="6"
          fill={text}
          opacity="0.85"
        >
          JEWELLERY
        </text>
        <line
          x1="140"
          y1="195"
          x2="180"
          y2="195"
          stroke={accent}
          strokeWidth="1"
        />
        <text
          x="110"
          y="222"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="7"
          letterSpacing="1.5"
          fill={text}
          opacity="0.6"
        >
          SOME FEELINGS DESERVE ETERNITY
        </text>
      </svg>
    );
  }

  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 60 60"
        className={cn("h-10 w-10", className)}
        aria-hidden
      >
        <text
          x="30"
          y="43"
          textAnchor="middle"
          fontFamily="Cormorant Garamond, serif"
          fontSize="42"
          fontWeight="600"
          fill={text}
        >
          M
        </text>
        <line
          x1="8"
          y1="51"
          x2="52"
          y2="51"
          stroke={accent}
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  // inline (header)
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex flex-col leading-none">
        <span
          className="font-display text-[22px] font-semibold leading-none tracking-[0.18em]"
          style={{ color: text }}
        >
          MASHAER
        </span>
        {/* subtitle flanked by thin accent rules */}
        <span className="mt-1 flex items-center gap-1.5">
          <span
            className="h-px flex-1"
            style={{
              background: `linear-gradient(to right, transparent, ${accent})`,
            }}
          />
          <span
            className="text-[13px] font-medium uppercase leading-none tracking-[0.42em]"
            style={{ color: accent }}
          >
            Jewellery
          </span>
          <span
            className="h-px flex-1"
            style={{
              background: `linear-gradient(to left, transparent, ${accent})`,
            }}
          />
        </span>
      </span>
    </span>
  );
}

/**
 * Monogram — the gold circular "M" badge used in the site header. Scales to any
 * size via the `size` prop (the inner letter tracks the box). Shared so the
 * header and admin show the exact same mark.
 */
export function Monogram({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.56) }}
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[linear-gradient(150deg,#f3e4c0_0%,#dcbf85_30%,#c9a96e_55%,#a8853f_100%)] shadow-[0_3px_8px_rgba(168,133,63,0.45),inset_0_1px_1px_rgba(255,255,255,0.7)] ring-1 ring-[var(--color-primary-dark)]/45",
        className,
      )}
    >
      {/* glossy shine sweep */}
      <span className="pointer-events-none absolute inset-x-0 -top-1 h-1/2 rounded-t-full bg-gradient-to-b from-white/55 to-transparent" />
      {/* refined italic monogram */}
      <span className="font-display font-semibold italic leading-none tracking-tight text-white drop-shadow-[0_1px_1px_rgba(120,90,30,0.5)]">
        M
      </span>
    </span>
  );
}
