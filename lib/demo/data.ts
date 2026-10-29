import type {
  ActivityEvent,
  GroupPlan,
  MembershipTier,
  Merchant,
  MerchantCampaign,
  Perk,
} from "@/lib/types";

/**
 * Demo dataset, Bali edition. Every merchant, resort, spa, club, perk,
 * transaction and metric here is fictional and exists only so the product can
 * be experienced before a live partner network exists. Venues are invented;
 * only the areas (Seminyak, Canggu, Ubud, Uluwatu, Nusa Dua, Sanur, Jimbaran,
 * Kuta) and their coordinates are real, so Radar can show a real map.
 */

const COUNTRY = "Indonesia";
const CITY = "Bali";

function loc(merchantId: string, n: number, address: string, neighbourhood: string, lat: number, lng: number) {
  return { id: `${merchantId}-l${n}`, merchantId, address, neighbourhood, city: CITY, country: COUNTRY, lat, lng };
}

export const MERCHANTS: Merchant[] = [
  { id: "m-kopi", name: "Kopi Kelapa Café", mark: "KK", category: "dining", status: "demo",
    description: "Single-origin Kintamani coffee, coconut cold brew and banana-leaf breakfasts under a frangipani tree.",
    locations: [loc("m-kopi", 1, "Jl. Kayu Aya 88", "Seminyak", -8.6895, 115.1660), loc("m-kopi", 2, "Jl. Pantai Batu Bolong 12", "Canggu", -8.6520, 115.1340)] },
  { id: "m-tamarind", name: "Tamarind Beach Club", mark: "TB", category: "pool-beach", status: "demo",
    description: "Daybeds on the sand, a sunset DJ every evening and a long table for the big nights.",
    locations: [loc("m-tamarind", 1, "Jl. Petitenget 51", "Seminyak", -8.6950, 115.1600)] },
  { id: "m-saltwater", name: "Saltwater Spa", mark: "SS", category: "spa-fitness", status: "demo",
    description: "Sea-salt scrubs, Balinese massage and a cold plunge that looks out over the rice fields.",
    locations: [loc("m-saltwater", 1, "Jl. Drupadi 20", "Seminyak", -8.6870, 115.1700)] },
  { id: "m-echo", name: "Echo Surf House", mark: "ES", category: "pool-beach", status: "demo",
    description: "Beginner surf lessons at Batu Bolong, board hire and a hammock to recover in.",
    locations: [loc("m-echo", 1, "Jl. Pantai Batu Bolong 3", "Canggu", -8.6560, 115.1300)] },
  { id: "m-lawn", name: "Sunset Lawn Club", mark: "SL", category: "bars-clubs", status: "demo",
    description: "Beanbags on the grass, live bands on Fridays and a cinema night under the stars.",
    locations: [loc("m-lawn", 1, "Jl. Pantai Berawa 99", "Canggu", -8.6600, 115.1290)] },
  { id: "m-ayung", name: "Ayung Ridge Resort", mark: "AR", category: "pool-beach", status: "demo",
    description: "Thirty villas above the Ayung river gorge, with an infinity pool that disappears into the jungle.",
    locations: [loc("m-ayung", 1, "Jl. Raya Kedewatan", "Ubud", -8.4980, 115.2500)] },
  { id: "m-tegal", name: "Tegal Spa & Yoga Shala", mark: "TS", category: "spa-fitness", status: "demo",
    description: "Morning yoga over the paddies, flower baths and a four-hand massage that resets everything.",
    locations: [loc("m-tegal", 1, "Jl. Tegallalang 14", "Ubud", -8.5090, 115.2640)] },
  { id: "m-terrace", name: "Rice Terrace Kitchen", mark: "RT", category: "dining", status: "demo",
    description: "Farm-to-table Balinese tasting menus with the terraces right outside the window.",
    locations: [loc("m-terrace", 1, "Jl. Monkey Forest 60", "Ubud", -8.5060, 115.2600)] },
  { id: "m-cliff", name: "Cliffside Beach Club", mark: "CB", category: "bars-clubs", status: "demo",
    description: "Seventy metres above the surf at Uluwatu: sunset sessions, a cliff-edge pool and full-moon parties.",
    locations: [loc("m-cliff", 1, "Jl. Labuansait", "Uluwatu", -8.8290, 115.0860)] },
  { id: "m-lagoon", name: "Lagoon Palm Resort", mark: "LP", category: "pool-beach", status: "demo",
    description: "A calm beachfront resort on the Nusa Dua lagoon with a kids' club and a quiet adults' pool.",
    locations: [loc("m-lagoon", 1, "Kawasan Pariwisata Lot 8", "Nusa Dua", -8.8000, 115.2320)] },
  { id: "m-pavilion", name: "Nusa Spa Pavilion", mark: "NP", category: "spa-fitness", status: "demo",
    description: "Open-air treatment pavilions by the water, with a hammam and a tea lounge.",
    locations: [loc("m-pavilion", 1, "Jl. Nusa Dua Selatan", "Nusa Dua", -8.7960, 115.2300)] },
  { id: "m-sanurcafe", name: "Sanur Morning Café", mark: "SM", category: "dining", status: "demo",
    description: "Sunrise smoothie bowls and long-black coffees on the Sanur beach path.",
    locations: [loc("m-sanurcafe", 1, "Jl. Pantai Sindhu 5", "Sanur", -8.6860, 115.2630)] },
  { id: "m-bikeboard", name: "Sanur Bike & Board", mark: "SB", category: "family", status: "demo",
    description: "Bike hire, paddleboards and a repair bench for the beach path.",
    locations: [loc("m-bikeboard", 1, "Jl. Danau Poso 22", "Sanur", -8.6920, 115.2610)] },
  { id: "m-fire", name: "Jimbaran Fire Grill", mark: "JF", category: "dining", status: "demo",
    description: "Grilled seafood on the sand at Jimbaran Bay, feet in the water, boats coming in.",
    locations: [loc("m-fire", 1, "Jl. Pantai Kedonganan", "Jimbaran", -8.7900, 115.1610)] },
];

