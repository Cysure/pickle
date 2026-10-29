"use client";
/**
 * Loads the Google Maps JavaScript API once. Resolves with the global
 * `google` namespace; rejects on network failure or an authentication
 * failure (invalid/restricted key), so callers can fall back gracefully.
 */
let pending: Promise<typeof google> | null = null;

declare global {
  interface Window {
    gm_authFailure?: () => void;
    __pickleMapsAuthFailed?: boolean;
  }
}

/** The namespace types are ambient; at runtime the global only exists once the script has run. */
function hasMaps(): boolean {
  const g = (window as unknown as { google?: { maps?: { importLibrary?: unknown } } }).google;
  return typeof g?.maps?.importLibrary === "function";
}

export function loadGoogleMaps(key: string): Promise<typeof google> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (hasMaps()) return Promise.resolve(google);
  if (pending) return pending;
  pending = new Promise<typeof google>((resolve, reject) => {
    window.gm_authFailure = () => {
      window.__pickleMapsAuthFailed = true;
      reject(new Error("Google Maps rejected the API key (check key restrictions and enabled APIs)."));
    };
    const s = document.createElement("script");
    const params = new URLSearchParams({ key, v: "weekly", loading: "async", libraries: "marker,places" });
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.async = true;
    s.onload = () => {
      // importLibrary becomes available once the bootstrap has run
      const check = () => (hasMaps() ? resolve(google) : setTimeout(check, 30));
      check();
    };
    s.onerror = () => { pending = null; reject(new Error("Could not load Google Maps.")); };
    document.head.appendChild(s);
  });
  return pending;
}
