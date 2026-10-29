import type { Metadata } from "next";
import { CardHero } from "@/components/cards/CardHero";
import { CardShowcase } from "@/components/cards/CardShowcase";
import { TierCards } from "@/components/marketing/Tiers";
import { SectionHead } from "@/components/marketing/Sections";

export const metadata: Metadata = { title: "The Pickle Card" };

export default function CardPage() {
  return (
    <>
      <CardHero />
      <section className="gutter py-16 md:py-24">
        <SectionHead eyebrow="Finishes" title="Pick your finish." body="Three designs, one wordmark. Matched to your plan." />
        <div className="relative mt-10 overflow-hidden rounded-[32px] bg-[#F1F2EE] px-5 py-10 ring-1 ring-ink/5 md:px-12 md:py-14">
          <div className="relative"><CardShowcase /></div>
        </div>
      </section>
      <section className="surface-dark grain py-20 md:py-28">
        <div className="gutter">
          <SectionHead dark eyebrow="Designs by tier" title="One design per membership." body="Proposed. Tiers are not yet for sale and no card is issued today." />
          <div className="mt-12"><TierCards /></div>
          <p className="mt-10 max-w-2xl text-sm text-paper/50">Card images are design previews. The payment network, issuer name and legal text will appear on the final card once the issuing partner is confirmed. The numbers shown are masked references and are not valid card numbers.</p>
        </div>
      </section>
    </>
  );
}
