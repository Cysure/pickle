"use client";
import Link from "next/link";
import { Waves, Martini, Utensils, Baby, Dumbbell, Smartphone, QrCode, UserPlus, CreditCard, Clock } from "lucide-react";
import { SectionHead } from "./Sections";
import { Stagger, Item, Reveal } from "@/components/motion/Reveal";
import { ACCESS_VENUES } from "@/lib/demo/access";
import { ACCESS_CATEGORY_LABELS, ACCESS_CATEGORY_BLURB, type AccessCategory } from "@/lib/types";
import { MerchantMark } from "@/components/perks/PerkCard";
import { PickleCard } from "@/components/cards/PickleCard";
import { DemoTag } from "@/components/ui";
import { PHOTOS, type PhotoKey } from "@/lib/photos";
import { WaveBackdrop } from "@/components/motion/WaveBackdrop";
import { FallingPickles } from "@/components/motion/FallingPickles";

/** Five big category tiles: icon, name, one line. */
export function Included() {
  const pillars: { icon: typeof Waves; cat: AccessCategory; line: string; photo: PhotoKey }[] = [
    { icon: Waves, cat: "pool-beach", line: "Free entry", photo: "beach" },
    { icon: Martini, cat: "bars-clubs", line: "Guest list & drinks", photo: "bars" },
    { icon: Utensils, cat: "dining", line: "15–25% off", photo: "dining" },
    { icon: Baby, cat: "family", line: "Kids go free", photo: "family" },
    { icon: Dumbbell, cat: "spa-fitness", line: "Gyms & spas in", photo: "spa" },
  ];
  return (
    <section className="gutter py-16 md:py-24" id="included">
      <SectionHead eyebrow="What you get" title="Five ways in." body="At registered partners, with one membership." />
      <Stagger className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 md:gap-4">
        {pillars.map(({ icon: Icon, cat, line, photo }) => {
          const n = ACCESS_VENUES.filter((v) => v.category === cat).length;
          const p = PHOTOS[photo];
          return (
            <Item key={cat}>
              <Link href={`/access#${cat}`} className="shine group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[var(--radius-card)] bg-night p-5 text-paper ring-1 ring-inset ring-white/10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:-translate-y-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" aria-hidden="true" loading="lazy" style={{ objectPosition: p.position }} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(16,17,16,0.92)_0%,rgba(16,17,16,0.4)_50%,rgba(16,17,16,0.05)_100%)]" />
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-pickle text-night shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"><Icon size={24} /></span>
                <span className="relative">
                  <span className="num block font-display text-5xl font-bold leading-none text-pickle">{n}</span>
                  <span className="mt-2 block font-display text-xl font-bold leading-tight tracking-tight">{ACCESS_CATEGORY_LABELS[cat]}</span>
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-paper/70">{line}</span>
                </span>
              </Link>
            </Item>
          );
        })}
      </Stagger>
    </section>
  );
}

const STEPS = [
  { icon: UserPlus, t: "Subscribe", b: "Pick Solo, Duo or Family. Monthly or annual, cancel any time.", tag: "1 minute" },
  { icon: Smartphone, t: "Open the app", b: "See every partner near you, what's included and when to book.", tag: "Always with you" },
  { icon: QrCode, t: "Walk in", b: "Show your check-in code at the desk. Nothing to pay at the door.", tag: "Free entry" },
];
export function HowMembershipWorks() {
  return (
    <section className="relative overflow-hidden bg-[#EFF0EC] py-16 text-night md:py-24" id="how">
      <FallingPickles />
      <div className="gutter relative">
        <Reveal className="max-w-2xl">
          <p className="eyebrow-pill">How it works</p>
          <h2 className="display mt-3 text-[clamp(2rem,4.5vw,3.5rem)] text-night">Three steps. Then just go.</h2>
        </Reveal>
        <Stagger className="relative mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {STEPS.map(({ icon: Icon, t, b, tag }, i) => (
            <Item key={t}>
              <article className="shine group relative h-full overflow-hidden rounded-[28px] bg-white p-7 shadow-[0_24px_50px_-30px_rgba(16,17,16,0.3)] ring-1 ring-ink/5 transition-transform duration-500 hover:-translate-y-1.5">
                <span aria-hidden="true" className="num pointer-events-none absolute right-6 top-4 font-display text-[5.5rem] font-bold leading-none text-pickle/15 transition-colors duration-500 group-hover:text-pickle/25">{i + 1}</span>
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-night text-pickle shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105"><Icon size={26} strokeWidth={1.8} /></span>
                <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.18em] text-pickle">Step {i + 1}</p>
                <h3 className="relative mt-1 font-display text-2xl font-bold tracking-tight text-night">{t}</h3>
                <p className="relative mt-2 text-[15px] leading-relaxed text-muted">{b}</p>
                <span className="relative mt-5 inline-flex rounded-full bg-cream px-3 py-1 text-xs font-semibold text-night">{tag}</span>
              </article>
            </Item>
          ))}
        </Stagger>
        <p className="mt-8 text-sm font-medium text-muted">Your subscription pays the partner per visit. You never do.</p>
      </div>
    </section>
  );
}

