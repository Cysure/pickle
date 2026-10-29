"""Second-pass email finder: visits each venue's own website (homepage + contact/about/
reservation pages) and collects only emails actually present in the HTML. Nothing guessed.
Usage: python -I emails2.py <raw.jsonl from the maps scraper> <cache.json>
Only places with a website and no email from the first pass are visited.
"""
import json, re, sys, concurrent.futures as cf
from urllib.parse import urljoin, urlparse
import gzip, ssl, urllib.request

EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}")
JUNK_DOMAINS = ("sentry", "wixpress", "example.", "domain.com", "email.com", "yourdomain", "godaddy",
                "squarespace", "wordpress", "schema.org", "w3.org", "mysite", "website.com", "sentry.io")
JUNK_EXT = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js")
SKIP_HOSTS = ("instagram.com", "facebook.com", "wa.me", "whatsapp.com", "tiktok.com", "google.com",
              "booking.com", "tripadvisor", "agoda", "traveloka", "airbnb", "expedia", "hotels.com")
KEYS = ("contact", "about", "reserv", "book", "enquir", "inquir", "kontak", "hubungi", "event", "partner")
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36"}


def cf_decode(hexstr):
    k = int(hexstr[:2], 16)
    return "".join(chr(int(hexstr[i:i + 2], 16) ^ k) for i in range(2, len(hexstr), 2))


def clean(emails):
    out = []
    for e in emails:
        e = e.strip(".").lower()
        if e.endswith(JUNK_EXT) or any(j in e for j in JUNK_DOMAINS) or len(e) > 80:
            continue
        if re.match(r"^[0-9a-f]{20,}@", e):
            continue
        if e not in out:
            out.append(e)
    return out


def extract(html):
    found = EMAIL.findall(html)
    found += [cf_decode(h) for h in re.findall(r'data-cfemail="([0-9a-f]+)"', html)]
    found += re.findall(r"mailto:([^\"'?>\s]+)", html)
    return found


CTX = ssl.create_default_context()
CTX_LAX = ssl._create_unverified_context()  # some venue sites ship broken chains; we only read public HTML


def get(url, lax=False):
    try:
        req = urllib.request.Request(url, headers={**UA, "Accept-Encoding": "gzip"})
        with urllib.request.urlopen(req, timeout=15, context=CTX_LAX if lax else CTX) as r:
            if "html" not in (r.headers.get("content-type") or "html"):
                return "", url
            body = r.read(3_000_000)
            if r.headers.get("content-encoding") == "gzip":
                body = gzip.decompress(body)
            charset = r.headers.get_content_charset() or "utf-8"
            return body.decode(charset, errors="replace"), r.geturl()
    except ssl.SSLError:
        return ("", url) if lax else get(url, lax=True)
    except Exception as e:
        if not lax and "CERTIFICATE" in str(e).upper():
            return get(url, lax=True)
    return "", url


def crawl(site, _root_tried=False):
    host = urlparse(site).netloc.lower()
    if not host or any(s in host for s in SKIP_HOSTS):
        return {"emails": [], "pages": [], "note": "website is social/OTA page, not crawled"}
    html, final = get(site)
    if not html:
        return {"emails": [], "pages": [], "note": "website unreachable"}
    emails, pages = [(e, final) for e in extract(html)], [final]
    links = []
    for href in re.findall(r'href="([^"#]+)"', html):
        u = urljoin(final, href)
        if urlparse(u).netloc.split(":")[0].endswith(urlparse(final).netloc.replace("www.", "")) and \
                any(k in u.lower() for k in KEYS) and u not in links:
            links.append(u)
    for u in links[:5]:
        h, f = get(u)
        if h:
            pages.append(f)
            emails += [(e, f) for e in extract(h)]
    good = clean([e for e, _ in emails])
    # bookings.venue.com / venue.com/some-outlet: the main site usually carries the contact address.
    parts = host.split(":")[0].split(".")
    root = ".".join(parts[-3:] if parts[-1] == "id" and parts[-2] in ("co", "or", "web") else parts[-2:])
    if not good and not _root_tried and (host.replace("www.", "") != root or urlparse(site).path.strip("/")):
        alt = crawl(f"https://{root}/", _root_tried=True)
        if alt.get("emails"):
            return alt
    src = {}
    for e, f in emails:
        e2 = e.strip(".").lower()
        if e2 in good and e2 not in src:
            src[e2] = f
    return {"emails": good, "sources": src, "pages": pages, "note": "" if good else "no email published on site"}


if __name__ == "__main__":
    items, seen = [], set()
    for line in open(sys.argv[1], encoding="utf8"):
        line = line.strip()
        if not line:
            continue
        d = json.loads(line)
        pid = d.get("data_id") or d.get("place_id") or d.get("cid")  # data_id is stable across fast/deep modes
        if pid in seen or d.get("emails") or not d.get("web_site"):
            continue
        seen.add(pid)
        items.append({"place_id": pid, "web_site": d["web_site"]})
    try:
        cache = json.load(open(sys.argv[2], encoding="utf8"))
    except FileNotFoundError:
        cache = {}
    retry = "--retry-empty" in sys.argv
    todo = [i for i in items if i["place_id"] not in cache or (retry and not cache[i["place_id"]].get("emails"))]
    with cf.ThreadPoolExecutor(16) as ex:
        futs = {ex.submit(crawl, i["web_site"]): i["place_id"] for i in todo}
        for n, f in enumerate(cf.as_completed(futs)):
            cache[futs[f]] = f.result()
            if n % 25 == 0:
                json.dump(cache, open(sys.argv[2], "w", encoding="utf8"))
                print(n, "/", len(todo), flush=True)
    json.dump(cache, open(sys.argv[2], "w", encoding="utf8"))
    print("done", len(cache))
