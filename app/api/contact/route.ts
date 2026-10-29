import { NextResponse } from "next/server";
import { contactSchema, looksAutomated, fieldErrors } from "@/lib/validation";
import { saveContactMessage } from "@/lib/database/repos";

export const runtime = "nodejs";

const MIN_SECONDS = Number(process.env.FORM_MIN_SECONDS ?? 3);

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  if (looksAutomated(parsed.data, MIN_SECONDS)) {
    return NextResponse.json({ ok: false, error: "Please take a moment and try again." }, { status: 429 });
  }
  const result = await saveContactMessage(parsed.data);
  if (!result.ok) return NextResponse.json({ ok: false, error: "We couldn't send your message right now." }, { status: 500 });
  return NextResponse.json({ ok: true, mode: result.mode });
}
