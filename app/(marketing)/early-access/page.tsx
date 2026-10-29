import type { Metadata } from "next";
import { PageHead } from "@/components/marketing/PageHead";
import { EarlyAccessForm } from "@/components/forms/EarlyAccessForm";
import { PickleCard } from "@/components/cards/PickleCard";
import { Reveal } from "@/components/motion/Reveal";
import { MascotTag } from "@/components/brand/Mascot";

export const metadata: Metadata = { title: "Early access" };

export default function EarlyAccessPage() {
  return (
    <>
      <PageHead mascot={{ bubble: "Plans open soon. Be first in.", note: "No charge to join", prop: <MascotTag>Early access</MascotTag> }} eyebrow="Early access" title={<>Be <span className="text-pickle">first in line.</span></>} body="Join the list and we'll tell you when Pickle opens where you are. Joining doesn't issue a card and doesn't commit you to anything." />
      <section className="gutter grid gap-12 pb-24 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal><div className="panel p-6 md:p-8"><EarlyAccessForm /></div></Reveal>
        <Reveal delay={0.15}>
          <div className="sticky top-28 px-6"><PickleCard variant="green" float /><p className="mt-6 text-center text-sm text-muted">Pick a preferred design on the form, or decide later.</p></div>
        </Reveal>
      </section>
    </>
  );
}
