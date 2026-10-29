/** Shared data model, mirrored by supabase/migrations/0001_init.sql. */

export type PerkCategory = "pool-beach" | "bars-clubs" | "dining" | "family" | "spa-fitness";
export type PerkStatus = "conceptual" | "available" | "expired";
export type CardVariant = "green" | "black" | "reserve";
export type MembershipTierId = "green" | "black" | "reserve";

export interface Merchant {
  id: string;
  name: string;
  description: string;
  category: PerkCategory;
  status: "demo" | "approved" | "pending";
  /** short mark used in the UI, since there are no real logos */
  mark: string;
  locations: MerchantLocation[];
}

export interface MerchantLocation {
  id: string;
  merchantId: string;
  address: string;
  neighbourhood: string;
  city: string;
  country: string;
  /** real coordinates for the map (demo partners are fictional, placed in real areas) */
  lat: number;
  lng: number;
}

export interface Perk {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  category: PerkCategory;
  terms: string;
  eligibility: string;
  startAt: string;  // ISO date
  expiresAt: string | null;
  status: PerkStatus;
  tier: MembershipTierId; // minimum tier
  featured?: boolean;
}

export interface MembershipTier {
  id: MembershipTierId;
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  status: "proposed";
}

export interface ActivityEvent {
  id: string;
  merchantLabel: string;
  date: string; // ISO
  amount: number; // demo currency units
  currency: string;
  category: PerkCategory;
  status: "demo-settled" | "demo-pending" | "demo-declined";
  relatedPerkId?: string;
}

export interface GroupPlan {
  id: string;
  title: string;
  plannedFor: string; // ISO date
  perkIds: string[];
  createdAt: string;
}

export interface MerchantCampaign {
  id: string;
  merchantId: string;
  perkId: string;
  title: string;
  status: "draft" | "scheduled" | "live-demo" | "ended";
  startAt: string;
  endAt: string | null;
  redemptionLimit: number | null;
  /** illustrative metrics, generated for the demo */
  views: number;
  saves: number;
  redemptions: number;
}

export interface WaitlistEntry {
  firstName: string;
  email: string;
  country: string;
  interest: PerkCategory | "everything";
  cardStyle?: CardVariant | "";
  consent: true;
}

export interface PartnerApplication {
  businessName: string;
  contactName: string;
  email: string;
  city: string;
  country: string;
  category: PerkCategory;
  message?: string;
}

/** Pickle Access: free entry to partner venues on a paid membership (the Privilee-style model). */
export type AccessCategory = PerkCategory;
export type AccessKind = "free-entry" | "discount" | "class-credit" | "perk";

export interface AccessVenue {
  id: string;
  name: string;
  mark: string;
  category: AccessCategory;
  kind: AccessKind;
  /** e.g. 20 for a 20% dining discount */
  discountPercent?: number;
  /** short label for kind "perk", e.g. "Guest list + 1 welcome drink" */
  perkLabel?: string;
  description: string;
  includes: string[];
  hours: string;
  bookingRequired: boolean;
  kidsWelcome: boolean;
  /** which plans include it; "all" or a list */
  plans: "all" | AccessPlanId[];
  area: string;
  address: string;
  lat: number;
  lng: number;
  /** weekday/weekend availability note shown to members */
  availability: string;
}

export type AccessPlanId = "solo" | "duo" | "family";
export interface AccessPlan {
  id: AccessPlanId;
  name: string;
  covers: string;
  monthly: number;   // IDR, proposed
  annual: number;    // IDR, proposed (per year)
  guestPassesPerMonth: number;
  highlights: string[];
  status: "proposed";
}

export interface AccessCheckIn {
  id: string;
  venueId: string;
  at: string;       // ISO
  guests: number;
  simulated: true;
}

export const ACCESS_CATEGORY_LABELS: Record<AccessCategory, string> = {
  "pool-beach": "Pool & Beach",
  "bars-clubs": "Bars & Clubs",
  dining: "Dining",
  family: "Family",
  "spa-fitness": "Spa & Fitness",
};
export const ACCESS_CATEGORY_BLURB: Record<AccessCategory, string> = {
  "pool-beach": "Free entry to resort pools, beach clubs and hot springs. Sunbed and towel included.",
  "bars-clubs": "Guest list, no cover charge and welcome drinks at bars, beach clubs and club nights.",
  dining: "15 to 25% off the food bill at partner restaurants and cafés, plus member extras.",
  family: "Kids' clubs, parks, play and family cinema, free or discounted for member families.",
  "spa-fitness": "Gyms, yoga shalas and spa hydro circuits included; treatments and classes at member rates.",
};

export const CATEGORY_LABELS: Record<PerkCategory, string> = {
  "pool-beach": "Pool & Beach",
  "bars-clubs": "Bars & Clubs",
  dining: "Dining",
  family: "Family",
  "spa-fitness": "Spa & Fitness",
};
