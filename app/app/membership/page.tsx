"use client";
import { AppHead } from "@/components/navigation/AppShell";
import { TierCards } from "@/components/marketing/Tiers";
import { useDemo } from "@/lib/demo/store";
import { TIERS } from "@/lib/demo/data";
import { DemoTag } from "@/components/ui";
import { Plans } from "@/components/access/Plans";

const MILESTONES = [
  { label: "Joined Pickle", done: true },
  { label: "Saved your first perk", done: true },
  { label: "Unlocked a perk at a partner", done: true },
  { label: "Planned something with Pickle Together", done: false },
  { label: "Visited three neighbourhoods", done: false },
];

export default function MembershipPage() {
  const [demo, update] = useDemo();
  const tier = TIERS.find((t) => t.id === demo.tier)!;
  return (
    <>
      <AppHead title="Membership" body="Your demo tier, what each tier would include, and illustrative milestones. Tiers are proposed and not for sale." tag="Proposed tiers" />
      <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="panel-dark p-6">
          <p className="eyebrow text-pickle">Current demo tier</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-paper">{tier.name}</h2>
          <p className="mt-1 text-paper/60">{tier.description}</p>
          <p className="mt-5 text-xs text-paper/50">Preview a different tier in this demo to see how eligibility changes across the app:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIERS.map((t) => <button key={t.id} type="button" aria-pressed={demo.tier === t.id} onClick={() => update({ tier: t.id, cardVariant: t.id })} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${demo.tier === t.id ? "bg-pickle text-night" : "bg-paper/10 text-paper hover:bg-paper/20"}`}>{t.name}</button>)}
          </div>
        </div>
        <div className="panel p-6">
          <div className="flex items-center justify-between"><p className="eyebrow">Milestones</p><DemoTag>Illustrative</DemoTag></div>
          <ul className="mt-4 space-y-3">
            {MILESTONES.map((m) => (
              <li key={m.label} className="flex items-center gap-3 text-sm"><span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${m.done ? "bg-pickle text-night" : "bg-cream text-muted"}`}>{m.done ? "✓" : ""}</span><span className={m.done ? "" : "text-muted"}>{m.label}</span></li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">Milestones are examples of how membership could grow. We don&rsquo;t show savings totals because they would be invented.</p>
        </div>
      </div>
      <div className="mb-6 mt-12 flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-bold tracking-tight">Access plans</h2><p className="mt-2 text-sm text-muted">Free entry to partner venues across Bali on one membership. Proposed plans; switch to preview how venue eligibility changes.</p></div></div>
      <Plans selectable />
      <h2 className="mb-4 mt-12 font-display text-2xl font-bold tracking-tight">Perk tiers</h2>
      <TierCards current={demo.tier} showCards={false} />
    </>
  );
}
