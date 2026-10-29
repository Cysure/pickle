import { NextResponse } from "next/server";
import { leadsEnabled, readLeads, rebuildLeads } from "@/lib/leads/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const off = () => NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

export async function GET() {
  if (!leadsEnabled()) return off();
  return NextResponse.json(readLeads());
}

/** Re-score every run's data (e.g. after editing process.py). */
export async function POST() {
  if (!leadsEnabled()) return off();
  try {
    const log = await rebuildLeads();
    return NextResponse.json({ ok: true, log });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
