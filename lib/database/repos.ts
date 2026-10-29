import { getSupabaseAdmin } from "./supabase";
import type { ContactInput, PartnerInput, WaitlistInput } from "@/lib/validation";

export type PersistResult = { mode: "supabase"; ok: true } | { mode: "supabase"; ok: false; duplicate?: boolean; error: string } | { mode: "local"; ok: true };

/** In-memory fallback so the API can still detect duplicates within a process in demo mode. */
const localWaitlist = new Set<string>();
const localPartners = new Set<string>();

export async function saveWaitlist(input: WaitlistInput): Promise<PersistResult> {
  const db = getSupabaseAdmin();
  if (!db) {
    if (localWaitlist.has(input.email)) return { mode: "supabase", ok: false, duplicate: true, error: "already-registered" };
    localWaitlist.add(input.email);
    return { mode: "local", ok: true };
  }
  const { error } = await db.from("waitlist").insert({
    first_name: input.firstName, email: input.email, country: input.country, interest: input.interest,
    card_style: input.cardStyle || null, consent: true,
  });
  if (error) {
    if (error.code === "23505") return { mode: "supabase", ok: false, duplicate: true, error: "already-registered" };
    return { mode: "supabase", ok: false, error: error.message };
  }
  return { mode: "supabase", ok: true };
}

export async function savePartnerApplication(input: PartnerInput): Promise<PersistResult> {
  const db = getSupabaseAdmin();
  const key = `${input.email}:${input.businessName.toLowerCase()}`;
  if (!db) {
    if (localPartners.has(key)) return { mode: "supabase", ok: false, duplicate: true, error: "already-applied" };
    localPartners.add(key);
    return { mode: "local", ok: true };
  }
  const { error } = await db.from("merchant_applications").insert({
    business_name: input.businessName, contact_name: input.contactName, email: input.email, city: input.city,
    country: input.country, category: input.category, message: input.message || null, status: "pending",
  });
  if (error) {
    if (error.code === "23505") return { mode: "supabase", ok: false, duplicate: true, error: "already-applied" };
    return { mode: "supabase", ok: false, error: error.message };
  }
  return { mode: "supabase", ok: true };
}

/** General enquiries. No duplicate rule; local mode accepts and discards. */
export async function saveContactMessage(input: ContactInput): Promise<PersistResult> {
  const db = getSupabaseAdmin();
  if (!db) return { mode: "local", ok: true };
  const { error } = await db.from("contact_messages").insert({
    name: input.name, email: input.email, topic: input.topic, message: input.message, status: "new",
  });
  if (error) return { mode: "supabase", ok: false, error: error.message };
  return { mode: "supabase", ok: true };
}

/** Exposed for tests to reset process-local state. */
export function __resetLocalRepos() {
  localWaitlist.clear();
  localPartners.clear();
}
