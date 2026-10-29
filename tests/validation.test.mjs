import { test } from "node:test";
import assert from "node:assert/strict";
import { waitlistSchema, partnerSchema, offerSchema, contactSchema, looksAutomated, fieldErrors } from "../lib/validation/index.ts";

const good = { firstName: "Sam", email: "Sam@Example.com", country: "Demo Country", interest: "everything", consent: true };

test("waitlist: accepts a valid entry and normalises the email", () => {
  const r = waitlistSchema.safeParse(good);
  assert.ok(r.success);
  assert.equal(r.data.email, "sam@example.com");
});

test("waitlist: rejects a bad email, missing consent and a filled honeypot", () => {
  assert.equal(waitlistSchema.safeParse({ ...good, email: "nope" }).success, false);
  assert.equal(waitlistSchema.safeParse({ ...good, consent: false }).success, false);
  assert.equal(waitlistSchema.safeParse({ ...good, website: "http://spam" }).success, false);
  const errs = fieldErrors(waitlistSchema.safeParse({ ...good, email: "nope", firstName: "" }).error);
  assert.ok(errs.email && errs.firstName);
});

test("spam heuristic: too-fast submissions look automated", () => {
  const now = 100_000;
  assert.equal(looksAutomated({ startedAt: now - 500 }, 3, now), true);
  assert.equal(looksAutomated({ startedAt: now - 5000 }, 3, now), false);
  assert.equal(looksAutomated({ website: "x" }, 3, now), true);
});

test("partner: requires category and consent", () => {
  const base = { businessName: "Brine & Bloom", contactName: "Jo", email: "jo@example.com", city: "Demo City", country: "Demo Country", category: "dining", consent: true };
  assert.ok(partnerSchema.safeParse(base).success);
  assert.equal(partnerSchema.safeParse({ ...base, category: "crypto" }).success, false);
  assert.equal(partnerSchema.safeParse({ ...base, consent: false }).success, false);
});

test("offer: rejects invalid data and expiry before start", () => {
  const base = {
    title: "Free pastry", category: "dining", description: "Pay for a coffee and pick any pastry from the counter.",
    terms: "Demo offer. One per visit.", locationIds: ["l1"], startAt: "2026-10-01", expiresAt: "2026-12-31",
    redemptionLimit: 100, status: "draft", tier: "green",
  };
  assert.ok(offerSchema.safeParse(base).success);
  assert.equal(offerSchema.safeParse({ ...base, expiresAt: "2026-09-01" }).success, false);
  assert.equal(offerSchema.safeParse({ ...base, locationIds: [] }).success, false);
  assert.equal(offerSchema.safeParse({ ...base, redemptionLimit: -5 }).success, false);
  assert.equal(offerSchema.safeParse({ ...base, title: "Hi" }).success, false);
});

test("contact: requires a topic from the list, a real message and consent", () => {
  const base = { name: "Sam", email: "sam@example.com", topic: "membership", message: "When do plans open?", consent: true };
  assert.ok(contactSchema.safeParse(base).success);
  assert.equal(contactSchema.safeParse({ ...base, topic: "spam" }).success, false);
  assert.equal(contactSchema.safeParse({ ...base, message: "hi" }).success, false);
  assert.equal(contactSchema.safeParse({ ...base, consent: false }).success, false);
  assert.equal(contactSchema.safeParse({ ...base, website: "x" }).success, false);
});
