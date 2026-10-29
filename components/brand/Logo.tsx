import { Wordmark } from "./Wordmark";

/**
 * The Pickle lockup: the glossy pickle (transparent PNG) beside the exact
 * wordmark. `width` is the wordmark width; the pickle scales with it.
 */
export function Logo({ width = 120, color = "#77C300", className = "", title = "Pickle", iconOnly = false }: { width?: number; color?: string; className?: string; title?: string; iconOnly?: boolean }) {
  const icon = Math.round(width * 0.25);
  return (
    <span className={`inline-flex items-center gap-[0.18em] ${className}`} style={{ fontSize: icon }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/pickle-icon.png" alt="" width={icon} height={icon} className="shrink-0 -mr-[0.08em] -rotate-12 drop-shadow-[0_2px_4px_rgba(16,17,16,0.25)]" draggable={false} />
      {!iconOnly && <Wordmark width={width} color={color} title={title} />}
    </span>
  );
}
