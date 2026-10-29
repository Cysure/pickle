"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Home, CreditCard, Gift, Radar as RadarIcon, Users, Bookmark, Activity, Crown, UserRound, Settings, ArrowLeft, Waves } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useDemo } from "@/lib/demo/store";
import { demoSignIn, completeOnboarding } from "@/lib/auth/demo-session";
import { PickleCard } from "@/components/cards/PickleCard";
import { DemoTag, Toaster } from "@/components/ui";
import { AREAS, TIERS } from "@/lib/demo/data";
import type { CardVariant } from "@/lib/types";
import { track } from "@/lib/analytics";

export const APP_NAV = [
  { href: "/app/home", label: "Home", icon: Home },
  { href: "/app/access", label: "Pickle Access", icon: Waves },
  { href: "/app/perks", label: "Perks", icon: Gift },
  { href: "/app/radar", label: "Radar", icon: RadarIcon },
  { href: "/app/card", label: "Card", icon: CreditCard },
  { href: "/app/together", label: "Together", icon: Users },
  { href: "/app/saved", label: "Saved", icon: Bookmark },
  { href: "/app/activity", label: "Activity", icon: Activity },
  { href: "/app/membership", label: "Membership", icon: Crown },
  { href: "/app/profile", label: "Profile", icon: UserRound },
  { href: "/app/settings", label: "Settings", icon: Settings },
];
const MOBILE = [APP_NAV[0], APP_NAV[1], APP_NAV[2], APP_NAV[3], APP_NAV[9]];

export function AppShell({ children }: { children: ReactNode }) {
  const [demo] = useDemo();
  const path = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); track("app_demo_opened", {}); }, []);

  if (!mounted) return <div className="min-h-screen bg-paper" />;
  if (!demo.signedIn) return <SignIn />;
  if (!demo.onboarded) return <Onboarding />;

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:flex lg:flex-col lg:border-r lg:border-ink/10 lg:bg-white">
        <div className="sticky top-0 flex h-screen flex-col px-5 py-6">
          <Link href="/app/home" aria-label="Pickle app home"><Logo width={150} /></Link>
          <nav className="mt-8 flex-1 space-y-1" aria-label="App">
            {APP_NAV.map(({ href, label, icon: Icon }) => {
              const active = path === href || path.startsWith(href + "/");
              return (
                <Link key={href} href={href} className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-night text-pickle" : "text-ink hover:bg-cream"}`} aria-current={active ? "page" : undefined}>
                  <Icon size={18} /> {label}
                </Link>
              );
            })}
          </nav>
          <div className="rounded-2xl bg-cream p-4 text-xs text-muted">
            <DemoTag>Demo mode</DemoTag>
            <p className="mt-2">Everything here is a preview on your device. No payments, no real data.</p>
            <Link href="/" className="mt-3 inline-flex items-center gap-1 font-semibold text-ink"><ArrowLeft size={12} /> Back to site</Link>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink/10 bg-paper/90 px-4 backdrop-blur lg:hidden">
          <Link href="/app/home" aria-label="Pickle app home"><Logo width={124} /></Link>
          <DemoTag>Demo</DemoTag>
        </header>
        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 backdrop-blur lg:hidden" aria-label="App">
          <ul className="grid grid-cols-5">
            {MOBILE.map(({ href, label, icon: Icon }) => {
              const active = path === href || path.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link href={href} className={`flex flex-col items-center gap-1 whitespace-nowrap py-2.5 text-[10px] font-semibold ${active ? "text-pickle" : "text-muted"}`} aria-current={active ? "page" : undefined}>
                    <span className={`grid h-8 w-12 place-items-center rounded-full ${active ? "bg-night" : ""}`}><Icon size={18} /></span>{label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <Toaster />
    </div>
  );
}

function SignIn() {
  const [name, setName] = useState("");
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-muted"><ArrowLeft size={14} /> Back to site</Link>
        <div className="panel p-7 sm:p-9">
          <Logo width={180} />
          <h1 className="display mt-6 text-3xl">Try the Pickle app.</h1>
          <p className="mt-2 text-muted">This is a demo. Choose a name to personalise it. There is no password, nothing is sent anywhere, and no card is issued.</p>
          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); demoSignIn(name || "Mr. Pickle"); }}>
            <div className="field"><label htmlFor="demo-name">What should we call you?</label><input id="demo-name" className="input" placeholder="Mr. Pickle" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="given-name" /></div>
            <button type="submit" className="btn btn-primary w-full">Continue to the demo</button>
          </form>
          <p className="mt-4 text-xs text-muted">We never ask for PINs, passwords or card details in this preview.</p>
        </div>
      </div>
    </div>
  );
}

const HOODS = AREAS;

function Onboarding() {
  const [demo] = useDemo();
  const [variant, setVariant] = useState<CardVariant>("green");
  const [hoods, setHoods] = useState<string[]>(["Seminyak"]);
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="panel p-7 sm:p-9">
          <p className="eyebrow text-pickle">Welcome, {demo.displayName}</p>
          <h1 className="display mt-2 text-3xl">Make it yours.</h1>
          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-semibold">Pick a card design</p>
              <div className="mt-3 px-2"><PickleCard variant={variant} tilt={false} /></div>
              <div className="mt-4 flex gap-2">
                {TIERS.map((t) => <button key={t.id} type="button" onClick={() => setVariant(t.id)} aria-pressed={variant === t.id} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${variant === t.id ? "border-night bg-night text-paper" : "border-ink/15"}`}>{t.name}</button>)}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Areas of Bali you care about</p>
              <p className="text-xs text-muted">Pick a few. You can add saved places later in Radar.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {HOODS.map((h) => {
                  const on = hoods.includes(h);
                  return <button key={h} type="button" aria-pressed={on} onClick={() => setHoods(on ? hoods.filter((x) => x !== h) : [...hoods, h])} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${on ? "bg-pickle text-night" : "bg-cream"}`}>{h}</button>;
                })}
              </div>
              <button type="button" className="btn btn-primary mt-8 w-full" onClick={() => completeOnboarding({ cardVariant: variant, savedLocations: hoods })}>Open my Pickle</button>
              <p className="mt-3 text-xs text-muted">You can change all of this later in Settings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Page header used inside the app. */
export function AppHead({ title, body, children, tag }: { title: ReactNode; body?: string; children?: ReactNode; tag?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2"><h1 className="display text-3xl md:text-4xl">{title}</h1>{tag && <DemoTag>{tag}</DemoTag>}</div>
        {body && <p className="mt-1.5 max-w-xl text-muted">{body}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