export const MERCHANT_BY_ID = Object.fromEntries(MERCHANTS.map((m) => [m.id, m])) as Record<string, Merchant>;

const T = "Pickle Perks are illustrative demo offers. Availability, eligibility and terms are confirmed with each partner before any live launch. Not transferable. Not redeemable for cash.";

export const PERKS: Perk[] = [
  { id: "p-kopi-pastry", merchantId: "m-kopi", category: "dining", title: "Free coconut pastry with any coffee", tier: "green", status: "available", featured: true,
    description: "Pay for your coffee as usual and pick any pastry from the counter. Mornings before 11am.",
    eligibility: "All Pickle members. One per visit.", terms: T, startAt: "2026-09-01", expiresAt: "2026-12-31" },
  { id: "p-kopi-coldbrew", merchantId: "m-kopi", category: "dining", title: "Second coconut cold brew free after 3pm", tier: "green", status: "conceptual",
    description: "Order a coconut cold brew after 3pm and the second one, for you or a friend, is free.",
    eligibility: "All Pickle members.", terms: T, startAt: "2026-11-01", expiresAt: null },
  { id: "p-tamarind-daybed", merchantId: "m-tamarind", category: "pool-beach", title: "Daybed upgrade at sunset", tier: "black", status: "available", featured: true,
    description: "Book any daybed and move to the front row for sunset when one is free.",
    eligibility: "Pickle Black and above. Subject to availability.", terms: T, startAt: "2026-09-15", expiresAt: "2027-02-28" },
  { id: "p-tamarind-queue", merchantId: "m-tamarind", category: "bars-clubs", title: "Priority entry on DJ nights", tier: "green", status: "available",
    description: "Skip the main line at the door with the member lane on Friday and Saturday nights.",
    eligibility: "All Pickle members. Ticket or booking required.", terms: T, startAt: "2026-09-01", expiresAt: null },
  { id: "p-saltwater-plunge", merchantId: "m-saltwater", category: "spa-fitness", title: "Extra 30 minutes of pool and plunge", tier: "green", status: "available", featured: true,
    description: "Every treatment comes with an extra half hour in the rice-field plunge pool.",
    eligibility: "All Pickle members.", terms: T, startAt: "2026-10-01", expiresAt: "2027-02-28" },
  { id: "p-saltwater-scrub", merchantId: "m-saltwater", category: "spa-fitness", title: "Sea-salt scrub added to any massage", tier: "black", status: "available",
    description: "Book a 90-minute Balinese massage and the sea-salt scrub is included.",
    eligibility: "Pickle Black and above.", terms: T, startAt: "2026-10-01", expiresAt: "2026-12-31" },
  { id: "p-echo-lesson", merchantId: "m-echo", category: "pool-beach", title: "First surf lesson included", tier: "green", status: "available", featured: true,
    description: "Your first 90-minute lesson at Batu Bolong, board and rash vest included.",
    eligibility: "All Pickle members. First visit only.", terms: T, startAt: "2026-09-01", expiresAt: null },
  { id: "p-echo-board", merchantId: "m-echo", category: "pool-beach", title: "Free board hire for a friend", tier: "black", status: "available",
    description: "Hire a board and bring a friend's for free, any day of the week.",
    eligibility: "Pickle Black and above.", terms: T, startAt: "2026-10-01", expiresAt: "2027-01-31" },
  { id: "p-lawn-cinema", merchantId: "m-lawn", category: "family", title: "Popcorn and a beanbag at cinema night", tier: "green", status: "available",
    description: "Outdoor cinema every Wednesday: members get a reserved beanbag and popcorn.",
    eligibility: "All Pickle members.", terms: T, startAt: "2026-09-01", expiresAt: null },
  { id: "p-lawn-guest", merchantId: "m-lawn", category: "bars-clubs", title: "Guest-list spot for one friend", tier: "reserve", status: "conceptual",
    description: "Add one friend to the guest list for live-band Fridays.",
    eligibility: "Pickle Reserve. Selected nights only.", terms: T, startAt: "2027-01-01", expiresAt: null },
  { id: "p-ayung-late", merchantId: "m-ayung", category: "pool-beach", title: "Late checkout until 2pm", tier: "green", status: "available", featured: true,
    description: "Sleep in above the gorge. Check out at 2pm, subject to availability.",
    eligibility: "All Pickle members. Subject to availability.", terms: T, startAt: "2026-09-01", expiresAt: null },
  { id: "p-ayung-dinner", merchantId: "m-ayung", category: "dining", title: "Sunset dinner for two on the ridge", tier: "black", status: "available",
    description: "Two nights or more includes a three-course dinner on the ridge terrace.",
    eligibility: "Pickle Black and above.", terms: T, startAt: "2026-10-01", expiresAt: "2027-03-31" },
  { id: "p-ayung-upgrade", merchantId: "m-ayung", category: "pool-beach", title: "Villa upgrade when available", tier: "reserve", status: "conceptual",
    description: "A complimentary upgrade to the next villa category whenever one is free at check-in.",
    eligibility: "Pickle Reserve.", terms: T, startAt: "2027-01-01", expiresAt: null },
  { id: "p-tegal-yoga", merchantId: "m-tegal", category: "spa-fitness", title: "Free sunrise yoga class", tier: "green", status: "available",
    description: "One sunrise class over the paddies, mats and tea included. Booking required.",
    eligibility: "All Pickle members. Booking required.", terms: T, startAt: "2026-09-01", expiresAt: "2026-12-20" },
  { id: "p-tegal-flower", merchantId: "m-tegal", category: "spa-fitness", title: "Flower bath added to any spa package", tier: "black", status: "available",
    description: "Book any two-hour package and finish with a frangipani flower bath.",
    eligibility: "Pickle Black and above.", terms: T, startAt: "2026-10-01", expiresAt: "2027-01-31" },
  { id: "p-terrace-course", merchantId: "m-terrace", category: "dining", title: "Chef's extra course on the tasting menu", tier: "black", status: "available",
    description: "Book the tasting menu and the kitchen sends out one extra course chosen that day.",
    eligibility: "Pickle Black and above. Table bookings only.", terms: T, startAt: "2026-09-15", expiresAt: "2027-02-28" },
  { id: "p-terrace-corkage", merchantId: "m-terrace", category: "dining", title: "Corkage waived on Sundays", tier: "green", status: "available",
    description: "Bring a bottle on Sunday evenings and skip the corkage fee.",
    eligibility: "All Pickle members.", terms: T, startAt: "2026-10-01", expiresAt: "2027-01-31" },
  { id: "p-cliff-sunset", merchantId: "m-cliff", category: "bars-clubs", title: "Sunset cocktail for two", tier: "black", status: "available", featured: true,
    description: "Arrive before 5pm and the first sunset cocktail for two is on the club.",
    eligibility: "Pickle Black and above. Minimum spend applies.", terms: T, startAt: "2026-10-01", expiresAt: "2027-03-31" },
  { id: "p-cliff-moon", merchantId: "m-cliff", category: "bars-clubs", title: "Full-moon party priority entry", tier: "green", status: "available",
    description: "Member lane at the door for full-moon nights.",
    eligibility: "All Pickle members. Ticket required.", terms: T, startAt: "2026-06-01", expiresAt: "2026-09-15" },
  { id: "p-lagoon-late", merchantId: "m-lagoon", category: "pool-beach", title: "Late checkout and lagoon breakfast", tier: "green", status: "available",
    description: "Check out at 2pm and take breakfast on the lagoon deck, any stay.",
    eligibility: "All Pickle members. Subject to availability.", terms: T, startAt: "2026-09-01", expiresAt: null },
  { id: "p-pavilion-hammam", merchantId: "m-pavilion", category: "spa-fitness", title: "Hammam session with any treatment", tier: "green", status: "available",
    description: "A 30-minute hammam before any treatment, every visit.",
    eligibility: "All Pickle members.", terms: T, startAt: "2026-10-01", expiresAt: "2027-02-28" },
  { id: "p-sanur-bowl", merchantId: "m-sanurcafe", category: "dining", title: "Smoothie bowl topping on us", tier: "green", status: "available",
    description: "Any smoothie bowl gets the full topping bar at no extra cost before 9am.",
    eligibility: "All Pickle members.", terms: T, startAt: "2026-09-01", expiresAt: null },
  { id: "p-bike-check", merchantId: "m-bikeboard", category: "family", title: "Free safety check with any bike hire", tier: "green", status: "available",
    description: "Brakes, lights and tyres checked before you set off on the beach path.",
    eligibility: "All Pickle members.", terms: T, startAt: "2026-09-01", expiresAt: null },
  { id: "p-fire-platter", merchantId: "m-fire", category: "dining", title: "Grilled prawns with any seafood platter", tier: "black", status: "available",
    description: "Order a platter for two and a plate of grilled prawns arrives first.",
    eligibility: "Pickle Black and above.", terms: T, startAt: "2026-10-01", expiresAt: "2026-11-30" },
];

