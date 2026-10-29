import Link from "next/link";
import { Hero } from "@/components/marketing/Hero";
import { Included, CardComingSoon } from "@/components/marketing/Membership";
import { Steps3 } from "@/components/marketing/Steps3";
import { SectionHead } from "@/components/marketing/Sections";
import { Plans } from "@/components/access/Plans";
import { EarlyAccessForm } from "@/components/forms/EarlyAccessForm";
import { Reveal } from "@/components/motion/Reveal";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Included />
      <Steps3 />

      <section className="surface-cream py-20 md:py-28" id="plans">
        <div className="gutter">
          <SectionHead eyebrow="Plans" title="Pick your plan." body="Proposed pricing. Nothing on sale yet." />
          <div className="mt-12"><Plans /></div>
        </div>
      </section>

      <CardComingSoon />

      <section className="gutter py-20 md:py-28" id="early-access">
        <Reveal>
          <div className="panel grid gap-8 p-7 md:grid-cols-[1fr_1.1fr] md:p-12">
            <div>
              <p className="eyebrow-pill">Early access</p>
              <h2 className="display mt-3 text-[clamp(2rem,4.5vw,3.5rem)]">Be first in.</h2>
              <p className="mt-4 text-muted">We&rsquo;ll tell you when Pickle Perks opens in Bali. No charge, no card.</p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
                <Link href="/access" className="btn btn-ghost btn-sm">All venues</Link>
                <Link href="/partners" className="btn btn-ghost btn-sm">List your venue</Link>
                <Link href="/faq" className="btn btn-ghost btn-sm">FAQ</Link>
              </div>
            </div>
            <EarlyAccessForm compact />
          </div>
        </Reveal>
      </section>
    </>
  );
}
