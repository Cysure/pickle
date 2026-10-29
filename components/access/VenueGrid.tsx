"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AccessCategory, AccessPlanId, AccessVenue } from "@/lib/types";
import { ACCESS_CATEGORY_LABELS } from "@/lib/types";
import { ACCESS_VENUES } from "@/lib/demo/access";
import { AREAS } from "@/lib/demo/data";
import { EmptyState } from "@/components/ui";
import { VenueCard } from "./VenueCard";

const CATS = Object.keys(ACCESS_CATEGORY_LABELS) as AccessCategory[];

export function VenueGrid({ plan, onOpen, limit, initialCategory = "all", showSearch = true }: { plan?: AccessPlanId; onOpen?: (v: AccessVenue) => void; limit?: number; initialCategory?: AccessCategory | "all"; showSearch?: boolean }) {
  const [cat, setCat] = useState<AccessCategory | "all">(initialCategory);
  const [area, setArea] = useState("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const out = ACCESS_VENUES.filter((v) => (cat === "all" || v.category === cat) && (area === "all" || v.area === area) && (!ql || `${v.name} ${v.description} ${v.area} ${v.includes.join(" ")}`.toLowerCase().includes(ql)));
    return limit ? out.slice(0, limit) : out;
  }, [cat, area, q, limit]);

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {showSearch && (
          <label className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-11" placeholder="Search venues: pools, beach clubs, bars, restaurants, spas, kids…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search venues" />
          </label>
        )}
        <select className="select w-auto" value={area} onChange={(e) => setArea(e.target.value)} aria-label="Area"><option value="all">All areas</option>{AREAS.map((a) => <option key={a}>{a}</option>)}</select>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Category">
        {(["all", ...CATS] as const).map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${cat === c ? "bg-pickle text-night" : "bg-cream hover:bg-ink/10"}`}>{c === "all" ? "Everything" : ACCESS_CATEGORY_LABELS[c]}</button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted"><span className="num font-semibold text-ink">{list.length}</span> {list.length === 1 ? "venue" : "venues"}</p>
      {list.length === 0 ? (
        <div className="mt-4"><EmptyState title="No venues match" body="Try another area or category." action={<button type="button" className="btn btn-ghost btn-sm" onClick={() => { setCat("all"); setArea("all"); setQ(""); }}>Reset</button>} /></div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">{list.map((v) => <VenueCard key={v.id} venue={v} plan={plan} onOpen={onOpen} />)}</div>
      )}
    </div>
  );
}
