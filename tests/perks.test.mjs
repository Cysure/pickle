import { test } from "node:test";
import assert from "node:assert/strict";
import { PERKS, MERCHANTS, MERCHANT_BY_ID, TIERS, ACTIVITY } from "../lib/demo/data.ts";
import { filterPerks, effectiveStatus, isEligible, daysUntil } from "../lib/perks/index.ts";

const hoods = (p) => MERCHANT_BY_ID[p.merchantId].locations.map((l) => l.neighbourhood);
const name = (p) => MERCHANT_BY_ID[p.merchantId].name;

test("demo dataset meets the brief minimums and is internally consistent", () => {
  assert.ok(MERCHANTS.length >= 12);
  assert.ok(PERKS.length >= 20);
  assert.ok(ACTIVITY.length >= 8);
  assert.equal(TIERS.length, 3);
  for (const p of PERKS) assert.ok(MERCHANT_BY_ID[p.merchantId], `perk ${p.id} has a merchant`);
  for (const t of TIERS) assert.equal(t.status, "proposed");
  for (const a of ACTIVITY) assert.ok(a.status.startsWith("demo-"));
});

test("filter by category and query", () => {
  const food = filterPerks(PERKS, { category: "dining" }, hoods, name);
  assert.ok(food.length > 0 && food.every((p) => p.category === "dining"));
  const q = filterPerks(PERKS, { query: "ayung" }, hoods, name);
  assert.ok(q.length >= 2 && q.every((p) => p.merchantId === "m-ayung"));
  assert.equal(filterPerks(PERKS, { query: "zzzznothing" }, hoods, name).length, 0);
});

test("filter by neighbourhood and status with a fixed today", () => {
  const w = filterPerks(PERKS, { neighbourhood: "Ubud" }, hoods, name);
  assert.ok(w.length > 0 && w.every((p) => hoods(p).includes("Ubud")));
  const expired = filterPerks(PERKS, { status: "expired" }, hoods, name, "2026-10-14");
  assert.ok(expired.some((p) => p.id === "p-cliff-moon"));
  assert.equal(effectiveStatus(PERKS.find((p) => p.id === "p-cliff-moon"), "2026-10-14"), "expired");
  assert.equal(effectiveStatus(PERKS.find((p) => p.id === "p-kopi-pastry"), "2026-10-14"), "available");
});

test("sort options", () => {
  const titles = filterPerks(PERKS, { sort: "title" }, hoods, name).map((p) => p.title);
  assert.deepEqual(titles, [...titles].sort((a, b) => a.localeCompare(b)));
  const featured = filterPerks(PERKS, { sort: "featured" }, hoods, name);
  assert.ok(featured[0].featured);
  const exp = filterPerks(PERKS, { sort: "expiring" }, hoods, name);
  assert.ok(exp[0].expiresAt !== null && exp[exp.length - 1].expiresAt === null);
});

test("membership eligibility follows tier rank", () => {
  const black = PERKS.find((p) => p.tier === "black");
  assert.equal(isEligible(black, "green"), false);
  assert.equal(isEligible(black, "black"), true);
  assert.equal(isEligible(black, "reserve"), true);
  assert.equal(daysUntil(null), null);
  assert.equal(daysUntil("2026-10-20", new Date("2026-10-14T00:00:00Z")), 6);
});
