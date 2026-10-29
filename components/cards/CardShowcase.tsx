"use client";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { PickleCard } from "./PickleCard";
import { DEMO_CARD_REFERENCE, TIERS } from "@/lib/demo/data";
import type { CardVariant } from "@/lib/types";

const DESC: Record<CardVariant, string> = {
  green: "Signature Pickle green with a black wordmark. Bright, friendly, unmistakably Pickle.",
  black: "Deep satin black with the wordmark in green. Quieter, for people who like their card to whisper.",
  reserve: "Premium charcoal with a forest undertone, finished in green. Proposed for Reserve members.",
};

export function CardShowcase({ initial = "green" }: { initial?: CardVariant }) {
  const [v, setV] = useState<CardVariant>(initial);
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
      <div className="relative mx-auto w-full max-w-[560px] px-4">
        <div aria-hidden="true" className={`absolute inset-x-6 top-1/2 h-2/3 -translate-y-1/2 rounded-full blur-3xl transition-colors duration-700 ${v === "green" ? "bg-pickle/40" : v === "black" ? "bg-night/25" : "bg-forest/30"}`} />
        <PickleCard variant={v} flipped={flipped} reference={DEMO_CARD_REFERENCE[v]} float />
      </div>
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-night px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-pickle">Coming soon</span>
        <div className="mt-4 flex gap-2" role="group" aria-label="Card design">
          {TIERS.map((t) => (
            <button key={t.id} type="button" onClick={() => { setV(t.id); setFlipped(false); }} aria-pressed={v === t.id} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${v === t.id ? "border-night bg-night text-paper" : "border-ink/15 hover:border-ink/40"}`}>
              <span className={`h-3.5 w-3.5 rounded-full ${t.id === "green" ? "bg-pickle" : t.id === "black" ? "bg-night ring-1 ring-paper/40" : "bg-forest"}`} />{t.name}
            </button>
          ))}
        </div>
        <h3 className="mt-6 font-display text-3xl font-bold tracking-tight">{TIERS.find((t) => t.id === v)!.name}</h3>
        <p className="mt-2 text-muted">{DESC[v]}</p>
        <ul className="mt-6 space-y-2 text-sm">
          <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-pickle" /> Chip and contactless</li>
          <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-pickle" /> Exact Pickle wordmark, never redrawn</li>
          <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-pickle" /> Masked demo reference only; no valid card numbers</li>
          <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-pickle" /> Network, issuer and terms shown once confirmed</li>
        </ul>
        <button type="button" onClick={() => setFlipped((f) => !f)} className="btn btn-ghost btn-sm mt-6"><RotateCcw size={14} /> {flipped ? "Show front" : "Flip card"}</button>
      </div>
    </div>
  );
}
