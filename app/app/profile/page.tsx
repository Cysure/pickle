"use client";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { AppHead } from "@/components/navigation/AppShell";
import { useDemo } from "@/lib/demo/store";
import { demoSignOut } from "@/lib/auth/demo-session";
import { DEMO_PROFILE, TIERS } from "@/lib/demo/data";
import { DemoTag } from "@/components/ui";

export default function ProfilePage() {
  const [demo, update] = useDemo();
  const tier = TIERS.find((t) => t.id === demo.tier)!;
  return (
    <>
      <AppHead title="Profile" body="Your demo profile. Nothing here leaves this device." tag="Demo profile">
        <Link href="/app/settings" className="btn btn-ghost btn-sm"><Settings size={14} /> Settings</Link>
      </AppHead>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel flex flex-col items-center p-8 text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-night font-display text-4xl font-bold text-pickle">{demo.displayName.slice(0, 1).toUpperCase()}</div>
          <h2 className="mt-4 font-display text-2xl font-bold">{demo.displayName}</h2>
          <p className="text-sm text-muted">{tier.name} · member since {DEMO_PROFILE.memberSince}</p>
          <DemoTag className="mt-3">Fictional profile</DemoTag>
          <button type="button" onClick={demoSignOut} className="btn btn-ghost btn-sm mt-6"><LogOut size={14} /> Sign out of the demo</button>
        </div>
        <div className="panel p-6">
          <div className="field"><label htmlFor="pf-name">Display name</label><input id="pf-name" className="input" value={demo.displayName} maxLength={40} onChange={(e) => update({ displayName: e.target.value })} /></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="field"><label htmlFor="pf-country">Country</label><input id="pf-country" className="input" value={demo.country} onChange={(e) => update({ country: e.target.value })} /></div>
            <div className="field"><label htmlFor="pf-currency">Currency</label><input id="pf-currency" className="input num" value={demo.currency} maxLength={3} onChange={(e) => update({ currency: e.target.value.toUpperCase() })} /></div>
          </div>
          <div className="field mt-4"><label htmlFor="pf-email">Email</label><input id="pf-email" className="input" value={DEMO_PROFILE.email} readOnly aria-readonly /><p className="text-xs text-muted">Fixed sample address. Real accounts would manage this through the issuer-verified sign-in.</p></div>
          <p className="mt-4 text-xs text-muted">Saved neighbourhoods: {demo.savedLocations.join(", ") || "none"} · change them in Settings.</p>
        </div>
      </div>
    </>
  );
}
