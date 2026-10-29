import { NextResponse } from "next/server";
import { partnerSchema, looksAutomated, fieldErrors } from "@/lib/validation";
import { savePartnerApplication } from "@/lib/database/repos";

export const runtime = "nodejs";

const MIN_SECONDS = Number(process.env.FORM_MIN_SECONDS ?? 3);

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }
  const parsed = partnerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  if (looksAutomated(parsed.data, MIN_SECONDS)) {
    return NextResponse.json({ ok: false, error: "Please take a moment and try again." }, { status: 429 });
  }
  const result = await savePartnerApplication(parsed.data);
  if (!result.ok) {
    if (result.duplicate) return NextResponse.json({ ok: false, duplicate: true, error: "We already have an application for this business." }, { status: 409 });
    return NextResponse.json({ ok: false, error: "We couldn't save your application right now." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, mode: result.mode });
}
