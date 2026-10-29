"use client";
import { useState } from "react";
import { Snowflake, RotateCcw, Copy, Check, Bell } from "lucide-react";
import { AppHead } from "@/components/navigation/AppShell";
import { PickleCard } from "@/components/cards/PickleCard";
import { useDemo, updateDemo } from "@/lib/demo/store";
import { DEMO_CARD_REFERENCE, TIERS } from "@/lib/demo/data";
import { DemoTag, Toggle, toast } from "@/components/ui";
import { track } from "@/lib/analytics";

export default function CardPage() {
  const [demo, update] = useDemo();
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = DEMO_CARD_REFERENCE[demo.cardVariant];

  const copyRef = async () => {
    try { await navigator.clipboard.writeText(`PICKLE-DEMO-${ref.slice(-4)}`); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { toast("Clipboard blocked", "dark"); }
  };
  const freeze = () => {
    update({ frozen: !demo.frozen });
    track("card_frozen_toggled", { frozen: !demo.frozen });
    toast(!demo.frozen ? "Card frozen (demo)" : "Card unfrozen (demo)", !demo.frozen ? "dark" : "green");
  };

  return (
    <>
      <AppHead title="Your card" body="Coming soon. A preview of your future Pickle Pay Card; membership works without it. It can't make payments yet." tag="Coming soon" />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className={`relative mx-auto max-w-md px-4 transition-opacity ${demo.frozen ? "opacity-70 grayscale-[0.4]" : ""}`}>
            <PickleCard variant={demo.cardVariant} flipped={flipped} name={demo.displayName.toUpperCase() + " · MEMBER"} reference={ref} float />
            {demo.frozen && <div className="pointer-events-none absolute inset-0 grid place-items-center"><span className="flex items-center gap-2 rounded-full bg-night/85 px-4 py-2 text-sm font-bold text-paper"><Snowflake size={16} className="text-pickle" /> Frozen</span></div>}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFlipped((f) => !f)}><RotateCcw size={14} /> {flipped ? "Front" : "Flip"}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={copyRef}>{copied ? <Check size={14} /> : <Copy size={14} />} Copy demo reference</button>
            <button type="button" className={`btn btn-sm ${demo.frozen ? "btn-primary" : "btn-dark"}`} onClick={freeze}><Snowflake size={14} /> {demo.frozen ? "Unfreeze" : "Freeze card"}</button>
          </div>
          <p className="mt-3 text-center text-xs text-muted">Reference shown is masked and fictional. Freeze is a local demo state.</p>
        </section>

        <section className="space-y-5">
          <div className="panel p-5">
            <p className="eyebrow">Design</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {TIERS.map((t) => (
                <button key={t.id} type="button" aria-pressed={demo.cardVariant === t.id} onClick={() => { update({ cardVariant: t.id }); track("card_design_changed", { design: t.id }); }} className={`rounded-2xl border p-3 text-left text-xs font-semibold transition-colors ${demo.cardVariant === t.id ? "border-night bg-night text-paper" : "border-ink/10 hover:border-ink/40"}`}>
                  <span className={`block h-8 w-full rounded-lg ${t.id === "green" ? "bg-pickle" : t.id === "black" ? "bg-[#1b1c1a]" : "bg-forest"}`} />
                  <span className="mt-2 block">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="panel p-5">
            <p className="eyebrow">Card details</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted">Status</dt><dd className="font-semibold">{demo.frozen ? "Frozen (demo)" : "Active (demo)"}</dd></div>
              <div><dt className="text-muted">Reference</dt><dd className="num font-semibold">{ref}</dd></div>
              <div><dt className="text-muted">Expiry</dt><dd className="num font-semibold">MM/YY</dd></div>
              <div><dt className="text-muted">Contactless</dt><dd className="font-semibold">Yes</dd></div>
            </dl>
            <DemoTag className="mt-3">No valid card number exists for this card</DemoTag>
          </div>
          <div className="panel p-5">
            <p className="eyebrow flex items-center gap-1.5"><Bell size={12} /> Notifications</p>
            <ul className="mt-3 divide-y divide-ink/5 text-sm">
              {([["perks", "New perks near me"], ["activity", "Transaction and perk-unlock alerts"], ["plans", "Pickle Together updates"]] as const).map(([k, label]) => (
                <li key={k} className="flex items-center justify-between py-3"><span>{label}</span><Toggle checked={demo.notifications[k]} label={label} onChange={(v) => updateDemo({ notifications: { ...demo.notifications, [k]: v } })} /></li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
