/**
 * Runtime configuration. Everything here is derived from environment
 * variables with safe defaults, so the product runs in demo mode with no
 * configuration at all. See .env.example for the full list.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:5500";

/** Public Supabase settings (safe for the browser). The service role key is server-only. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Launch facts that must stay configurable rather than invented. */
export const LAUNCH = {
  regions: process.env.NEXT_PUBLIC_LAUNCH_REGIONS?.trim() || "", // e.g. "United Kingdom, UAE"
  timing: process.env.NEXT_PUBLIC_LAUNCH_TIMING?.trim() || "",   // e.g. "2027"
  issuer: process.env.NEXT_PUBLIC_ISSUER_NAME?.trim() || "",     // the licensed issuing partner, once confirmed
};

export const DEMO_CITY = "Bali";

/** Google Maps for Pickle Radar. Optional: without a key the illustrated map is used. */
function parseCenter(v: string | undefined): { lat: number; lng: number } | null {
  const m = v?.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = Number(m[1]), lng = Number(m[2]);
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null;
}
export const MAPS = {
  key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "",
  mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || "DEMO_MAP_ID",
  defaultCenter: parseCenter(process.env.NEXT_PUBLIC_RADAR_CENTER) ?? { lat: -8.6913, lng: 115.1683 },
  defaultLabel: process.env.NEXT_PUBLIC_RADAR_CENTER_LABEL?.trim() || "Seminyak, Bali",
};
export const mapsConfigured = Boolean(MAPS.key);

/** Footer columns. The header nav lives in lib/nav.ts. */
export const NAV = {
  footer: {
    perks: [
      { label: "The membership", href: "/perks" },
      { label: "All venues", href: "/access" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Member perks", href: "/perks#perks" },
      { label: "Try the app demo", href: "/app" },
      { label: "Early access", href: "/early-access" },
    ],
    more: [
      { label: "Pay · Pickle Card (soon)", href: "/card" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
      { label: "Partners", href: "/partners" },
      { label: "Merchant portal", href: "/merchant" },
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
    ],
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
} as const;
