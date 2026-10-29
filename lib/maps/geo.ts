/** Small geo helpers for Pickle Radar. Pure functions, unit tested. */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Demo partners live on a 0..100 grid; this spreads the grid over roughly 6 km around an anchor. */
export const GRID_SPAN_KM = 6;

export function gridToLatLng(anchor: LatLng, mapX: number, mapY: number): LatLng {
  const kmPerDegLat = 110.574;
  const kmPerDegLng = 111.32 * Math.cos((anchor.lat * Math.PI) / 180) || 1e-6;
  const dxKm = ((mapX - 50) / 100) * GRID_SPAN_KM;
  const dyKm = ((50 - mapY) / 100) * GRID_SPAN_KM;
  return { lat: anchor.lat + dyKm / kmPerDegLat, lng: anchor.lng + dxKm / kmPerDegLng };
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function formatDistance(km: number): string {
  if (km < 0.1) return "right here";
  if (km < 1) return `${Math.round(km * 1000 / 50) * 50} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function isValidLatLng(p: Partial<LatLng> | null | undefined): p is LatLng {
  return !!p && typeof p.lat === "number" && typeof p.lng === "number" && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180 && !Number.isNaN(p.lat) && !Number.isNaN(p.lng);
}