/** Privilee-style category rows: partner marks per category with a link to the full list. */
export function VenueRows() {
  const cats = Object.keys(ACCESS_CATEGORY_LABELS) as AccessCategory[];
  return (
    <section className="gutter py-20 md:py-28" id="venues">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead eyebrow="Perks" title="Where your subscription gets you in." body="Every registered partner, by category. Fictional partners for the demo." />
        <DemoTag>Fictional partners · demo</DemoTag>
      </div>
      <div className="mt-12 divide-y divide-ink/10">
        {cats.map((c) => {
          const vs = ACCESS_VENUES.filter((v) => v.category === c);
          return (
            <Reveal key={c} className="grid gap-4 py-6 md:grid-cols-[260px_1fr_auto] md:items-center">
              <div><p className="font-display text-xl font-bold tracking-tight">{ACCESS_CATEGORY_LABELS[c]}</p><p className="text-xs text-muted">{vs.length} {vs.length === 1 ? "venue" : "venues"} · {c === "pool-beach" ? "free entry" : c === "bars-clubs" ? "guest list & drinks" : c === "dining" ? "15–25% off" : c === "family" ? "free or discounted" : "gyms & circuits free, classes on credits"}</p></div>
              <ul className="flex flex-wrap gap-2">
                {vs.map((v) => <li key={v.id} className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-xs font-semibold ring-1 ring-ink/10"><MerchantMark mark={v.mark} size={26} /> {v.name}<span className="text-muted">· {v.area}</span></li>)}
              </ul>
              <Link href={`/access#${c}`} className="btn btn-ghost btn-sm justify-self-start md:justify-self-end">All {ACCESS_CATEGORY_LABELS[c].toLowerCase()}</Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/** The Pickle Card: its own section, clearly coming soon, with the detail people ask for. */
export function CardComingSoon() {
  const points = [
    { t: "Perks unlock when you pay", b: "Pay at a partner and the perk applies at the till. No code, no app open." },
    { t: "Issued by a licensed partner", b: "Pickle is not a bank. The card and its terms come from a regulated issuer, region by region." },
    { t: "Three finishes", b: "Green, Black and Reserve, matched to your plan. Chip, contactless, masked number." },
    { t: "Not needed for membership", b: "Pickle Perks works today with the app. The card is the next chapter." },
  ];
  return (
    <section className="relative overflow-hidden py-20 text-paper md:py-28" id="card">
      <WaveBackdrop />
      <div className="gutter relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="order-2 lg:order-1">
          <div className="relative mx-auto max-w-md px-4">
            <PickleCard variant="green" float />
            <span className="absolute -right-2 -top-4 inline-flex rotate-6 items-center gap-1.5 rounded-full bg-pickle px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-night shadow-lg"><Clock size={12} /> Coming soon</span>
          </div>
        </Reveal>
        <div className="order-1 lg:order-2">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-pickle ring-1 ring-paper/15"><Clock size={12} /> Coming soon</span>
            <h2 className="display mt-4 text-[clamp(2rem,4.5vw,3.5rem)] text-paper">The Pickle Card.</h2>
            <p className="mt-4 max-w-lg text-lg text-paper/65">Your membership, as a card. Tap to pay anywhere, and your Pickle perks unlock automatically at partners.</p>
          </Reveal>
          <Stagger className="mt-8 grid gap-3 sm:grid-cols-2">
            {points.map(({ t, b }) => <Item key={t}><div className="panel-dark shine h-full p-5"><p className="font-display text-base font-bold text-paper">{t}</p><p className="mt-1 text-sm text-paper/60">{b}</p></div></Item>)}
          </Stagger>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/early-access" className="btn btn-primary"><CreditCard size={16} /> Get notified</Link><Link href="/card" className="btn btn-ghost !text-paper">See the designs</Link></div>
          <p className="mt-4 text-xs text-paper/45">Timing and issuer to be confirmed.</p>
        </div>
      </div>
    </section>
  );
}
