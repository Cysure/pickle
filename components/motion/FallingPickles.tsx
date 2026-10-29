/**
 * Pickle icons drifting down behind a section. Positions and timings are
 * fixed so server and client markup match. Pure CSS animation; hidden for
 * visitors who prefer reduced motion.
 */
const PICKLES = [
  { left: 3, size: 34, dur: 14, delay: -2, rot: 260, op: 0.55 },
  { left: 8, size: 20, dur: 19, delay: -12, rot: -200, op: 0.35 },
  { left: 13, size: 24, dur: 18, delay: -9, rot: -220, op: 0.4 },
  { left: 18, size: 30, dur: 15, delay: -15, rot: 240, op: 0.5 },
  { left: 23, size: 42, dur: 16, delay: -5, rot: 320, op: 0.5 },
  { left: 29, size: 22, dur: 21, delay: -1, rot: -260, op: 0.35 },
  { left: 34, size: 26, dur: 20, delay: -14, rot: -280, op: 0.4 },
  { left: 40, size: 32, dur: 17, delay: -8, rot: 220, op: 0.45 },
  { left: 45, size: 36, dur: 15, delay: -11, rot: 240, op: 0.45 },
  { left: 51, size: 24, dur: 18, delay: -17, rot: -240, op: 0.4 },
  { left: 56, size: 20, dur: 19, delay: -3, rot: -300, op: 0.35 },
  { left: 61, size: 34, dur: 16, delay: -13, rot: 300, op: 0.5 },
  { left: 66, size: 40, dur: 17, delay: -7, rot: 280, op: 0.5 },
  { left: 71, size: 22, dur: 20, delay: -10, rot: -220, op: 0.35 },
  { left: 76, size: 26, dur: 21, delay: -16, rot: -240, op: 0.4 },
  { left: 81, size: 30, dur: 15, delay: -4, rot: 260, op: 0.45 },
  { left: 86, size: 38, dur: 14, delay: -12, rot: 300, op: 0.55 },
  { left: 91, size: 24, dur: 19, delay: -18, rot: -280, op: 0.4 },
  { left: 95, size: 30, dur: 18, delay: -6, rot: -260, op: 0.45 },
];

export function FallingPickles({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`falling-pickles pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {PICKLES.map((p, i) => (
        <span key={i} className="falling-pickle"
          style={{ left: `${p.left}%`, width: p.size, height: p.size, opacity: p.op, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, ["--pickle-rot" as string]: `${p.rot}deg` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/pickle-icon.png" alt="" draggable={false} className="block h-full w-full max-w-none" />
        </span>
      ))}
    </div>
  );
}
