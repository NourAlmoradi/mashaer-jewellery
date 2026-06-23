import { cn } from "@/lib/utils";

/**
 * Petal path geometry is static, so compute it once at module load instead of
 * on every render. Each ring is an array of pre-built SVG path `d` strings.
 */
function buildPetals(
  count: number,
  inner: number,
  outer: number,
  ctrl: number,
  spread: number,
  angleOffset = 0,
) {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i * Math.PI * 2) / count + angleOffset;
    const x1 = 200 + Math.cos(angle) * inner;
    const y1 = 200 + Math.sin(angle) * inner;
    const x2 = 200 + Math.cos(angle) * outer;
    const y2 = 200 + Math.sin(angle) * outer;
    const cx1 = 200 + Math.cos(angle - spread) * ctrl;
    const cy1 = 200 + Math.sin(angle - spread) * ctrl;
    const cx2 = 200 + Math.cos(angle + spread) * ctrl;
    const cy2 = 200 + Math.sin(angle + spread) * ctrl;
    return `M${x1} ${y1} C ${cx1} ${cy1}, ${x2} ${y2}, ${x2} ${y2} C ${cx2} ${cy2}, ${x1} ${y1}, ${x1} ${y1} Z`;
  });
}

const OUTER_PETALS = buildPetals(24, 30, 130, 95, 0.18);
const INNER_PETALS = buildPetals(16, 15, 80, 55, 0.22, Math.PI / 16);

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
        {OUTER_PETALS.map((d, i) => (
          <path key={`outer-${i}`} d={d} />
        ))}

        {/* Inner petals */}
        {INNER_PETALS.map((d, i) => (
          <path key={`inner-${i}`} d={d} />
        ))}

        {/* Center */}
        <circle cx="200" cy="200" r="10" />
        <circle cx="200" cy="200" r="4" />
      </g>
    </svg>
  );
}
