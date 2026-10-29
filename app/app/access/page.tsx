"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { QrCode, Users, History, MapPin, Clock, CalendarCheck, ExternalLink, Check, X } from "lucide-react";
import { AppHead } from "@/components/navigation/AppShell";
import { VenueGrid } from "@/components/access/VenueGrid";
import { KindPill } from "@/components/access/VenueCard";
import { MerchantMark } from "@/components/perks/PerkCard";
import { Modal, DemoTag, toast } from "@/components/ui";
import { useDemo, addCheckIn } from "@/lib/demo/store";
import { ACCESS_PLAN_BY_ID, ACCESS_VENUE_BY_ID, ACCESS_VENUES } from "@/lib/demo/access";
import { canCheckIn, checkInPattern, guestPassesLeft, monthKey, venueIncludedIn } from "@/lib/access";
import type { AccessVenue } from "@/lib/types";
import { ACCESS_CATEGORY_LABELS } from "@/lib/types";

export default function AccessPage() {
  const [demo] = useDemo();
  const plan = ACCESS_PLAN_BY_ID[demo.access.plan];
  const month = monthKey(new Date().toISOString());
  const passesLeft = guestPassesLeft(plan, demo.access.checkIns, month);
  const [open, setOpen] = useState<AccessVenue | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const visitsToday = demo.access.checkIns.filter((c) => c.at.slice(0, 10) === today);
  const includedCount = ACCESS_VENUES.filter((v) => venueIncludedIn(v, plan.id)).length;

  return (
    <>
      <AppHead title="Access" body="Pool & Beach, Bars & Clubs, Dining, Family and Spa & Fitness: every venue your subscription covers. Check in at the desk with the code in the app." tag="Demo membership">
        <Link href="/app/membership" className="btn btn-ghost btn-sm">Change plan</Link>
      </AppHead>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="panel-dark p-5">
          <p className="eyebrow text-pickle">Your plan</p>
          <p className="mt-1 font-display text-2xl font-bold text-paper">{plan.name}</p>
          <p className="text-xs text-paper/60">{plan.covers} · {demo.access.billing} · {includedCount} of {ACCESS_VENUES.length} venues included</p>
          <DemoTag className="mt-3">Proposed plan · demo</DemoTag>
        </div>
        <div className="panel p-5">
          <p className="eyebrow flex items-center gap-1.5"><Users size={12} /> Guest passes</p>
          <p className="num mt-1 font-display text-3xl font-bold">{passesLeft}<span className="text-base text-muted"> / {plan.guestPassesPerMonth}</span></p>
          <p className="text-xs text-muted">left this month. Guests check in with you.</p>
        </div>
        <div className="panel p-5">
          <p className="eyebrow flex items-center gap-1.5"><History size={12} /> Today</p>
          <p className="num mt-1 font-display text-3xl font-bold">{visitsToday.length}</p>
          <p className="text-xs text-muted">{visitsToday.length === 0 ? "No check-ins yet. Pick a venue below." : visitsToday.map((c) => ACCESS_VENUE_BY_ID[c.venueId]?.name).join(", ")}</p>
        </div>
      </div>

      <VenueGrid plan={plan.id} onOpen={setOpen} />

      {demo.access.checkIns.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-bold">Recent check-ins</h2>
          <ul className="panel divide-y divide-ink/5">
            {demo.access.checkIns.slice(0, 8).map((c) => { const v = ACCESS_VENUE_BY_ID[c.venueId]; return v ? (
              <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm"><span><span className="font-semibold">{v.name}</span> <span className="text-muted">· {v.area}{c.guests ? ` · +${c.guests} guest${c.guests > 1 ? "s" : ""}` : ""}</span></span><span className="num text-xs text-muted">{new Date(c.at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span></li>
            ) : null; })}
          </ul>
        </section>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ""} wide>
        {open && <VenueDetail venue={open} onDone={() => setOpen(null)} />}
      </Modal>
    </>
  );
}

