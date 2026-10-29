"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { offerSchema, fieldErrors, type OfferInput } from "@/lib/validation";
import { CATEGORY_LABELS, type PerkCategory } from "@/lib/types";
import { MERCHANT_BY_ID, DEMO_MERCHANT_ID } from "@/lib/demo/data";
import { saveOffer, type MerchantOffer } from "@/lib/demo/merchant-store";
import { Field, DemoTag, toast } from "@/components/ui";
import { PerkCard } from "@/components/perks/PerkCard";
import { track } from "@/lib/analytics";

const STATUS_HELP: Record<OfferInput["status"], string> = {
  draft: "Only you can see it.",
  scheduled: "Will appear to members from the start date, once Pickle confirms.",
  "live-demo": "Visible in this demo only. Nothing is published to a live network.",
  ended: "Kept for your records; hidden from members.",
};

export function OfferForm({ offer }: { offer?: MerchantOffer }) {
  const router = useRouter();
  const merchant = MERCHANT_BY_ID[offer?.merchantId ?? DEMO_MERCHANT_ID];
  const [v, setV] = useState<OfferInput>({
    title: offer?.title ?? "", category: offer?.category ?? merchant.category, description: offer?.description ?? "", terms: offer?.terms ?? "Pickle members only. One per visit. Subject to availability. Not transferable.",
    locationIds: offer?.locationIds ?? merchant.locations.map((l) => l.id), startAt: offer?.startAt ?? new Date().toISOString().slice(0, 10), expiresAt: offer?.expiresAt ?? null,
    redemptionLimit: offer?.redemptionLimit ?? null, status: offer?.campaignStatus ?? "draft", tier: offer?.tier ?? "green",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = offerSchema.safeParse(v);
    if (!parsed.success) { setErrors(fieldErrors(parsed.error)); return; }
    setErrors({});
    const saved = saveOffer(offer?.id ?? null, parsed.data);
    track("merchant_offer_saved", { status: parsed.data.status });
    toast(offer ? "Offer updated (demo)" : "Offer created (demo)");
    router.push(`/merchant/offers/${saved.id}`);
  };

  const preview = {
    id: offer?.id ?? "preview", merchantId: merchant.id, title: v.title || "Your offer title", description: v.description || "Your description will appear here.", category: v.category,
    terms: v.terms, eligibility: "", startAt: v.startAt, expiresAt: v.expiresAt, status: v.status === "live-demo" ? "available" as const : "conceptual" as const, tier: v.tier,
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field label="Offer title" htmlFor="of-title" error={errors.title} hint="Say what the member gets, in plain words."><input id="of-title" className="input" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} maxLength={90} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category" htmlFor="of-cat" error={errors.category}><select id="of-cat" className="select" value={v.category} onChange={(e) => setV({ ...v, category: e.target.value as PerkCategory })}>{(Object.keys(CATEGORY_LABELS) as PerkCategory[]).map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}</select></Field>
          <Field label="Minimum tier" htmlFor="of-tier" error={errors.tier}><select id="of-tier" className="select" value={v.tier} onChange={(e) => setV({ ...v, tier: e.target.value as OfferInput["tier"] })}><option value="green">Pickle Green (everyone)</option><option value="black">Pickle Black</option><option value="reserve">Pickle Reserve</option></select></Field>
        </div>
        <Field label="Description" htmlFor="of-desc" error={errors.description}><textarea id="of-desc" className="textarea" rows={3} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} /></Field>
        <Field label="Terms" htmlFor="of-terms" error={errors.terms}><textarea id="of-terms" className="textarea" rows={3} value={v.terms} onChange={(e) => setV({ ...v, terms: e.target.value })} /></Field>
        <div className="field">
          <span className="text-sm font-semibold">Locations</span>
          <div className="flex flex-wrap gap-2">
            {merchant.locations.map((l) => { const on = v.locationIds.includes(l.id); return <button key={l.id} type="button" aria-pressed={on} onClick={() => setV({ ...v, locationIds: on ? v.locationIds.filter((x) => x !== l.id) : [...v.locationIds, l.id] })} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${on ? "bg-pickle text-night" : "bg-cream"}`}>{l.address}, {l.neighbourhood}</button>; })}
          </div>
          {errors.locationIds && <p className="error">{errors.locationIds}</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Starts" htmlFor="of-start" error={errors.startAt}><input id="of-start" type="date" className="input num" value={v.startAt} onChange={(e) => setV({ ...v, startAt: e.target.value })} /></Field>
          <Field label="Expires (optional)" htmlFor="of-exp" error={errors.expiresAt}><input id="of-exp" type="date" className="input num" value={v.expiresAt ?? ""} onChange={(e) => setV({ ...v, expiresAt: e.target.value || null })} /></Field>
          <Field label="Redemption limit" htmlFor="of-limit" error={errors.redemptionLimit} hint="Blank = unlimited"><input id="of-limit" type="number" min={1} className="input num" value={v.redemptionLimit ?? ""} onChange={(e) => setV({ ...v, redemptionLimit: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
        </div>
        <Field label="Campaign status" htmlFor="of-status" error={errors.status} hint={STATUS_HELP[v.status]}>
          <select id="of-status" className="select" value={v.status} onChange={(e) => setV({ ...v, status: e.target.value as OfferInput["status"] })}><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="live-demo">Live (demo)</option><option value="ended">Ended</option></select>
        </Field>
        <div className="flex flex-wrap items-center gap-3"><button type="submit" className="btn btn-primary">{offer ? "Save changes" : "Create offer"}</button><button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button><DemoTag>Saved locally · never published live</DemoTag></div>
      </form>
      <aside>
        <p className="eyebrow mb-3">Member preview</p>
        <div className="pointer-events-none"><PerkCard perk={preview} saved={false} onToggleSave={() => {}} onOpen={() => {}} /></div>
        <p className="mt-3 text-xs text-muted">This is how the offer would appear in Pickle Perks and on Radar.</p>
      </aside>
    </div>
  );
}
