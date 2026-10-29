"""Build the Pickle Bali partner list from raw scrape output.
Facts (name, rating, reviews, website, phone, emails, Google price band) come only from the scrape.
Prices and offer values are a MODEL, labelled as estimates in every output column.
Usage: python -I process.py <raw.jsonl[,raw2.jsonl...]> <emails2.json[,...]> <out_dir>
Several runs can be merged; duplicates collapse on Google place_id.
"""
import json, math, re, sys, csv, os
from collections import defaultdict

RAW, CACHE, OUT = sys.argv[1], sys.argv[2], sys.argv[3]

CATS = {
    "pool_beach": "Pool & Beach", "bars_clubs": "Bars & Clubs", "dining": "Dining",
    "family": "Family", "spa_fitness": "Spa & Fitness",
}
# Google category substrings that prove a venue belongs to a Pickle category.
FIT = {
    "pool_beach": ["beach club", "resort hotel", "swimming pool", "beach pavillion", "pool", "hotel", "resort"],
    "bars_clubs": ["bar", "pub", "night club", "disco", "lounge", "brewpub", "brewery", "beer", "speakeasy"],
    "dining": ["restaurant", "cafe", "café", "coffee", "bistro", "steak", "brunch", "bakery", "eatery", "warung", "diner"],
    "family": ["water park", "zoo", "amusement", "theme park", "wildlife", "aquarium", "playground", "children",
               "kids", "family", "safari", "adventure", "bird park", "animal park", "tourist attraction", "farm",
               "indoor playground", "entertainment"],
    "spa_fitness": ["spa", "massage", "gym", "fitness", "yoga", "pilates", "wellness", "sauna", "health club",
                    "boxing", "crossfit", "martial arts", "muay thai", "reflexology", "beauty salon", "bath"],
}
MIN_REVIEWS = {"pool_beach": 200, "bars_clubs": 200, "dining": 300, "family": 150, "spa_fitness": 100}
MIN_RATING = 4.2
LUXURY = ["four seasons", "bulgari", "bvlgari", "ritz", "mulia", "como ", "six senses", "alila", "raffles",
          "st. regis", "st regis", "ayana", "mandapa", "capella", "regent", "w bali", "aman", "hanging gardens",
          "the edition", "edition", "fairmont", "conrad", "intercontinental", "kempinski", "park hyatt",
          "jumeirah", "anantara", "the legian", "oberoi", "viceroy", "maya ubud", "apurva", "potato head",
          "desa potato", "ku de ta", "kudeta", "sundays beach", "el kabron", "rock bar", "locavore", "mozaic",
          "sarong", "merah putih", "sakala", "kaum"]

# --- Price model (IDR, per person, estimate) -----------------------------------------------
# Typical Bali spend by category and venue tier. These are planning assumptions, not quotes;
# replace with the venue's own price list once a partnership conversation starts.
PRICE = {
    "pool_beach":  {"value": 300_000, "mid": 600_000, "premium": 1_200_000},   # day-bed / pool min spend
    "bars_clubs":  {"value": 90_000,  "mid": 150_000, "premium": 250_000},     # one cocktail
    "dining":      {"value": 150_000, "mid": 300_000, "premium": 900_000},     # one person's meal
    "family":      {"value": 150_000, "mid": 350_000, "premium": 550_000},     # one admission / kids activity
    "spa_fitness": {"value": 200_000, "mid": 500_000, "premium": 1_600_000},   # 60-min massage or class/day pass
}
FITNESS_WORDS = ["gym", "fitness", "yoga", "pilates", "crossfit", "boxing", "martial", "muay"]
FITNESS_PRICE = {"value": 120_000, "mid": 200_000, "premium": 350_000}    # drop-in / day pass

