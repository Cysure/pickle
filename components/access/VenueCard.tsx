"use client";
import { MapPin, Clock, CalendarCheck, Baby, Lock, Ticket, Percent, Dumbbell, Sparkles } from "lucide-react";
import type { AccessVenue, AccessPlanId } from "@/lib/types";
import { ACCESS_CATEGORY_LABELS } from "@/lib/types";
import { venueIncludedIn } from "@/lib/access";
import { ACCESS_PLAN_BY_ID } from "@/lib/demo/access";
import { MerchantMark } from "@/components/perks/PerkCard";
import { DemoTag } from "@/components/ui";

export function KindPill({ venue }: { venue: AccessVenue }) {
  if (venue.kind === "free-entry") return <span className="pill-green"><Ticket size={11} /> Free entry</span>;
  if (venue.kind === "class-credit") return <span className="pill-lime"><Dumbbell size={11} /> Classes included</span>;
  if (venue.kind === "perk") return <span className="pill-lime"><Sparkles size={11} /> {venue.perkLabel ?? "Member perk"}</span>;
  return <span className="pill-outline"><Percent size={11} /> {venue.discountPercent}% off</span>;
}

export function VenueCard({ venue, plan, onOpen, compact = false }: { venue: AccessVenue; plan?: AccessPlanId; onOpen?: (v: AccessVenue) => void; compact?: boolean }) {
  const included = plan ? venueIncludedIn(venue, plan) : true;
  const minPlan = venue.plans === "all" ? null : ACCESS_PLAN_BY_ID[venue.plans[0]];
  return (
    <article className={`panel hover-lift group relative flex h-full min-w-0 flex-col gap-3 p-5 ${included ? "" : "opacity-80"}`}>
      <div className="flex items-start gap-3">
        <MerchantMark mark={venue.mark} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">{venue.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted"><MapPin size={11} /> {venue.area} · {ACCESS_CATEGORY_LABELS[venue.category]}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <DemoTag>Demo</DemoTag>
        <KindPill venue={venue} />
        {venue.kidsWelcome && <span className="pill-outline"><Baby size={11} /> Kids</span>}
        {venue.bookingRequired && <span className="pill-outline"><CalendarCheck size={11} /> Book ahead</span>}
        {!included && minPlan && <span className="pill-dark"><Lock size={11} /> {minPlan.name}+</span>}
      </div>
      {!compact && <p className="text-sm text-muted">{venue.description}</p>}
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {venue.includes.map((i) => <li key={i} className="flex items-center gap-1 before:h-1 before:w-1 before:rounded-full before:bg-pickle">{i}</li>)}
      </ul>
      <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-xs text-muted">
        <span className="flex items-center gap-1"><Clock size={11} /> {venue.hours}</span>
        {onOpen && <button type="button" onClick={() => onOpen(venue)} className="btn btn-dark btn-sm">{included ? "View & check in" : "View"}</button>}
      </div>
    </article>
  );
}
