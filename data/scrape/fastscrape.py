"""Fast discovery driver: runs gosom/google-maps-scraper in -fast-mode once per (area, category),
centred on the area, and appends normalised records to <run_dir>/raw.json (JSON lines).
Fast mode reads the Maps results list directly (rating, reviews, website, phone, categories),
so a whole island takes minutes; emails come afterwards from emails2.py.
Usage: python -I fastscrape.py <run_dir> <plan.json>
plan.json: [{"area": str, "lat": float, "lng": float, "zoom": int, "radius": int, "category": str, "queries": [str]}]
"""
import json, os, subprocess, sys, time

RUN_DIR, PLAN = sys.argv[1], sys.argv[2]
IMAGE = "gosom/google-maps-scraper:latest"
RUN_ID = os.path.basename(os.path.normpath(RUN_DIR))
plan = json.load(open(PLAN, encoding="utf8"))
depth = int(os.environ.get("PICKLE_DEPTH", "2"))
done_file = os.path.join(RUN_DIR, "fast_done.json")
done = set(json.load(open(done_file))) if os.path.exists(done_file) else set()
raw = open(os.path.join(RUN_DIR, "raw.json"), "a", encoding="utf8")
total = sum(len(j["queries"]) for j in plan)
n = sum(len(j["queries"]) for i, j in enumerate(plan) if str(i) in done)


def log(msg):
    print(time.strftime("%H:%M:%S"), msg, flush=True)


def cid_from(data_id):
    try:
        return str(int(data_id.split(":")[1], 16))
    except Exception:
        return ""


for i, job in enumerate(plan):
    if str(i) in done:
        continue
    work = os.path.join(RUN_DIR, "fast", str(i))
    os.makedirs(work, exist_ok=True)
    with open(os.path.join(work, "q.txt"), "w", encoding="utf8") as f:
        f.write("\n".join(job["queries"]) + "\n")
    out = os.path.join(work, "out.json")
    if os.path.exists(out):
        os.remove(out)
    vol = os.path.abspath(work).replace("\\", "/")
    name = f"pickle-scrape-{RUN_ID}-{i}"
    cmd = ["docker", "run", "--rm", "--name", name, "-v", f"{vol}:/w", IMAGE,
           "-input", "/w/q.txt", "-results", "/w/out.json", "-json", "-fast-mode",
           "-geo", f"{job['lat']},{job['lng']}", "-zoom", str(job.get("zoom", 14)),
           "-radius", str(job.get("radius", 5000)), "-depth", str(depth), "-c", "4", "-exit-on-inactivity", "1m"]
    t0 = time.time()
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf8", errors="replace")
    items = []
    if os.path.exists(out):
        txt = open(out, encoding="utf8").read().strip()
        try:
            # one JSON value per line: an array per query, or single records
            for l in txt.splitlines():
                if l.strip():
                    v = json.loads(l)
                    items += v if isinstance(v, list) else [v]
        except Exception as e:
            log(f"could not parse results for {job['area']} / {job['category']}: {e}")
    for d in items:
        if not isinstance(d, dict):
            continue
        pid = d.get("place_id") or d.get("data_id")
        if not pid:
            continue
        cid = d.get("cid") or cid_from(d.get("data_id", ""))
        d["place_id"] = pid
        d["cid"] = cid
        d["input_id"] = job["category"]
        d["category"] = d.get("category") or (d.get("categories") or [""])[0]
        if not d.get("link") and cid:
            d["link"] = f"https://maps.google.com/?cid={cid}"
        ca = d.get("complete_address") or {}
        if not ca.get("borough"):
            ca["borough"] = job["area"]
            d["complete_address"] = ca
        d.pop("user_reviews", None)
        d.pop("user_reviews_extended", None)
        raw.write(json.dumps(d, ensure_ascii=False) + "\n")
    raw.flush()
    n += len(job["queries"])
    done.add(str(i))
    json.dump(sorted(done), open(done_file, "w"))
    # same wording the dashboard counts for the deep scraper
    log(f"search {n} / {total} - {job['area']} - {job['category']} - {len(items)} places found in {time.time() - t0:.0f}s"
        + ("" if res.returncode == 0 else f" (exit {res.returncode})"))

log("done")
