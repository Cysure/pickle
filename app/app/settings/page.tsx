"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AppHead } from "@/components/navigation/AppShell";
import { useDemo, resetDemo } from "@/lib/demo/store";
import { AREAS } from "@/lib/demo/data";
import { Toggle, Modal, toast } from "@/components/ui";

const HOODS = AREAS;

export default function SettingsPage() {
  const [demo, update] = useDemo();
  const [confirm, setConfirm] = useState(false);
  const row = "flex items-center justify-between gap-4 py-3";
  return (
    <>
      <AppHead title="Settings" body="Notifications, privacy, accessibility and your demo data." />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="eyebrow">Areas of Bali</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {HOODS.map((h) => { const on = demo.savedLocations.includes(h); return <button key={h} type="button" aria-pressed={on} onClick={() => update({ savedLocations: on ? demo.savedLocations.filter((x) => x !== h) : [...demo.savedLocations, h] })} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${on ? "bg-pickle text-night" : "bg-cream"}`}>{h}</button>; })}
          </div>
        </section>
        <section className="panel p-6">
          <h2 className="eyebrow">Notifications</h2>
          <ul className="mt-2 divide-y divide-ink/5 text-sm">
            {([["perks", "New perks near me"], ["activity", "Transactions and perk unlocks"], ["plans", "Pickle Together updates"]] as const).map(([k, l]) => <li key={k} className={row}><span>{l}</span><Toggle checked={demo.notifications[k]} label={l} onChange={(v) => update({ notifications: { ...demo.notifications, [k]: v } })} /></li>)}
          </ul>
        </section>
        <section className="panel p-6">
          <h2 className="eyebrow">Privacy</h2>
          <ul className="mt-2 divide-y divide-ink/5 text-sm">
            <li className={row}><div><p>Product analytics</p><p className="text-xs text-muted">Anonymous events only. Off by default.</p></div><Toggle checked={demo.privacy.analytics} label="Product analytics" onChange={(v) => update({ privacy: { ...demo.privacy, analytics: v } })} /></li>
            <li className={row}><div><p>Location for Radar</p><p className="text-xs text-muted">Only used on this device, only when Radar is open.</p></div><Toggle checked={demo.privacy.location} label="Location for Radar" onChange={(v) => update({ privacy: { ...demo.privacy, location: v } })} /></li>
          </ul>
        </section>
        <section className="panel p-6">
          <h2 className="eyebrow">Accessibility</h2>
          <ul className="mt-2 divide-y divide-ink/5 text-sm">
            <li className={row}><div><p>Reduce motion</p><p className="text-xs text-muted">Also follows your system setting automatically.</p></div><Toggle checked={demo.a11y.reduceMotion} label="Reduce motion" onChange={(v) => { update({ a11y: { ...demo.a11y, reduceMotion: v } }); document.documentElement.classList.toggle("reduce-motion", v); }} /></li>
            <li className={row}><div><p>Larger text</p></div><Toggle checked={demo.a11y.largeText} label="Larger text" onChange={(v) => { update({ a11y: { ...demo.a11y, largeText: v } }); document.documentElement.style.fontSize = v ? "112.5%" : ""; }} /></li>
          </ul>
        </section>
        <section className="panel p-6 lg:col-span-2">
          <h2 className="eyebrow">Your demo data</h2>
          <p className="mt-2 text-sm text-muted">Everything in this demo (saved perks, plans, card design, settings) lives in this browser&rsquo;s local storage. Deleting it resets the demo. If persistent accounts are enabled in a live deployment, account deletion will appear here too.</p>
          <button type="button" className="btn btn-dark btn-sm mt-4" onClick={() => setConfirm(true)}><Trash2 size={14} /> Delete demo data</button>
        </section>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Delete demo data?">
        <p className="text-sm text-muted">This clears saved perks, plans, card choices and settings from this browser and signs you out of the demo. It cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-2"><button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)}>Cancel</button><button type="button" className="btn btn-dark btn-sm" onClick={() => { resetDemo(); setConfirm(false); toast("Demo data deleted", "dark"); }}>Delete</button></div>
      </Modal>
    </>
  );
}
