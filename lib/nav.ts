/**
 * Site navigation: four headings. "Perks" opens a mega menu that holds
 * everything about the membership; the other three are single destinations.
 */
import type { PhotoKey } from "@/lib/photos";
import type { AccessCategory } from "@/lib/types";

export interface NavLink {
  label: string;
  href: string;
  blurb: string;
  /** lucide icon name, resolved in the nav component */
  icon: "sparkles" | "map-pin" | "list-checks" | "gift" | "radar" | "users" | "smartphone" | "rocket";
}

export const PERKS_CATEGORIES: { cat: AccessCategory; label: string; line: string; photo: PhotoKey }[] = [
  { cat: "pool-beach", label: "Pool & Beach", line: "Free entry", photo: "beach" },
  { cat: "bars-clubs", label: "Bars & Clubs", line: "Guest list & drinks", photo: "bars" },
  { cat: "dining", label: "Dining", line: "15–25% off", photo: "dining" },
  { cat: "family", label: "Family", line: "Kids go free", photo: "family" },
  { cat: "spa-fitness", label: "Spa & Fitness", line: "Gyms & spas in", photo: "spa" },
];

export const PERKS_LINKS: NavLink[] = [
  { label: "The membership", href: "/perks", blurb: "What Pickle Perks is and what you get", icon: "sparkles" },
  { label: "All venues", href: "/access", blurb: "Every registered partner, by category", icon: "map-pin" },
  { label: "How it works", href: "/how-it-works", blurb: "Subscribe, open the app, walk in", icon: "list-checks" },
  { label: "Member perks", href: "/perks#perks", blurb: "The extras partners add for members", icon: "gift" },
  { label: "Pickle Radar", href: "/app/radar", blurb: "Find partners near you on the map", icon: "radar" },
  { label: "Pickle Together", href: "/app/together", blurb: "Plan days out with friends", icon: "users" },
  { label: "Try the app demo", href: "/app", blurb: "Check in, browse, save, all in demo", icon: "smartphone" },
  { label: "Early access", href: "/early-access", blurb: "Be first in when plans open", icon: "rocket" },
];

export const TOP_NAV = [
  { key: "perks", label: "Perks", href: "/perks" },
  { key: "pay", label: "Pay", href: "/card", badge: "Soon" },
  { key: "pricing", label: "Pricing", href: "/pricing" },
  { key: "contact", label: "Contact", href: "/contact" },
] as const;
