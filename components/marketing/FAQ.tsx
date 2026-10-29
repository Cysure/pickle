"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LAUNCH } from "@/lib/config";

export function faqItems() {
  const regions = LAUNCH.regions || "to be confirmed";
  const timing = LAUNCH.timing || "to be confirmed";
  const issuer = LAUNCH.issuer || "a licensed issuing partner, to be announced";
  return [
    { q: "What is Pickle Perks?", a: "Pickle Perks is a membership, in the mould of clubs like Privilee in the UAE but built for Bali: you subscribe to one monthly or annual plan and get perks across five categories: Pool & Beach (free entry), Bars & Clubs (guest list and welcome drinks), Dining (discounts), Family (kids' clubs and parks) and Spa & Fitness (gyms, shalas and spa circuits). You check in with the app and pay nothing at the door." },
    { q: "What about the Pickle Card?", a: `Coming soon. The Pickle Card is intended to be a payment card issued by ${issuer}, added after membership launches. You pay with it like any other card. When you pay at a Pickle partner, the perk you're eligible for unlocks automatically. Until the issuing product is live, the card on this site is a design preview.` },
    { q: "What is Pickle Access?", a: "Pickle Access is the check-in side of the membership: the venue list and the code you show at the desk. Plans and prices on this site are proposed and not yet for sale." },
    { q: "How do Pickle Perks work?", a: "Each perk has a partner, a category, a location, eligibility and an expiry. Save perks you like, see them on Pickle Radar and share them with friends. Perks are confirmed with each partner before they go live; the perks shown here are illustrative." },
    { q: "Is entry really free?", a: "At Pool & Beach and Spa & Fitness venues marked free entry, yes: your membership covers it and Pickle pays the venue per verified visit. Bars & Clubs give guest list and welcome drinks, Dining is a discount, Family venues are free or discounted, studios run on monthly class credits, and a few premium venues need the Duo or Family plan. We don't publish savings figures, because they depend on what you actually do." },
    { q: "Where is Pickle available?", a: `Launch regions: ${regions}. We'll confirm availability by email to the early-access list as regions open.` },
    { q: "Is Pickle a bank?", a: "No. Pickle is not a bank and does not hold deposits. Any card will be issued by a licensed partner under its own terms, and Pickle never stores card credentials." },
    { q: "When does Pickle launch?", a: `Timing: ${timing}. Joining early access does not issue a card and does not commit you to anything.` },
    { q: "How do merchants participate?", a: "Apply through the Partners page. Approved partners create and manage offers in the merchant portal, choose locations and dates, set limits and see illustrative performance. Nothing is published to members until the partner and Pickle both confirm." },
    { q: "How is my data protected?", a: "We collect the minimum needed: for early access, your name, email, country and interests, stored only with your consent. The app demo keeps your choices on your own device. See the privacy notice for details." },
  ];
}

export function FAQ({ limit }: { limit?: number }) {
  const items = faqItems().slice(0, limit);
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-ink/10 rounded-[var(--radius-card)] border border-ink/10 bg-white">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <h3>
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-display text-lg font-bold tracking-tight hover:text-pickle">
                {it.q}<ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? "rotate-180 text-pickle" : ""}`} />
              </button>
            </h3>
            <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden"><p className="px-6 pb-6 text-muted">{it.a}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
