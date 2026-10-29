import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { SeenEvents } from "@/lib/payments/webhook";

export const runtime = "nodejs";

const seen = new SeenEvents();

/**
 * Inbound events from the payment provider. The raw body is verified against
 * the shared secret before parsing; duplicates are acknowledged but ignored.
 * Perks are only ever granted here, server-side, from verified events.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-pickle-signature");
  const provider = getPaymentProvider();
  const event = await provider.verifyWebhook(raw, signature);
  if (!event) return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  if (seen.check(event.id)) return NextResponse.json({ ok: true, duplicate: true });

  // A live deployment persists the event to activity_events (unique source_event_id)
  // and evaluates perk eligibility here. The mock provider simply acknowledges.
  return NextResponse.json({ ok: true, received: event.type, simulated: provider.simulated });
}
