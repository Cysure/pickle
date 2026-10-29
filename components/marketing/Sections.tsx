"use client";
import Link from "next/link";
import { type ReactNode } from "react";
import { CreditCard, Compass, Gift, Coffee, Share2, CalendarDays, Link2, Store } from "lucide-react";
import { Reveal, Stagger, Item } from "@/components/motion/Reveal";
import { DemoTag } from "@/components/ui";
import { WaveBackdrop } from "@/components/motion/WaveBackdrop";
import { PHOTOS, type PhotoKey } from "@/lib/photos";

export function SectionHead({ eyebrow, title, body, dark = false, center = false, children, mark }: { eyebrow: string; title: ReactNode; body?: string; dark?: boolean; center?: boolean; children?: ReactNode; mark?: ReactNode }) {
  return (
    <Reveal className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {mark ? <div className="mb-2">{mark}</div> : <p className="eyebrow-pill">{eyebrow}</p>}
      <h2 className={`display mt-3 text-[clamp(2rem,4.5vw,3.5rem)] ${dark ? "text-paper" : ""}`}>{title}</h2>
      {body && <p className={`mt-4 text-lg ${dark ? "text-paper/65" : "text-muted"}`}>{body}</p>}
      {children}
    </Reveal>
  );
}

/* ---------------------------------------------------------------- */
const TRIO = [
  { icon: CreditCard, title: "Pay", body: "Use your Pickle Card the way you use any card. Coffee, groceries, dinner, the train. Nothing new to learn." },
  { icon: Compass, title: "Discover", body: "Pickle Radar surfaces places near you with member perks, from the café round the corner to a weekend away." },
  { icon: Gift, title: "Unlock", body: "Perks unlock when you pay at a partner. No codes, no vouchers, no apps to juggle at the till." },
];
export function PayDiscoverUnlock() {
  return (
    <section className="gutter py-20 md:py-28">
      <SectionHead eyebrow="How Pickle feels" title={<>Pay normally.<br />Get more out of life.</>} body="Pickle sits quietly behind the card you already reach for, and makes the ordinary moments a little better." />
      <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
        {TRIO.map(({ icon: Icon, title, body }, i) => (
          <Item key={title}>
            <div className="panel hover-lift group relative h-full overflow-hidden p-7">
              <span className="num absolute right-6 top-6 font-display text-6xl font-bold text-cream transition-colors group-hover:text-pickle/30">0{i + 1}</span>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-night text-pickle transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105"><Icon /></div>
              <h3 className="mt-6 font-display text-2xl font-bold tracking-tight">{title}</h3>
              <p className="mt-2 text-muted">{body}</p>
            </div>
          </Item>
        ))}
      </Stagger>
    </section>
  );
}

/* ---------------------------------------------------------------- */
type Moment = { photo: PhotoKey; label: string; line: string; perk: string };
const MOMENTS: Moment[] = [
  { photo: "beach", label: "Pool & Beach", line: "Daybed, pool, sunset.", perk: "Free entry" },
  { photo: "bars", label: "Bars & Clubs", line: "On the list, first round in.", perk: "Guest list" },
  { photo: "dining", label: "Dining", line: "Long tables, golden hour.", perk: "15–25% off" },
  { photo: "family", label: "Family", line: "Slides, splashes, big smiles.", perk: "Kids go free" },
  { photo: "spa", label: "Spa & Fitness", line: "Slow down, switch off.", perk: "Circuits included" },
  { photo: "hero", label: "Clifftop clubs", line: "Toasts with a view.", perk: "VIP access" },
];

/** Lifestyle strip: six photo moments, compact. Grid on desktop, swipe on phones. */
export function Lifestyle() {
  return (
    <section className="relative overflow-hidden py-14 text-paper md:py-20">
      <WaveBackdrop />
      <div className="gutter relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal>
            <p className="eyebrow-pill">Lifestyle</p>
            <h2 className="display mt-2 text-[clamp(1.8rem,3.6vw,2.8rem)]">Everyday places. Better moments.</h2>
          </Reveal>
          <Link href="/access" className="btn btn-ghost btn-sm !border-paper/25 !text-paper hover:!bg-paper/10">All partners <span className="arrow">→</span></Link>
        </div>
      </div>
      <Stagger className="relative mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible md:px-[max(24px,calc((100vw-1280px)/2+24px))] md:pb-0 lg:grid-cols-6">
        {MOMENTS.map((m) => <MomentCard key={m.label} moment={m} />)}
      </Stagger>
    </section>
  );
}

