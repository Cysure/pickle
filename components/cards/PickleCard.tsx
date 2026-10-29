"use client";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import type { CardVariant } from "@/lib/types";

/**
 * The Pickle Card as a CSS 3D object: three finishes (green, black,
 * reserve), a brushed sheen and grain, chip and contactless mark, pointer
 * tilt on devices with a fine pointer, optional float and flip.
 * It is a design preview only: the number is a masked demo reference and
 * no real payment credentials are ever shown.
 */
export function PickleCard({
  variant = "green",
  name = "MR. PICKLE",
  reference = "•••• •••• •••• 0427",
  expiry = "MM/YY",
  tilt = true,
  float = false,
  flipped = false,
  className = "",
  onClick,
}: {
  variant?: CardVariant;
  name?: string;
  reference?: string;
  expiry?: string;
  tilt?: boolean;
  float?: boolean;
  flipped?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const scene = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [canTilt, setCanTilt] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCanTilt(tilt && fine && !reduced);
  }, [tilt]);

  const onMove = (e: React.PointerEvent) => {
    if (!canTilt || !scene.current) return;
    const r = scene.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setRot({ x: -py * 16, y: px * 22 });
  };
  const onLeave = () => setRot({ x: 0, y: 0 });

  const face = variant === "green" ? "pcard-green" : variant === "black" ? "pcard-black" : "pcard-reserve";
  const markColor = variant === "green" ? "#101110" : "#77C300";
  const dim = variant === "green" ? "rgba(16,17,16,0.55)" : "rgba(248,249,245,0.55)";

  return (
    <div ref={scene} className={`pcard-scene ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} onClick={onClick}>
      <div
        className={`pcard ${flipped ? "is-flipped" : ""} ${float ? "pcard-float" : ""}`}
        style={canTilt && !flipped ? { transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` } : undefined}
      >
        {/* front */}
        <div className={`pcard-face ${face}`}>
          <div className="pcard-sheen" />
          <div className="pcard-grain" />
          <div className="absolute left-[7%] top-[8%] flex w-[34%] items-center gap-[4%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/pickle-icon.png" alt="" className="w-[22%] shrink-0 -rotate-12" draggable={false} />
            <span className="block min-w-0 flex-1">
              <Wordmark width="100%" color={markColor} />
            </span>
          </div>
          <span className="absolute right-[7%] top-[10%] font-display text-[clamp(8px,1.6cqw,12px)] font-bold tracking-[0.3em]" style={{ color: dim }}>
            PICKLE PAY CARD
          </span>
          {/* chip */}
          <div className="absolute left-[7%] top-[42%] aspect-[1.25] w-[13%] rounded-[12%] border border-black/25" style={{ background: "linear-gradient(135deg, #e9d79a, #c9a84a 50%, #a8842a)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.3)" }}>
            <div className="absolute inset-[18%] rounded-[8%] border border-black/25" />
            <div className="absolute left-[18%] right-[18%] top-1/2 h-px bg-black/25" />
            <div className="absolute bottom-[18%] top-[18%] left-1/2 w-px bg-black/25" />
          </div>
          {/* contactless */}
          <svg viewBox="0 0 24 24" className="absolute left-[24%] top-[44%] w-[7%]" fill="none" stroke={dim} strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 9a7 7 0 0 1 0 6" /><path d="M9.5 7a10 10 0 0 1 0 10" /><path d="M13 5a13 13 0 0 1 0 14" /><path d="M16.5 3a16 16 0 0 1 0 18" />
          </svg>
          <div className="absolute bottom-[12%] left-[7%] right-[7%] flex items-end justify-between">
            <div>
              <p className="num font-display text-[clamp(10px,2.4cqw,16px)] font-semibold tracking-[0.16em]">{reference}</p>
              <p className="mt-1 font-display text-[clamp(7px,1.5cqw,11px)] font-bold tracking-[0.22em]" style={{ color: dim }}>
                {name}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-[clamp(6px,1.2cqw,9px)] tracking-[0.2em]" style={{ color: dim }}>VALID THRU</p>
              <p className="num font-display text-[clamp(8px,1.8cqw,13px)] font-semibold tracking-[0.1em]">{expiry}</p>
            </div>
          </div>
        </div>
        {/* back */}
        <div className={`pcard-face back ${face}`}>
          <div className="pcard-sheen" />
          <div className="pcard-grain" />
          <div className="absolute inset-x-0 top-[14%] h-[14%] bg-black/70" />
          <div className="absolute left-[7%] right-[40%] top-[38%] h-[11%] rounded-md bg-white/85" />
          <p className="absolute left-[7%] top-[54%] font-display text-[clamp(7px,1.4cqw,10px)] tracking-[0.2em]" style={{ color: dim }}>
            AUTHORISED SIGNATURE
          </p>
          <div className="absolute bottom-[10%] right-[7%] w-[22%] opacity-80">
            <Wordmark width="100%" color={markColor} />
          </div>
          <p className="absolute bottom-[10%] left-[7%] max-w-[55%] text-[clamp(6px,1.1cqw,8px)] leading-snug" style={{ color: dim }}>
            Issuer, network and terms will appear here once confirmed.
          </p>
        </div>
      </div>
    </div>
  );
}
