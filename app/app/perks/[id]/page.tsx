"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PERK_BY_ID } from "@/lib/demo/data";
import { PerkDetail } from "@/components/perks/PerkDetail";
import { useSavedPerks } from "@/components/perks/PerkExplorer";
import { useDemo } from "@/lib/demo/store";
import { isEligible } from "@/lib/perks";
import { EmptyState } from "@/components/ui";

export default function PerkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [demo] = useDemo();
  const { saved, toggle } = useSavedPerks();
  const perk = PERK_BY_ID[id];
  if (!perk) {
    return <EmptyState title="Perk not found" body="This demo perk doesn't exist or has been removed." action={<Link href="/app/perks" className="btn btn-dark btn-sm">Back to perks</Link>} />;
  }
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/perks" className="mb-5 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={14} /> All perks</Link>
      <h1 className="display mb-6 text-3xl md:text-4xl">{perk.title}</h1>
      <div className="panel p-6 md:p-8">
        <PerkDetail perk={perk} saved={saved.includes(perk.id)} onToggleSave={toggle} eligible={isEligible(perk, demo.tier)} onAddToPlan={(p) => router.push(`/app/together?add=${p.id}`)} />
      </div>
    </div>
  );
}