function MomentCard({ moment }: { moment: Moment }) {
  const p = PHOTOS[moment.photo];
  return (
    <Item className="w-[62vw] max-w-[260px] shrink-0 snap-center md:w-auto md:max-w-none">
      <article className="shine group relative aspect-[3/4] overflow-hidden rounded-[22px] bg-night shadow-[0_24px_50px_-24px_rgba(0,0,0,0.8)] ring-1 ring-inset ring-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.src} alt={p.alt} loading="lazy" style={{ objectPosition: p.position }} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
        <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,11,10,0.92)_0%,rgba(10,11,10,0.35)_45%,transparent_70%)]" />
        <span className="absolute left-3 top-3 rounded-full bg-pickle px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-night">{moment.perk}</span>
        <div className="absolute inset-x-4 bottom-4">
          <p className="font-display text-lg font-bold leading-tight">{moment.label}</p>
          <p className="mt-0.5 text-sm text-paper/75">{moment.line}</p>
        </div>
      </article>
    </Item>
  );
}

/* ---------------------------------------------------------------- */
export function Together() {
  return (
    <section className="gutter py-20 md:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <SectionHead eyebrow="Together" title="Good things are better shared." body="Send a perk to a friend with a link, build a plan for Saturday, and keep it private between you. Pickle Together never moves money. It just gets everyone on the same page.">
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/app/together" className="btn btn-dark">Try Together in the demo</Link>
            <Link href="/how-it-works" className="btn btn-ghost">How it works</Link>
          </div>
        </SectionHead>
        <Reveal delay={0.1} className="relative">
          <div className="panel relative mx-auto max-w-md p-6">
            <div className="flex items-center justify-between"><p className="font-display text-lg font-bold">Saturday in Seminyak</p><DemoTag>Sample plan</DemoTag></div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><CalendarDays size={14} /> Sat 18 Oct · 3 perks · shared with 2 friends</p>
            <ul className="mt-5 space-y-2">
              {["Free coconut pastry with any coffee", "Free tailoring on any linen piece", "Daybed upgrade at sunset"].map((t, i) => (
                <li key={t} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-sm"><span className="num grid h-7 w-7 place-items-center rounded-full bg-night text-xs font-bold text-pickle">{i + 1}</span>{t}</li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-2"><span className="btn btn-primary btn-sm pointer-events-none"><Share2 size={14} /> Share plan</span><span className="btn btn-ghost btn-sm pointer-events-none"><Link2 size={14} /> Copy link</span></div>
          </div>
          <div aria-hidden="true" className="absolute -left-4 top-10 -rotate-6 rounded-2xl bg-pickle px-4 py-2 text-xs font-bold text-night shadow-lg">Sam saved this</div>
          <div aria-hidden="true" className="absolute -right-2 bottom-12 rotate-3 rounded-2xl bg-night px-4 py-2 text-xs font-bold text-pickle shadow-lg">Jo added a perk</div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
export function PartnersCta() {
  return (
    <section className="gutter py-20 md:py-28">
      <Reveal>
        <div className="surface-green grain relative overflow-hidden rounded-[var(--radius-card)] px-7 py-14 md:px-14 md:py-20">
          <div className="relative grid items-center gap-8 md:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="eyebrow-pill">For merchants</p>
              <h2 className="display mt-3 text-[clamp(2rem,4.5vw,3.5rem)]">Bring more people through your door.</h2>
              <p className="mt-4 max-w-lg text-lg text-night/75">Offer a perk members actually want, reach people who are already nearby and see how your campaign performs. No hardware, no new till flow.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/partners" className="btn btn-dark">Become a Pickle Partner</Link>
                <Link href="/merchant" className="btn btn-ghost !border-night/30 !text-night hover:!bg-night/10">See the merchant portal demo</Link>
              </div>
            </div>
            <div className="hidden justify-center md:flex"><div className="grid h-40 w-40 place-items-center rounded-[36px] bg-night text-pickle shadow-2xl"><Store size={72} strokeWidth={1.4} /></div></div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
