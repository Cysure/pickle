"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CalendarDays, Plus, Trash2, Share2, Pencil, Lock } from "lucide-react";
import { AppHead } from "@/components/navigation/AppShell";
import { useDemo, upsertPlan, deletePlan, newId } from "@/lib/demo/store";
import { PERKS, PERK_BY_ID, MERCHANT_BY_ID } from "@/lib/demo/data";
import type { GroupPlan } from "@/lib/types";
import { Modal, CopyButton, DemoTag, EmptyState, toast } from "@/components/ui";
import { SITE_URL } from "@/lib/config";
import { track } from "@/lib/analytics";

export default function TogetherPage() {
  return <Suspense fallback={null}><Together /></Suspense>;
}

function Together() {
  const [demo] = useDemo();
  const params = useSearchParams();
  const router = useRouter();
  const [editing, setEditing] = useState<GroupPlan | null>(null);
  const [pendingAdd, setPendingAdd] = useState<string | null>(null);

  useEffect(() => {
    const add = params.get("add");
    if (add && PERK_BY_ID[add]) { setPendingAdd(add); router.replace("/app/together"); }
  }, [params, router]);

  const startNew = (perkId?: string) => setEditing({ id: newId("plan"), title: "", plannedFor: "", perkIds: perkId ? [perkId] : [], createdAt: new Date().toISOString() });
  const addToExisting = (plan: GroupPlan) => { if (!pendingAdd) return; upsertPlan({ ...plan, perkIds: Array.from(new Set([...plan.perkIds, pendingAdd])) }); setPendingAdd(null); toast("Added to plan"); };

  return (
    <>
      <AppHead title="Together" body="Share a perk, build a plan, keep it between you. Together never moves money." tag="Private by default">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => startNew()}><Plus size={14} /> New plan</button>
      </AppHead>

      {pendingAdd && (
        <div className="panel mb-6 border-pickle/40 bg-pickle/10 p-5">
          <p className="font-semibold">Add &ldquo;{PERK_BY_ID[pendingAdd].title}&rdquo; to a plan</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {demo.plans.map((p) => <button key={p.id} type="button" className="btn btn-dark btn-sm" onClick={() => addToExisting(p)}>{p.title}</button>)}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { startNew(pendingAdd); setPendingAdd(null); }}><Plus size={14} /> New plan</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPendingAdd(null)}>Cancel</button>
          </div>
        </div>
      )}

      {demo.plans.length === 0 ? (
        <EmptyState icon={<CalendarDays />} title="No plans yet" body="Create a plan, add a few perks and share the link with friends." action={<button type="button" className="btn btn-dark btn-sm" onClick={() => startNew()}>Create a plan</button>} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {demo.plans.map((plan) => {
            const url = `${SITE_URL}/app/together?plan=${plan.id}`;
            return (
              <li key={plan.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="font-display text-xl font-bold leading-tight">{plan.title}</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-muted"><CalendarDays size={12} /> {plan.plannedFor || "No date yet"} · {plan.perkIds.length} {plan.perkIds.length === 1 ? "perk" : "perks"} · <Lock size={11} /> private</p></div>
                  <DemoTag>Demo</DemoTag>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.perkIds.map((id) => PERK_BY_ID[id]).filter(Boolean).map((p) => <li key={p.id} className="flex items-center justify-between rounded-2xl bg-cream px-3 py-2 text-sm"><span><span className="font-semibold">{p.title}</span> <span className="text-muted">· {MERCHANT_BY_ID[p.merchantId].name}</span></span></li>)}
                  {plan.perkIds.length === 0 && <li className="text-sm text-muted">No perks yet.</li>}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <CopyButton text={url} label="Copy demo link" onCopied={() => track("offer_shared", { perkId: plan.id, method: "copy" })} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { try { if (navigator.share) await navigator.share({ title: plan.title, url }); else toast("Sharing not supported here; use Copy link", "dark"); } catch {} }}><Share2 size={14} /> Share</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(plan)}><Pencil size={14} /> Edit</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { deletePlan(plan.id); toast("Plan deleted", "dark"); }}><Trash2 size={14} /></button>
                </div>
                <p className="num mt-2 break-all text-[11px] text-muted">{url}</p>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing && demo.plans.some((p) => p.id === editing.id) ? "Edit plan" : "New plan"} wide>
        {editing && <PlanEditor plan={editing} onSave={(p) => { upsertPlan(p); setEditing(null); track("plan_created", { perkCount: p.perkIds.length }); toast("Plan saved"); }} onCancel={() => setEditing(null)} />}
      </Modal>
    </>
  );
}

function PlanEditor({ plan, onSave, onCancel }: { plan: GroupPlan; onSave: (p: GroupPlan) => void; onCancel: () => void }) {
  const [p, setP] = useState(plan);
  const [err, setErr] = useState("");
  const toggle = (id: string) => setP({ ...p, perkIds: p.perkIds.includes(id) ? p.perkIds.filter((x) => x !== id) : [...p.perkIds, id] });
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (p.title.trim().length < 2) { setErr("Give the plan a name"); return; } onSave({ ...p, title: p.title.trim() }); }} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="field"><label htmlFor="plan-title">Plan name</label><input id="plan-title" className="input" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} placeholder="Saturday in Seminyak" />{err && <p className="error">{err}</p>}</div>
        <div className="field"><label htmlFor="plan-date">Date</label><input id="plan-date" type="date" className="input num" value={p.plannedFor} onChange={(e) => setP({ ...p, plannedFor: e.target.value })} /></div>
      </div>
      <div>
        <p className="text-sm font-semibold">Perks in this plan <span className="text-muted">({p.perkIds.length})</span></p>
        <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {PERKS.map((perk) => { const on = p.perkIds.includes(perk.id); return <li key={perk.id}><button type="button" aria-pressed={on} onClick={() => toggle(perk.id)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${on ? "bg-pickle text-night" : "bg-cream hover:bg-ink/10"}`}><span><span className="font-semibold">{perk.title}</span> <span className={on ? "text-night/70" : "text-muted"}>· {MERCHANT_BY_ID[perk.merchantId].name}</span></span>{on && <span className="text-xs font-bold">Added</span>}</button></li>; })}
        </ul>
      </div>
      <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button><button type="submit" className="btn btn-primary btn-sm">Save plan</button></div>
    </form>
  );
}
