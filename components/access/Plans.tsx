"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { ACCESS_PLANS } from "@/lib/demo/access";
import { formatMoney } from "@/lib/demo/data";
import { annualSaving } from "@/lib/access";
import { useDemo, setAccessPlan } from "@/lib/demo/store";
import { DemoTag, toast } from "@/components/ui";
import { Stagger, Item } from "@/components/motion/Reveal";
import Link from "next/link";

/** Proposed Pickle Access plans with a monthly/annual switch. Never sold here. */
export function Plans({ selectable = false, dark = false }: { selectable?: boolean; dark?: boolean }) {
  const [demo] = useDemo();
  const [billing, setBilling] = useState<"monthly" | "annual">(selectable ? demo.access.billing : "monthly");
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className={`flex rounded-full border p-0.5 ${dark ? "border-paper/20" : "border-ink/15 bg-white"}`} role="group" aria-label="Billing">
          {(["monthly", "annual"] as const).map((b) => (
            <button key={b} type="button" onClick={() => { setBilling(b); if (selectable) setAccessPlan(demo.access.plan, b); }} aria-pressed={billing === b} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${billing === b ? "bg-pickle text-night" : dark ? "text-paper" : ""}`}>
              {b === "monthly" ? "Monthly" : "Annual"}
            </button>
          ))}
        </div>
        <DemoTag>Proposed · IDR</DemoTag>
      </div>
      <Stagger className="grid gap-5 md:grid-cols-3">
        {ACCESS_PLANS.map((p, i) => {
          const featured = i === 1;
          const price = billing === "monthly" ? p.monthly : Math.round(p.annual / 12);
          const saving = annualSaving(p);
          const current = selectable && demo.access.plan === p.id;
          return (
            <Item key={p.id}>
              <article className={`shine relative flex h-full flex-col p-6 ${featured ? "panel-dark" : dark ? "panel-dark" : "panel"}`}>
                {featured && <span className="absolute -top-3 left-6 rounded-full bg-pickle px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-night">Most popular</span>}
                <p className={`eyebrow ${featured || dark ? "text-pickle" : ""}`}>{p.name}</p>
                <p className={`mt-1 text-sm ${featured || dark ? "text-paper/60" : "text-muted"}`}>{p.covers}</p>
                <p className={`num mt-5 font-display text-3xl font-bold ${featured || dark ? "text-paper" : ""}`}>{formatMoney(price)}<span className={`text-sm font-semibold ${featured || dark ? "text-paper/50" : "text-muted"}`}> /month</span></p>
                <p className={`mt-1 text-xs ${featured || dark ? "text-paper/50" : "text-muted"}`}>{billing === "annual" ? `${formatMoney(p.annual)} a year · save ${saving.percent}%` : `or ${formatMoney(p.annual)} a year (save ${saving.percent}%)`}</p>
                <ul className={`mt-5 space-y-2 text-sm ${featured || dark ? "text-paper/85" : ""}`}>
                  {p.highlights.map((h) => <li key={h} className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-pickle" /> {h}</li>)}
                </ul>
                <div className="mt-auto pt-6">
                  {selectable ? (
                    <button type="button" onClick={() => { setAccessPlan(p.id, billing); toast(`Previewing ${p.name}`); }} className={`btn w-full ${current ? "btn-primary" : featured ? "btn-primary" : "btn-dark"}`}>{current ? "Your demo plan" : "Preview this plan"}</button>
                  ) : (
                    <Link href="/early-access" className={`btn w-full ${featured ? "btn-primary" : "btn-dark"}`}>Join the waiting list</Link>
                  )}
                </div>
              </article>
            </Item>
          );
        })}
      </Stagger>
    </div>
  );
}
