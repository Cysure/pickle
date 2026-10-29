"use client";
import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/maps/loader";
import { haversineKm, type LatLng } from "@/lib/maps/geo";
import { buildPickleMarker } from "@/lib/maps/pin";
import { MAPS } from "@/lib/config";

export interface RadarPin {
  id: string;        // location id
  merchantId: string;
  mark: string;
  name: string;
  position: LatLng;
}

/**
 * Google Maps view for Pickle Radar. Pins are AdvancedMarkerElements whose
 * content is the cartoon pickle; the member's own position is a pulsing dot.
 * The map pans smoothly when the anchor changes and fits the partner pins
 * when they are near the anchor.
 */
export function GoogleRadarMap({
  center, pins, activeMerchantId, userPosition, onPick, onError, className = "", fitKey,
}: {
  center: LatLng; pins: RadarPin[]; activeMerchantId: string | null; userPosition: LatLng | null;
  onPick: (merchantId: string) => void; onError: (message: string) => void; className?: string;
  /** change this value to ask the map to fit the pins again */
  fitKey: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markers = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const userMarker = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [ready, setReady] = useState(false);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const pinsRef = useRef(pins);
  pinsRef.current = pins;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const g = await loadGoogleMaps(MAPS.key);
        const { Map } = (await g.maps.importLibrary("maps")) as google.maps.MapsLibrary;
        await g.maps.importLibrary("marker");
        if (cancelled || !el.current) return;
        mapRef.current = new Map(el.current, {
          center, zoom: 12, mapId: MAPS.mapId,
          disableDefaultUI: true, zoomControl: true, fullscreenControl: false, clickableIcons: false,
          gestureHandling: "greedy", backgroundColor: "#ecefe7",
        });
        // Watchdog: an invalid or restricted key leaves a grey box without always firing gm_authFailure.
        let tiles = false;
        google.maps.event.addListenerOnce(mapRef.current, "tilesloaded", () => { tiles = true; });
        window.setTimeout(() => {
          if (!tiles && !cancelled) onError("map tiles did not load; check the API key, its restrictions and that Maps JavaScript API is enabled");
        }, 9000);
        setReady(true);
      } catch (e) {
        onError(e instanceof Error ? e.message : "Google Maps failed to load.");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recentre / fit when the anchor changes
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    const near = pinsRef.current.filter((p) => haversineKm(p.position, center) < 60);
    if (near.length > 1) {
      const b = new google.maps.LatLngBounds();
      b.extend(center);
      near.forEach((p) => b.extend(p.position));
      map.fitBounds(b, 56);
      google.maps.event.addListenerOnce(map, "idle", () => { if ((map.getZoom() ?? 0) > 14) map.setZoom(14); });
    } else {
      map.panTo(center);
      map.setZoom(13);
    }
  }, [ready, center, fitKey]);

  // pins
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;
    const keep = new Set(pins.map((p) => p.id));
    for (const [id, m] of markers.current) if (!keep.has(id)) { m.map = null; markers.current.delete(id); }
    for (const p of pins) {
      let m = markers.current.get(p.id);
      if (!m) {
        m = new google.maps.marker.AdvancedMarkerElement({ map, position: p.position, content: buildPickleMarker(p.mark), title: p.name });
        m.addListener("click", () => onPickRef.current(p.merchantId));
        markers.current.set(p.id, m);
      }
      const active = p.merchantId === activeMerchantId;
      (m.content as HTMLElement).classList.toggle("is-active", active);
      m.zIndex = active ? 100 : 1;
    }
  }, [ready, pins, activeMerchantId]);

  // focus the active merchant
  useEffect(() => {
    if (!ready || !mapRef.current || !activeMerchantId) return;
    const p = pins.find((x) => x.merchantId === activeMerchantId);
    if (p) mapRef.current.panTo(p.position);
  }, [ready, activeMerchantId, pins]);

  // user dot
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    if (!userPosition) { if (userMarker.current) { userMarker.current.map = null; userMarker.current = null; } return; }
    if (!userMarker.current) {
      const dot = document.createElement("div");
      dot.className = "gmap-user";
      dot.innerHTML = '<span class="gmap-user-pulse"></span><span class="gmap-user-dot"></span>';
      userMarker.current = new google.maps.marker.AdvancedMarkerElement({ map: mapRef.current, position: userPosition, content: dot, title: "You are here", zIndex: 200 });
    } else {
      userMarker.current.position = userPosition;
    }
  }, [ready, userPosition]);

  return (
    <div className={`relative ${className}`}>
      <div ref={el} className="absolute inset-0" aria-label="Google map of Pickle partners" role="application" />
      {!ready && <div className="skeleton absolute inset-0" aria-hidden="true" />}
    </div>
  );
}
