import type { LeadCategoryLabel } from "@/lib/leads/config";

export const CATEGORY_COLOR: Record<LeadCategoryLabel, string> = {
  "Pool & Beach": "#1fa2d6",
  "Bars & Clubs": "#8b5cf6",
  Dining: "#e69a12",
  Family: "#ec6a5e",
  "Spa & Fitness": "#5ea300",
};

export const TIER_LABEL = { A: "Anchor", B: "Core", C: "Value" } as const;
