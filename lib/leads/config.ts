// Shared (client-safe) definitions for the internal Bali leads dashboard.

export const LEAD_CATEGORIES = {
  pool_beach: "Pool & Beach",
  bars_clubs: "Bars & Clubs",
  dining: "Dining",
  family: "Family",
  spa_fitness: "Spa & Fitness",
} as const;
export type LeadCategoryKey = keyof typeof LEAD_CATEGORIES;
export type LeadCategoryLabel = (typeof LEAD_CATEGORIES)[LeadCategoryKey];
export const CATEGORY_KEYS = Object.keys(LEAD_CATEGORIES) as LeadCategoryKey[];

export const BALI_AREAS = [
  "Seminyak", "Canggu", "Pererenan", "Berawa", "Uluwatu", "Ubud", "Kuta", "Legian",
  "Nusa Dua", "Jimbaran", "Sanur", "Nusa Penida",
] as const;

// Search anchors for fast mode (approximate area centres).
export const AREA_GEO: Record<(typeof BALI_AREAS)[number], [number, number]> = {
  Seminyak: [-8.6913, 115.1683], Canggu: [-8.6478, 115.1385], Pererenan: [-8.644, 115.123], Berawa: [-8.662, 115.15],
  Uluwatu: [-8.815, 115.11], Ubud: [-8.5069, 115.2625], Kuta: [-8.718, 115.169], Legian: [-8.704, 115.167],
  "Nusa Dua": [-8.8, 115.231], Jimbaran: [-8.77, 115.169], Sanur: [-8.688, 115.262], "Nusa Penida": [-8.7275, 115.5444],
};
export const BALI_CENTRE: [number, number] = [-8.55, 115.2];

export type ScrapeMode = "fast" | "deep";

// Google Maps searches per category; {a} is replaced by the area.
export const CATEGORY_QUERIES: Record<LeadCategoryKey, string[]> = {
  pool_beach: ["beach club in {a} Bali", "resort pool day pass in {a} Bali", "infinity pool in {a} Bali"],
  bars_clubs: ["bar in {a} Bali", "nightclub in {a} Bali", "rooftop bar in {a} Bali", "cocktail bar in {a} Bali"],
  dining: ["best restaurant in {a} Bali", "fine dining in {a} Bali", "brunch cafe in {a} Bali"],
  family: ["family friendly restaurant in {a} Bali", "kids club in {a} Bali", "family attraction in {a} Bali", "kids activities in {a} Bali", "playground in {a} Bali"],
  spa_fitness: ["spa in {a} Bali", "gym in {a} Bali", "yoga studio in {a} Bali"],
};
// Island-wide searches added whenever Family is selected. Keep them list-style: a query naming one
// venue ("Bali zoo") opens that place page directly and fast mode then returns nothing.
export const FAMILY_ISLAND_QUERIES = ["water park", "zoo", "safari park", "animal park", "amusement park", "theme park", "aquarium", "bird park", "family resort kids club", "kids activities"];

export const LEAD_STATUSES = ["new", "contacted", "replied", "negotiating", "signed", "declined"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type Lead = {
  overall_rank: number;
  name: string;
  pickle_category: LeadCategoryLabel;
  category_rank: number;
  popularity_score: number;
  popularity_tier: "A" | "B" | "C";
  popularity_index_all: number;
  rating: number;
  reviews: number;
  area: string;
  emails: string;
  email_source: string;
  phone: string | null;
  website: string | null;
  price_tier: "value" | "mid" | "premium";
  price_tier_basis: string;
  google_price_band: string;
  est_ticket_idr: number;
  proposed_offer: string;
  est_member_saving_per_visit_idr: number;
  est_member_saving_per_month_idr: number;
  pickle_value_score: number;
  signing_priority: string;
  also_fits: string;
  google_category: string;
  google_categories: string;
  address: string;
  lat: number;
  lng: number;
  google_maps: string;
  place_id: string;
};

export type CrmEntry = { status: LeadStatus; notes: string; updatedAt: string };

export type RunStage = "scraping" | "emails" | "scoring" | "done" | "failed" | "stopped";
export type RunInfo = {
  id: string;
  dir: string; // relative to data/scrape
  createdAt: string;
  finishedAt?: string;
  areas: string[];
  categories: LeadCategoryKey[];
  depth: number;
  queryCount: number;
  mode?: ScrapeMode; // missing = deep (the first run predates fast mode)
  scrapePid?: number;
  restarts?: number; // driver restarts after a crash or dev-server reload; capped
  container: string;
  stage: RunStage;
  error?: string;
  emailsPid?: number;
  // live counters, filled in by the status endpoint
  searchesDone?: number;
  placesScraped?: number;
  emailsChecked?: number;
  emailsTotal?: number;
  logTail?: string[];
};

export type LeadsPayload = {
  leads: (Lead & { crm: CrmEntry })[];
  generatedAt: string | null;
  scrapedUnique: number;
  dropped: Record<string, number>;
};

export const ACTIVE_STAGES: RunStage[] = ["scraping", "emails", "scoring"];

export function buildQueries(areas: string[], categories: LeadCategoryKey[], custom: { query: string; category: LeadCategoryKey }[] = []) {
  const lines: string[] = [];
  for (const c of categories) for (const a of areas) for (const q of CATEGORY_QUERIES[c]) lines.push(`${q.replace("{a}", a)} #!#${c}`);
  if (categories.includes("family")) for (const q of FAMILY_ISLAND_QUERIES) lines.push(`${q} #!#family`);
  for (const c of custom) lines.push(`${c.query} #!#${c.category}`);
  return [...new Set(lines)];
}

/** Fast mode: one job per (area, category), queries without the area name, centred on the area. */
export function buildFastPlan(areas: string[], categories: LeadCategoryKey[], custom: { query: string; category: LeadCategoryKey }[] = []) {
  const plan: { area: string; lat: number; lng: number; zoom: number; radius: number; category: LeadCategoryKey; queries: string[] }[] = [];
  for (const a of areas) {
    const [lat, lng] = AREA_GEO[a as keyof typeof AREA_GEO];
    for (const c of categories) plan.push({ area: a, lat, lng, zoom: 14, radius: 5000, category: c, queries: CATEGORY_QUERIES[c].map((q) => q.replace(" in {a} Bali", "")) });
  }
  const island = (category: LeadCategoryKey, queries: string[]) => queries.length && plan.push({ area: "", lat: BALI_CENTRE[0], lng: BALI_CENTRE[1], zoom: 11, radius: 60000, category, queries });
  if (categories.includes("family")) island("family", FAMILY_ISLAND_QUERIES);
  for (const c of new Set(custom.map((x) => x.category))) island(c, custom.filter((x) => x.category === c).map((x) => x.query));
  return plan;
}

export const idr =(n: number) => `Rp ${Math.round(n).toLocaleString("en-US")}`;
export const idrShort = (n: number) => (n >= 1_000_000 ? `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M` : `Rp ${Math.round(n / 1000)}K`);
