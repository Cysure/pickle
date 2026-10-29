import type { AccessCheckIn, AccessPlan, AccessPlanId, AccessVenue } from "@/lib/types";

/** Pure membership logic for Pickle Access, unit tested. */

export function annualSaving(plan: AccessPlan): { amount: number; percent: number } {
  const full = plan.monthly * 12;
  const amount = Math.max(0, full - plan.annual);
  return { amount, percent: full ? Math.round((amount / full) * 100) : 0 };
}

export function venueIncludedIn(venue: AccessVenue, plan: AccessPlanId): boolean {
  return venue.plans === "all" || venue.plans.includes(plan);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function guestPassesUsed(checkIns: AccessCheckIn[], month: string): number {
  return checkIns.filter((c) => monthKey(c.at) === month).reduce((n, c) => n + c.guests, 0);
}

export function guestPassesLeft(plan: AccessPlan, checkIns: AccessCheckIn[], month: string): number {
  return Math.max(0, plan.guestPassesPerMonth - guestPassesUsed(checkIns, month));
}

/** A member may check in once per venue per day; guests are limited by passes left this month. */
export function canCheckIn(
  venue: AccessVenue, plan: AccessPlan, checkIns: AccessCheckIn[], guests: number, now: Date,
): { ok: true } | { ok: false; reason: string } {
  if (!venueIncludedIn(venue, plan.id)) return { ok: false, reason: `${venue.name} is included from the ${venue.plans === "all" ? "" : venue.plans[0]} plan upwards.` };
  const today = now.toISOString().slice(0, 10);
  if (checkIns.some((c) => c.venueId === venue.id && c.at.slice(0, 10) === today)) return { ok: false, reason: "You've already checked in here today." };
  if (guests < 0 || !Number.isInteger(guests)) return { ok: false, reason: "Invalid guest count." };
  const left = guestPassesLeft(plan, checkIns, monthKey(now.toISOString()));
  if (guests > left) return { ok: false, reason: `Only ${left} guest ${left === 1 ? "pass" : "passes"} left this month.` };
  return { ok: true };
}

/** Deterministic 7x7 pattern for the demo check-in code so it looks like a QR without being one. */
export function checkInPattern(seed: string): boolean[] {
  let h = 2166136261;
  for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const cells: boolean[] = [];
  for (let i = 0; i < 49; i++) { h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; cells.push((h & 1) === 1); }
  return cells;
}
