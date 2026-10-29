"use client";
import { MapPin, Users, BadgeCheck } from "lucide-react";
import { checkInPattern } from "@/lib/access";
import { PHOTOS } from "@/lib/photos";

/** A CSS phone showing the member app mid check-in: Mr. Pickle's QR code for the venue he's walking into. Pure markup. */
export function PhoneMock() {
  const cells = checkInPattern("mr-pickle|tamarind");
  return (
    <div className="relative mx-auto w-[300px] md:w-[320px]">
      <div className="relative aspect-[9/19] overflow-hidden rounded-[44px] border-[8px] border-night bg-paper shadow-[0_40px_90px_-30px_rgba(16,17,16,0.55)] ring-1 ring-black/40">
        <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-night" aria-hidden="true" />
        <div className="flex h-full flex-col px-4 pb-4 pt-10 text-ink">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/pickle-icon.png" alt="" className="h-5 w-5 -rotate-12" />
              <span className="font-display text-sm font-bold">Check in</span>
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pickle font-display text-sm font-bold text-night">MP</span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 font-display text-sm font-bold leading-tight">Mr. Pickle <BadgeCheck size={13} className="text-pickle" /></span>
              <span className="block text-[10px] text-muted">Pickle Perks Duo · ID 0427-PK</span>
            </span>
          </div>

          {/* QR */}
          <div className="mt-4 rounded-3xl bg-night p-4 text-paper">
            <div className="mx-auto grid w-fit grid-cols-7 gap-[3px] rounded-2xl bg-white p-3">
              {cells.map((on, i) => <span key={i} className={`h-[17px] w-[17px] rounded-[3px] ${on ? "bg-night" : "bg-cream"}`} />)}
            </div>
            <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-pickle">Show at the desk</p>
            <p className="mt-0.5 flex items-center justify-center gap-1 whitespace-nowrap text-[11px] text-paper/60">Valid 14:58 · <Users size={10} /> +1 guest</p>
          </div>

          {/* venue */}
          <div className="relative mt-3 h-[88px] overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTOS.beach.src} alt="" style={{ objectPosition: "50% 40%" }} className="absolute inset-0 h-full w-full object-cover" />
            <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,17,16,0.85),rgba(16,17,16,0.15))]" />
            <span className="absolute inset-y-0 left-3 flex flex-col justify-center text-paper">
              <span className="font-display text-sm font-bold leading-tight">Tamarind Beach Club</span>
              <span className="flex items-center gap-1 text-[10px] text-paper/75"><MapPin size={10} /> Seminyak</span>
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-pickle px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-night">Free entry</span>
          </div>

          <div className="mt-auto grid grid-cols-5 gap-1 rounded-2xl bg-white p-1.5 text-[8px] font-semibold text-muted ring-1 ring-ink/5">
            {["Home", "Check in", "Perks", "Radar", "Me"].map((t, i) => <span key={t} className={`rounded-xl py-1.5 text-center ${i === 1 ? "bg-night text-pickle" : ""}`}>{t}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
