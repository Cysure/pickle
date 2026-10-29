"use client";
import { useCallback, useSyncExternalStore } from "react";
import type { CardVariant, GroupPlan, MembershipTierId } from "@/lib/types";
import { DEMO_PROFILE, SAMPLE_PLANS } from "./data";

/**
 * Local demo state. Everything a visitor does in the app demo is kept in
 * localStorage under one key, so it survives reloads but never leaves the
 * browser. When Supabase is configured, saved perks are also mirrored there
 * (see components/perks/useSavedPerks).
 */
export interface SavedPlace {
  id: string;
  label: string;
  address?: string;
  lat: number;
  lng: number;
}

export interface DemoState {
  version: 1;
  /** Radar: places the member has saved (home, work, a city they visit) */
  savedPlaces: SavedPlace[];
  /** Radar: which saved place is active, or null for the default/current location */
  activePlaceId: string | null;
  /** Pickle Access demo membership */
  access: { plan: "solo" | "duo" | "family"; checkIns: import("@/lib/types").AccessCheckIn[]; billing: "monthly" | "annual" };
  signedIn: boolean;
  onboarded: boolean;
  displayName: string;
  tier: MembershipTierId;
  cardVariant: CardVariant;
  frozen: boolean;
  notifications: { perks: boolean; activity: boolean; plans: boolean };
  savedPerkIds: string[];
  plans: GroupPlan[];
  savedLocations: string[];
  radarView: "map" | "list";
  privacy: { analytics: boolean; location: boolean };
  a11y: { reduceMotion: boolean; largeText: boolean };
  country: string;
  currency: string;
}

const KEY = "pickle.demo.v1";

export const DEFAULT_STATE: DemoState = {
  version: 1,
  savedPlaces: [],
  activePlaceId: null,
  access: { plan: "solo", billing: "monthly", checkIns: [] },
  signedIn: false,
  onboarded: false,
  displayName: DEMO_PROFILE.displayName,
  tier: "green",
  cardVariant: "green",
  frozen: false,
  notifications: { perks: true, activity: true, plans: true },
  savedPerkIds: ["p-brine-coffee", "p-halcyon-late"],
  plans: SAMPLE_PLANS,
  savedLocations: ["Seminyak"],
  radarView: "map",
  privacy: { analytics: false, location: false },
  a11y: { reduceMotion: false, largeText: false },
  country: DEMO_PROFILE.country,
  currency: DEMO_PROFILE.currency,
};

let state: DemoState | null = null;
const listeners = new Set<() => void>();

function read(): DemoState {
  if (state) return state;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    state = raw ? { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<DemoState>) } : DEFAULT_STATE;
    // migrations from earlier demo builds
    if (state.currency === "DMO") state = { ...state, currency: "IDR", country: DEFAULT_STATE.country };
    if (state.savedLocations.some((l) => !["Seminyak", "Canggu", "Ubud", "Uluwatu", "Nusa Dua", "Sanur", "Jimbaran", "Kuta"].includes(l))) state = { ...state, savedLocations: DEFAULT_STATE.savedLocations };
  } catch {
    state = DEFAULT_STATE;
  }
  return state;
}

function write(next: DemoState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage may be unavailable; state still lives in memory */
  }
  listeners.forEach((l) => l());
}

export function getDemoState(): DemoState {
  return read();
}

export function updateDemo(patch: Partial<DemoState> | ((s: DemoState) => Partial<DemoState>)) {
  const cur = read();
  const p = typeof patch === "function" ? patch(cur) : patch;
  write({ ...cur, ...p });
}

export function resetDemo() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  state = null;
  write(DEFAULT_STATE);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** React binding. Server snapshot is the default state so hydration matches. */
export function useDemo() {
  const s = useSyncExternalStore(subscribe, read, () => DEFAULT_STATE);
  const update = useCallback(updateDemo, []);
  return [s, update] as const;
}

/* Convenience helpers */
export function toggleSaved(perkId: string): boolean {
  const cur = read();
  const has = cur.savedPerkIds.includes(perkId);
  write({ ...cur, savedPerkIds: has ? cur.savedPerkIds.filter((id) => id !== perkId) : [...cur.savedPerkIds, perkId] });
  return !has;
}

export function upsertPlan(plan: GroupPlan) {
  const cur = read();
  const exists = cur.plans.some((p) => p.id === plan.id);
  write({ ...cur, plans: exists ? cur.plans.map((p) => (p.id === plan.id ? plan : p)) : [plan, ...cur.plans] });
}

export function deletePlan(id: string) {
  const cur = read();
  write({ ...cur, plans: cur.plans.filter((p) => p.id !== id) });
}

export function addCheckIn(venueId: string, guests: number) {
  const cur = read();
  const c = { id: newId("ci"), venueId, at: new Date().toISOString(), guests, simulated: true as const };
  write({ ...cur, access: { ...cur.access, checkIns: [c, ...cur.access.checkIns] } });
  return c;
}

export function setAccessPlan(plan: DemoState["access"]["plan"], billing?: DemoState["access"]["billing"]) {
  const cur = read();
  write({ ...cur, access: { ...cur.access, plan, billing: billing ?? cur.access.billing } });
}

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}
