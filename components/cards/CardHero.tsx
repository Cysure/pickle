"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Clock, CreditCard } from "lucide-react";
import { PickleCard } from "./PickleCard";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Pay page hero: white page, the Pickle Pay Card as the focus. The green
 * wave lines sweep in, then the card rolls in through them and settles,
 * floating, while the waves keep drifting behind it.
 */
export function CardHero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-white pt-28 pb-16 md:pt-36 md:pb-24">
      {/* full-bleed green waves: sweep in from the right on arrival, then keep drifting */}
      <motion.div data-reveal aria-hidden="true" className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0, x: "18%" }} animate={{ opacity: 1, x: "0%" }} transition={{ duration: 1.6, ease: EASE }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/wave-lines.webp" alt="" className="wave-full wave-full-a" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/wave-lines.webp" alt="" className="wave-full wave-full-b" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/wave-lines.webp" alt="" className="wave-full wave-full-c" draggable={false} />
      </motion.div>
      {/* readability veil: white behind the words, clear behind the card */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.55)_45%,rgba(255,255,255,0.25)_100%)] lg:bg-[linear-gradient(90deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.82)_32%,rgba(255,255,255,0.15)_58%,rgba(255,255,255,0)_75%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,#fff,transparent)]" />
      <div className="gutter relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 min-w-0">
          <motion.p data-reveal initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}
            className="eyebrow-pill">
            <Clock size={12} /> Pay · Coming soon
          </motion.p>
          <motion.h1 data-reveal initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="display mt-4 text-[clamp(2.4rem,6vw,4.75rem)] leading-[0.95]">
            The Pickle <span className="text-pickle">Pay</span> Card.
          </motion.h1>
          <motion.p data-reveal initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="mt-5 max-w-md text-lg text-muted">
            Your membership, as a card. Tap to pay, and your perks unlock automatically at partners. Issued by a licensed partner when it launches.
          </motion.p>
          <motion.div data-reveal initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            className="mt-8 flex flex-wrap gap-3">
            <Link href="/early-access" className="btn btn-primary"><CreditCard size={16} /> Get notified</Link>
            <Link href="/perks" className="btn btn-ghost">Start with membership</Link>
          </motion.div>
        </div>

        <div className="relative mx-auto aspect-[5/4] w-full max-w-[640px]">
          <span aria-hidden="true" className="card-glow absolute inset-[18%] rounded-[48px]" />

          {/* the card rolls in */}
          <div className="absolute inset-0 grid place-items-center [perspective:1600px]">
            <motion.div data-reveal className="w-[78%] [transform-style:preserve-3d]"
              initial={reduce ? false : { opacity: 0, x: 260, y: 40, rotateY: -200, rotateZ: 28, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, y: 0, rotateY: 0, rotateZ: -8, scale: 1 }}
              transition={{ duration: 1.8, delay: 0.5, ease: EASE }}>
              <div className={reduce ? "" : "pcard-float"}>
                <PickleCard variant="green" tilt />
              </div>
            </motion.div>
          </div>

          <motion.span data-reveal aria-hidden="true" className="absolute right-[6%] top-[8%] inline-flex rotate-6 items-center gap-1.5 rounded-full bg-pickle px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-night shadow-[0_0_28px_rgba(119,195,0,0.55)]"
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 2.0, ease: EASE }}>
            <Clock size={12} /> Coming soon
          </motion.span>
          <motion.span data-reveal aria-hidden="true" className="absolute bottom-[8%] left-[4%] inline-flex -rotate-3 items-center gap-2 rounded-full bg-night px-3.5 py-2 text-xs font-semibold text-paper shadow-lg"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 2.25, ease: EASE }}>
            <span className="h-1.5 w-1.5 rounded-full bg-pickle" /> Perks unlock when you tap
          </motion.span>
        </div>
      </div>
    </section>
  );
}
