"use client";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { AppHead } from "@/components/navigation/AppShell";
import { PerkExplorer } from "@/components/perks/PerkExplorer";
import type { Perk } from "@/lib/types";

export default function AppPerksPage() {
  const router = useRouter();
  const addToPlan = (p: Perk) => router.push(`/app/together?add=${p.id}`);
  return (
    <>
      <AppHead title="Perks" body="Search, filter and save. Perks you're not yet eligible for are marked with a lock." tag="Demo offers" />
      <Suspense fallback={<div className="skeleton h-64 rounded-[var(--radius-card)]" />}>
        <PerkExplorer showTierFilter onAddToPlan={addToPlan} />
      </Suspense>
    </>
  );
}
