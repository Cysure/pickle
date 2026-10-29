"use client";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, MapPin, Crown } from "lucide-react";
import { AppHead } from "@/components/navigation/AppShell";
import { PickleCard } from "@/components/cards/PickleCard";
import { useDemo } from "@/lib/demo/store";
import { ACTIVITY, DEMO_CARD_REFERENCE, MERCHANTS, PERKS, PERK_BY_ID, TIERS, formatMoney } from "@/lib/demo/data";
import { effectiveStatus, isEligible } from "@/lib/perks";
import { DemoTag } from "@/components/ui";
import { PerkCard } from "@/components/perks/PerkCard";
import { useSavedPerks } from "@/components/perks/PerkExplorer";
import { MerchantMark } from "@/components/perks/PerkCard";
import { useRouter } from "next/navigation";
import { ACCESS_PLAN_BY_ID, ACCESS_VENUES } from "@/lib/demo/access";
import { guestPassesLeft, monthKey } from "@/lib/access";
import { Waves } from "lucide-react";

export default function HomeDashboard() {
  const [demo] = useDemo();
  const { saved, toggle } = useSavedPerks();
  const router = useRouter();
  const tier = TIERS.find((t) => t.id === demo.tier)!;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const forYou = PERKS.filter((p) => effectiveStatus(p) === "available" && isEligible(p, demo.tier) && !saved.includes(p.id)).slice(0, 3);
  const nearby = MERCHANTS.filter((m) => m.locations.some((l) => demo.savedLocations.includes(l.neighbourhood))).slice(0, 4);
  const recent = ACTIVITY.slice(0, 3);

  return (
    <>
      <AppHead title={<>{greet}, {demo.displayName}.</>} body="Here's what's good around you today." tag="Demo" />
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel-dark relative overflow-hidden p-6">
          <div className="flex items-center justify-between"><p className="eyebrow text-pickle">Your Pickle Card · coming soon</p><span className={`pill-${demo.frozen ? "outline" : "green"}`}>{demo.frozen ? "Frozen" : "Active · demo"}</span></div>
          <div className="mx-auto mt-4 max-w-sm"><PickleCard variant={demo.cardVariant} name={demo.displayName.toUpperCase() + " · MEMBER"} reference={DEMO_CARD_REFERENCE[demo.cardVariant]} /></div>
          <div className="mt-5 flex items-end justify-between">
            <div><p className="text-xs text-paper/50">Sample balance</p><p className="num font-display text-3xl font-bold text-paper">{formatMoney(2450000, demo.currency)}</p><DemoTag className="mt-1">Sample figure · not real money</DemoTag></div>
            <Link href="/app/card" className="btn btn-primary btn-sm">Manage card</Link>
          </div>
        </section>

        <section className="grid gap-5">
          <div className="panel p-5">
            <div className="flex items-center justify-between"><p className="eyebrow">Access</p><Link href="/app/access" className="text-sm font-semibold text-pickle">Check in</Link></div>
            <div className="mt-3 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-pickle text-night"><Waves size={20} /></span><div><p className="font-display text-xl font-bold">{ACCESS_PLAN_BY_ID[demo.access.plan].name}</p><p className="text-xs text-muted">{ACCESS_VENUES.length} venues · {guestPassesLeft(ACCESS_PLAN_BY_ID[demo.access.plan], demo.access.checkIns, monthKey(new Date().toISOString()))} guest passes left this month · proposed plan, demo</p></div></div>
          </div>
          <div className="panel p-5">
            <div className="flex items-center justify-between"><p className="eyebrow">Membership</p><Link href="/app/membership" className="text-sm font-semibold text-pickle">Details</Link></div>
            <div className="mt-3 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-night text-pickle"><Crown size={20} /></span><div><p className="font-display text-xl font-bold">{tier.name}</p><p className="text-xs text-muted">{tier.tagline} · Proposed tier, demo</p></div></div>
          </div>
          <div className="panel p-5">
            <div className="flex items-center justify-between"><p className="eyebrow">Recent activity</p><Link href="/app/activity" className="text-sm font-semibold text-pickle">All</Link></div>
            <ul className="mt-3 divide-y divide-ink/5">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2.5 text-sm"><div><p className="font-semibold">{a.merchantLabel}</p><p className="text-xs text-muted">{new Date(a.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}{a.relatedPerkId ? ` · ${PERK_BY_ID[a.relatedPerkId].title}` : ""}</p></div><p className="num font-semibold">{formatMoney(a.amount, a.currency)}</p></li>
              ))}
            </ul>
            <DemoTag className="mt-2">Sample transactions</DemoTag>
          </div>
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-2xl font-bold tracking-tight">Perks for you</h2><Link href="/app/perks" className="btn btn-ghost btn-sm">Explore Perks <ArrowRight size={14} /></Link></div>
        <div className="grid gap-4 md:grid-cols-3">
          <Suspense>{forYou.map((p) => <PerkCard key={p.id} perk={p} saved={saved.includes(p.id)} onToggleSave={toggle} onOpen={() => router.push(`/app/perks/${p.id}`)} />)}</Suspense>
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Nearby</h2><Link href="/app/radar" className="text-sm font-semibold text-pickle">Open Radar</Link></div>
          <p className="text-xs text-muted">Based on your saved areas: {demo.savedLocations.join(", ") || "none yet"}</p>
          <ul className="mt-3 space-y-2">
            {nearby.length === 0 && <li className="text-sm text-muted">Add areas in Settings to see places here.</li>}
            {nearby.map((m) => <li key={m.id} className="flex items-center gap-3 rounded-2xl bg-cream px-3 py-2.5 text-sm"><MerchantMark mark={m.mark} size={36} /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{m.name}</p><p className="flex items-center gap-1 text-xs text-muted"><MapPin size={11} /> {m.locations.map((l) => l.neighbourhood).join(" · ")}</p></div></li>)}
          </ul>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Saved</h2><Link href="/app/saved" className="text-sm font-semibold text-pickle">See all</Link></div>
          <ul className="mt-3 space-y-2">
            {saved.length === 0 && <li className="text-sm text-muted">Nothing saved yet. Tap the bookmark on any perk.</li>}
            {saved.slice(0, 4).map((id) => PERK_BY_ID[id]).filter(Boolean).map((p) => <li key={p.id}><Link href={`/app/perks/${p.id}`} className="flex items-center justify-between rounded-2xl bg-cream px-3 py-2.5 text-sm hover:bg-pickle/20"><span className="font-semibold">{p.title}</span><ArrowRight size={14} /></Link></li>)}
          </ul>
        </div>
      </section>
    </>
  );
}
