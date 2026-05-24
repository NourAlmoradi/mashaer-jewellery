import { cn } from "@/lib/utils";

/**
 * Decorative floral SVG used as a faint backdrop on light sections.
 * Pure SVG line drawing — no external assets, scales freely.
 */
export function FloralPattern({
  className,
  color = "#c9a96e",
  opacity = 0.08,
}: {
  className?: string;
  color?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("pointer-events-none select-none", className)}
      style={{ color }}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g opacity={opacity}>
        {/* Stem */}
        <path d="M200 360 C 205 300, 195 250, 200 200" />
        {/* Leaves on stem */}
        <path d="M200 320 C 175 318, 160 308, 158 290 C 178 292, 195 304, 200 320 Z" />
        <path d="M200 280 C 225 278, 240 268, 242 250 C 222 252, 205 264, 200 280 Z" />

        {/* Chrysanthemum-style petals — outer ring */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 24;
          const x1 = 200 + Math.cos(angle) * 30;
          const y1 = 200 + Math.sin(angle) * 30;
          const x2 = 200 + Math.cos(angle) * 130;
          const y2 = 200 + Math.sin(angle) * 130;
          const cx1 = 200 + Math.cos(angle - 0.18) * 95;
          const cy1 = 200 + Math.sin(angle - 0.18) * 95;
          const cx2 = 200 + Math.cos(angle + 0.18) * 95;
          const cy2 = 200 + Math.sin(angle + 0.18) * 95;
          return (
            <path
              key={`outer-${i}`}
              d={`M${x1} ${y1} C ${cx1} ${cy1}, ${x2} ${y2}, ${x2} ${y2} C ${cx2} ${cy2}, ${x1} ${y1}, ${x1} ${y1} Z`}
            />
          );
        })}

        {/* Inner petals */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 16 + Math.PI / 16;
          const x1 = 200 + Math.cos(angle) * 15;
          const y1 = 200 + Math.sin(angle) * 15;
          const x2 = 200 + Math.cos(angle) * 80;
          const y2 = 200 + Math.sin(angle) * 80;
          const cx1 = 200 + Math.cos(angle - 0.22) * 55;
          const cy1 = 200 + Math.sin(angle - 0.22) * 55;
          const cx2 = 200 + Math.cos(angle + 0.22) * 55;
          const cy2 = 200 + Math.sin(angle + 0.22) * 55;
          return (
            <path
              key={`inner-${i}`}
              d={`M${x1} ${y1} C ${cx1} ${cy1}, ${x2} ${y2}, ${x2} ${y2} C ${cx2} ${cy2}, ${x1} ${y1}, ${x1} ${y1} Z`}
            />
          );
        })}

        {/* Center */}
        <circle cx="200" cy="200" r="10" />
        <circle cx="200" cy="200" r="4" />
      </g>
    </svg>
  );
}