export const PERK_BY_ID = Object.fromEntries(PERKS.map((p) => [p.id, p])) as Record<string, Perk>;

export const TIERS: MembershipTier[] = [
  { id: "green", name: "Pickle Green", tagline: "The everyday membership.", status: "proposed",
    description: "Proposed entry tier. Access to everyday perks at cafés, markets, surf houses and local experiences.",
    benefits: ["Everyday Pickle Perks", "Pickle Radar and saved perks", "Pickle Together plans", "Green card design"] },
  { id: "black", name: "Pickle Black", tagline: "More of the good stuff.", status: "proposed",
    description: "Proposed mid tier. Everything in Green plus resort, spa and beach-club extras and members' evenings.",
    benefits: ["Everything in Pickle Green", "Resort, spa and beach-club extras", "Members' previews and lounges", "Black card design"] },
  { id: "reserve", name: "Pickle Reserve", tagline: "The quiet upgrades.", status: "proposed",
    description: "Proposed top tier. Priority access, villa upgrades and guest-list perks, by invitation.",
    benefits: ["Everything in Pickle Black", "Priority access and upgrades", "Guest-list perks", "Reserve card design", "Dedicated member support"] },
];

export const TIER_RANK: Record<string, number> = { green: 0, black: 1, reserve: 2 };

