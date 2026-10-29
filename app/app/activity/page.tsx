"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Gift } from "lucide-react";
import { AppHead } from "@/components/navigation/AppShell";
import { ACTIVITY, PERK_BY_ID, formatMoney } from "@/lib/demo/data";
import { CATEGORY_LABELS, type PerkCategory } from "@/lib/types";
import { DemoTag, EmptyState } from "@/components/ui";

const STATUS: Record<string, { label: string; cls: string }> = {
  "demo-settled": { label: "Settled · demo", cls: "pill-green" },
  "demo-pending": { label: "Pending · demo", cls: "pill-lime" },
  "demo-declined": { label: "Declined · demo", cls: "pill-outline" },
};

export default function ActivityPage() {
  const [cat, setCat] = useState<PerkCategory | "all">("all");
  const [range, setRange] = useState<"7" | "30" | "all">("30");
  const list = useMemo(() => {
    const cutoff = range === "all" ? 0 : Date.parse("2026-10-14T00:00:00Z") - Number(range) * 86_400_000;
    return ACTIVITY.filter((a) => (cat === "all" || a.category === cat) && Date.parse(a.date) >= cutoff);
  }, [cat, range]);
  const total = list.filter((a) => a.status !== "demo-declined").reduce((s, a) => s + a.amount, 0);

  return (
    <>
      <AppHead title="Activity" body="Sample transactions and the perks they unlocked. Figures are illustrative." tag="Sample data">
        <select className="select w-auto" value={range} onChange={(e) => setRange(e.target.value as typeof range)} aria-label="Date range"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="all">All sample data</option></select>
        <select className="select w-auto" value={cat} onChange={(e) => setCat(e.target.value as typeof cat)} aria-label="Category"><option value="all">All categories</option>{(Object.keys(CATEGORY_LABELS) as PerkCategory[]).map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}</select>
      </AppHead>
      <div className="panel mb-5 flex flex-wrap items-center justify-between gap-3 p-5">
        <div><p className="text-xs text-muted">Sample spend in range</p><p className="num font-display text-3xl font-bold">{formatMoney(total)}</p></div>
        <div><p className="text-xs text-muted">Perks unlocked</p><p className="num font-display text-3xl font-bold">{list.filter((a) => a.relatedPerkId).length}</p></div>
        <DemoTag>Sample transactions · illustrative amounts</DemoTag>
      </div>
      {list.length === 0 ? (
        <EmptyState title="No activity in this range" body="Try a wider date range or another category." />
      ) : (
        <ul className="panel divide-y divide-ink/5">
          {list.map((a) => {
            const perk = a.relatedPerkId ? PERK_BY_ID[a.relatedPerkId] : null;
            return (
              <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{a.merchantLabel}</p>
                  <p className="text-xs text-muted">{new Date(a.date).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {CATEGORY_LABELS[a.category]}</p>
                  {perk && <Link href={`/app/perks/${perk.id}`} className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-pickle/15 px-2.5 py-1 text-xs font-semibold text-ink hover:bg-pickle/30"><Gift size={12} className="text-pickle" /> {perk.title}</Link>}
                </div>
                <span className={STATUS[a.status].cls}>{STATUS[a.status].label}</span>
                <p className={`num w-24 text-right font-semibold ${a.status === "demo-declined" ? "line-through text-muted" : ""}`}>{formatMoney(a.amount, a.currency)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
