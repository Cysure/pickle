"use client";
import { Check } from "lucide-react";
import { TIERS } from "@/lib/demo/data";
import type { MembershipTierId } from "@/lib/types";
import { PickleCard } from "@/components/cards/PickleCard";
import { Stagger, Item } from "@/components/motion/Reveal";
import { DemoTag } from "@/components/ui";

export function TierCards({ current, showCards = true }: { current?: MembershipTierId; showCards?: boolean }) {
  return (
    <Stagger className="grid gap-5 md:grid-cols-3">
      {TIERS.map((t) => {
        const dark = t.id !== "green";
        return (
          <Item key={t.id}>
            <article className={`${dark ? "panel-dark text-paper" : "panel text-ink"} shine relative flex h-full flex-col p-6`}>
              <div className="flex items-center justify-between">
                <p className={`eyebrow ${dark ? "text-pickle" : "text-muted"}`}>{t.name}</p>
                {current === t.id ? <span className="pill-green">Your demo tier</span> : <DemoTag>Proposed</DemoTag>}
              </div>
              <h3 className={`mt-3 font-display text-2xl font-bold tracking-tight ${dark ? "text-paper" : "text-ink"}`}>{t.tagline}</h3>
              <p className={`mt-2 text-sm ${dark ? "text-paper/60" : "text-muted"}`}>{t.description}</p>
              {showCards && <div className="my-6 px-4"><PickleCard variant={t.id} tilt={false} /></div>}
              <ul className={`mt-auto space-y-2 text-sm ${dark ? "text-paper/85" : "text-ink"}`}>
                {t.benefits.map((b) => <li key={b} className="flex items-start gap-2"><Check size={16} className="mt-0.5 shrink-0 text-pickle" /> {b}</li>)}
              </ul>
            </article>
          </Item>
        );
      })}
    </Stagger>
  );
}
