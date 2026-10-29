"use client";
import { useSyncExternalStore } from "react";
import type { MerchantCampaign, Perk } from "@/lib/types";
import { CAMPAIGNS, DEMO_MERCHANT_ID, MERCHANT_BY_ID, PERKS } from "./data";
import type { OfferInput } from "@/lib/validation";

/**
 * Merchant portal demo state: the partner's offers and campaigns, kept in
 * localStorage. Nothing here is published to members or to any live network.
 */
export interface MerchantOffer extends Perk {
  locationIds: string[];
  redemptionLimit: number | null;
  campaignStatus: MerchantCampaign["status"];
  metrics: { views: number; saves: number; redemptions: number };
  updatedAt: string;
}
interface MerchantState { version: 1; merchantId: string; offers: MerchantOffer[] }

const KEY = "pickle.merchant.v1";

function seed(): MerchantState {
  const offers: MerchantOffer[] = PERKS.filter((p) => p.merchantId === DEMO_MERCHANT_ID).map((p) => {
    const c = CAMPAIGNS.find((c) => c.perkId === p.id && c.status !== "ended");
    return {
      ...p, locationIds: MERCHANT_BY_ID[DEMO_MERCHANT_ID].locations.map((l) => l.id), redemptionLimit: c?.redemptionLimit ?? null,
      campaignStatus: c?.status ?? "draft", metrics: { views: c?.views ?? 0, saves: c?.saves ?? 0, redemptions: c?.redemptions ?? 0 }, updatedAt: "2026-10-01T09:00:00Z",
    };
  });
  const ended = CAMPAIGNS.find((c) => c.status === "ended")!;
  offers.push({
    id: "offer-ended-iced", merchantId: DEMO_MERCHANT_ID, title: "Dry-season iced latte refill", category: "dining", tier: "green", status: "expired",
    description: "A dry-season campaign: any iced latte came with one free refill on days over 32°C.", terms: "Demo campaign, ended.", eligibility: "All Pickle members.",
    startAt: ended.startAt, expiresAt: ended.endAt, locationIds: [MERCHANT_BY_ID[DEMO_MERCHANT_ID].locations[0].id], redemptionLimit: ended.redemptionLimit, campaignStatus: "ended",
    metrics: { views: ended.views, saves: ended.saves, redemptions: ended.redemptions }, updatedAt: "2026-09-01T09:00:00Z",
  });
  return { version: 1, merchantId: DEMO_MERCHANT_ID, offers };
}

let state: MerchantState | null = null;
const listeners = new Set<() => void>();
const SERVER = seed();

function read(): MerchantState {
  if (state) return state;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    state = raw ? (JSON.parse(raw) as MerchantState) : seed();
  } catch { state = seed(); }
  return state;
}
function write(next: MerchantState) {
  state = next;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); }

export function useMerchant() {
  return useSyncExternalStore(subscribe, read, () => SERVER);
}

export function saveOffer(id: string | null, input: OfferInput): MerchantOffer {
  const cur = read();
  const now = new Date().toISOString();
  const existing = id ? cur.offers.find((o) => o.id === id) : undefined;
  const offer: MerchantOffer = {
    id: existing?.id ?? `offer-${Math.random().toString(36).slice(2, 8)}`,
    merchantId: cur.merchantId,
    title: input.title, category: input.category, description: input.description, terms: input.terms,
    eligibility: input.tier === "green" ? "All Pickle members." : input.tier === "black" ? "Pickle Black and above." : "Pickle Reserve.",
    startAt: input.startAt, expiresAt: input.expiresAt, tier: input.tier,
    status: input.status === "live-demo" ? "available" : "conceptual",
    locationIds: input.locationIds, redemptionLimit: input.redemptionLimit, campaignStatus: input.status,
    metrics: existing?.metrics ?? { views: 0, saves: 0, redemptions: 0 }, updatedAt: now,
  };
  write({ ...cur, offers: existing ? cur.offers.map((o) => (o.id === offer.id ? offer : o)) : [offer, ...cur.offers] });
  return offer;
}

export function deleteOffer(id: string) {
  const cur = read();
  write({ ...cur, offers: cur.offers.filter((o) => o.id !== id) });
}

export function resetMerchant() {
  try { window.localStorage.removeItem(KEY); } catch {}
  state = null;
  write(seed());
}
