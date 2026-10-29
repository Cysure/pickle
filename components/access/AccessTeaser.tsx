"use client";
import Link from "next/link";
import { Waves, Martini, Baby, Utensils, Dumbbell } from "lucide-react";
import { SectionHead } from "@/components/marketing/Sections";
import { Stagger, Item } from "@/components/motion/Reveal";
import { ACCESS_VENUES } from "@/lib/demo/access";
import { DemoTag } from "@/components/ui";

const TILES = [
  { icon: Waves, label: "Pool & Beach", cat: "pool-beach", tone: "bg-pickle text-night" },
  { icon: Martini, label: "Bars & Clubs", cat: "bars-clubs", tone: "bg-night text-paper" },
  { icon: Utensils, label: "Dining", cat: "dining", tone: "bg-cream text-ink" },
  { icon: Baby, label: "Family", cat: "family", tone: "bg-lime text-night" },
  { icon: Dumbbell, label: "Spa & Fitness", cat: "spa-fitness", tone: "bg-forest text-paper" },
] as const;

/** Homepage section introducing the membership model. */
export function AccessTeaser() {
  const counts = Object.fromEntries(TILES.map((t) => [t.cat, ACCESS_VENUES.filter((v) => v.category === t.cat).length]));
  return (
    <section className="gutter py-20 md:py-28" id="access">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead eyebrow="Access" title={<>Free access to the best of Bali.<br />One membership.</>} body="Resort pools, beach clubs, gyms, yoga shalas, spas, kids' clubs, surf houses and courts: walk in free with the app, nothing to pay at the door. Plus dining discounts everywhere Pickle is." />
        <DemoTag>Fictional venues · proposed plans</DemoTag>
      </div>
      <Stagger className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5">
        {TILES.map(({ icon: Icon, label, cat, tone }) => (
          <Item key={cat}>
            <Link href={`/access#${cat}`} className={`shine group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-[var(--radius-card)] p-5 ring-1 ring-inset ring-ink/5 transition-transform duration-500 hover:-translate-y-1 ${tone}`}>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-current/10 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"><Icon size={22} /></span>
              <span><span className="num block font-display text-3xl font-bold">{counts[cat]}</span><span className="block text-sm font-semibold">{label}</span></span>
            </Link>
          </Item>
        ))}
      </Stagger>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/access" className="btn btn-primary">Explore Pickle Access <span className="arrow">→</span></Link>
        <Link href="/app/access" className="btn btn-ghost">Try Pickle Access check-in in the demo</Link>
      </div>
    </section>
  );
}
