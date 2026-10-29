/**
 * Animated green-wave backdrop for dark sections: a black base with the
 * wave artwork's bright lines screened over it, so only the green light
 * shows and drifts. Three copies move at different speeds (see .wave-layer
 * in globals.css); the animation pauses under prefers-reduced-motion.
 */
export function WaveBackdrop({ opacity = 0.9, dim = 0.15, className = "" }: { opacity?: number; dim?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#050605] ${className}`}>
      <img src="/brand/wave-lines.webp" alt="" className="wave-layer wave-layer-a" style={{ opacity }} draggable={false} />
      <img src="/brand/wave-lines.webp" alt="" className="wave-layer wave-layer-b" style={{ opacity: opacity * 0.6 }} draggable={false} />
      <img src="/brand/wave-lines.webp" alt="" className="wave-layer wave-layer-c" style={{ opacity: opacity * 0.25 }} draggable={false} />
      {/* vignette: keeps the lines bright in the middle, black at the edges and behind text */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(5,6,5,${dim}) 0%, rgba(5,6,5,0) 30%, rgba(5,6,5,0) 70%, rgba(5,6,5,${dim}) 100%)` }} />
    </div>
  );
}
