# Pickle — Life's Better with Pickle.

Marketing site, customer app demo and merchant portal demo for the Pickle Card, a lifestyle and perks programme in development. Everything runs in local demo mode with zero configuration; Supabase and a payment provider plug in through environment variables.

## Run

```bash
npm install
npm run dev        # http://localhost:5500
npm run typecheck
npm test
npm run build
```

## What's here

| Area | Route(s) | Notes |
| --- | --- | --- |
| Marketing | `/`, `/how-it-works`, `/perks`, `/card`, `/partners`, `/about`, `/faq`, `/early-access`, `/privacy`, `/terms` | Early-access and partner forms post to `/api/*`, validate on both sides, and say plainly when no backend is configured. |
| Pickle Access | `/access`, `/app/access` | Privilee-style membership: free entry to 27 fictional Bali venues (pools, beach clubs, gyms, shalas, spas, kids' clubs, surf, courts) plus dining discounts; proposed Solo/Duo/Family plans; demo check-in codes, guest passes and visit history in the app. |
| Customer app demo | `/app` → `/app/home`, `/app/card`, `/app/perks`, `/app/perks/[id]`, `/app/radar`, `/app/saved`, `/app/together`, `/app/activity`, `/app/membership`, `/app/profile`, `/app/settings` | Demo sign-in (display name only). All state in `localStorage` under `pickle.demo.v1`. |
| Merchant portal demo | `/merchant`, `/merchant/offers/new`, `/merchant/offers/[id]` | Offers live in `localStorage` under `pickle.merchant.v1`; nothing is ever published to members. |
| API | `POST /api/waitlist`, `POST /api/partners`, `POST /api/payments/webhook` | Zod validation, honeypot + minimum fill time, duplicate detection, HMAC webhook verification, duplicate-event guard. |

## Structure

```
app/(marketing)   public pages        components/brand   exact wordmark (inline SVG path)
app/app           customer demo       components/cards   CSS 3D PickleCard, CardShowcase
app/merchant      merchant demo       components/perks   PerkCard, PerkDetail, PerkExplorer, Radar
app/api           route handlers      components/forms   EarlyAccessForm, PartnerForm
lib/demo          dataset + stores    lib/access         membership rules (plans, passes, check-in)    components/marketing, navigation, motion, ui
lib/validation    zod schemas         lib/payments       provider interface, mock, webhook HMAC
lib/database      Supabase clients    lib/analytics      typed events, pluggable sink
supabase/migrations/0001_init.sql     tests/*.test.mjs   node:test with native TS stripping
```

## Environment

See `.env.example`. With nothing set the product runs entirely in demo mode. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and the server-only `SUPABASE_SERVICE_ROLE_KEY` to persist waitlist and partner applications. `PAYMENT_WEBHOOK_SECRET` enables webhook signature verification for the mock provider. Launch facts shown in the FAQ (`NEXT_PUBLIC_LAUNCH_REGIONS`, `NEXT_PUBLIC_LAUNCH_TIMING`, `NEXT_PUBLIC_ISSUER_NAME`) stay "to be confirmed" until set.

## Pickle Radar and Google Maps

Radar renders a real Google map when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local` (enable Maps JavaScript API, Places API (New) and Geocoding API for the key; set `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` for a styled map, otherwise `DEMO_MAP_ID` is used). Pins are the brand pickle PNG; the member's position is a pulsing dot. Location management: current location (every permission state explained), saved places (add by Places search, rename, remove, switch), distances and a Directions link. Without a key, or if tiles never load, Radar falls back to the illustrated south-Bali map with the same pins and location features (places can be added by coordinates). Demo partners are fictional but placed at real coordinates in Seminyak, Canggu, Ubud, Uluwatu, Nusa Dua, Sanur, Jimbaran and Kuta.

## Photography

`public/photos/*.jpg` are CC BY / CC0 photographs sourced through Openverse (Flickr). `lib/photos.ts` holds alt text, the credit each licence requires and the source page; the footer prints the credits automatically. Replace any file and update its entry to swap imagery; keep the credit line for CC BY images.

## Boundaries that are deliberate

- Pickle is never described as a bank; cards are described as issued by a licensed partner, subject to eligibility and availability.
- Every merchant, perk, transaction, balance, metric and plan is fictional and labelled as demo/sample in the UI.
- No valid card numbers anywhere. Card visuals carry masked references only.
- Perks are never granted from client-side claims; the webhook route is the only place they would be, from verified events.
- No issuer secrets reach the browser. The service-role Supabase client refuses to run client-side.
