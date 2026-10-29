"use client";
import { UserPlus, CreditCard, QrCode, Smartphone } from "lucide-react";
import { Stagger, Item } from "@/components/motion/Reveal";

export const STEPS = [
  { icon: UserPlus, title: "Choose a plan", body: "Solo, Duo or Family, monthly or annual. Join early access now; plans open with the Bali launch." },
  { icon: Smartphone, title: "Open the app", body: "Every venue with hours and what's included, your perks nearby, and Pickle Radar to find the next one." },
  { icon: QrCode, title: "Check in and walk in", body: "Show the code at the desk for free entry. Guests use your passes. Dining discounts apply at the bill." },
  { icon: CreditCard, title: "Pickle Card: coming soon", body: "Later, a card from a licensed issuer unlocks perks automatically when you pay. Membership works without it." },
];

export function Steps({ dark = false }: { dark?: boolean }) {
  return (
    <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map(({ icon: Icon, title, body }, i) => (
        <Item key={title}>
          <div className={`${dark ? "panel-dark" : "panel"} relative h-full p-6`}>
            <div className="flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pickle text-night"><Icon size={22} /></span>
              <span className={`num font-display text-4xl font-bold ${dark ? "text-paper/15" : "text-cream"}`}>0{i + 1}</span>
            </div>
            <h3 className={`mt-5 font-display text-xl font-bold tracking-tight ${dark ? "text-paper" : ""}`}>{title}</h3>
            <p className={`mt-2 text-sm ${dark ? "text-paper/60" : "text-muted"}`}>{body}</p>
          </div>
        </Item>
      ))}
    </Stagger>
  );
}
