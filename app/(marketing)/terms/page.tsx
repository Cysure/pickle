import type { Metadata } from "next";
import { PageHead } from "@/components/marketing/PageHead";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <>
      <PageHead eyebrow="Legal" title="Terms of use" body="Draft terms for the Pickle website and app preview. Final terms, including card terms from the issuing partner, will be published before launch." />
      <section className="gutter max-w-3xl space-y-8 pb-24 text-muted [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink">
        <div><h2>1. What this site is</h2><p className="mt-2">This website and the app and merchant demos describe a product in development. Nothing here is an offer of a financial product, a card, credit or membership.</p></div>
        <div><h2>2. Demo content</h2><p className="mt-2">Merchants, venues, perks, transactions, balances, metrics and plans shown in the demos are fictional and illustrative. They do not represent real partners, real offers or real savings.</p></div>
        <div><h2>3. No card is issued</h2><p className="mt-2">Joining early access does not issue a card or create an account with any issuer. Any future card would be issued by a licensed partner under its own terms and subject to eligibility and local availability.</p></div>
        <div><h2>4. Perks</h2><p className="mt-2">Perks are offered by partners and may change, pause or end. Eligibility, limits and expiry are set per perk. Perks have no cash value and are not transferable.</p></div>
        <div><h2>5. Merchant portal</h2><p className="mt-2">The merchant portal demo lets you create and edit sample offers locally. Nothing created in the demo is published to members or to any live network.</p></div>
        <div><h2>6. Acceptable use</h2><p className="mt-2">Don&rsquo;t misuse the forms or attempt to disrupt the service. We may remove submissions that appear automated or abusive.</p></div>
        <div><h2>7. Liability</h2><p className="mt-2">The preview is provided as-is for evaluation. To the extent permitted by law, Pickle is not liable for decisions made in reliance on demo content.</p></div>
        <div><h2>8. Changes</h2><p className="mt-2">These terms will be replaced by full terms before launch, including the issuing partner&rsquo;s cardholder agreement.</p></div>
      </section>
    </>
  );
}
