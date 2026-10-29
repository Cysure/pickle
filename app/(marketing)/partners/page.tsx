import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Target, BarChart3, ShieldCheck } from "lucide-react";
import { PageHead } from "@/components/marketing/PageHead";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { SectionHead } from "@/components/marketing/Sections";
import { Stagger, Item, Reveal } from "@/components/motion/Reveal";
import { MascotTag } from "@/components/brand/Mascot";

export const metadata: Metadata = { title: "Partners" };

const WHY = [
  { icon: Eye, t: "Be seen by people nearby", b: "Pickle Radar shows your place to members in your neighbourhood when they're deciding where to go." },
  { icon: Target, t: "Offer what you choose", b: "You write the perk, the terms, the dates and the limits. Change or pause it any time from the portal." },
  { icon: BarChart3, t: "See what works", b: "Views, saves and redemptions per campaign, so you learn what members respond to." },
  { icon: ShieldCheck, t: "Nothing at the till", b: "Perks unlock from the card payment itself. No codes to check, no new hardware, no staff training." },
];

export default function PartnersPage() {
  return (
    <>
      <PageHead mascot={{ bubble: "A new member just checked in at your venue.", note: "No codes at the till", stat: { value: "0", label: "new hardware" }, prop: <MascotTag>Paid per visit</MascotTag> }} eyebrow="For merchants" title={<>Bring more people <span className="text-pickle">through your door.</span></>} body="Join Pickle as a partner and reach members who are already nearby, with a perk you design.">
        <a href="#apply" className="btn btn-primary">Become a Pickle Partner</a>
        <Link href="/merchant" className="btn btn-ghost">Try the portal demo</Link>
      </PageHead>
      <section className="gutter pb-20">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map(({ icon: Icon, t, b }) => (
            <Item key={t}><div className="panel shine h-full p-6"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-night text-pickle"><Icon size={22} /></span><h3 className="mt-5 font-display text-xl font-bold tracking-tight">{t}</h3><p className="mt-2 text-sm text-muted">{b}</p></div></Item>
          ))}
        </Stagger>
      </section>
      <section id="apply" className="surface-cream py-20 md:py-28">
        <div className="gutter grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHead eyebrow="Apply" title="Tell us about your place." body="Applications are reviewed as regions open. We'll never publish an offer to members without your confirmation." />
          <Reveal delay={0.1}><div className="panel p-6 md:p-8"><PartnerForm /></div></Reveal>
        </div>
      </section>
    </>
  );
}
