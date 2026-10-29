import { test } from "node:test";
import assert from "node:assert/strict";
import { signBody, verifySignature, SeenEvents } from "../lib/payments/webhook.ts";
import { createMockProvider } from "../lib/payments/mock.ts";

const secret = "test-secret";
const body = JSON.stringify({ id: "evt_1", type: "transaction.settled", occurredAt: "2026-10-14T10:00:00Z", data: {} });

test("signature verification accepts the right secret and rejects tampering", () => {
  const sig = signBody(body, secret);
  assert.equal(verifySignature(body, sig, secret), true);
  assert.equal(verifySignature(body + " ", sig, secret), false);
  assert.equal(verifySignature(body, sig, "other"), false);
  assert.equal(verifySignature(body, "sha256=00", secret), false);
});

test("mock provider verifies webhooks and is visibly simulated", async () => {
  const p = createMockProvider(secret);
  assert.equal(p.simulated, true);
  const ev = await p.verifyWebhook(body, signBody(body, secret));
  assert.equal(ev?.id, "evt_1");
  assert.equal(await p.verifyWebhook(body, "sha256=bad"), null);
  assert.equal(await p.verifyWebhook(body, null), null);
  const card = await p.getCard("u1");
  assert.equal(card.simulated, true);
  assert.equal(card.last4.length, 4);
  const frozen = await p.setCardStatus("u1", "frozen");
  assert.equal(frozen.status, "frozen");
  const noSecret = createMockProvider(undefined);
  assert.equal(await noSecret.verifyWebhook(body, signBody(body, secret)), null);
});

test("duplicate events are detected and expire after the ttl", () => {
  let t = 1000;
  const seen = new SeenEvents(100, () => t);
  assert.equal(seen.check("a"), false);
  assert.equal(seen.check("a"), true);
  t += 200;
  assert.equal(seen.check("a"), false);
});
