import { test } from "node:test";
import assert from "node:assert/strict";
import { ACCESS_PLANS, ACCESS_VENUES, ACCESS_PLAN_BY_ID } from "../lib/demo/access.ts";
import { annualSaving, canCheckIn, guestPassesLeft, venueIncludedIn, checkInPattern } from "../lib/access/index.ts";

const solo = ACCESS_PLAN_BY_ID.solo;
const family = ACCESS_PLAN_BY_ID.family;
const now = new Date("2026-10-14T09:00:00Z");

test("venues cover every category and proposed plans are consistent", () => {
  assert.ok(ACCESS_VENUES.length >= 20);
  const cats = new Set(ACCESS_VENUES.map((v) => v.category));
  assert.deepEqual([...cats].sort(), ["bars-clubs", "dining", "family", "pool-beach", "spa-fitness"]);
  for (const p of ACCESS_PLANS) { assert.equal(p.status, "proposed"); assert.ok(p.annual < p.monthly * 12); }
  const s = annualSaving(solo);
  assert.ok(s.amount > 0 && s.percent > 0 && s.percent < 50);
});

test("plan gating: premium venues excluded from Solo", () => {
  const onsen = ACCESS_VENUES.find((v) => v.id === "av-jungleonsen");
  assert.equal(venueIncludedIn(onsen, "solo"), false);
  assert.equal(venueIncludedIn(onsen, "duo"), true);
  const r = canCheckIn(onsen, solo, [], 0, now);
  assert.equal(r.ok, false);
});

test("one check-in per venue per day, guest passes per month", () => {
  const gym = ACCESS_VENUES.find((v) => v.id === "av-ironpalm");
  assert.deepEqual(canCheckIn(gym, solo, [], 0, now), { ok: true });
  const today = [{ id: "c1", venueId: gym.id, at: "2026-10-14T07:00:00Z", guests: 0, simulated: true }];
  assert.equal(canCheckIn(gym, solo, today, 0, now).ok, false);
  const used = [{ id: "c2", venueId: "av-tamarind", at: "2026-10-02T11:00:00Z", guests: 2, simulated: true }];
  assert.equal(guestPassesLeft(solo, used, "2026-10"), 0);
  assert.equal(guestPassesLeft(solo, used, "2026-11"), 2);
  assert.equal(canCheckIn(gym, solo, used, 1, now).ok, false);
  assert.equal(canCheckIn(gym, family, used, 1, now).ok, true);
  assert.equal(canCheckIn(gym, solo, [], 1.5, now).ok, false);
});

test("check-in pattern is deterministic", () => {
  const a = checkInPattern("av-ironpalm|2026-10-14");
  assert.equal(a.length, 49);
  assert.deepEqual(a, checkInPattern("av-ironpalm|2026-10-14"));
  assert.notDeepEqual(a, checkInPattern("av-ironpalm|2026-10-15"));
});
