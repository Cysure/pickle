"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search, SlidersHorizontal, Bookmark } from "lucide-react";
import type { Perk, PerkCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { AREAS, MERCHANT_BY_ID, PERKS, PERK_BY_ID } from "@/lib/demo/data";
import { filterPerks, isEligible, type PerkFilter, type PerkSort } from "@/lib/perks";
import { useDemo, toggleSaved } from "@/lib/demo/store";
import { EmptyState, Modal, toast, DemoTag } from "@/components/ui";
import { PerkCard } from "./PerkCard";
import { PerkDetail } from "./PerkDetail";
import { track } from "@/lib/analytics";

const CATS: (PerkCategory | "all")[] = ["all", "pool-beach", "bars-clubs", "dining", "family", "spa-fitness"];
const HOODS = AREAS;

export function useSavedPerks() {
  const [s] = useDemo();
  return {
    saved: s.savedPerkIds,
    toggle(id: string) {
      const now = toggleSaved(id);
      track(now ? "perk_saved" : "perk_unsaved", { perkId: id });
      toast(now ? "Saved to your perks" : "Removed from saved", now ? "green" : "dark");
    },
  };
}

export function PerkExplorer({
  perks = PERKS, compact = false, onlySaved = false, onAddToPlan, showTierFilter = false,
}: {
  perks?: Perk[]; compact?: boolean; onlySaved?: boolean; onAddToPlan?: (p: Perk) => void; showTierFilter?: boolean;
}) {
  const [demo] = useDemo();
  const { saved, toggle } = useSavedPerks();
  const params = useSearchParams();
  const [f, setF] = useState<PerkFilter>({ category: "all", neighbourhood: "all", status: "all", sort: "featured", query: "" });
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [open, setOpen] = useState<Perk | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(!compact);

  useEffect(() => {
    const id = params.get("perk");
    if (id && PERK_BY_ID[id]) setOpen(PERK_BY_ID[id]);
  }, [params]);

  useEffect(() => {
    if (open) track("perk_viewed", { perkId: open.id, category: open.category });
  }, [open]);

  const source = onlySaved ? perks.filter((p) => saved.includes(p.id)) : perks;
  const list = useMemo(
    () => filterPerks(source, f, (p) => MERCHANT_BY_ID[p.merchantId].locations.map((l) => l.neighbourhood), (p) => MERCHANT_BY_ID[p.merchantId].name),
    [source, f],
  );

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-11" placeholder="Search perks, places, categories" value={f.query} onChange={(e) => setF({ ...f, query: e.target.value })} aria-label="Search perks" />
        </label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setFiltersOpen((v) => !v)} className="btn btn-ghost btn-sm" aria-expanded={filtersOpen}><SlidersHorizontal size={14} /> Filters</button>
          <div className="flex rounded-full border border-ink/15 p-0.5" role="group" aria-label="Layout">
            <button type="button" onClick={() => setLayout("grid")} aria-pressed={layout === "grid"} className={`rounded-full p-2 ${layout === "grid" ? "bg-night text-paper" : ""}`} aria-label="Grid"><LayoutGrid size={14} /></button>
            <button type="button" onClick={() => setLayout("list")} aria-pressed={layout === "list"} className={`rounded-full p-2 ${layout === "list" ? "bg-night text-paper" : ""}`} aria-label="List"><List size={14} /></button>
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
            {CATS.map((c) => (
              <button key={c} type="button" onClick={() => setF({ ...f, category: c })} aria-pressed={f.category === c}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${f.category === c ? "bg-pickle text-night" : "bg-cream hover:bg-ink/10"}`}>
                {c === "all" ? "All" : CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="select w-auto" value={f.neighbourhood} onChange={(e) => setF({ ...f, neighbourhood: e.target.value })} aria-label="Location">
              <option value="all">All areas</option>
              {HOODS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
            <select className="select w-auto" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as PerkFilter["status"] })} aria-label="Status">
              <option value="all">Any status</option><option value="available">Available</option><option value="conceptual">Concept</option><option value="expired">Expired</option>
            </select>
            {showTierFilter && (
              <select className="select w-auto" value={f.tier ?? "all"} onChange={(e) => setF({ ...f, tier: e.target.value as PerkFilter["tier"] })} aria-label="Tier">
                <option value="all">Any tier</option><option value="green">Pickle Green</option><option value="black">Pickle Black</option><option value="reserve">Pickle Reserve</option>
              </select>
            )}
            <select className="select w-auto" value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value as PerkSort })} aria-label="Sort">
              <option value="featured">Featured first</option><option value="newest">Newest</option><option value="expiring">Expiring soon</option><option value="title">A to Z</option>
            </select>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <p><span className="num font-semibold text-ink">{list.length}</span> {list.length === 1 ? "perk" : "perks"}</p>
        <DemoTag>All perks are illustrative demos</DemoTag>
      </div>

      {list.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={<Bookmark />} title={onlySaved ? "Nothing saved yet" : "No perks match"} body={onlySaved ? "Tap the bookmark on any perk to keep it here." : "Try another category or clear the search."}
            action={<button type="button" className="btn btn-ghost btn-sm" onClick={() => setF({ category: "all", neighbourhood: "all", status: "all", sort: "featured", query: "" })}>Clear filters</button>} />
        </div>
      ) : (
        <div className={`mt-6 grid gap-4 ${layout === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {list.map((p) => (
            <PerkCard key={p.id} perk={p} saved={saved.includes(p.id)} onToggleSave={toggle} onOpen={setOpen} eligible={isEligible(p, demo.tier)} layout={layout} />
          ))}
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ""} wide>
        {open && <PerkDetail perk={open} saved={saved.includes(open.id)} onToggleSave={toggle} onAddToPlan={onAddToPlan} eligible={isEligible(open, demo.tier)} />}
      </Modal>
    </div>
  );
}
