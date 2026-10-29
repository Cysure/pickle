"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Bookmark, Gift, Plus, RotateCcw } from "lucide-react";
import { useMerchant, resetMerchant } from "@/lib/demo/merchant-store";
import { MERCHANT_BY_ID } from "@/lib/demo/data";
import { DemoTag, toast } from "@/components/ui";
import { MerchantMark } from "@/components/perks/PerkCard";

const STATUS: Record<string, string> = { draft: "pill-outline", scheduled: "pill-lime", "live-demo": "pill-green", ended: "pill-dark" };

export default function MerchantDashboard() {
  const m = useMerchant();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const merchant = MERCHANT_BY_ID[m.merchantId];
  const totals = m.offers.reduce((t, o) => ({ views: t.views + o.metrics.views, saves: t.saves + o.metrics.saves, redemptions: t.redemptions + o.metrics.redemptions }), { views: 0, saves: 0, redemptions: 0 });
  const live = m.offers.filter((o) => o.campaignStatus === "live-demo").length;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4"><MerchantMark mark={merchant.mark} size={56} /><div><p className="eyebrow text-pickle">Partner dashboard</p><h1 className="display text-3xl md:text-4xl">{merchant.name}</h1><p className="text-sm text-muted">{merchant.locations.length} locations · fictional demo partner</p></div></div>
        <div className="flex gap-2"><button type="button" className="btn btn-ghost btn-sm" onClick={() => { resetMerchant(); toast("Demo offers reset", "dark"); }}><RotateCcw size={14} /> Reset demo</button><Link href="/merchant/offers/new" className="btn btn-primary btn-sm"><Plus size={14} /> New offer</Link></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Live offers", live, Gift], ["Views", totals.views, Eye], ["Saves", totals.saves, Bookmark], ["Redemptions", totals.redemptions, Gift]].map(([l, n, Icon]) => {
          const I = Icon as typeof Eye;
          return <div key={l as string} className="panel p-5"><div className="flex items-center justify-between"><p className="text-sm text-muted">{l as string}</p><I size={16} className="text-pickle" /></div><p className="num mt-2 font-display text-3xl font-bold">{mounted ? (n as number).toLocaleString() : "—"}</p></div>;
        })}
      </div>
      <p className="mt-3"><DemoTag>Metrics are illustrative and generated for the demo</DemoTag></p>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-bold tracking-tight">Offers</h2>
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-muted"><th className="px-5 py-3">Offer</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Dates</th><th className="px-5 py-3 text-right">Views</th><th className="px-5 py-3 text-right">Saves</th><th className="px-5 py-3 text-right">Redeemed</th><th className="px-5 py-3"></th></tr></thead>
            <tbody>
              {m.offers.map((o) => (
                <tr key={o.id} className="border-b border-ink/5 last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3"><p className="font-semibold">{o.title}</p><p className="text-xs text-muted">Tier: {o.tier} · {o.locationIds.length} locations{o.redemptionLimit ? ` · limit ${o.redemptionLimit}` : ""}</p></td>
                  <td className="px-5 py-3"><span className={STATUS[o.campaignStatus]}>{o.campaignStatus === "live-demo" ? "Live (demo)" : o.campaignStatus}</span></td>
                  <td className="num px-5 py-3 text-xs">{o.startAt} → {o.expiresAt ?? "open"}</td>
                  <td className="num px-5 py-3 text-right">{mounted ? o.metrics.views.toLocaleString() : "—"}</td>
                  <td className="num px-5 py-3 text-right">{mounted ? o.metrics.saves.toLocaleString() : "—"}</td>
                  <td className="num px-5 py-3 text-right">{mounted ? o.metrics.redemptions.toLocaleString() : "—"}</td>
                  <td className="px-5 py-3 text-right"><Link href={`/merchant/offers/${o.id}`} className="btn btn-ghost btn-sm">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
