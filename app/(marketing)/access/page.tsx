import type { Metadata } from "next";
import Link from "next/link";
import { Users, Store, Wallet, ShieldCheck } from "lucide-react";
import { PageHead } from "@/components/marketing/PageHead";
import { SectionHead } from "@/components/marketing/Sections";
import { VenueGrid } from "@/components/access/VenueGrid";
import { Plans } from "@/components/access/Plans";
import { Reveal, Stagger, Item } from "@/components/motion/Reveal";
import { ACCESS_MODEL, ACCESS_VENUES } from "@/lib/demo/access";
import { ACCESS_CATEGORY_LABELS, type AccessCategory } from "@/lib/types";
import { DemoTag } from "@/components/ui";
import { HowMembershipWorks } from "@/components/marketing/Membership";
import { MascotTag } from "@/components/brand/Mascot";

export const metadata: Metadata = { title: "Pickle Access" };

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

export default function AccessPage() {
  const cats = Object.keys(ACCESS_CATEGORY_LABELS) as AccessCategory[];
  return (
    <>
      <PageHead mascot={{ flip: true, bubble: "Saltwater Spa, Sunset Lawn and more near you.", note: "Nearest: Seminyak", stat: { value: "38", label: "partners" }, prop: <MascotTag>Free entry</MascotTag> }} eyebrow="Access" title={<>Every <span className="text-pickle">registered partner</span> your membership gets you into.</>} body={`Five categories, one subscription: Pool & Beach, Bars & Clubs, Dining, Family and Spa & Fitness. ${ACCESS_VENUES.length} registered partners, checked into with the app. Partners and prices here are a proposed demo.`}>
        <Link href="#plans" className="btn btn-primary">See the plans</Link>
        <Link href="/app/access" className="btn btn-ghost">Try check-in in the demo</Link>
      </PageHead>

      <section className="gutter pb-16">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => <a key={c} href={`#${c}`} className="rounded-full bg-cream px-4 py-2 text-sm font-semibold hover:bg-pickle hover:text-night">{ACCESS_CATEGORY_LABELS[c]} <span className="num text-muted">{ACCESS_VENUES.filter((v) => v.category === c).length}</span></a>)}
        </div>
      </section>

      <HowMembershipWorks />

      <section className="gutter py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow="Pickle Access venues" title="Where Pickle Access gets you in." body="Fictional partners placed in real Bali areas, so you can see how the network would feel. Filter by category or area." />
          <DemoTag>Fictional venues for the demo</DemoTag>
        </div>
        <div className="mt-10"><VenueGrid /></div>
      </section>

      {cats.map((c) => (
        <section key={c} id={c} className="scroll-mt-24 gutter pb-16">
          <h2 className="mb-5 flex items-center gap-3 font-display text-2xl font-bold tracking-tight">{ACCESS_CATEGORY_LABELS[c]} <span className="num rounded-full bg-cream px-2.5 py-0.5 text-sm text-muted">{ACCESS_VENUES.filter((v) => v.category === c).length}</span></h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACCESS_VENUES.filter((v) => v.category === c).map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-sm"><span><span className="font-semibold">{v.name}</span> <span className="text-muted">· {v.area}</span></span><span className="shrink-0 text-xs font-semibold text-pickle">{v.kind === "free-entry" ? "Free entry" : v.kind === "class-credit" ? "Classes" : v.kind === "perk" ? (v.perkLabel ?? "Member perk") : `${v.discountPercent}% off`}</span></li>
            ))}
          </ul>
        </section>
      ))}

      <section id="plans" className="surface-cream scroll-mt-24 py-20 md:py-28">
        <div className="gutter">
          <SectionHead eyebrow="Pickle Access plans" title="Pick the Pickle Access plan that fits your week." body="Proposed pricing in rupiah. Nothing is on sale yet; join early access and you'll be first to hear when plans open." />
          <div className="mt-12"><Plans /></div>
          <Reveal className="mt-10">
            <div className="panel p-6 md:p-8">
              <p className="eyebrow-pill">Membership rules, in plain words</p>
              <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">{RULES.map((r) => <li key={r} className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pickle" /> {r}</li>)}</ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="gutter py-20 md:py-28">
        <SectionHead eyebrow="The Pickle Access model" title="Why venues say yes." body="Pickle Access is a membership business: members pay Pickle, Pickle pays venues per verified visit. Everyone's incentives line up on the quiet days." />
        <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
          {[[Wallet, "Members", ACCESS_MODEL.memberPays], [Store, "Venues", ACCESS_MODEL.venueGets], [ShieldCheck, "Pickle", ACCESS_MODEL.pickleKeeps]].map(([Icon, t, b]) => {
            const I = Icon as typeof Wallet;
            return <Item key={t as string}><div className="panel shine h-full p-6"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-night text-pickle"><I size={22} /></span><h3 className="mt-5 font-display text-xl font-bold">{t as string}</h3><p className="mt-2 text-sm text-muted">{b as string}</p></div></Item>;
          })}
        </Stagger>
        <div className="mt-10 flex flex-wrap gap-3"><Link href="/partners" className="btn btn-dark"><Users size={16} /> List your venue</Link><Link href="/early-access" className="btn btn-primary">Join the waiting list</Link></div>
      </section>
    </>
  );
}
