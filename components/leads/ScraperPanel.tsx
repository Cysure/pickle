"use client";
import { useMemo, useState } from "react";
import { Play, Square, RotateCw, Loader2, CheckCircle2, AlertTriangle, Radar } from "lucide-react";
import { toast } from "@/components/ui";
import { ACTIVE_STAGES, BALI_AREAS, CATEGORY_KEYS, LEAD_CATEGORIES, buildQueries, type LeadCategoryKey, type RunInfo } from "@/lib/leads/config";
import { CATEGORY_COLOR } from "./colors";

const STEPS = [
  { key: "scraping", label: "Google Maps" },
  { key: "emails", label: "Venue sites" },
  { key: "scoring", label: "Score & offers" },
  { key: "done", label: "Done" },
] as const;

function ago(iso?: string) {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

export function ScraperPanel({ runs, onChanged }: { runs: RunInfo[]; onChanged: () => void }) {
  const [areas, setAreas] = useState<string[]>(["Seminyak", "Canggu", "Uluwatu", "Ubud"]);
  const [cats, setCats] = useState<LeadCategoryKey[]>([...CATEGORY_KEYS]);
  const [depth, setDepth] = useState(2);
  const [mode, setMode] = useState<"fast" | "deep">("fast");
  const [custom, setCustom] = useState("");
  const [customCat, setCustomCat] = useState<LeadCategoryKey>("dining");
  const [pending, setPending] = useState(false);

  const active = runs.find((r) => ACTIVE_STAGES.includes(r.stage));
  const last = active ?? runs[0];
  const customList = custom.split("\n").map((q) => q.trim()).filter((q) => q.length >= 3).map((query) => ({ query, category: customCat }));
  const queryCount = useMemo(() => buildQueries(areas, cats, customList).length, [areas, cats, customList]);

  const toggle = <T,>(list: T[], v: T, set: (x: T[]) => void) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function post(payload: object, okText: string) {
    setPending(true);
    try {
      const res = await fetch("/api/leads/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      toast(okText);
      onChanged();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Request failed", "dark");
    } finally {
      setPending(false);
    }
  }

  const stepIndex = last ? STEPS.findIndex((s) => s.key === last.stage) : -1;
  const progress = !last ? 0
    : last.stage === "scraping" ? Math.min(0.98, (last.searchesDone ?? 0) / Math.max(1, last.queryCount))
    : last.stage === "emails" ? Math.min(0.98, (last.emailsChecked ?? 0) / Math.max(1, last.emailsTotal ?? 1))
    : last.stage === "done" ? 1 : 0.5;

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* --- configure --- */}
      <div className="panel p-6">
        <div className="mb-4 flex items-center gap-2"><Radar size={18} className="text-pickle" /><h2 className="font-display text-xl font-bold tracking-tight">New scrape</h2></div>
        <p className="eyebrow mb-2">Areas</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {BALI_AREAS.map((a) => (
            <button key={a} type="button" onClick={() => toggle(areas, a, setAreas)} aria-pressed={areas.includes(a)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${areas.includes(a) ? "border-pickle bg-pickle/15 font-semibold" : "border-ink/15 text-muted hover:text-ink"}`}>{a}</button>
          ))}
          <button type="button" className="px-2 text-xs text-muted underline" onClick={() => setAreas(areas.length === BALI_AREAS.length ? [] : [...BALI_AREAS])}>{areas.length === BALI_AREAS.length ? "None" : "All"}</button>
        </div>
        <p className="eyebrow mb-2">Categories</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORY_KEYS.map((c) => (
            <button key={c} type="button" onClick={() => toggle(cats, c, setCats)} aria-pressed={cats.includes(c)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${cats.includes(c) ? "border-ink/30 bg-white font-semibold" : "border-ink/10 text-muted"}`}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: cats.includes(c) ? CATEGORY_COLOR[LEAD_CATEGORIES[c]] : "#ccc" }} />{LEAD_CATEGORIES[c]}
            </button>
          ))}
        </div>
        <p className="eyebrow mb-2">Mode</p>
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          {([["fast", "Fast", "Reads the Maps results list per area: rating, reviews, website, phone. Minutes."], ["deep", "Deep", "Opens every place page too, adding Google's price band. Hours."]] as const).map(([k, t, d]) => (
            <button key={k} type="button" onClick={() => setMode(k)} aria-pressed={mode === k}
              className={`rounded-2xl border p-3 text-left text-sm transition ${mode === k ? "border-pickle bg-pickle/10" : "border-ink/10 hover:border-ink/25"}`}>
              <span className="font-semibold">{t}</span><span className="mt-0.5 block text-xs text-muted">{d}</span>
            </button>
          ))}
        </div>
        <div className="mb-4 grid gap-4 xl:grid-cols-[1fr_1.4fr]">
          <label className="block">
            <span className="eyebrow">Scroll depth · {depth}</span>
            <input type="range" min={1} max={mode === "fast" ? 4 : 10} value={Math.min(depth, mode === "fast" ? 4 : 10)} onChange={(e) => setDepth(Number(e.target.value))} className="mt-3 w-full accent-[var(--color-pickle)]" />
            <span className="text-xs text-muted">{mode === "fast" ? "Higher digs past Google's top ~20 per search" : `About ${depth * 20} results per search`}</span>
          </label>
          <label className="block">
            <span className="eyebrow">Extra searches (one per line)</span>
            <div className="mt-2 flex gap-2">
              <textarea value={custom} onChange={(e) => setCustom(e.target.value)} rows={2} placeholder="sunset bar Seseh Bali" className="textarea h-auto min-h-[64px] min-w-0 flex-1 py-2 text-sm" />
              <select value={customCat} onChange={(e) => setCustomCat(e.target.value as LeadCategoryKey)} className="select h-auto shrink-0 text-xs" style={{ width: 144 }} aria-label="Category for extra searches">
                {CATEGORY_KEYS.map((c) => <option key={c} value={c}>{LEAD_CATEGORIES[c]}</option>)}
              </select>
            </div>
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
          <p className="text-sm text-muted"><b className="num text-ink">{queryCount}</b> Google Maps searches · {mode === "fast" ? `about ${Math.max(1, Math.round(queryCount / 8))}–${Math.max(2, Math.round(queryCount / 4))} min` : `several hours`}</p>
          <button type="button" className="btn btn-primary btn-sm" disabled={pending || !!active || !queryCount}
            onClick={() => post({ action: "start", mode, areas, categories: cats, depth, custom: customList }, "Scraper started")}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} {active ? "Scrape running" : "Start scraper"}
          </button>
        </div>
      </div>

      {/* --- live status --- */}
      <div className="panel-dark flex min-w-0 flex-col p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-tight">{active ? "Running now" : "Last run"}</h2>
          {last && (
            <span className="text-xs text-paper/60">
              {last.areas.length} areas · {last.categories.length} categories · started {ago(last.createdAt)} ago
            </span>
          )}
        </div>
        {!last ? (
          <p className="text-sm text-paper/60">No scrape yet. Pick areas and categories and start one.</p>
        ) : (
          <>
            <ol className="mb-4 grid grid-cols-4 gap-2">
              {STEPS.map((s, i) => {
                const state = last.stage === "failed" || last.stage === "stopped" ? (i === 0 ? "stopped" : "idle") : i < stepIndex ? "done" : i === stepIndex ? (s.key === "done" ? "done" : "now") : "idle";
                return (
                  <li key={s.key} className="text-xs">
                    <div className={`mb-1.5 h-1.5 rounded-full ${state === "done" ? "bg-pickle" : state === "now" ? "bg-lime animate-pulse" : state === "stopped" ? "bg-[#d64545]" : "bg-paper/15"}`} />
                    <span className={state === "idle" ? "text-paper/40" : "text-paper/85"}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat label="Searches" value={`${last.searchesDone ?? (last.stage === "scraping" ? 0 : last.queryCount)}/${last.queryCount}`} />
              <Stat label="Places scraped" value={(last.placesScraped ?? 0).toLocaleString()} />
              <Stat label="Sites checked" value={last.emailsTotal ? `${last.emailsChecked ?? 0}/${last.emailsTotal}` : "—"} />
            </div>
            {ACTIVE_STAGES.includes(last.stage) && (
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-paper/10"><div className="h-full rounded-full bg-pickle transition-[width] duration-700" style={{ width: `${Math.round(progress * 100)}%` }} /></div>
            )}
            {last.stage === "done" && <p className="mb-3 inline-flex items-center gap-2 text-sm text-lime"><CheckCircle2 size={16} /> Finished {ago(last.finishedAt)} ago, leads updated</p>}
            {(last.stage === "failed" || last.stage === "stopped") && (
              <p className="mb-3 inline-flex items-center gap-2 text-sm text-[#ff9a8a]"><AlertTriangle size={16} /> {last.stage === "failed" ? last.error ?? "Failed" : "Stopped"}</p>
            )}
{(ACTIVE_STAGES.includes(last.stage) || (last.logTail ?? []).length > 0) && (
                          <pre className="mb-4 max-h-44 flex-1 overflow-auto whitespace-pre-wrap break-all rounded-2xl bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-paper/70">
              {(last.logTail ?? []).join("\n") || "Waiting for log output…"}
            </pre>
            )}
            <div className="flex flex-wrap gap-2">
              {active && (
                <button type="button" className="btn btn-ghost btn-sm" disabled={pending} onClick={() => post({ action: "stop", id: active.id }, "Stopping scraper")}><Square size={14} /> Stop</button>
              )}
              {!active && last && (last.stage === "stopped" || last.stage === "failed") && (
                <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => post({ action: "resume", id: last.id }, "Processing what was scraped")}><RotateCw size={14} /> Process what was scraped</button>
              )}
            </div>
          </>
        )}
        {runs.length > 1 && (
          <details className="mt-4 text-xs text-paper/60">
            <summary className="cursor-pointer">Run history ({runs.length})</summary>
            <ul className="mt-2 space-y-1">
              {runs.map((r) => (
                <li key={r.id} className="num flex justify-between gap-2"><span>{r.createdAt.slice(0, 16).replace("T", " ")} · {r.queryCount} searches</span><span>{(r.placesScraped ?? 0).toLocaleString()} places · {r.stage}</span></li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-paper/5 p-3">
      <p className="text-[11px] uppercase tracking-wider text-paper/50">{label}</p>
      <p className="num mt-1 font-display text-xl font-bold">{value}</p>
    </div>
  );
}