function VenueDetail({ venue, onDone }: { venue: AccessVenue; onDone: () => void }) {
  const [demo] = useDemo();
  const plan = ACCESS_PLAN_BY_ID[demo.access.plan];
  const [guests, setGuests] = useState(0);
  const [code, setCode] = useState<{ seed: string; expires: number } | null>(null);
  const [left, setLeft] = useState(0);
  const check = canCheckIn(venue, plan, demo.access.checkIns, guests, new Date());
  const passesLeft = guestPassesLeft(plan, demo.access.checkIns, monthKey(new Date().toISOString()));

  useEffect(() => {
    if (!code) return;
    const t = setInterval(() => setLeft(Math.max(0, Math.round((code.expires - Date.now()) / 1000))), 500);
    return () => clearInterval(t);
  }, [code]);

  const doCheckIn = () => {
    if (!check.ok) { toast(check.reason, "dark"); return; }
    const c = addCheckIn(venue.id, guests);
    setCode({ seed: `${venue.id}|${c.id}`, expires: Date.now() + 15 * 60 * 1000 });
    setLeft(15 * 60);
    toast(`Checked in at ${venue.name} (demo)`);
  };

  if (code) {
    const cells = checkInPattern(code.seed);
    return (
      <div className="flex flex-col items-center text-center">
        <DemoTag>Demo check-in code · not scannable</DemoTag>
        <div className="mt-4 grid grid-cols-7 gap-1 rounded-2xl bg-white p-4 shadow-inner ring-1 ring-ink/10">
          {cells.map((on, i) => <span key={i} className={`h-5 w-5 rounded-[3px] ${on ? "bg-night" : "bg-cream"}`} />)}
        </div>
        <p className="mt-4 font-display text-xl font-bold">{venue.name}</p>
        <p className="text-sm text-muted">{plan.name} member{guests ? ` + ${guests} guest${guests > 1 ? "s" : ""}` : ""}</p>
        <p className="num mt-2 text-sm">Valid for <span className="font-semibold">{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</span></p>
        <p className="mt-3 max-w-sm text-xs text-muted">In a live product the desk scans this and Pickle records a verified visit, which is what the venue is paid on.</p>
        <button type="button" className="btn btn-dark btn-sm mt-5" onClick={onDone}><Check size={14} /> Done</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4"><MerchantMark mark={venue.mark} size={56} /><div><p className="text-sm text-muted">{ACCESS_CATEGORY_LABELS[venue.category]}</p><p className="flex items-center gap-1 text-sm"><MapPin size={13} className="text-pickle" /> {venue.address}, {venue.area}</p></div></div>
      <div className="flex flex-wrap gap-1.5"><DemoTag>Fictional venue</DemoTag><KindPill venue={venue} />{venue.bookingRequired && <span className="pill-outline"><CalendarCheck size={11} /> Book ahead</span>}</div>
      <p>{venue.description}</p>
      <dl className="grid gap-3 rounded-2xl bg-cream p-4 text-sm sm:grid-cols-2">
        <div><dt className="eyebrow">Included</dt><dd className="mt-1">{venue.includes.join(" · ")}</dd></div>
        <div><dt className="eyebrow">Hours</dt><dd className="mt-1 flex items-center gap-1"><Clock size={12} /> {venue.hours}</dd></div>
        <div className="sm:col-span-2"><dt className="eyebrow">Availability</dt><dd className="mt-1">{venue.availability}</dd></div>
      </dl>
      {venueIncludedIn(venue, plan.id) ? (
        <div className="rounded-2xl border border-ink/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-semibold">Bringing guests?</p><p className="text-xs text-muted">{passesLeft} guest {passesLeft === 1 ? "pass" : "passes"} left this month</p></div>
            <div className="flex items-center gap-2"><button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-ink/15" onClick={() => setGuests((g) => Math.max(0, g - 1))} aria-label="Fewer guests">−</button><span className="num w-6 text-center font-semibold">{guests}</span><button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-ink/15" onClick={() => setGuests((g) => Math.min(passesLeft, g + 1))} aria-label="More guests">+</button></div>
          </div>
          {!check.ok && <p className="mt-3 flex items-center gap-1.5 text-sm text-muted"><X size={14} /> {check.reason}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={doCheckIn} disabled={!check.ok}><QrCode size={16} /> Check in (demo)</button>
            {venue.bookingRequired && <button type="button" className="btn btn-ghost" onClick={() => toast("Booking is simulated in this demo", "dark")}><CalendarCheck size={16} /> Book a slot</button>}
            <a className="btn btn-ghost" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`}><ExternalLink size={16} /> Directions</a>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-ink/10 bg-cream p-4 text-sm">This venue is included from the <strong>{ACCESS_PLAN_BY_ID[(venue.plans as string[])[0]].name}</strong> plan. <Link href="/app/membership" className="underline">Preview another plan</Link> to try it in the demo.</div>
      )}
    </div>
  );
}
