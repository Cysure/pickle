import type { Metadata } from "next";
import { PageHead } from "@/components/marketing/PageHead";

export const metadata: Metadata = { title: "Privacy notice" };

export default function PrivacyPage() {
  return (
    <>
      <PageHead eyebrow="Legal" title="Privacy notice" body="Draft notice for the Pickle website and app preview. It describes what this site and demo actually do today, and will be reviewed by counsel before any live launch." />
      <section className="gutter max-w-3xl space-y-8 pb-24 text-muted [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink">
        <div><h2>Who we are</h2><p className="mt-2">Pickle is a lifestyle and perks programme in development. Pickle is not a bank and does not issue payment cards itself. Contact details will be published here before launch.</p></div>
        <div><h2>What we collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong className="text-ink">Early access:</strong> first name, email, country, primary interest and optional card style preference, with your consent, so we can contact you about availability.</li>
            <li><strong className="text-ink">Partner applications:</strong> business name, contact name, work email, city, country, category and an optional message, to discuss a partnership.</li>
            <li><strong className="text-ink">App demo:</strong> your choices (saved perks, card design, plans, settings) are stored only in your browser&rsquo;s local storage and never sent to us.</li>
            <li><strong className="text-ink">Location:</strong> only if you tap &ldquo;Use my location&rdquo; in Pickle Radar, and only on your device. We do not transmit or store it.</li>
          </ul>
        </div>
        <div><h2>What we don&rsquo;t collect</h2><p className="mt-2">Card numbers, PINs, passwords or any payment credentials. The cards shown are design previews with masked, invalid references.</p></div>
        <div><h2>Where data is stored</h2><p className="mt-2">If a database is configured, form submissions are stored in Supabase with row-level security. If none is configured, the server validates your submission and discards it; the form tells you when this &ldquo;local demo mode&rdquo; is active.</p></div>
        <div><h2>Analytics</h2><p className="mt-2">Product events (such as &ldquo;perk saved&rdquo;) carry no personal data. With no analytics provider configured they are logged locally in development only.</p></div>
        <div><h2>Your rights</h2><p className="mt-2">You can ask us to access, correct or delete anything you submitted. A contact address will be published here before launch. Demo data in your browser can be cleared from the app&rsquo;s Settings page.</p></div>
        <div><h2>Changes</h2><p className="mt-2">This notice will change as the product does. The date of the last update will be shown here.</p></div>
      </section>
    </>
  );
}
