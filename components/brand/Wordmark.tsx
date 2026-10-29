import { WORDMARK_PATH, WORDMARK_VIEWBOX } from "./wordmark-path";

/**
 * The Pickle wordmark, rendered from the supplied outline so lettering and
 * proportions are exact. Colour is a prop; the mark inherits nothing.
 */
export function Wordmark({
  width = 120,
  color = "#77C300",
  className = "",
  title = "Pickle",
}: {
  width?: number | string;
  color?: string;
  className?: string;
  title?: string;
}) {
  const w = typeof width === "number" ? `${width}px` : width;
  return (
    <svg viewBox={WORDMARK_VIEWBOX} role="img" aria-label={title} className={className} style={{ width: w, height: "auto" }}>
      <title>{title}</title>
      <path d={WORDMARK_PATH} fill={color} fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}
