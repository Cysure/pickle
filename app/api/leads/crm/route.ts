import { NextResponse } from "next/server";
import { z } from "zod";
import { LEAD_STATUSES } from "@/lib/leads/config";
import { leadsEnabled, updateCrm } from "@/lib/leads/runner";

export const runtime = "nodejs";

const body = z.object({
  placeId: z.string().min(5).max(200),
  status: z.enum(LEAD_STATUSES).optional(),
  notes: z.string().max(4000).optional(),
});

export async function PATCH(req: Request) {
  if (!leadsEnabled()) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 422 });
  const { placeId, ...patch } = parsed.data;
  return NextResponse.json({ ok: true, crm: updateCrm(placeId, patch) });
}
