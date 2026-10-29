import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHead } from "@/components/marketing/PageHead";
import { PerkExplorer } from "@/components/perks/PerkExplorer";
import { Included, HowMembershipWorks, VenueRows } from "@/components/marketing/Membership";
import { Plans } from "@/components/access/Plans";
import { SectionHead } from "@/components/marketing/Sections";
import { Reveal } from "@/components/motion/Reveal";
import { ACCESS_VENUES } from "@/lib/demo/access";
import { Lifestyle } from "@/components/marketing/Sections";
import { MascotTag } from "@/components/brand/Mascot";

export const metadata: Metadata = { title: "Pickle Perks membership" };

const RULES = [
  "Pool & Beach: free entry, unlimited visits, one check-in per venue per day.",
  "Bars & Clubs: guest list, no cover charge and welcome drinks on the nights listed.",
  "Spa & Fitness: gyms and hydro circuits free; studios on monthly class credits.",
  "Premium venues: included from Duo, or weekday-only on Solo.",
  "Guest passes: 2, 4 or 6 a month depending on your plan.",
  "Weekend rules at busy beach clubs keep queues short for everyone.",
  "Dining: 15 to 25% off the food bill with any plan.",
  "Family: kids' venues are included on the Family plan; kids are covered at family venues.",
];

export default function PerksPage() {
  return (
    <>
      <PageHead mascot={{ bubble: "Free entry at Tamarind Beach Club. Checked in.", note: "On the list tonight", stat: { value: "5", label: "ways in" }, prop: <MascotTag>VIP pass</MascotTag> }} eyebrow="Perks" title={<>The membership that gets you <span className="text-pickle">in</span>.</>} body={`One subscription, five categories: Pool & Beach, Bars & Clubs, Dining, Family and Spa & Fitness. ${ACCESS_VENUES.length} registered partners, all through the app. Plans and partners shown are a proposed demo.`}>
        <Link href="#plans" className="btn btn-primary">See the plans</Link>
        <Link href="/app" className="btn btn-ghost">Try the app demo</Link>
      </PageHead>
      <Included />
      <HowMembershipWorks />
      <VenueRows />
      <Lifestyle />
      <section id="plans" className="surface-cream scroll-mt-24 py-20 md:py-28">
        <div className="gutter">
          <SectionHead eyebrow="Plans" title="Pick the plan that fits your week." body="Proposed pricing in rupiah. Nothing is on sale yet; join early access and you'll be first to hear when plans open." />
          <div className="mt-12"><Plans /></div>
          <Reveal className="mt-10"><div className="panel p-6 md:p-8"><p className="eyebrow-pill">Membership rules, in plain words</p><ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">{RULES.map((r) => <li key={r} className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pickle" /> {r}</li>)}</ul></div></Reveal>
        </div>
      </section>
      <section id="perks" className="gutter scroll-mt-24 py-20 md:py-28">
        <SectionHead eyebrow="Member perks" title="The little extras at partners." body="Every perk here is an illustrative demo; live perks are confirmed with each partner before launch. Perks marked with a lock need a higher plan." />
        <div className="mt-10"><Suspense fallback={<div className="skeleton h-64 rounded-[var(--radius-card)]" />}><PerkExplorer showTierFilter /></Suspense></div>
      </section>
    </>
  );
}