export const ACTIVITY: ActivityEvent[] = [
  { id: "a1", merchantLabel: "Kopi Kelapa Café", date: "2026-10-12T08:41:00Z", amount: 65000, currency: "IDR", category: "dining", status: "demo-settled", relatedPerkId: "p-kopi-pastry" },
  { id: "a2", merchantLabel: "Saltwater Spa", date: "2026-10-11T17:12:00Z", amount: 842000, currency: "IDR", category: "spa-fitness", status: "demo-settled", relatedPerkId: "p-saltwater-plunge" },
  { id: "a3", merchantLabel: "Sunset Lawn Club", date: "2026-10-10T19:30:00Z", amount: 150000, currency: "IDR", category: "family", status: "demo-settled", relatedPerkId: "p-lawn-cinema" },
  { id: "a4", merchantLabel: "Tamarind Beach Club", date: "2026-10-09T13:05:00Z", amount: 1250000, currency: "IDR", category: "bars-clubs", status: "demo-settled" },
  { id: "a5", merchantLabel: "Rice Terrace Kitchen", date: "2026-10-08T20:48:00Z", amount: 1980000, currency: "IDR", category: "dining", status: "demo-pending", relatedPerkId: "p-terrace-corkage" },
  { id: "a6", merchantLabel: "Echo Surf House", date: "2026-10-06T09:20:00Z", amount: 0, currency: "IDR", category: "pool-beach", status: "demo-settled", relatedPerkId: "p-echo-lesson" },
  { id: "a7", merchantLabel: "Sanur Bike & Board", date: "2026-10-04T10:15:00Z", amount: 120000, currency: "IDR", category: "family", status: "demo-settled", relatedPerkId: "p-bike-check" },
  { id: "a8", merchantLabel: "Ayung Ridge Resort", date: "2026-10-02T11:02:00Z", amount: 4600000, currency: "IDR", category: "pool-beach", status: "demo-declined" },
  { id: "a9", merchantLabel: "Tegal Spa & Yoga Shala", date: "2026-09-28T06:30:00Z", amount: 0, currency: "IDR", category: "spa-fitness", status: "demo-settled", relatedPerkId: "p-tegal-yoga" },
];

