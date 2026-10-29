import type { MembershipTierId, Perk, PerkCategory, PerkStatus } from "@/lib/types";
import { TIER_RANK } from "@/lib/demo/data";

export type PerkSort = "featured" | "newest" | "expiring" | "title";

export interface PerkFilter {
  query?: string;
  category?: PerkCategory | "all";
  neighbourhood?: string | "all";
  status?: PerkStatus | "all";
  tier?: MembershipTierId | "all";
  sort?: PerkSort;
}

/** Derived status: an expiry in the past makes a perk expired regardless of stored status. */
export function effectiveStatus(p: Perk, today = new Date().toISOString().slice(0, 10)): PerkStatus {
  if (p.expiresAt && p.expiresAt < today) return "expired";
  return p.status;
}

export function isEligible(p: Perk, tier: MembershipTierId): boolean {
  return TIER_RANK[tier] >= TIER_RANK[p.tier];
}

export function daysUntil(dateIso: string | null, today = new Date()): number | null {
  if (!dateIso) return null;
  const d = new Date(dateIso + "T00:00:00Z").getTime();
  return Math.ceil((d - today.getTime()) / 86_400_000);
}

export function filterPerks(
  perks: Perk[],
  f: PerkFilter,
  neighbourhoodOf: (p: Perk) => string[],
  merchantName: (p: Perk) => string,
  today?: string,
): Perk[] {
  const q = (f.query ?? "").trim().toLowerCase();
  let out = perks.filter((p) => {
    if (f.category && f.category !== "all" && p.category !== f.category) return false;
    if (f.tier && f.tier !== "all" && p.tier !== f.tier) return false;
    if (f.status && f.status !== "all" && effectiveStatus(p, today) !== f.status) return false;
    if (f.neighbourhood && f.neighbourhood !== "all" && !neighbourhoodOf(p).includes(f.neighbourhood)) return false;
    if (q) {
      const hay = `${p.title} ${p.description} ${merchantName(p)} ${p.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const sort = f.sort ?? "featured";
  out = [...out].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "newest") return b.startAt.localeCompare(a.startAt);
    if (sort === "expiring") {
      const ax = a.expiresAt ?? "9999", bx = b.expiresAt ?? "9999";
      return ax.localeCompare(bx);
    }
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.title.localeCompare(b.title);
  });
  return out;
}
