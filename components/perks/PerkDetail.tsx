"use client";
import { Bookmark, BookmarkCheck, MapPin, Share2, CalendarPlus } from "lucide-react";
import type { Perk } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { MERCHANT_BY_ID, TIERS } from "@/lib/demo/data";
import { effectiveStatus } from "@/lib/perks";
import { CopyButton, DemoTag, toast } from "@/components/ui";
import { MerchantMark, StatusPill } from "./PerkCard";
import { SITE_URL } from "@/lib/config";
import { track } from "@/lib/analytics";

export function PerkDetail({
  perk, saved, onToggleSave, onAddToPlan, eligible = true,
}: {
  perk: Perk; saved: boolean; onToggleSave: (id: string) => void; onAddToPlan?: (p: Perk) => void; eligible?: boolean;
}) {
  const m = MERCHANT_BY_ID[perk.merchantId];
  const tier = TIERS.find((t) => t.id === perk.tier)!;
  const shareUrl = `${SITE_URL}/perks?perk=${perk.id}`;
  const status = effectiveStatus(perk);

  const share = async () => {
    const data = { title: `${perk.title} — Pickle`, text: `${m.name}: ${perk.title}`, url: shareUrl };
    try {
      if (navigator.share) { await navigator.share(data); track("offer_shared", { perkId: perk.id, method: "share" }); return; }
    } catch { /* user cancelled */ return; }
    await navigator.clipboard.writeText(shareUrl).catch(() => {});
    track("offer_shared", { perkId: perk.id, method: "copy" });
    toast("Demo link copied");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <MerchantMark mark={m.mark} size={56} />
        <div>
          <p className="font-semibold">{m.name}</p>
          <p className="text-sm text-muted">{m.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="pill-outline">{CATEGORY_LABELS[perk.category]}</span>
        <StatusPill perk={perk} />
        <span className="pill-dark">{tier.name}+</span>
        <DemoTag>Illustrative demo offer</DemoTag>
      </div>
      <p className="text-base leading-relaxed">{perk.description}</p>

      <dl className="grid gap-4 rounded-2xl bg-cream p-4 text-sm sm:grid-cols-2">
        <div><dt className="eyebrow">Eligibility</dt><dd className="mt-1">{perk.eligibility}</dd></div>
        <div><dt className="eyebrow">Valid</dt><dd className="mt-1 num">{perk.startAt}{perk.expiresAt ? ` → ${perk.expiresAt}` : " → no fixed end date"}</dd></div>
        <div className="sm:col-span-2"><dt className="eyebrow">Where</dt>
          <dd className="mt-1 space-y-1">
            {m.locations.map((l) => (<p key={l.id} className="flex items-center gap-1.5"><MapPin size={13} className="text-pickle" /> {l.address}, {l.neighbourhood}, {l.city}</p>))}
          </dd>
        </div>
        <div className="sm:col-span-2"><dt className="eyebrow">Terms</dt><dd className="mt-1 text-muted">{perk.terms}</dd></div>
      </dl>

      {!eligible && (
        <p className="rounded-2xl border border-ink/10 p-4 text-sm">
          This perk is proposed for <strong>{tier.name}</strong> members and above. Membership tiers are not yet available; see <a href="/app/membership" className="underline">Membership</a>.
        </p>
      )}
      {status === "expired" && <p className="text-sm text-muted">This demo offer has ended and is shown for reference.</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onToggleSave(perk.id)} className={`btn btn-sm ${saved ? "btn-primary" : "btn-dark"}`}>
          {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />} {saved ? "Saved" : "Save perk"}
        </button>
        <button type="button" onClick={share} className="btn btn-ghost btn-sm"><Share2 size={14} /> Share</button>
        <CopyButton text={shareUrl} onCopied={() => track("offer_shared", { perkId: perk.id, method: "copy" })} />
        {onAddToPlan && <button type="button" onClick={() => onAddToPlan(perk)} className="btn btn-ghost btn-sm"><CalendarPlus size={14} /> Add to a plan</button>}
      </div>
      <p className="num break-all text-xs text-muted">{shareUrl}</p>
    </div>
  );
}
