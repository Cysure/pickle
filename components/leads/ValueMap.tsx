"use client";
import { useState } from "react";
import type { Lead } from "@/lib/leads/config";
import { idrShort } from "@/lib/leads/config";
import { CATEGORY_COLOR } from "./colors";

// Popularity (x) against what a member saves per visit (y, log scale).
// Top-right = venues that make the membership worth buying.
const W = 760, H = 340, PAD = { l: 64, r: 16, t: 16, b: 40 };
const Y_MIN = 30_000, Y_MAX = 3_000_000;
const x = (v: number) => PAD.l + (v / 100) * (W - PAD.l - PAD.r);
const y = (v: number) => {
  const t = (Math.log10(Math.max(Y_MIN, Math.min(Y_MAX, v))) - Math.log10(Y_MIN)) / (Math.log10(Y_MAX) - Math.log10(Y_MIN));
  return H - PAD.b - t * (H - PAD.t - PAD.b);
};

export function ValueMap({ leads, onPick }: { leads: Lead[]; onPick: (l: Lead) => void }) {
  const [hover, setHover] = useState<Lead | null>(null);
  const ticks = [50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000];
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Popularity against estimated member saving per visit">
        <rect x={x(60)} y={PAD.t} width={x(100) - x(60)} height={y(Y_MIN) - PAD.t} fill="#77c300" opacity={0.06} />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="#171914" strokeOpacity={0.07} />
            <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#777c70">{idrShort(t)}</text>
          </g>
        ))}
        {[0, 20, 40, 60, 80, 100].map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={PAD.t} y2={H - PAD.b} stroke="#171914" strokeOpacity={0.05} />
            <text x={x(t)} y={H - PAD.b + 16} textAnchor="middle" fontSize={11} fill="#777c70">{t}</text>
          </g>
        ))}
        <text x={(PAD.l + W - PAD.r) / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="#171914" fontWeight={600}>Popularity score in category (0–100)</text>
        <text x={x(80)} y={PAD.t + 14} textAnchor="middle" fontSize={11} fill="#3d6b00" fontWeight={700}>Popular + generous: headline perks</text>
        {leads.map((l) => (
          <circle key={l.place_id} cx={x(l.popularity_score)} cy={y(l.est_member_saving_per_visit_idr)}
            r={3 + Math.min(6, Math.log10(l.reviews + 1) * 1.3)} fill={CATEGORY_COLOR[l.pickle_category]}
            fillOpacity={hover && hover.place_id !== l.place_id ? 0.25 : 0.75} stroke="#fff" strokeWidth={1}
            className="cursor-pointer" onMouseEnter={() => setHover(l)} onMouseLeave={() => setHover(null)} onClick={() => onPick(l)} />
        ))}
      </svg>
      {hover && (
        <div className="pointer-events-none absolute right-2 top-2 max-w-[260px] rounded-2xl bg-night px-4 py-3 text-xs text-paper shadow-xl">
          <p className="font-semibold">{hover.name}</p>
          <p className="text-paper/70">{hover.pickle_category} · {hover.area || "Bali"}</p>
          <p className="num mt-1">★ {hover.rating} · {hover.reviews.toLocaleString()} reviews · popularity {hover.popularity_score}</p>
          <p className="mt-1 text-lime">{hover.proposed_offer}</p>
          <p className="num text-paper/70">≈ {idrShort(hover.est_member_saving_per_visit_idr)} saved per visit (estimate)</p>
        </div>
      )}
    </div>
  );
}