export const SAMPLE_PLANS: GroupPlan[] = [
  { id: "plan-sat", title: "Saturday in Seminyak", plannedFor: "2026-10-18", perkIds: ["p-kopi-pastry", "p-saltwater-plunge", "p-tamarind-daybed"], createdAt: "2026-10-05T09:00:00Z" },
  { id: "plan-ubud", title: "Ubud reset weekend", plannedFor: "2026-11-02", perkIds: ["p-ayung-late", "p-tegal-yoga", "p-terrace-course"], createdAt: "2026-10-09T18:30:00Z" },
];

export const CAMPAIGNS: MerchantCampaign[] = [
  { id: "c1", merchantId: "m-kopi", perkId: "p-kopi-pastry", title: "Morning pastry", status: "live-demo", startAt: "2026-09-01", endAt: "2026-12-31", redemptionLimit: 500, views: 1842, saves: 312, redemptions: 148 },
  { id: "c2", merchantId: "m-kopi", perkId: "p-kopi-coldbrew", title: "Afternoon cold brew", status: "scheduled", startAt: "2026-11-01", endAt: null, redemptionLimit: null, views: 0, saves: 0, redemptions: 0 },
  { id: "c3", merchantId: "m-kopi", perkId: "p-kopi-pastry", title: "Dry-season iced latte (ended)", status: "ended", startAt: "2026-06-01", endAt: "2026-08-31", redemptionLimit: 300, views: 2210, saves: 405, redemptions: 300 },
];

/** Default merchant for the portal demo. */
export const DEMO_MERCHANT_ID = "m-kopi";

export const DEMO_PROFILE = {
  firstName: "Mr.",
  lastName: "Member",
  displayName: "Mr. Pickle",
  cardName: "MR. PICKLE",
  email: "alex@example.com",
  country: COUNTRY,
  currency: "IDR",
  city: CITY,
  tier: "green" as const,
  memberSince: "2026-09-01",
};

/** Masked demo references, one per card design. None is a valid card number. */
export const DEMO_CARD_REFERENCE: Record<string, string> = {
  green: "•••• •••• •••• 0427",
  black: "•••• •••• •••• 1183",
  reserve: "•••• •••• •••• 9006",
};

/** Sample money formatting for the demo currency. */
export function formatMoney(amount: number, currency = "IDR"): string {
  if (currency === "IDR") return `Rp ${Math.round(amount).toLocaleString("en-US")}`;
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

/** Areas used by Radar and onboarding, in the order they appear on the island map. */
export const AREAS = Array.from(new Set(MERCHANTS.flatMap((m) => m.locations.map((l) => l.neighbourhood))));
