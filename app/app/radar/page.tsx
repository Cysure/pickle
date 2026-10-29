"use client";
import { AppHead } from "@/components/navigation/AppShell";
import { Radar } from "@/components/perks/Radar";

export default function AppRadarPage() {
  return (
    <>
      <AppHead title="Radar" body="Find your next favourite across Bali. Partners are fictional demos placed in real areas." tag="Illustrated map" />
      <Radar />
    </>
  );
}
