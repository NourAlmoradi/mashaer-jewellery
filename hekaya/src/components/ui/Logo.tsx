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
          fontSize="8"
          letterSpacing="3"
          fill={text}
          opacity="0.6"
        >
          FEELINGS THAT LAST
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
      <span className="flex flex-col leading-tight">
        <span
          className="font-display text-xl font-semibold tracking-wider"
          style={{ color: text }}
        >
          MASHAER
        </span>
        <span
          className="text-[9px] font-medium tracking-[0.3em] uppercase"
          style={{ color: accent }}
        >
          Jewellery
        </span>
      </span>
    </span>
  );
}
