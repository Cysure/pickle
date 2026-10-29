"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useMerchant, deleteOffer } from "@/lib/demo/merchant-store";
import { OfferForm } from "@/components/merchant/OfferForm";
import { EmptyState, Modal, toast } from "@/components/ui";

export default function EditOfferPage() {
  const { id } = useParams<{ id: string }>();
  const m = useMerchant();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => setMounted(true), []);
  const offer = m.offers.find((o) => o.id === id);
  if (!mounted) return null;
  if (!offer) return <EmptyState title="Offer not found" body="It may have been deleted from this demo." action={<Link href="/merchant" className="btn btn-dark btn-sm">Back to dashboard</Link>} />;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><Link href="/merchant" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={14} /> Dashboard</Link><h1 className="display text-3xl md:text-4xl">Edit offer</h1><p className="text-sm text-muted">Last updated {new Date(offer.updatedAt).toLocaleString()}</p></div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(true)}><Trash2 size={14} /> Delete</button>
      </div>
      <div className="panel mb-8 grid grid-cols-3 gap-4 p-5 text-center">
        {[["Views", offer.metrics.views], ["Saves", offer.metrics.saves], ["Redemptions", offer.metrics.redemptions]].map(([l, n]) => <div key={l as string}><p className="text-xs text-muted">{l as string}</p><p className="num font-display text-2xl font-bold">{(n as number).toLocaleString()}</p></div>)}
        <p className="col-span-3 text-xs text-muted">Illustrative metrics for this demo campaign.</p>
      </div>
      <OfferForm key={offer.id} offer={offer} />
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Delete this offer?">
        <p className="text-sm text-muted">It will be removed from this demo. This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-2"><button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)}>Cancel</button><button type="button" className="btn btn-dark btn-sm" onClick={() => { deleteOffer(offer.id); toast("Offer deleted", "dark"); router.push("/merchant"); }}>Delete</button></div>
      </Modal>
    </>
  );
}
