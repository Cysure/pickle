import { z } from "zod";

/** Shared validation. Used by forms in the browser and again by API routes on the server. */

const CATEGORY = z.enum(["pool-beach", "bars-clubs", "dining", "family", "spa-fitness"]);
const name = z.string().trim().min(1, "Required").max(80, "Too long");
const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);
const country = z.string().trim().min(2, "Choose your country").max(80);

export const waitlistSchema = z.object({
  firstName: name,
  email,
  country,
  interest: z.enum(["pool-beach", "bars-clubs", "dining", "family", "spa-fitness", "everything"]),
  cardStyle: z.enum(["green", "black", "reserve", ""]).optional(),
  consent: z.literal(true, { message: "Please agree to the privacy notice" }),
  /** honeypot: must stay empty */
  website: z.string().max(0).optional(),
  /** form render timestamp (ms) for a minimum fill-time check */
  startedAt: z.number().int().optional(),
});
export type WaitlistInput = z.infer<typeof waitlistSchema>;

export const partnerSchema = z.object({
  businessName: name,
  contactName: name,
  email,
  city: z.string().trim().min(1, "Required").max(80),
  country,
  category: CATEGORY,
  message: z.string().trim().max(1000, "Keep it under 1000 characters").optional(),
  consent: z.literal(true, { message: "Please agree to the privacy notice" }),
  website: z.string().max(0).optional(),
  startedAt: z.number().int().optional(),
});
export type PartnerInput = z.infer<typeof partnerSchema>;

export const contactSchema = z.object({
  name: name,
  email,
  topic: z.enum(["membership", "pricing", "partnership", "press", "support", "other"]),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(2000, "Keep it under 2000 characters"),
  consent: z.literal(true, { message: "Please agree to the privacy notice" }),
  website: z.string().max(0).optional(),
  startedAt: z.number().int().optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const offerSchema = z
  .object({
    title: z.string().trim().min(4, "At least 4 characters").max(90, "Keep it under 90 characters"),
    category: CATEGORY,
    description: z.string().trim().min(20, "Describe the offer in at least 20 characters").max(600),
    terms: z.string().trim().min(10, "Terms are required").max(1200),
    locationIds: z.array(z.string().min(1)).min(1, "Choose at least one location"),
    startAt: isoDate,
    expiresAt: isoDate.nullable(),
    redemptionLimit: z.number().int().positive("Must be a positive whole number").nullable(),
    status: z.enum(["draft", "scheduled", "live-demo", "ended"]),
    tier: z.enum(["green", "black", "reserve"]),
  })
  .refine((o) => !o.expiresAt || o.expiresAt >= o.startAt, { message: "Expiry must be on or after the start date", path: ["expiresAt"] });
export type OfferInput = z.infer<typeof offerSchema>;

/** Minimum fill time check. Returns true when the submission looks automated. */
export function looksAutomated(input: { website?: string; startedAt?: number }, minSeconds: number, now = Date.now()): boolean {
  if (input.website) return true;
  if (typeof input.startedAt === "number" && now - input.startedAt < minSeconds * 1000) return true;
  return false;
}

/** Flattens zod issues to { field: message } for form display. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "form");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
