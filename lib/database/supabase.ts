import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/config";

let browserClient: SupabaseClient | null = null;

/** Anon client, safe for the browser. Null when Supabase is not configured. */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!browserClient) browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true } });
  return browserClient;
}

/**
 * Service-role client for API routes only. Never import from a client
 * component: the key is read from a non-public env var and this module
 * refuses to run in the browser.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (typeof window !== "undefined") throw new Error("getSupabaseAdmin must not run in the browser");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
