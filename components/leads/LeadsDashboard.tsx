"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Mail, MapPin, RefreshCw, Search, Star, Globe, Phone, ExternalLink, Users } from "lucide-react";
import { CopyButton, EmptyState, Modal, Toggle, toast } from "@/components/ui";
import {
  ACTIVE_STAGES, LEAD_CATEGORIES, LEAD_STATUSES, idr, idrShort,
  type Lead, type LeadCategoryLabel, type LeadStatus, type LeadsPayload, type RunInfo, type CrmEntry,
} from "@/lib/leads/config";
import { ScraperPanel } from "./ScraperPanel";
import { ValueMap } from "./ValueMap";
import { CATEGORY_COLOR, TIER_LABEL } from "./colors";

type Row = Lead & { crm: CrmEntry };
const SORTS = {
  value: { label: "Pickle value score", fn: (a: Row, b: Row) => b.pickle_value_score - a.pickle_value_score },
  popularity: { label: "Popularity", fn: (a: Row, b: Row) => b.popularity_index_all - a.popularity_index_all },
  reviews: { label: "Most reviews", fn: (a: Row, b: Row) => b.reviews - a.reviews },
  saving: { label: "Member saving", fn: (a: Row, b: Row) => b.est_member_saving_per_visit_idr - a.est_member_saving_per_visit_idr },
  rating: { label: "Rating", fn: (a: Row, b: Row) => b.rating - a.rating || b.reviews - a.reviews },
} as const;
const STATUS_TONE: Record<LeadStatus, string> = {
  new: "bg-cream text-ink", contacted: "bg-[#e3efff] text-[#1d4ed8]", replied: "bg-[#f3e8ff] text-[#7c3aed]",
  negotiating: "bg-[#fff3d6] text-[#a16207]", signed: "bg-pickle text-night", declined: "bg-[#fde2e0] text-[#b42318]",
};

