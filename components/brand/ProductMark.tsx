import { Wordmark } from "./Wordmark";

/**
 * Product lockup: the pickle icon, the exact Pickle wordmark and a product
 * name ("Perks", "Radar", "Together", "Access") set in the display face at cap
 * height. `width` is the wordmark width on large screens; the whole lockup is
 * em-based and shrinks on narrow viewports so it never wraps.
 */
export function ProductMark({ product, width = 150, color = "#77C300", dark = false, className = "" }: { product: string; width?: number; color?: string; dark?: boolean; className?: string }) {
  const icon = Math.round(width * 0.25);
  return (
    <span
      className={`inline-flex flex-nowrap items-center gap-x-[0.22em] whitespace-nowrap ${className}`}
      style={{ fontSize: `min(${icon}px, 8.5vw)` }}
      aria-label={`Pickle ${product}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/pickle-icon.png" alt="" width={icon} height={icon} className="h-[1em] w-[1em] shrink-0 -rotate-12 drop-shadow-[0_2px_4px_rgba(16,17,16,0.25)]" draggable={false} />
      <Wordmark width="4em" color={color} title="" className="shrink-0" />
      <span className={`font-display font-bold leading-none tracking-tight ${dark ? "text-paper" : "text-ink"}`} style={{ fontSize: "1.32em", marginTop: "0.08em" }}>{product}</span>
    </span>
  );
}
