"use client";
import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Plus, Search, Star, Trash2, ChevronDown, Pencil, Check, Loader2, Navigation } from "lucide-react";
import { useDemo, updateDemo, newId, type SavedPlace } from "@/lib/demo/store";
import { MAPS, mapsConfigured } from "@/lib/config";
import { loadGoogleMaps } from "@/lib/maps/loader";
import { isValidLatLng, type LatLng } from "@/lib/maps/geo";
import { Modal, toast } from "@/components/ui";

export type Anchor = { kind: "default" | "current" | "saved"; label: string; position: LatLng; placeId?: string };
export type GeoState = "idle" | "asking" | "granted" | "denied" | "unsupported" | "timeout";

/**
 * Where Radar looks. One control that handles: the current location (with
 * every permission state explained), saved places (home, work, a city you
 * visit), and adding a place by searching Google Places. Everything is kept
 * on the device.
 */
export function LocationPicker({
  anchor, onAnchor, geo, onGeo, userPosition, onUserPosition,
}: {
  anchor: Anchor; onAnchor: (a: Anchor) => void; geo: GeoState; onGeo: (g: GeoState) => void;
  userPosition: LatLng | null; onUserPosition: (p: LatLng | null) => void;
}) {
  const [demo] = useDemo();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const useCurrent = () => {
    if (!("geolocation" in navigator)) { onGeo("unsupported"); return; }
    onGeo("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onUserPosition(p);
        onGeo("granted");
        updateDemo({ activePlaceId: null, privacy: { ...demo.privacy, location: true } });
        onAnchor({ kind: "current", label: "Current location", position: p });
        setOpen(false);
      },
      (err) => { onGeo(err.code === err.TIMEOUT ? "timeout" : "denied"); },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
    );
  };

  const pick = (p: SavedPlace) => {
    updateDemo({ activePlaceId: p.id });
    onAnchor({ kind: "saved", label: p.label, position: { lat: p.lat, lng: p.lng }, placeId: p.id });
    setOpen(false);
  };
  const useDefault = () => {
    updateDemo({ activePlaceId: null });
    onAnchor({ kind: "default", label: MAPS.defaultLabel, position: MAPS.defaultCenter });
    setOpen(false);
  };
  const remove = (id: string) => {
    updateDemo((s) => ({ savedPlaces: s.savedPlaces.filter((p) => p.id !== id), activePlaceId: s.activePlaceId === id ? null : s.activePlaceId }));
    if (anchor.placeId === id) useDefault();
    toast("Place removed", "dark");
  };
  const rename = (id: string) => {
    const label = draft.trim().slice(0, 40);
    if (label) updateDemo((s) => ({ savedPlaces: s.savedPlaces.map((p) => (p.id === id ? { ...p, label } : p)) }));
    if (anchor.placeId === id && label) onAnchor({ ...anchor, label });
    setEditing(null);
  };
  const saveCurrentAsPlace = () => {
    if (!userPosition) return;
    const place: SavedPlace = { id: newId("place"), label: "My spot", lat: userPosition.lat, lng: userPosition.lng };
    updateDemo((s) => ({ savedPlaces: [place, ...s.savedPlaces], activePlaceId: place.id }));
    setEditing(place.id); setDraft(place.label);
    toast("Saved your current location");
  };

  return (
    <div ref={wrap} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu" className="flex max-w-full items-center gap-2 rounded-full border border-ink/15 bg-white py-2 pl-3 pr-3.5 text-sm font-semibold shadow-sm hover:border-ink/40">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-night text-pickle">{anchor.kind === "current" ? <Navigation size={14} /> : anchor.kind === "saved" ? <Star size={14} /> : <MapPin size={14} />}</span>
        <span className="truncate">Around <span className="text-pickle">{anchor.label}</span></span>
        <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="menu" className="absolute left-0 z-30 mt-2 w-[min(92vw,360px)] rounded-[22px] border border-ink/10 bg-white p-2 shadow-[0_20px_60px_rgba(23,25,20,0.18)]">
          <button type="button" role="menuitem" onClick={useCurrent} disabled={geo === "asking"} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm hover:bg-cream disabled:opacity-60">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-pickle text-night">{geo === "asking" ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}</span>
            <span><span className="block font-semibold">Use my current location</span><span className="block text-xs text-muted">{geoHint(geo)}</span></span>
          </button>
          {userPosition && !demo.savedPlaces.some((p) => Math.abs(p.lat - userPosition.lat) < 1e-4 && Math.abs(p.lng - userPosition.lng) < 1e-4) && (
            <button type="button" role="menuitem" onClick={saveCurrentAsPlace} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-xs font-semibold text-muted hover:bg-cream"><Plus size={14} className="ml-2.5" /> Save current location as a place</button>
          )}
          <div className="my-1.5 h-px bg-ink/10" />
          <p className="px-3 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">Saved places</p>
          {demo.savedPlaces.length === 0 && <p className="px-3 pb-2 text-xs text-muted">None yet. Add home, work or a city you visit.</p>}
          <ul className="max-h-56 overflow-y-auto">
            {demo.savedPlaces.map((p) => (
              <li key={p.id} className={`group flex items-center gap-2 rounded-2xl px-2 py-1 ${anchor.placeId === p.id ? "bg-pickle/15" : "hover:bg-cream"}`}>
                {editing === p.id ? (
                  <form className="flex flex-1 items-center gap-1" onSubmit={(e) => { e.preventDefault(); rename(p.id); }}>
                    <input autoFocus className="input !py-1.5 !text-sm" value={draft} maxLength={40} onChange={(e) => setDraft(e.target.value)} aria-label="Place name" />
                    <button type="submit" className="grid h-8 w-8 place-items-center rounded-full bg-night text-pickle" aria-label="Save name"><Check size={14} /></button>
                  </form>
                ) : (
                  <>
                    <button type="button" role="menuitem" onClick={() => pick(p)} className="flex min-w-0 flex-1 items-center gap-3 py-1.5 text-left text-sm">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-night text-pickle"><Star size={14} /></span>
                      <span className="min-w-0"><span className="block truncate font-semibold">{p.label}</span>{p.address && <span className="block truncate text-xs text-muted">{p.address}</span>}</span>
                    </button>
                    <button type="button" onClick={() => { setEditing(p.id); setDraft(p.label); }} className="rounded-full p-1.5 text-muted opacity-0 hover:bg-ink/10 group-hover:opacity-100 focus:opacity-100" aria-label={`Rename ${p.label}`}><Pencil size={13} /></button>
                    <button type="button" onClick={() => remove(p.id)} className="rounded-full p-1.5 text-muted opacity-0 hover:bg-ink/10 group-hover:opacity-100 focus:opacity-100" aria-label={`Remove ${p.label}`}><Trash2 size={13} /></button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <button type="button" role="menuitem" onClick={() => { setAdding(true); setOpen(false); }} className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-cream">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-dashed border-ink/30"><Plus size={15} /></span>{mapsConfigured ? "Add a place by search" : "Add a place"}
          </button>
          <div className="my-1.5 h-px bg-ink/10" />
          <button type="button" role="menuitem" onClick={useDefault} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-xs hover:bg-cream ${anchor.kind === "default" ? "font-semibold" : "text-muted"}`}><MapPin size={14} className="ml-2.5" /> {MAPS.defaultLabel}</button>
        </div>
      )}

      <AddPlaceModal open={adding} onClose={() => setAdding(false)} onAdd={(p) => { updateDemo((s) => ({ savedPlaces: [p, ...s.savedPlaces], activePlaceId: p.id })); onAnchor({ kind: "saved", label: p.label, position: { lat: p.lat, lng: p.lng }, placeId: p.id }); setAdding(false); toast(`Saved ${p.label}`); }} />
    </div>
  );
}

function geoHint(g: GeoState) {
  switch (g) {
    case "asking": return "Waiting for your browser…";
    case "granted": return "Location on. Used only on this device.";
    case "denied": return "Blocked in your browser. You can allow it in site settings.";
    case "unsupported": return "This browser can't share location.";
    case "timeout": return "Took too long. Try again or pick a saved place.";
    default: return "We ask your browser once; nothing is stored or sent.";
  }
}

/* ------------------------------------------------------------------ */
interface PlaceLike { fetchFields(o: { fields: string[] }): Promise<unknown>; location?: { lat(): number; lng(): number } | null; displayName?: string | null; formattedAddress?: string | null }
interface PredictionEvent extends Event { placePrediction?: { toPlace(): PlaceLike } }

function AddPlaceModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (p: SavedPlace) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [found, setFound] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [manual, setManual] = useState({ lat: "", lng: "" });
  const [autocompleteReady, setAutocompleteReady] = useState(false);

  // Places autocomplete (new PlaceAutocompleteElement), only when a key exists
  useEffect(() => {
    if (!open || !mapsConfigured || !host.current) return;
    let el: HTMLElement | null = null;
    let cancelled = false;
    (async () => {
      try {
        const g = await loadGoogleMaps(MAPS.key);
        const lib = (await g.maps.importLibrary("places")) as unknown as { PlaceAutocompleteElement?: new () => HTMLElement };
        if (cancelled || !host.current || !lib.PlaceAutocompleteElement) return;
        el = new lib.PlaceAutocompleteElement();
        el.style.width = "100%";
        el.addEventListener("gmp-select", async (ev: Event) => {
          const e = ev as PredictionEvent;
          if (!e.placePrediction) return;
          setBusy(true); setErr("");
          try {
            const place = e.placePrediction.toPlace();
            await place.fetchFields({ fields: ["location", "displayName", "formattedAddress"] });
            if (place.location) {
              setFound({ lat: place.location.lat(), lng: place.location.lng(), address: place.formattedAddress ?? place.displayName ?? "" });
              setLabel((l) => l || (place.displayName ?? ""));
            } else setErr("That place has no coordinates.");
          } catch { setErr("Couldn't fetch that place."); }
          setBusy(false);
        });
        host.current.replaceChildren(el);
        setAutocompleteReady(true);
      } catch {
        setAutocompleteReady(false);
      }
    })();
    return () => { cancelled = true; el?.remove(); };
  }, [open]);

  const geocode = async () => {
    if (!mapsConfigured || !query.trim()) return;
    setBusy(true); setErr("");
    try {
      const g = await loadGoogleMaps(MAPS.key);
      const { Geocoder } = (await g.maps.importLibrary("geocoding")) as google.maps.GeocodingLibrary;
      const res = await new Geocoder().geocode({ address: query.trim() });
      const r = res.results[0];
      if (!r) { setErr("No results. Try a fuller address."); }
      else { setFound({ lat: r.geometry.location.lat(), lng: r.geometry.location.lng(), address: r.formatted_address }); setLabel((l) => l || query.trim()); }
    } catch { setErr("Search failed. Check the Geocoding API is enabled for your key."); }
    setBusy(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const pos = found ?? (isValidLatLng({ lat: Number(manual.lat), lng: Number(manual.lng) }) ? { lat: Number(manual.lat), lng: Number(manual.lng), address: "" } : null);
    if (!pos) { setErr(mapsConfigured ? "Search for a place first." : "Enter a valid latitude and longitude."); return; }
    const name = label.trim().slice(0, 40) || "Saved place";
    onAdd({ id: newId("place"), label: name, address: pos.address || undefined, lat: pos.lat, lng: pos.lng });
    setLabel(""); setFound(null); setQuery(""); setManual({ lat: "", lng: "" }); setErr("");
  };

  return (
    <Modal open={open} onClose={onClose} title="Add a place">
      <form onSubmit={submit} className="space-y-4">
        {mapsConfigured ? (
          <div className="field">
            <label htmlFor="place-search">Search</label>
            <div ref={host} className={autocompleteReady ? "" : "hidden"} />
            {!autocompleteReady && (
              <div className="flex gap-2">
                <input id="place-search" className="input" placeholder="Address, neighbourhood or city" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); geocode(); } }} />
                <button type="button" className="btn btn-dark btn-sm" onClick={geocode} disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}</button>
              </div>
            )}
            {found && <p className="flex items-center gap-1.5 text-xs text-muted"><MapPin size={12} className="text-pickle" /> {found.address} <span className="num">({found.lat.toFixed(4)}, {found.lng.toFixed(4)})</span></p>}
          </div>
        ) : (
          <>
            <p className="rounded-2xl bg-cream p-3 text-xs text-muted">Place search needs a Google Maps key (see .env.example). Until then you can add a place by coordinates.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="field"><label htmlFor="place-lat">Latitude</label><input id="place-lat" className="input num" inputMode="decimal" value={manual.lat} onChange={(e) => setManual({ ...manual, lat: e.target.value })} placeholder="51.5074" /></div>
              <div className="field"><label htmlFor="place-lng">Longitude</label><input id="place-lng" className="input num" inputMode="decimal" value={manual.lng} onChange={(e) => setManual({ ...manual, lng: e.target.value })} placeholder="-0.1278" /></div>
            </div>
          </>
        )}
        <div className="field"><label htmlFor="place-label">Name it</label><input id="place-label" className="input" placeholder="Home, Work, Lisbon trip…" maxLength={40} value={label} onChange={(e) => setLabel(e.target.value)} /></div>
        {err && <p className="error" role="alert">{err}</p>}
        <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary btn-sm" disabled={busy}><Plus size={14} /> Save place</button></div>
      </form>
    </Modal>
  );
}