# Offer playbook: (offer, how member value is computed). Hotter venues need Pickle less, so they
# are asked for lighter offers; quieter venues get bigger offers in exchange for traffic.
OFFERS = {
    "pool_beach": {
        "A": ("Priority day-bed booking + 15% off F&B min spend", lambda p: 0.15 * p),
        "B": ("Free entry with min spend credited back 50%", lambda p: 0.50 * p),
        "C": ("Free pool / day-bed access (no min spend, weekdays)", lambda p: 1.00 * p),
    },
    "bars_clubs": {
        "A": ("Free entry / guest-list + welcome drink", lambda p: 1.0 * p),
        "B": ("2-for-1 cocktails, one round per visit", lambda p: 1.0 * p),
        "C": ("2-for-1 cocktails all night (cap 3 rounds) + reserved table", lambda p: 3.0 * p),
    },
    "dining": {
        "A": ("Guaranteed table + 15% off food", lambda p: 0.15 * p * 2),
        "B": ("2-for-1 main course (2 diners)", lambda p: 0.5 * p),
        "C": ("2-for-1 on the full food bill (2 diners)", lambda p: 1.0 * p),
    },
    "family": {
        "A": ("Kids enter free with paying adult", lambda p: 0.7 * p),
        "B": ("Kids free + 15% off adult tickets", lambda p: 0.7 * p + 0.15 * p),
        "C": ("2-for-1 admission for the whole family", lambda p: 2.0 * p),
    },
    "spa_fitness": {
        "A": ("20% off treatments / first class free", lambda p: 0.20 * p),
        "B": ("2-for-1 treatment or 5-class pack bonus", lambda p: 0.5 * p),
        "C": ("2-for-1 treatments / free day pass", lambda p: 1.0 * p),
    },
}
VISITS_PER_MONTH = {"pool_beach": 2, "bars_clubs": 3, "dining": 4, "family": 1, "spa_fitness": 2}


# Places nobody can sign a partnership for (public land, transport, worship) or that are not venues.
NOT_A_VENUE = re.compile(r"^(beach|public beach|airport|international airport|hindu temple|temple|buddhist temple|church|mosque|"
                         r"natural feature|monument|national park|park|scenic spot|observation deck|hiking area|waterfall|"
                         r"rice field|lake|island|bus stop|parking lot|shopping mall|hotel management|villa|vacation home rental agency)$")
WORD_BAR = re.compile(r"(?<![a-z])(bar|pub|lounge|night club|disco club|speakeasy|brewpub)(?![a-z])")


def fit_categories(gcats):
    low = " | ".join(gcats).lower()
    fits = {c for c, words in FIT.items() if c != "bars_clubs" and any(w in low for w in words)}
    # "bar" must be a whole word, and a bar & grill is a restaurant first.
    if any(WORD_BAR.search(g.lower()) and "bar & grill" not in g.lower() for g in gcats):
        fits.add("bars_clubs")
    return fits


def parse_price_band(s):
    """Google price band -> tier. Returns None when Google shows none."""
    if not s:
        return None
    s2 = s.replace(" ", "")
    if re.fullmatch(r"\$+|Rp+", s2):
        n = s2.count("$") or s2.count("p")
        return "value" if n <= 1 else "mid" if n == 2 else "premium"
    nums = [float(x.replace(",", ".")) for x in re.findall(r"(\d+(?:[.,]\d+)?)", s2)]
    if not nums:
        return None
    mult = 1_000_000 if re.search(r"(jt|M|juta)", s2) else 1000 if re.search(r"(K|rb|ribu)", s2, re.I) else 1
    hi = max(nums) * mult
    return "value" if hi <= 150_000 else "mid" if hi <= 400_000 else "premium"


def tier_for(p, cat):
    band = parse_price_band(p.get("price_range", ""))
    if band:
        return band, "Google price band"
    low = (p["title"] + " " + p.get("web_site", "")).lower()
    gc = " ".join(p.get("categories") or []).lower()
    if any(k in low for k in LUXURY) or "fine dining" in gc or "resort hotel" in gc and "5" in str(p.get("about")):
        return "premium", "estimate: luxury brand / fine-dining"
    if p["review_count"] >= 3000 or any(k in gc for k in ["beach club", "cocktail bar", "night club", "day spa"]):
        return "mid", "estimate: category & scale"
    return "value", "estimate: default"


AREAS = ["Seminyak", "Canggu", "Pererenan", "Berawa", "Uluwatu", "Ubud", "Kuta", "Legian", "Nusa Dua",
         "Jimbaran", "Sanur", "Nusa Penida", "Pecatu", "Ungasan", "Bingin", "Tanjung Benoa", "Denpasar", "Tabanan",
         "Gianyar", "Kerobokan", "Umalas", "Seseh", "Nusa Lembongan", "Amed", "Lovina", "Munduk", "Sidemen"]
AREA_ALIAS = {"Pecatu": "Uluwatu", "Ungasan": "Uluwatu", "Bingin": "Uluwatu", "Tanjung Benoa": "Nusa Dua",
              "Kerobokan": "Seminyak", "Umalas": "Seminyak", "Seseh": "Pererenan"}


