import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OfferForm } from "@/components/merchant/OfferForm";

export default function NewOfferPage() {
  return (
    <>
      <Link href="/merchant" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={14} /> Dashboard</Link>
      <h1 className="display mb-2 text-3xl md:text-4xl">Create an offer</h1>
      <p className="mb-8 max-w-xl text-muted">Describe the perk, choose where and when it applies, and preview how members will see it. Offers stay in this demo until Pickle and you both confirm a live launch.</p>
      <OfferForm />
    </>
  );
}
