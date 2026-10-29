import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/marketing/PageHead";
import { Steps } from "@/components/marketing/Steps";
import { PayDiscoverUnlock, SectionHead } from "@/components/marketing/Sections";
import { Reveal } from "@/components/motion/Reveal";
import { MascotTag } from "@/components/brand/Mascot";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <>
      <PageHead mascot={{ flip: true, bubble: "Subscribe. Open the app. Walk in.", note: "Nothing to pay at the door", stat: { value: "3", label: "steps" }, prop: <MascotTag>Walk in</MascotTag> }} eyebrow="How it works" title={<>One membership. <span className="text-pickle">Then just go.</span></>} body="Pickle Perks is a membership first: one plan, free entry, check in with the app. The card comes later. Here's the whole journey, honestly described.">
        <Link href="/pricing" className="btn btn-primary">See plans</Link>
        <Link href="/app" className="btn btn-ghost">Open the app demo</Link>
      </PageHead>
      <section className="gutter pb-20"><Steps /></section>
      <PayDiscoverUnlock />
      <section className="surface-dark grain py-20 md:py-28">
        <div className="gutter grid gap-12 lg:grid-cols-2">
          <SectionHead dark eyebrow="Behind the scenes" title="How a perk actually unlocks." />
          <Reveal delay={0.1}>
            <ol className="space-y-4">
              {[
                ["You pay at a partner", "Your card payment goes through the issuer and card network as normal. Pickle never sees your card credentials."],
                ["The issuer notifies Pickle", "A signed transaction event reaches Pickle's servers. Its signature is verified and duplicates are ignored."],
                ["Eligibility is checked server-side", "Pickle matches the partner, the time and your membership tier against the perk's rules. Nothing is granted on a claim from the app."],
                ["The perk unlocks", "You get a notification and the perk appears in your activity with the related transaction."],
              ].map(([t, b], i) => (
                <li key={t} className="panel-dark flex gap-4 p-5">
                  <span className="num grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pickle font-display font-bold text-night">{i + 1}</span>
                  <div><p className="font-display text-lg font-bold text-paper">{t}</p><p className="mt-1 text-sm text-paper/60">{b}</p></div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>
    </>
  );
}
