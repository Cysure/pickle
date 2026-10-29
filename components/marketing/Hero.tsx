"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Waves, Martini, Baby, Utensils, Dumbbell, Clock } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { PhoneMock } from "./PhoneMock";
import { PickleCard } from "@/components/cards/PickleCard";

const EASE = [0.16, 1, 0.3, 1] as const;
import { ACCESS_VENUES } from "@/lib/demo/access";
import { PHOTOS } from "@/lib/photos";

const CHIPS = [
  { icon: Waves, label: "Pool & Beach" },
  { icon: Martini, label: "Bars & Clubs" },
  { icon: Utensils, label: "Dining" },
  { icon: Baby, label: "Family" },
  { icon: Dumbbell, label: "Spa & Fitness" },
];

/** Membership-first hero: one plan, free entry across Bali, the app checks you in. The card waits behind it, coming soon. */
export function Hero() {
  const fade = (delay: number) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const } });
  return (
    <section className="relative overflow-hidden bg-night pt-28 pb-14 text-paper md:pt-36 md:pb-20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={PHOTOS.hero.src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-[55%_50%]" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(100deg,rgba(16,17,16,0.6)_0%,rgba(16,17,16,0.35)_38%,rgba(16,17,16,0.08)_66%,rgba(16,17,16,0)_100%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_top,rgba(16,17,16,0.75),transparent)]" />
      <div className="gutter relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10 [text-shadow:0_2px_28px_rgba(16,17,16,0.6)]">
          <motion.h1 data-reveal {...fade(0.05)} className="display text-[clamp(2.6rem,6.4vw,5.4rem)] leading-[0.95] text-paper">
            Everyone loves<br />a <span className="text-pickle">Pickle</span>.
          </motion.h1>
          <motion.p data-reveal {...fade(0.12)} className="mt-4 font-display text-[clamp(1.35rem,2.8vw,2.1rem)] font-bold leading-tight tracking-tight text-paper/90">
            Your VIP pass to the good life.
          </motion.p>
          <motion.p data-reveal {...fade(0.2)} className="mt-5 max-w-md text-base text-paper/70 md:text-lg">
            Check in with the app. Enjoy the perks. Beach clubs, pools, bars, dining, family days and spas at registered partners, on one membership.
          </motion.p>
          <motion.ul data-reveal {...fade(0.3)} className="mt-6 flex flex-wrap gap-2">
            {CHIPS.map(({ icon: Icon, label }) => <li key={label} className="flex items-center gap-2 rounded-full bg-paper/10 px-3.5 py-2 text-sm font-semibold text-paper ring-1 ring-paper/15 backdrop-blur-sm"><span className="grid h-6 w-6 place-items-center rounded-full bg-pickle text-night"><Icon size={13} /></span>{label}</li>)}
          </motion.ul>
          <motion.div data-reveal {...fade(0.4)} className="mt-8 flex flex-wrap gap-3">
            <Link href="/pricing" className="btn btn-primary">See membership plans <span className="arrow">→</span></Link>
            <Link href="/access" className="btn btn-ghost !border-paper/30 !text-paper hover:!bg-paper/10">Browse {ACCESS_VENUES.length} partners</Link>
          </motion.div>
          <motion.p data-reveal {...fade(0.5)} className="mt-6 max-w-lg text-xs text-paper/50">
            Proposed plans, demo venues.
          </motion.p>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[460px] py-6">
          {/* the card slides in underneath the phone, trailing green light */}
          <motion.div data-reveal aria-hidden="true" className="absolute -left-4 bottom-4 z-20 w-[74%] drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)] sm:-left-14 sm:w-[78%]"
            initial={{ opacity: 0, x: -160, rotate: -16 }} animate={{ opacity: 1, x: 0, rotate: -12 }} transition={{ duration: 1.2, delay: 1.1, ease: EASE }}>
            <CardStreaks />
            <div className="relative">
              <PickleCard variant="black" tilt={false} />
              <span className="absolute -top-4 left-4 inline-flex -rotate-3 items-center gap-1.5 rounded-full bg-pickle px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-night shadow-[0_0_24px_rgba(119,195,0,0.6)]"><Clock size={12} /> Card coming soon</span>
            </div>
          </motion.div>
          <motion.div data-reveal initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.1, delay: 0.4, ease: EASE }} className="relative z-10 ml-auto w-fit">
            <PhoneMock />
          </motion.div>
        </div>
      </div>

      <div className="relative mt-16 border-y border-paper/10 py-4" aria-hidden="true">
        <div className="marquee" style={{ ["--marquee-speed" as string]: "36s" }}>
          <div className="marquee-track items-center gap-10 px-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center gap-10 font-display text-sm font-bold uppercase tracking-[0.3em] text-paper/60">
                VIP access <span className="h-1.5 w-1.5 rounded-full bg-pickle" /> One membership <span className="h-1.5 w-1.5 rounded-full bg-pickle" /> Check in with the app <Wordmark width={64} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Green light streaks trailing the card as it slides in, then settling into a soft glow. */
function CardStreaks() {
  const lines = [
    { top: "18%", w: "130%", h: 3, delay: 1.0, op: 0.9 },
    { top: "34%", w: "160%", h: 2, delay: 1.08, op: 0.7 },
    { top: "52%", w: "120%", h: 4, delay: 1.04, op: 1 },
    { top: "68%", w: "150%", h: 2, delay: 1.12, op: 0.6 },
    { top: "84%", w: "110%", h: 3, delay: 1.16, op: 0.8 },
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className="card-glow absolute -inset-6 rounded-[40px]" />
      {lines.map((l, i) => (
        <motion.span key={i} className="absolute right-[55%] origin-right rounded-full"
          style={{ top: l.top, width: l.w, height: l.h, background: "linear-gradient(90deg, rgba(119,195,0,0) 0%, rgba(119,195,0,0.35) 40%, #b7f34a 100%)", boxShadow: "0 0 12px rgba(119,195,0,0.8)" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 1, 0.2], opacity: [0, l.op, l.op * 0.6, 0] }}
          transition={{ duration: 1.6, delay: l.delay, times: [0, 0.35, 0.7, 1], ease: "easeOut" }} />
      ))}
    </div>
  );
}