def area_of(p):
    """One consistent area name: Berawa/Pererenan before Canggu, Legian before Kuta, etc."""
    text = " ".join([(p.get("complete_address") or {}).get("borough") or "", p.get("address") or ""])
    hits = [(text.find(a), a) for a in AREAS if a in text]
    if not hits:
        return ((p.get("complete_address") or {}).get("borough") or "").split(",")[0].strip()
    name = min(hits)[1]
    return AREA_ALIAS.get(name, name)


def popularity(rating, reviews):
    # Bayesian-shrunk rating x review volume (log). Shrinks small-sample 5.0s toward Bali mean.
    m, c = 150, 4.4
    shrunk = (reviews * rating + m * c) / (reviews + m)
    return (shrunk - 3.5) * math.log10(reviews + 1)


def main():
    places = {}
    lines = []
    for path in RAW.split(","):
        if os.path.exists(path):
            lines += open(path, encoding="utf8").read().splitlines()
    for line in lines:
        line = line.strip()
        if not line:
            continue
        d = json.loads(line)
        pid = d.get("data_id") or d.get("place_id") or d.get("cid")  # data_id is stable across fast/deep modes
        cat = d.get("input_id")
        if pid in places:
            places[pid]["_queries"].add(cat)
            places[pid]["emails"] = sorted(set(places[pid].get("emails") or []) | set(d.get("emails") or []))
            continue
        d["_queries"] = {cat}
        places[pid] = d
    cache = {}
    for path in CACHE.split(","):
        if os.path.exists(path):
            cache.update(json.load(open(path, encoding="utf8")))

    rows, dropped = [], defaultdict(int)
    for pid, p in places.items():
        addr = (p.get("address") or "") + json.dumps(p.get("complete_address") or {})
        if "Bali" not in addr:
            dropped["outside Bali"] += 1; continue
        if "closed" in (p.get("status") or "").lower():
            dropped["closed"] += 1; continue
        gc = p.get("categories") or [p.get("category") or ""]
        main_cat, title_l = (p.get("category") or gc[0] or "").lower().strip(), p["title"].lower()
        public_spot = main_cat == "tourist attraction" and (not p.get("web_site") or re.search(r"(beach|pantai|island|waterblow|pura|temple)", title_l))
        if NOT_A_VENUE.match(main_cat) or public_spot or re.search(r"airport|bandar udara", title_l):
            dropped["not a partner venue (public place, transport, lodging-only)"] += 1; continue
        fits = fit_categories(gc) - {"pool_beach"}
        gl, nl = " ".join(gc).lower(), p["title"].lower()
        if any(w in gl for w in ["beach club", "swimming pool", "pool"]) or "beach" in nl or "pool" in nl or \
                ("pool_beach" in p["_queries"] and any(w in gl for w in ["hotel", "resort"])):
            fits.add("pool_beach")
        # A generic tourist attraction only counts as Family when a family query found it.
        if "family" in fits and "family" not in p["_queries"] and \
                not any(w in gl for w in ["water park", "zoo", "amusement", "theme park", "playground", "safari"]):
            fits.discard("family")
        # Family restaurants count as Family only when Google marks them good for kids.
        about = json.dumps(p.get("about") or []).lower()
        if "family" in p["_queries"] and "family" not in fits and \
                re.search(r'"good for kids", "enabled": true|"kids\' menu", "enabled": true', about):
            fits.add("family")
        if not fits:
            dropped["off-category"] += 1; continue
        # Primary category: the one Google's main category matches, else first fit.
        main_fit = fit_categories([p.get("category") or ""]) & fits
        if "pool_beach" in fits and ("beach club" in gl or "beach club" in nl):
            main_fit = {"pool_beach"}
        primary = sorted(main_fit or fits, key=list(CATS).index)[0]
        rating, reviews = p.get("review_rating") or 0, p.get("review_count") or 0
        if reviews < MIN_REVIEWS[primary] or rating < MIN_RATING:
            dropped["below popularity bar"] += 1; continue

        emails = list(p.get("emails") or [])
        email_src = "venue homepage (scraper)" if emails else ""
        c2 = cache.get(pid)
        if c2 and c2.get("emails"):
            for e in c2["emails"]:
                if e not in emails:
                    emails.append(e)
            email_src = email_src or ("venue site: " + next(iter(c2.get("sources", {}).values()), ""))
        emails = [m.lower() for e in emails for m in re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}", e)
                  if not re.search(r"(user@domain|example\.|wixpress|sentry|\.(png|jpe?g|webp|gif|svg)$)", m, re.I)]
        emails = list(dict.fromkeys(emails))

        tier, tier_basis = tier_for(p, primary)
        is_fit = primary == "spa_fitness" and any(w in " ".join(gc).lower() for w in FITNESS_WORDS) \
            and not any(w in " ".join(gc).lower() for w in ["spa", "massage"])
        price = (FITNESS_PRICE if is_fit else PRICE[primary])[tier]
        rows.append({
            "place_id": pid, "name": p["title"], "pickle_category": CATS[primary],
            "also_fits": ", ".join(CATS[c] for c in sorted(fits - {primary}, key=list(CATS).index)),
            "google_category": p.get("category"), "google_categories": ", ".join(gc),
            "area": area_of(p),
            "address": p.get("address"), "lat": p.get("latitude"), "lng": p.get("longitude") or p.get("longtitude"),
            "rating": rating, "reviews": reviews, "_pop_raw": popularity(rating, reviews),
            "emails": "; ".join(emails), "email_source": email_src if emails else
                ((c2 or {}).get("note") or ("no website listed" if not p.get("web_site") else "not crawled")),
            "phone": p.get("phone"), "website": p.get("web_site"), "google_maps": p.get("link"),
            "google_price_band": p.get("price_range") or "",
            "price_tier": tier, "price_tier_basis": tier_basis, "_is_fitness": is_fit,
            "est_ticket_idr": price,
        })

    # Popularity score 0-100 = percentile within the Pickle category; tier A top 20%, B next 40%.
    by = defaultdict(list)
    for r in rows:
        by[r["pickle_category"]].append(r)
    for cat, rs in by.items():
        rs.sort(key=lambda r: -r["_pop_raw"])
        n = len(rs)
        for i, r in enumerate(rs):
            r["category_rank"] = i + 1
            r["popularity_score"] = round(100 * (1 - i / max(n - 1, 1)), 1)
            r["popularity_tier"] = "A" if i < 0.2 * n else "B" if i < 0.6 * n else "C"
    top = max(r["_pop_raw"] for r in rows)
    for r in rows:
        r["popularity_index_all"] = round(100 * r["_pop_raw"] / top, 1)
        key = [k for k, v in CATS.items() if v == r["pickle_category"]][0]
        offer, fn = OFFERS[key][r["popularity_tier"]]
        if r["_is_fitness"]:
            offer = {"A": "First class free + 15% off packs", "B": "Free day pass monthly",
                     "C": "2 free day passes / classes monthly"}[r["popularity_tier"]]
            v = {"A": 1.0, "B": 1.0, "C": 2.0}[r["popularity_tier"]] * r["est_ticket_idr"]
        else:
            v = fn(r["est_ticket_idr"])
        r["proposed_offer"] = offer
        r["est_member_saving_per_visit_idr"] = int(round(v, -3))
        r["est_member_saving_per_month_idr"] = int(round(v * VISITS_PER_MONTH[key], -3))
        # Pickle value score: how much a venue lifts the membership = popularity x saving (both normalised).
        r["_v"] = v
    vmax = max(r["_v"] for r in rows)
    for r in rows:
        r["pickle_value_score"] = round(0.6 * r["popularity_index_all"] + 40 * math.sqrt(r["_v"] / vmax), 1)
        r["signing_priority"] = ("1 - Anchor (sign first)" if r["popularity_tier"] == "A" else
                                 "2 - Core" if r["popularity_tier"] == "B" else "3 - Fill / value")
    rows.sort(key=lambda r: -r["pickle_value_score"])
    for i, r in enumerate(rows):
        r["overall_rank"] = i + 1

    cols = ["overall_rank", "name", "pickle_category", "category_rank", "popularity_score", "popularity_tier",
            "popularity_index_all", "rating", "reviews", "area", "emails", "email_source", "phone", "website",
            "price_tier", "price_tier_basis", "google_price_band", "est_ticket_idr", "proposed_offer",
            "est_member_saving_per_visit_idr", "est_member_saving_per_month_idr", "pickle_value_score",
            "signing_priority", "also_fits", "google_category", "google_categories", "address", "lat", "lng",
            "google_maps", "place_id"]
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "pickle_bali_venues.csv"), "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader(); w.writerows(rows)
    json.dump({"rows": [{k: r[k] for k in cols} for r in rows], "dropped": dropped,
               "scraped_unique": len(places)}, open(os.path.join(OUT, "pickle_bali_venues.json"), "w", encoding="utf8"),
              ensure_ascii=False, indent=1)
    print("unique scraped", len(places), "kept", len(rows), "dropped", dict(dropped))
    for c in CATS.values():
        rs = by.get(c, [])
        print(f"  {c}: {len(rs)} venues, {sum(1 for r in rs if r['emails'])} with email")


if __name__ == "__main__":
    main()