export function LeadsDashboard() {
  const [data, setData] = useState<LeadsPayload | null>(null);
  const [runs, setRuns] = useState<RunInfo[]>([]);
  const [cat, setCat] = useState<LeadCategoryLabel | "all">("all");
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<"all" | "A" | "B" | "C">("all");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [area, setArea] = useState("all");
  const [emailOnly, setEmailOnly] = useState(false);
  const [sort, setSort] = useState<keyof typeof SORTS>("value");
  const [limit, setLimit] = useState(60);
  const [open, setOpen] = useState<Row | null>(null);

  const loadLeads = useCallback(async () => {
    const r = await fetch("/api/leads", { cache: "no-store" });
    if (r.ok) setData(await r.json());
  }, []);
  const loadRuns = useCallback(async () => {
    const r = await fetch("/api/leads/runs", { cache: "no-store" });
    if (!r.ok) return;
    const j = (await r.json()) as { runs: RunInfo[] };
    setRuns((prev) => {
      const wasActive = prev.some((x) => ACTIVE_STAGES.includes(x.stage));
      const nowActive = j.runs.some((x) => ACTIVE_STAGES.includes(x.stage));
      if (wasActive && !nowActive) loadLeads();
      return j.runs;
    });
  }, [loadLeads]);

  useEffect(() => { loadLeads(); loadRuns(); }, [loadLeads, loadRuns]);
  const active = runs.some((r) => ACTIVE_STAGES.includes(r.stage));
  useEffect(() => {
    const t = setInterval(loadRuns, active ? 5000 : 30000);
    return () => clearInterval(t);
  }, [active, loadRuns]);

  const leads = useMemo(() => data?.leads ?? [], [data]);
  const areas = useMemo(() => [...new Set(leads.map((l) => l.area).filter(Boolean))].sort(), [leads]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads
      .filter((l) => (cat === "all" || l.pickle_category === cat) && (tier === "all" || l.popularity_tier === tier) &&
        (status === "all" || l.crm.status === status) && (area === "all" || l.area === area) && (!emailOnly || l.emails) &&
        (!needle || `${l.name} ${l.area} ${l.emails} ${l.google_categories}`.toLowerCase().includes(needle)))
      .sort(SORTS[sort].fn);
  }, [leads, cat, tier, status, area, emailOnly, q, sort]);

  const kpi = useMemo(() => {
    const withEmail = filtered.filter((l) => l.emails).length;
    const avgSave = filtered.length ? filtered.reduce((s, l) => s + l.est_member_saving_per_month_idr, 0) / filtered.length : 0;
    return { total: filtered.length, withEmail, anchors: filtered.filter((l) => l.popularity_tier === "A").length, signed: filtered.filter((l) => l.crm.status === "signed").length, avgSave };
  }, [filtered]);

  async function saveCrm(l: Row, patch: Partial<CrmEntry>) {
    const r = await fetch("/api/leads/crm", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ placeId: l.place_id, ...patch }) });
    const j = await r.json();
    if (!j.ok) return toast("Couldn't save", "dark");
    setData((d) => d && { ...d, leads: d.leads.map((x) => (x.place_id === l.place_id ? { ...x, crm: j.crm } : x)) });
    setOpen((o) => (o && o.place_id === l.place_id ? { ...o, crm: j.crm } : o));
  }
  async function rescore() {
    const r = await fetch("/api/leads", { method: "POST" });
    const j = await r.json();
    if (!j.ok) return toast(j.error ?? "Re-score failed", "dark");
    toast("Leads re-scored");
    loadLeads();
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of leads) c[l.pickle_category] = (c[l.pickle_category] ?? 0) + 1;
    return c;
  }, [leads]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-pickle">Pickle Perks · Bali</p>
          <h1 className="display text-3xl md:text-4xl">Partner leads</h1>
          <p className="mt-1 text-sm text-muted">
            {data?.generatedAt ? <>Scored {new Date(data.generatedAt).toLocaleString()} · {data.scrapedUnique.toLocaleString()} places scraped, {leads.length.toLocaleString()} passed the popularity and category bar</> : "No leads yet"}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={rescore} disabled={!data?.generatedAt && !runs.length}><RefreshCw size={14} /> Re-score</button>
          <a className="btn btn-dark btn-sm" href="/api/leads/export"><Download size={14} /> Export CSV</a>
        </div>
      </div>

      <ScraperPanel runs={runs} onChanged={loadRuns} />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Leads in view" value={kpi.total.toLocaleString()} />
        <Kpi label="With an email" value={`${kpi.withEmail.toLocaleString()}`} sub={kpi.total ? `${Math.round((100 * kpi.withEmail) / kpi.total)}%` : ""} />
        <Kpi label="Anchor venues (tier A)" value={kpi.anchors.toLocaleString()} />
        <Kpi label="Signed" value={kpi.signed.toLocaleString()} />
        <Kpi label="Avg member saving / month" value={idrShort(kpi.avgSave)} sub="estimate" />
      </div>

      {leads.length === 0 ? (
        <div className="mt-8"><EmptyState icon={<Users size={20} />} title="No leads yet" body={active ? "The scraper is running. Leads appear here once Google Maps, the venue-site email pass and scoring finish." : "Start a scrape above. Leads appear once it finishes."} /></div>
      ) : (
        <>
          <section className="panel mt-8 p-6">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-bold tracking-tight">Popularity against member value</h2>
              <div className="flex flex-wrap gap-3 text-xs">
                {Object.values(LEAD_CATEGORIES).map((c) => <span key={c} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />{c}</span>)}
              </div>
            </div>
            <p className="mb-3 text-sm text-muted">Each dot is a venue: dot size is review volume. Quieter venues get bigger proposed offers, which is why they sit higher. Click a dot to open the lead.</p>
            <ValueMap leads={filtered} onPick={(l) => setOpen(l as Row)} />
          </section>

          <section className="mt-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {(["all", ...Object.values(LEAD_CATEGORIES)] as const).map((c) => (
                <button key={c} type="button" onClick={() => { setCat(c); setLimit(60); }} aria-pressed={cat === c}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${cat === c ? "bg-night text-paper" : "bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/25"}`}>
                  {c !== "all" && <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />}
                  {c === "all" ? "All" : c}
                  <span className="num text-xs opacity-60">{c === "all" ? leads.length : counts[c] ?? 0}</span>
                </button>
              ))}
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, area, email…" className="input h-11 pl-10 text-sm" aria-label="Search leads" /></label>
              <select value={tier} onChange={(e) => setTier(e.target.value as typeof tier)} className="select h-11 w-auto text-sm" aria-label="Popularity tier">
                <option value="all">All tiers</option><option value="A">A · Anchor</option><option value="B">B · Core</option><option value="C">C · Value</option>
              </select>
              <select value={area} onChange={(e) => setArea(e.target.value)} className="select h-11 w-auto max-w-[200px] text-sm" aria-label="Area">
                <option value="all">All areas</option>{areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="select h-11 w-auto text-sm" aria-label="Outreach status">
                <option value="all">Any status</option>{LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className="select h-11 w-auto text-sm" aria-label="Sort">
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Sort: {v.label}</option>)}
              </select>
              <span className="inline-flex items-center gap-2 text-sm"><Toggle checked={emailOnly} onChange={setEmailOnly} label="Only leads with email" />Has email</span>
            </div>

            <div className="panel overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">#</th><th className="px-4 py-3">Venue</th><th className="px-4 py-3">Popularity</th>
                    <th className="px-4 py-3">Contact</th><th className="px-4 py-3">Price tier</th><th className="px-4 py-3">Proposed offer</th>
                    <th className="px-4 py-3 text-right">Saving / visit</th><th className="px-4 py-3 text-right">Value</th><th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, limit).map((l, i) => (
                    <tr key={l.place_id} className="cursor-pointer border-b border-ink/5 align-top last:border-0 hover:bg-cream/60" onClick={() => setOpen(l)}>
                      <td className="num px-4 py-3 text-muted">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{l.name}</p>
                        <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted"><span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLOR[l.pickle_category] }} />{l.pickle_category} · #{l.category_rank}{l.area ? ` · ${l.area}` : ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-cream"><div className="h-full bg-pickle" style={{ width: `${l.popularity_score}%` }} /></div>
                          <span className="num text-xs font-semibold">{l.popularity_score}</span>
                          <span className={`rounded-full px-1.5 text-[10px] font-bold ${l.popularity_tier === "A" ? "bg-night text-paper" : l.popularity_tier === "B" ? "bg-cream" : "ring-1 ring-ink/15"}`}>{l.popularity_tier}</span>
                        </div>
                        <p className="num mt-1 text-xs text-muted"><Star size={11} className="-mt-0.5 inline fill-current text-[#e6a700]" /> {l.rating} · {l.reviews.toLocaleString()}</p>
                      </td>
                      <td className="max-w-[230px] px-4 py-3 text-xs">
                        {l.emails ? <p className="truncate font-medium" title={l.emails}>{l.emails.split("; ")[0]}{l.emails.includes(";") && <span className="text-muted"> +{l.emails.split("; ").length - 1}</span>}</p> : <p className="text-muted">No public email</p>}
                        {l.phone && <p className="num text-muted">{l.phone}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs"><p className="font-semibold capitalize">{l.price_tier}</p><p className="num text-muted">{idrShort(l.est_ticket_idr)} est.</p></td>
                      <td className="max-w-[240px] px-4 py-3 text-xs">{l.proposed_offer}</td>
                      <td className="num px-4 py-3 text-right text-xs"><p className="font-semibold">{idrShort(l.est_member_saving_per_visit_idr)}</p><p className="text-muted">{idrShort(l.est_member_saving_per_month_idr)}/mo</p></td>
                      <td className="num px-4 py-3 text-right font-display text-base font-bold">{l.pickle_value_score}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select value={l.crm.status} onChange={(e) => saveCrm(l, { status: e.target.value as LeadStatus })} aria-label={`Status for ${l.name}`}
                          className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_TONE[l.crm.status]}`}>
                          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="p-8 text-center text-sm text-muted">No leads match these filters.</p>}
            </div>
            {filtered.length > limit && (
              <div className="mt-4 text-center"><button type="button" className="btn btn-ghost btn-sm" onClick={() => setLimit(limit + 100)}>Show more ({(filtered.length - limit).toLocaleString()} left)</button></div>
            )}
            <p className="mt-4 text-xs text-muted">
              Name, rating, reviews, phone, website and emails come from Google Maps and the venue&apos;s own website. Emails are the venue&apos;s published business addresses, not verified owner inboxes.
              Price tier, ticket size, offers and savings are Pickle planning estimates. Replace them with the venue&apos;s price list during the conversation.
            </p>
          </section>
        </>
      )}

      <LeadDrawer lead={open} onClose={() => setOpen(null)} onSave={saveCrm} />
    </>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="panel p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="num mt-2 font-display text-3xl font-bold">{value}{sub && <span className="ml-2 text-sm font-medium text-muted">{sub}</span>}</p>
    </div>
  );
}

