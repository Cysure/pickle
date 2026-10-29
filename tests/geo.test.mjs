import { test } from "node:test";
import assert from "node:assert/strict";
import { gridToLatLng, haversineKm, formatDistance, isValidLatLng, GRID_SPAN_KM } from "../lib/maps/geo.ts";

const anchor = { lat: 51.5074, lng: -0.1278 };

test("grid centre maps onto the anchor and corners sit about half a span away", () => {
  const c = gridToLatLng(anchor, 50, 50);
  assert.ok(Math.abs(c.lat - anchor.lat) < 1e-9 && Math.abs(c.lng - anchor.lng) < 1e-9);
  const east = gridToLatLng(anchor, 100, 50);
  assert.ok(Math.abs(haversineKm(anchor, east) - GRID_SPAN_KM / 2) < 0.05);
  const north = gridToLatLng(anchor, 50, 0);
  assert.ok(north.lat > anchor.lat);
  assert.ok(Math.abs(haversineKm(anchor, north) - GRID_SPAN_KM / 2) < 0.05);
});

test("haversine matches a known distance (London to Paris ≈ 344 km)", () => {
  const d = haversineKm(anchor, { lat: 48.8566, lng: 2.3522 });
  assert.ok(d > 340 && d < 346, String(d));
  assert.equal(haversineKm(anchor, anchor), 0);
});

test("distance formatting", () => {
  assert.equal(formatDistance(0.02), "right here");
  assert.equal(formatDistance(0.43), "450 m");
  assert.equal(formatDistance(2.345), "2.3 km");
  assert.equal(formatDistance(14.6), "15 km");
});

test("lat/lng validation", () => {
  assert.equal(isValidLatLng({ lat: 0, lng: 0 }), true);
  assert.equal(isValidLatLng({ lat: 91, lng: 0 }), false);
  assert.equal(isValidLatLng({ lat: NaN, lng: 0 }), false);
  assert.equal(isValidLatLng(null), false);
});
