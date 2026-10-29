import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/marketing/PageHead";
import { Plans } from "@/components/access/Plans";
import { SectionHead } from "@/components/marketing/Sections";
import { Reveal } from "@/components/motion/Reveal";
import { FAQ } from "@/components/marketing/FAQ";
import { MascotTag } from "@/components/brand/Mascot";

export const metadata: Metadata = { title: "Pricing" };

const RULES = [
  "Pool & Beach: free entry, unlimited visits, one check-in per venue per day.",
  "Bars & Clubs: guest list, no cover charge and welcome drinks on the nights listed.",
  "Dining: 15 to 25% off the food bill with any plan.",
  "Family: kids' venues are included on the Family plan.",
  "Spa & Fitness: gyms and hydro circuits free; studios on monthly class credits.",
  "Guest passes: 2, 4 or 6 a month depending on your plan.",
  "Premium venues: included from Duo.",
  "Cancel at the end of any billing period.",
];

export default function PricingPage() {
  return (
    <>
      <PageHead mascot={{ bubble: "Go annual and save 17% on any plan.", note: "Cancel any time", stat: { value: "3", label: "plans" }, prop: <MascotTag>From Rp 1.45m / mo</MascotTag> }} eyebrow="Pricing" title={<>One plan. <span className="text-pickle">Every perk.</span></>} body="Pick Solo, Duo or Family, pay monthly or save with annual. Proposed pricing; nothing is on sale yet.">
        <Link href="/early-access" className="btn btn-primary">Join early access</Link>
        <Link href="/perks" className="btn btn-ghost">What's included</Link>
      </PageHead>
      <section className="gutter pb-16"><Plans /></section>
      <section className="surface-cream py-16 md:py-24">
        <div className="gutter grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHead eyebrow="The rules" title="In plain words." />
          <Reveal><ul className="panel grid gap-2 p-6 text-sm sm:grid-cols-2 md:p-8">{RULES.map((r) => <li key={r} className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pickle" /> {r}</li>)}</ul></Reveal>
        </div>
      </section>
      <section className="gutter py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHead eyebrow="FAQ" title="Before you join."><Link href="/contact" className="btn btn-ghost mt-6">Ask us something</Link></SectionHead>
          <Reveal><FAQ limit={6} /></Reveal>
        </div>
      </section>
    </>
  );
}
