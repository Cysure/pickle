import { NextResponse } from "next/server";
import { z } from "zod";
import { BALI_AREAS, CATEGORY_KEYS } from "@/lib/leads/config";
import { leadsEnabled, resumeRun, startRun, stopRun, tick } from "@/lib/leads/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const off = () => NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
const category = z.enum(CATEGORY_KEYS as [string, ...string[]]);
const body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("start"),
    mode: z.enum(["fast", "deep"]).default("fast"),
    areas: z.array(z.enum(BALI_AREAS)).min(1),
    categories: z.array(category).min(1),
    depth: z.number().int().min(1).max(10),
    custom: z.array(z.object({ query: z.string().trim().min(3).max(120).regex(/^[^#\n\r]+$/), category })).max(50).default([]),
  }),
  z.object({ action: z.literal("stop"), id: z.string().regex(/^\d{14}$/) }),
  z.object({ action: z.literal("resume"), id: z.string().regex(/^\d{14}$/) }),
]);

export async function GET() {
  if (!leadsEnabled()) return off();
  return NextResponse.json({ runs: await tick() });
}

export async function POST(req: Request) {
  if (!leadsEnabled()) return off();
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 422 });
  try {
    const d = parsed.data;
    const r =
      d.action === "start" ? await startRun(d as Parameters<typeof startRun>[0])
      : d.action === "stop" ? await stopRun(d.id)
      : resumeRun(d.id);
    return NextResponse.json({ ok: true, run: r });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 409 });
  }
}
