import { NextResponse } from "next/server";
import { waitlistSchema, looksAutomated, fieldErrors } from "@/lib/validation";
import { saveWaitlist } from "@/lib/database/repos";

export const runtime = "nodejs";

const MIN_SECONDS = Number(process.env.FORM_MIN_SECONDS ?? 3);

/** Early-access sign-up. Validates again on the server, blocks obvious bots, never fakes success. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }
  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 422 });
  }
  if (looksAutomated(parsed.data, MIN_SECONDS)) {
    // Quietly accept-and-drop so bots learn nothing; the client never shows this as a real success.
    return NextResponse.json({ ok: false, error: "Please take a moment and try again." }, { status: 429 });
  }
  const result = await saveWaitlist(parsed.data);
  if (!result.ok) {
    if (result.duplicate) return NextResponse.json({ ok: false, duplicate: true, error: "That email is already on the list." }, { status: 409 });
    return NextResponse.json({ ok: false, error: "We couldn't save your details right now." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, mode: result.mode });
}
