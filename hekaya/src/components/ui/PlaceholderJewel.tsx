import { cn } from "@/lib/utils";

type Props = {
  kind?: "ring" | "necklace" | "bracelet" | "earring" | "gem";
  tone?: string;
  className?: string;
};

/**
 * Elegant SVG placeholder graphic for products (no real photos yet).
 * Picks an icon based on category. Used inside ProductCard image area.
 */
export function PlaceholderJewel({
  kind = "gem",
  tone = "#e8dfcc",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${tone} 0%, #fafaf8 70%)`,
      }}
    >
      <svg viewBox="0 0 200 200" className="h-2/3 w-2/3">
        <defs>
          <radialGradient id={`gold-${tone}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#e8d4a3" />
            <stop offset="60%" stopColor="#c9a96e" />
            <stop offset="100%" stopColor="#8a7544" />
          </radialGradient>
        </defs>
        {kind === "ring" && (
          <g>
            <circle
              cx="100"
              cy="120"
              r="50"
              fill="none"
              stroke={`url(#gold-${tone})`}
              strokeWidth="6"
            />
            <path d="M85 70 L100 40 L115 70 Z" fill={`url(#gold-${tone})`} />
            <circle cx="100" cy="55" r="5" fill="#fff" opacity="0.85" />
          </g>
        )}
        {kind === "necklace" && (
          <g fill="none" stroke={`url(#gold-${tone})`} strokeWidth="2.5">
            <path d="M30 50 Q100 130 170 50" />
            <circle
              cx="100"
              cy="135"
              r="14"
              fill={`url(#gold-${tone})`}
              stroke="none"
            />
            <circle cx="100" cy="135" r="5" fill="#fff" opacity="0.7" />
          </g>
        )}
        {kind === "bracelet" && (
          <g fill="none" stroke={`url(#gold-${tone})`} strokeWidth="4">
            <ellipse cx="100" cy="100" rx="65" ry="40" />
            <circle cx="50" cy="100" r="6" fill={`url(#gold-${tone})`} />
            <circle cx="100" cy="65" r="5" fill={`url(#gold-${tone})`} />
            <circle cx="150" cy="100" r="6" fill={`url(#gold-${tone})`} />
            <circle cx="100" cy="135" r="5" fill={`url(#gold-${tone})`} />
          </g>
        )}
        {kind === "earring" && (
          <g fill={`url(#gold-${tone})`}>
            <circle cx="80" cy="60" r="6" />
            <path d="M80 65 Q60 95 80 130 Q100 95 80 65" opacity="0.85" />
            <circle cx="130" cy="60" r="6" />
            <path d="M130 65 Q110 95 130 130 Q150 95 130 65" opacity="0.85" />
          </g>
        )}
        {kind === "gem" && (
          <g>
            <path
              d="M100 40 L150 90 L100 160 L50 90 Z"
              fill={`url(#gold-${tone})`}
              opacity="0.9"
            />
            <path d="M100 40 L150 90 L100 100 Z" fill="#fff" opacity="0.25" />
          </g>
        )}
        {/* Sparkles */}
        <g fill="#c9a96e" opacity="0.7">
          <circle cx="40" cy="40" r="1.5" />
          <circle cx="160" cy="50" r="1.2" />
          <circle cx="170" cy="160" r="1.5" />
          <circle cx="30" cy="170" r="1.3" />
        </g>
      </svg>
    </div>
  );
}

export function kindFromCategory(categoryId: string): Props["kind"] {
  if (categoryId.includes("ring")) return "ring";
  if (categoryId.includes("necklace")) return "necklace";
  if (categoryId.includes("bracelet")) return "bracelet";
  if (categoryId.includes("earring")) return "earring";
  return "gem";
}
