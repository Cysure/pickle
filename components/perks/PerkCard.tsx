"use client";
import { Bookmark, BookmarkCheck, MapPin, Clock, Lock } from "lucide-react";
import type { Perk } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { MERCHANT_BY_ID } from "@/lib/demo/data";
import { effectiveStatus, daysUntil } from "@/lib/perks";
import { DemoTag } from "@/components/ui";

export function MerchantMark({ mark, size = 44, dark }: { mark: string; size?: number; dark?: boolean }) {
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-2xl font-display font-bold ${dark ? "bg-paper text-night" : "bg-night text-pickle"}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {mark}
    </div>
  );
}

export function StatusPill({ perk }: { perk: Perk }) {
  const s = effectiveStatus(perk);
  if (s === "expired") return <span className="pill-outline">Expired</span>;
  if (s === "conceptual") return <span className="pill-outline">Concept</span>;
  const d = daysUntil(perk.expiresAt);
  if (d !== null && d <= 14) return <span className="pill-lime"><Clock size={11} /> {d <= 0 ? "Last day" : `${d} days left`}</span>;
  return <span className="pill-green">Available</span>;
}

export function PerkCard({
  perk, saved, onToggleSave, onOpen, eligible = true, layout = "grid",
}: {
  perk: Perk; saved: boolean; onToggleSave: (id: string) => void; onOpen: (p: Perk) => void; eligible?: boolean; layout?: "grid" | "list";
}) {
  const m = MERCHANT_BY_ID[perk.merchantId];
  const hoods = Array.from(new Set(m.locations.map((l) => l.neighbourhood))).join(" · ");
  const expired = effectiveStatus(perk) === "expired";
  return (
    <article className={`panel hover-lift group relative flex ${layout === "list" ? "flex-row items-center gap-5 p-4" : "flex-col gap-4 p-5"} ${expired ? "opacity-70" : ""}`}>
      <div className={`flex items-start gap-3 ${layout === "list" ? "w-56 shrink-0" : ""}`}>
        <MerchantMark mark={m.mark} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{m.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted"><MapPin size={11} /> <span className="truncate">{hoods}</span></p>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <DemoTag>Demo</DemoTag>
          <span className="pill-outline">{CATEGORY_LABELS[perk.category]}</span>
          <StatusPill perk={perk} />
          {!eligible && <span className="pill-dark"><Lock size={11} /> {perk.tier === "black" ? "Black" : "Reserve"}</span>}
        </div>
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight">{perk.title}</h3>
        {layout === "grid" && <p className="mt-1.5 line-clamp-2 text-sm text-muted">{perk.description}</p>}
      </div>
      <div className={`flex items-center gap-2 ${layout === "grid" ? "mt-auto justify-between" : ""}`}>
        <button type="button" onClick={() => onOpen(perk)} className="btn btn-dark btn-sm">View details</button>
        <button
          type="button"
          onClick={() => onToggleSave(perk.id)}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save perk"}
          className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${saved ? "border-pickle bg-pickle text-night" : "border-ink/15 hover:border-pickle"}`}
        >
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>
    </article>
  );
}
