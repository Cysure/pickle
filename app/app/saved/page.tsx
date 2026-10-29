"use client";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { AppHead } from "@/components/navigation/AppShell";
import { PerkExplorer } from "@/components/perks/PerkExplorer";

export default function SavedPage() {
  const router = useRouter();
  return (
    <>
      <AppHead title="Saved perks" body="Kept on this device. Unsave anything to remove it." tag="Local" />
      <Suspense fallback={null}>
        <PerkExplorer onlySaved compact onAddToPlan={(p) => router.push(`/app/together?add=${p.id}`)} />
      </Suspense>
    </>
  );
}
