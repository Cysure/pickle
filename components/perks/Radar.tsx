"use client";
import { useEffect, useMemo, useState } from "react";
import { Map as MapIcon, List, Search, Bookmark, Navigation, X, ExternalLink, LocateFixed, Crosshair } from "lucide-react";
import type { Perk, PerkCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { AREAS, MERCHANTS, MERCHANT_BY_ID, PERKS } from "@/lib/demo/data";
import { DEMO_CITY, MAPS, mapsConfigured } from "@/lib/config";
import { effectiveStatus } from "@/lib/perks";
import { useDemo, updateDemo } from "@/lib/demo/store";
import { formatDistance, haversineKm, type LatLng } from "@/lib/maps/geo";
import { picklePinHtml } from "@/lib/maps/pin";
import { DemoTag, EmptyState, Modal } from "@/components/ui";
import { MerchantMark, StatusPill } from "./PerkCard";
import { PerkDetail } from "./PerkDetail";
import { useSavedPerks } from "./PerkExplorer";
import { LocationPicker, type Anchor, type GeoState } from "./LocationPicker";
import { GoogleRadarMap, type RadarPin } from "./GoogleRadarMap";
import { track } from "@/lib/analytics";

const CATS: (PerkCategory | "all")[] = ["all", "pool-beach", "bars-clubs", "dining", "family", "spa-fitness"];

/**
 * Pickle Radar. A real Google map (when a key is configured) of fictional
 * partners placed in real Bali areas, with smooth location management:
 * current location, saved places, place search, distances and directions.
 * Without a key the illustrated island map takes over with the same pins.
 */
export function Radar({ compact = false }: { compact?: boolean }) {
  const [demo] = useDemo();
  const { saved, toggle } = useSavedPerks();
  const [view, setViewState] = useState<"map" | "list">(demo.radarView);
  const [cat, setCat] = useState<PerkCategory | "all">("all");
  const [area, setArea] = useState<string>("all");
  const [q, setQ] = useState("");
  const [onlySaved, setOnlySaved] = useState(false);
  const [geo, setGeo] = useState<GeoState>("idle");
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [anchor, setAnchor] = useState<Anchor>({ kind: "default", label: MAPS.defaultLabel, position: MAPS.defaultCenter });
  const [fitKey, setFitKey] = useState("init");
  const [activeMerchant, setActiveMerchant] = useState<string | null>(null);
  const [open, setOpen] = useState<Perk | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);

  // restore the active saved place
  useEffect(() => {
    const p = demo.savedPlaces.find((x) => x.id === demo.activePlaceId);
    if (p) setAnchor({ kind: "saved", label: p.label, position: { lat: p.lat, lng: p.lng }, placeId: p.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setView = (v: "map" | "list") => { setViewState(v); updateDemo({ radarView: v }); track("radar_opened", { view: v }); };
  const origin = userPosition ?? anchor.position;

  const merchants = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return MERCHANTS
      .map((m) => {
        const perks = PERKS.filter((p) => p.merchantId === m.id && effectiveStatus(p) !== "expired");
        const nearest = Math.min(...m.locations.map((l) => haversineKm(origin, l)));
        return { m, perks, km: nearest };
      })
      .filter(({ m, perks }) => {
        if (perks.length === 0) return false;
        if (cat !== "all" && m.category !== cat) return false;
        if (area !== "all" && !m.locations.some((l) => l.neighbourhood === area)) return false;
        if (onlySaved && !perks.some((p) => saved.includes(p.id))) return false;
        if (ql && !`${m.name} ${m.description} ${m.locations.map((l) => `${l.neighbourhood} ${l.address}`).join(" ")}`.toLowerCase().includes(ql)) return false;
        return true;
      })
      .sort((a, b) => a.km - b.km);
  }, [cat, area, q, onlySaved, saved, origin]);

  const pins: RadarPin[] = useMemo(
    () => merchants.flatMap(({ m }) => m.locations.map((l) => ({ id: l.id, merchantId: m.id, mark: m.mark, name: m.name, position: { lat: l.lat, lng: l.lng } }))),
    [merchants],
  );

  const farFromPartners = merchants.length > 0 && merchants[0].km > 80;
  const active = activeMerchant ? merchants.find((x) => x.m.id === activeMerchant) ?? null : null;
  const useGoogle = mapsConfigured && !mapsError;

  return (
    <div className="flex flex-col gap-4">
      {/* where + what */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <LocationPicker anchor={anchor} onAnchor={(a) => { setAnchor(a); setFitKey(String(Date.now())); setActiveMerchant(null); }} geo={geo} onGeo={setGeo} userPosition={userPosition} onUserPosition={setUserPosition} />
        <label className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-11" placeholder={`Search ${DEMO_CITY}: resorts, spas, clubs, cafés…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search Radar" />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <select className="select w-auto" value={area} onChange={(e) => setArea(e.target.value)} aria-label="Area">
            <option value="all">All areas</option>
            {AREAS.map((h) => <option key={h}>{h}</option>)}
          </select>
          <button type="button" onClick={() => setOnlySaved((v) => !v)} aria-pressed={onlySaved} className={`btn btn-sm ${onlySaved ? "btn-primary" : "btn-ghost"}`}><Bookmark size={14} /> Saved</button>
          <div className="flex rounded-full border border-ink/15 bg-white p-0.5" role="group" aria-label="View">
            <button type="button" onClick={() => setView("map")} aria-pressed={view === "map"} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${view === "map" ? "bg-night text-paper" : ""}`}><MapIcon size={14} /> Map</button>
            <button type="button" onClick={() => setView("list")} aria-pressed={view === "list"} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${view === "list" ? "bg-night text-paper" : ""}`}><List size={14} /> List</button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
        {CATS.map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${cat === c ? "bg-pickle text-night" : "bg-cream hover:bg-ink/10"}`}>
            {c === "all" ? "Everything" : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <p><span className="num font-semibold text-ink">{merchants.length}</span> places{userPosition ? ", nearest first from you" : `, nearest first from ${anchor.label}`}</p>
        <DemoTag>{useGoogle ? "Fictional partners in real Bali areas" : "Illustrated map · fictional partners"}</DemoTag>
      </div>

      {geo === "denied" && (
        <p className="rounded-2xl border border-ink/10 bg-cream p-4 text-sm">
          <strong>Location is blocked.</strong> No problem: pick an area or a saved place instead. If you allow location later, Radar will sort places by distance from you and show your position on the map. Your position never leaves this device.
        </p>
      )}
      {geo === "timeout" && <p className="rounded-2xl border border-ink/10 bg-cream p-4 text-sm"><strong>Couldn&rsquo;t get a fix.</strong> Try again outdoors or pick a saved place.</p>}
      {farFromPartners && (
        <p className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pickle/40 bg-pickle/10 p-4 text-sm">
          <span><strong>Pickle partners are in {DEMO_CITY} for this demo.</strong> You&rsquo;re about {formatDistance(merchants[0].km)} from the nearest one.</span>
          <button type="button" className="btn btn-dark btn-sm" onClick={() => { setAnchor({ kind: "default", label: MAPS.defaultLabel, position: MAPS.defaultCenter }); updateDemo({ activePlaceId: null }); setFitKey(String(Date.now())); }}><Crosshair size={14} /> Jump to {DEMO_CITY}</button>
        </p>
      )}
      {mapsConfigured && mapsError && <p className="rounded-2xl border border-ink/10 bg-cream p-4 text-xs text-muted">Google Maps couldn&rsquo;t load ({mapsError}). Showing the illustrated map instead.</p>}

      {merchants.length === 0 ? (
        <EmptyState icon={<Navigation />} title="Nothing here yet" body={`No places match these filters in ${DEMO_CITY}. Try another area or category.`} action={<button type="button" className="btn btn-ghost btn-sm" onClick={() => { setCat("all"); setArea("all"); setQ(""); setOnlySaved(false); }}>Reset</button>} />
      ) : view === "map" ? (
        <div className={`relative overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-cream ${compact ? "aspect-[4/3] sm:aspect-[16/9]" : "aspect-[4/3] sm:aspect-[16/10] lg:aspect-[2/1]"}`}>
          {useGoogle ? (
            <GoogleRadarMap className="absolute inset-0" center={anchor.position} pins={pins} activeMerchantId={activeMerchant} userPosition={userPosition} onPick={setActiveMerchant} onError={setMapsError} fitKey={fitKey} />
          ) : (
            <IslandMap pins={pins} userPosition={userPosition} anchor={anchor.position} active={activeMerchant} onPick={setActiveMerchant} />
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <button type="button" className="btn btn-sm bg-white shadow-md hover:bg-cream" onClick={() => { setFitKey(String(Date.now())); setActiveMerchant(null); }}><LocateFixed size={14} /> Recentre</button>
          </div>
          {active && (
            <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-paper p-4 shadow-xl sm:left-auto sm:w-[22rem]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3"><MerchantMark mark={active.m.mark} size={40} /><div><p className="font-semibold leading-tight">{active.m.name}</p><p className="text-xs text-muted">{active.m.locations.map((l) => l.neighbourhood).join(" · ")} · {formatDistance(active.km)}</p></div></div>
                <button type="button" onClick={() => setActiveMerchant(null)} aria-label="Close preview" className="rounded-full p-1 hover:bg-cream"><X size={16} /></button>
              </div>
              <ul className="mt-3 max-h-36 space-y-2 overflow-y-auto">
                {active.perks.map((p) => (
                  <li key={p.id}><button type="button" onClick={() => setOpen(p)} className="flex w-full items-center justify-between gap-2 rounded-xl bg-cream px-3 py-2 text-left text-sm hover:bg-pickle/20"><span className="font-semibold">{p.title}</span><StatusPill perk={p} /></button></li>
                ))}
              </ul>
              <a href={directionsUrl(active.m.locations[0], origin)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-pickle hover:underline"><ExternalLink size={12} /> Directions in Google Maps</a>
            </div>
          )}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {merchants.map(({ m, perks, km }) => (
            <li key={m.id} className="panel p-4">
              <div className="flex items-center gap-3">
                <MerchantMark mark={m.mark} />
                <div className="min-w-0 flex-1"><p className="truncate font-semibold leading-tight">{m.name}</p><p className="text-xs text-muted">{CATEGORY_LABELS[m.category]} · {m.locations.map((l) => l.neighbourhood).join(" · ")}</p></div>
                <span className="pill-outline num">{formatDistance(km)}</span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {perks.map((p) => (
                  <li key={p.id}><button type="button" onClick={() => setOpen(p)} className="flex w-full items-center justify-between gap-2 rounded-xl bg-cream px-3 py-2 text-left text-sm hover:bg-pickle/20"><span>{p.title}</span><StatusPill perk={p} /></button></li>
                ))}
              </ul>
              <div className="mt-3 flex gap-3 text-xs font-semibold">
                <button type="button" className="text-ink hover:text-pickle" onClick={() => { setActiveMerchant(m.id); setView("map"); }}>Show on map</button>
                <a href={directionsUrl(m.locations[0], origin)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-pickle hover:underline"><ExternalLink size={12} /> Directions</a>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ""} wide>
        {open && <PerkDetail perk={open} saved={saved.includes(open.id)} onToggleSave={toggle} />}
      </Modal>
    </div>
  );
}

function directionsUrl(dest: LatLng, origin: LatLng | null) {
  const u = new URL("https://www.google.com/maps/dir/");
  u.searchParams.set("api", "1");
  u.searchParams.set("destination", `${dest.lat},${dest.lng}`);
  if (origin) u.searchParams.set("origin", `${origin.lat},${origin.lng}`);
  return u.toString();
}

/* ------------------------------------------------------------------ */
/** Illustrated fallback: pins projected onto a stylised map of south Bali drawn from real coastline points. */
const BOUNDS = { n: -8.42, s: -8.88, w: 115.02, e: 115.34 };
function project(p: LatLng) {
  const x = ((p.lng - BOUNDS.w) / (BOUNDS.e - BOUNDS.w)) * 100;
  const y = ((BOUNDS.n - p.lat) / (BOUNDS.n - BOUNDS.s)) * 100;
  return { x: Math.min(98, Math.max(2, x)), y: Math.min(96, Math.max(4, y)) };
}
// approximate coastline of south Bali (lng, lat), clockwise from the north-west corner
const COAST: [number, number][] = [
  [115.02, -8.42], [115.34, -8.42], [115.34, -8.52], [115.31, -8.60], [115.28, -8.66], [115.262, -8.71], [115.235, -8.73],
  [115.21, -8.74], [115.215, -8.755], [115.228, -8.77], [115.236, -8.80], [115.228, -8.825], [115.19, -8.845], [115.14, -8.855],
  [115.095, -8.835], [115.085, -8.81], [115.11, -8.79], [115.15, -8.78], [115.162, -8.75], [115.165, -8.72], [115.15, -8.695],
  [115.13, -8.66], [115.087, -8.62], [115.05, -8.585], [115.02, -8.56],
];
const HIGHLANDS: [number, number][] = [[115.18, -8.42], [115.34, -8.42], [115.34, -8.50], [115.29, -8.54], [115.23, -8.55], [115.18, -8.50]];
function toPath(pts: [number, number][]) {
  return pts.map(([lng, lat], i) => { const p = project({ lat, lng }); return `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`; }).join(" ") + " Z";
}
const AREA_LABELS: { name: string; lat: number; lng: number }[] = [
  { name: "Ubud", lat: -8.47, lng: 115.262 }, { name: "Canggu", lat: -8.62, lng: 115.17 }, { name: "Seminyak", lat: -8.685, lng: 115.205 },
  { name: "Sanur", lat: -8.672, lng: 115.245 }, { name: "Kuta", lat: -8.725, lng: 115.205 }, { name: "Jimbaran", lat: -8.775, lng: 115.195 },
  { name: "Nusa Dua", lat: -8.805, lng: 115.195 }, { name: "Uluwatu", lat: -8.838, lng: 115.13 },
];

function IslandMap({ pins, userPosition, anchor, active, onPick }: { pins: RadarPin[]; userPosition: LatLng | null; anchor: LatLng; active: string | null; onPick: (id: string) => void }) {
  const a = project(anchor);
  return (
    <div className="absolute inset-0" role="group" aria-label="Illustrated map of south Bali with Pickle partners">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="sea" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.28" fill="#8fc3e0" /></pattern>
          <filter id="coast-glow" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.8" /></filter>
        </defs>
        <rect width="100" height="100" fill="#d7e9f4" /><rect width="100" height="100" fill="url(#sea)" opacity="0.6" />
        <path d={toPath(COAST)} fill="#b9dcef" filter="url(#coast-glow)" />
        <path d={toPath(COAST)} fill="#eef3e3" stroke="#c6d6ae" strokeWidth="0.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={toPath(HIGHLANDS)} fill="#d6e8b6" opacity="0.8" />
        <path d={`${toPath([[115.26, -8.42], [115.262, -8.56], [115.25, -8.68], [115.262, -8.71]]).replace(" Z", "")}`} stroke="#9ec5e6" strokeWidth="0.9" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.9" />
        <path d={`${toPath([[115.165, -8.72], [115.20, -8.70], [115.23, -8.60], [115.262, -8.52]]).replace(" Z", "")}`} stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.9" />
        <path d={`${toPath([[115.13, -8.66], [115.165, -8.72], [115.16, -8.75], [115.21, -8.74], [115.262, -8.71]]).replace(" Z", "")}`} stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.9" />
      </svg>
      {AREA_LABELS.map((l) => { const p = project(l); return <span key={l.name} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-ink/45 sm:text-[11px]" style={{ left: `${p.x}%`, top: `${p.y}%` }}>{l.name}</span>; })}
      <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${a.x}%`, top: `${a.y}%` }}><span className="block h-3 w-3 rounded-full border-2 border-white bg-night shadow" /></span>
      {userPosition && (() => { const p = project(userPosition); return <span key="user" className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}><span className="gmap-user"><span className="gmap-user-pulse" /><span className="gmap-user-dot" /></span></span>; })()}
      {pins.map((pin) => {
        const p = project(pin.position);
        const isActive = pin.merchantId === active;
        return (
          <button key={pin.id} type="button" onClick={() => onPick(pin.merchantId)} aria-label={pin.name} aria-pressed={isActive}
            className={`gmap-pin absolute -translate-x-1/2 -translate-y-full border-0 bg-transparent p-0 ${isActive ? "is-active z-20" : "z-10"}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <span dangerouslySetInnerHTML={{ __html: picklePinHtml({ active: isActive }) }} />
            <span className="gmap-pin-mark">{pin.mark}</span>
          </button>
        );
      })}
    </div>
  );
}
