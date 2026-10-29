"use client";
import { UserPlus, Smartphone, QrCode } from "lucide-react";
import { Stagger, Item, Reveal } from "@/components/motion/Reveal";

const STEPS = [
  { icon: UserPlus, t: "Subscribe", b: "One plan. Solo, Duo or Family." },
  { icon: Smartphone, t: "Open the app", b: "Every partner and perk, near you." },
  { icon: QrCode, t: "Walk in", b: "Show the code. Nothing to pay at the door." },
];

/** How it works: light, quiet, three steps. Apple-style restraint. */
export function Steps3() {
  return (
    <section className="bg-white py-16 md:py-20" id="how">
      <div className="gutter">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="eyebrow-pill">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">Three steps. Then just go.</h2>
        </Reveal>
        <Stagger className="relative mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3 md:gap-5">
          <span aria-hidden="true" className="absolute left-[16%] right-[16%] top-9 hidden h-px bg-[linear-gradient(90deg,transparent,rgba(23,25,20,0.15),transparent)] md:block" />
          {STEPS.map(({ icon: Icon, t, b }, i) => (
            <Item key={t}>
              <div className="shine group relative flex h-full flex-col items-center rounded-[28px] bg-cream/70 px-6 py-8 text-center ring-1 ring-inset ring-ink/5 transition-all duration-500 hover:bg-white hover:shadow-[0_24px_60px_-28px_rgba(23,25,20,0.25)]">
                <span className="relative grid h-[72px] w-[72px] place-items-center rounded-full bg-white text-ink shadow-[0_10px_30px_-12px_rgba(23,25,20,0.3)] ring-1 ring-ink/5 transition-transform duration-500 group-hover:scale-105">
                  <Icon size={26} strokeWidth={1.6} />
                  <span className="num absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-pickle text-[11px] font-bold text-night">{i + 1}</span>
                </span>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight">{t}</h3>
                <p className="mt-1.5 max-w-[22ch] text-sm text-muted">{b}</p>
              </div>
            </Item>
          ))}
        </Stagger>
        <p className="mt-8 text-center text-xs text-muted">Your subscription pays the partner per visit. You never do.</p>
      </div>
    </section>
  );
}