function LeadDrawer({ lead, onClose, onSave }: { lead: Row | null; onClose: () => void; onSave: (l: Row, p: Partial<CrmEntry>) => void }) {
  const [notes, setNotes] = useState("");
  useEffect(() => setNotes(lead?.crm.notes ?? ""), [lead?.place_id, lead?.crm.notes]);
  if (!lead) return null;
  const emails = lead.emails ? lead.emails.split("; ") : [];
  return (
    <Modal open onClose={onClose} title={lead.name} wide>
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full px-2.5 py-1 font-semibold text-white" style={{ background: CATEGORY_COLOR[lead.pickle_category] }}>{lead.pickle_category}</span>
        <span className="pill-outline">#{lead.category_rank} in category</span>
        <span className="pill-outline">Tier {lead.popularity_tier} · {TIER_LABEL[lead.popularity_tier]}</span>
        <span className="pill-outline">{lead.signing_priority}</span>
        {lead.also_fits && <span className="text-muted">Also fits: {lead.also_fits}</span>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Box label="Popularity score" value={String(lead.popularity_score)} sub={`★ ${lead.rating} from ${lead.reviews.toLocaleString()} Google reviews`} />
        <Box label="Pickle value score" value={String(lead.pickle_value_score)} sub="popularity × member saving" />
        <Box label="Member saving" value={idrShort(lead.est_member_saving_per_visit_idr)} sub={`per visit · ${idrShort(lead.est_member_saving_per_month_idr)} / month (est.)`} />
      </div>

      <div className="mt-5 rounded-2xl bg-cream p-4 text-sm">
        <p className="eyebrow mb-1">Proposed Pickle offer</p>
        <p className="font-semibold">{lead.proposed_offer}</p>
        <p className="mt-1 text-xs text-muted">
          Based on an estimated ticket of {idr(lead.est_ticket_idr)} ({lead.price_tier}; {lead.price_tier_basis}{lead.google_price_band ? `; Google shows ${lead.google_price_band}` : ""}).
          Tier {lead.popularity_tier} venues are asked for {lead.popularity_tier === "A" ? "a light perk, because they already have demand" : lead.popularity_tier === "B" ? "a standard 2-for-1 / credit-back perk" : "a generous perk in return for member traffic"}.
        </p>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="space-y-2">
          <p className="eyebrow">Contact</p>
          {emails.length ? emails.map((e) => (
            <div key={e} className="flex items-center justify-between gap-2"><a href={`mailto:${e}`} className="inline-flex items-center gap-2 truncate font-medium hover:text-pickle"><Mail size={14} />{e}</a><CopyButton text={e} label="Copy" /></div>
          )) : <p className="text-muted">No email published on the Maps listing or the venue site.</p>}
          {emails.length > 0 && <p className="text-xs text-muted">Source: {lead.email_source}</p>}
          {lead.phone && <p className="inline-flex items-center gap-2"><Phone size={14} />{lead.phone}</p>}
        </div>
        <div className="space-y-2">
          <p className="eyebrow">Links</p>
          {lead.website && <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 truncate hover:text-pickle"><Globe size={14} />{lead.website.replace(/^https?:\/\//, "")}<ExternalLink size={12} /></a>}
          <a href={lead.google_maps} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-pickle"><MapPin size={14} />Google Maps<ExternalLink size={12} /></a>
          <p className="text-xs text-muted">{lead.address}</p>
          <p className="text-xs text-muted">Google: {lead.google_categories}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-ink/10 pt-5">
        <p className="eyebrow mb-2">Outreach</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {LEAD_STATUSES.map((s) => (
            <button key={s} type="button" onClick={() => onSave(lead, { status: s })} aria-pressed={lead.crm.status === s}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${lead.crm.status === s ? STATUS_TONE[s] + " ring-2 ring-ink/20" : "bg-white ring-1 ring-ink/10"}`}>{s}</button>
          ))}
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== lead.crm.notes && onSave(lead, { notes })} rows={3}
          placeholder="Notes: who you spoke to, agreed offer, follow-up date…" className="textarea h-auto py-3 text-sm" aria-label="Notes" />
        {lead.crm.updatedAt && <p className="mt-1 text-xs text-muted">Updated {new Date(lead.crm.updatedAt).toLocaleString()}</p>}
      </div>
    </Modal>
  );
}

function Box({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl ring-1 ring-ink/10 p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="num mt-1 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}
