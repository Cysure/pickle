import { createHmac, timingSafeEqual } from "node:crypto";

/** HMAC-SHA256 over the raw body, hex encoded. Header format: "sha256=<hex>" or bare hex. */
export function signBody(rawBody: string, secret: string): string {
  return "sha256=" + createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

export function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = signBody(rawBody, secret);
  const given = signature.startsWith("sha256=") ? signature : "sha256=" + signature;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(given, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Duplicate delivery guard. Keeps the ids seen in the last `ttlMs`; a real
 * deployment swaps this for a database unique index (see activity_events.source_event_id).
 */
export class SeenEvents {
  private seen = new Map<string, number>();
  private ttlMs: number;
  private now: () => number;
  constructor(ttlMs = 24 * 60 * 60 * 1000, now: () => number = Date.now) {
    this.ttlMs = ttlMs;
    this.now = now;
  }
  /** returns true if the id was already processed */
  check(id: string): boolean {
    const t = this.now();
    for (const [k, v] of this.seen) if (t - v > this.ttlMs) this.seen.delete(k);
    if (this.seen.has(id)) return true;
    this.seen.set(id, t);
    return false;
  }
}
