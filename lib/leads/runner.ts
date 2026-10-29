import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { ACTIVE_STAGES, buildFastPlan, buildQueries, type CrmEntry, type LeadCategoryKey, type LeadsPayload, type Lead, type RunInfo, type ScrapeMode } from "./config";

// Pipeline for one scrape run, all on this machine:
//   1. scraping — gosom/google-maps-scraper in Docker. "fast" = fastscrape.py runs one -fast-mode
//      container per area x category (minutes); "deep" = one detached container that opens every
//      place page (hours; adds price band). Both outlive dev-server reloads.
//   2. emails   — emails2.py visits venue websites without an email (resumable cache)
//   3. scoring  — process.py merges every run into data/scrape/leads/
// Each status request advances the pipeline, so nothing depends on in-memory timers.

const run = promisify(execFile);
const ROOT = path.join(process.cwd(), "data", "scrape");
const RUNS_FILE = path.join(ROOT, "runs.json");
const LEADS_DIR = path.join(ROOT, "leads");
const CRM_FILE = path.join(LEADS_DIR, "crm.json");
const IMAGE = "gosom/google-maps-scraper:latest";
const PYTHON = process.env.LEADS_PYTHON ?? "python";

export const leadsEnabled = () => process.env.NODE_ENV !== "production" || process.env.LEADS_DASHBOARD === "1";

const g = globalThis as unknown as { __pickleLeadsBusy?: Set<string>; __pickleLeadsCount?: Map<string, { at: number; n: number }> };
const busy = (g.__pickleLeadsBusy ??= new Set());
const countCache = (g.__pickleLeadsCount ??= new Map());

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}
const writeJson = (file: string, v: unknown) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(v, null, 1));
};

export function listRuns(): RunInfo[] {
  return readJson<RunInfo[]>(RUNS_FILE, []);
}
function saveRun(r: RunInfo) {
  const runs = listRuns();
  const i = runs.findIndex((x) => x.id === r.id);
  if (i >= 0) runs[i] = r;
  else runs.unshift(r);
  writeJson(RUNS_FILE, runs);
}
const runDir = (r: RunInfo) => path.join(ROOT, r.dir);
const dockerPath = (p: string) => p.replace(/\\/g, "/");

async function containerRunning(name: string) {
  try {
    const { stdout } = await run("docker", ["inspect", "-f", "{{.State.Running}}", name]);
    return stdout.trim() === "true";
  } catch {
    return false; // removed (--rm) or never existed
  }
}
function pidAlive(pid?: number) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function lineCount(file: string) {
  try {
    const st = fs.statSync(file);
    const hit = countCache.get(file);
    if (hit && hit.at === st.mtimeMs) return hit.n;
    const n = fs.readFileSync(file, "utf8").split("\n").filter((l) => l.trim()).length;
    countCache.set(file, { at: st.mtimeMs, n });
    return n;
  } catch {
    return 0;
  }
}
async function scraperLog(r: RunInfo): Promise<string> {
  if (r.mode === "fast") {
    const f = path.join(runDir(r), "scrape.log");
    return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
  }
  const file = path.join(runDir(r), "run.log");
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  try {
    const { stdout, stderr } = await run("docker", ["logs", r.container], { maxBuffer: 64 * 1024 * 1024 });
    return stdout + stderr;
  } catch {
    return "";
  }
}
function summarise(line: string) {
  try {
    const j = JSON.parse(line) as { message?: string; job?: string; url?: string; error?: string; status?: string; time?: string };
    const t = j.time?.slice(11, 19) ?? "";
    const target = j.url ?? j.job?.match(/URL: ([^,]+)/)?.[1] ?? "";
    const pretty = decodeURIComponent(
      target.replace(/^https:\/\/www\.google\.com\/maps\/search\/([^?]+).*/, "search: $1").replace(/^https:\/\/www\.google\.com\/maps\/place\/([^/]+).*/, "place: $1").replace(/\?.*$/, "").replace(/\+/g, " "),
    );
    return `${t} ${j.message ?? ""}${j.error ? " (failed)" : ""} ${pretty}`.trim();
  } catch {
    return line.slice(0, 200);
  }
}

export async function startRun(opts: { mode: ScrapeMode; areas: string[]; categories: LeadCategoryKey[]; depth: number; custom: { query: string; category: LeadCategoryKey }[] }) {
  if (listRuns().some((r) => ACTIVE_STAGES.includes(r.stage))) throw new Error("A scrape is already running. Stop it or wait for it to finish.");
  const queries = buildQueries(opts.areas, opts.categories, opts.custom);
  if (!queries.length) throw new Error("Pick at least one area and category.");
  const id = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const r: RunInfo = {
    id, dir: path.join("runs", id), createdAt: new Date().toISOString(), areas: opts.areas, categories: opts.categories,
    depth: opts.depth, queryCount: queries.length, mode: opts.mode, container: `pickle-scrape-${id}`, stage: "scraping",
  };
  const dir = runDir(r);
  fs.mkdirSync(dir, { recursive: true });
  if (opts.mode === "fast") {
    const plan = buildFastPlan(opts.areas, opts.categories, opts.custom);
    r.queryCount = plan.reduce((n, j) => n + j.queries.length, 0);
    fs.writeFileSync(path.join(dir, "plan.json"), JSON.stringify(plan, null, 1));
    startFast(r);
  } else {
    fs.writeFileSync(path.join(dir, "queries.txt"), queries.join("\n") + "\n");
    // Emails are left to emails2.py: plain HTTP is far quicker than the scraper's browser email pass.
    await run("docker", [
      "run", "-d", "--name", r.container, "-v", `${dockerPath(dir)}:/w`, IMAGE,
      "-input", "/w/queries.txt", "-results", "/w/raw.json", "-json", "-depth", String(opts.depth),
      "-c", "8", "-exit-on-inactivity", "4m",
    ]);
  }
  saveRun(r);
  return r;
}

function startFast(r: RunInfo) {
  const dir = runDir(r);
  const out = fs.openSync(path.join(dir, "scrape.log"), "a");
  const child = spawn(PYTHON, ["-I", path.join(ROOT, "fastscrape.py"), dir, path.join(dir, "plan.json")], {
    detached: true, stdio: ["ignore", out, out], windowsHide: true, env: { ...process.env, PICKLE_DEPTH: String(Math.min(r.depth, 4)) },
  });
  child.unref();
  r.scrapePid = child.pid;
}

async function scrapeRunning(r: RunInfo) {
  if (r.mode !== "fast") return containerRunning(r.container);
  if (pidAlive(r.scrapePid)) return true;
  const last = (await scraperLog(r)).trim().split("\n").pop() ?? "";
  if (/ done$/.test(last)) return false;
  r.restarts = (r.restarts ?? 0) + 1;
  if (r.restarts > 5) throw new Error("The scrape driver keeps crashing; see scrape.log in the run folder.");
  startFast(r); // driver died with the dev server: resume, finished jobs are skipped
  return true;
}

export async function stopRun(id: string) {
  const r = listRuns().find((x) => x.id === id);
  if (!r) throw new Error("Unknown run");
  if (r.scrapePid && pidAlive(r.scrapePid)) process.kill(r.scrapePid);
  const { stdout } = await run("docker", ["ps", "-q", "--filter", `name=${r.container}`]).catch(() => ({ stdout: "" }));
  const ids = stdout.split(/\s+/).filter(Boolean);
  if (ids.length) await run("docker", ["stop", ...ids]).catch(() => undefined);
  if (r.emailsPid && pidAlive(r.emailsPid)) process.kill(r.emailsPid);
  r.stage = "stopped";
  r.finishedAt = new Date().toISOString();
  saveRun(r);
  return r;
}

/** Continue a stopped/failed run from its emails stage with whatever was scraped. */
export function resumeRun(id: string) {
  const r = listRuns().find((x) => x.id === id);
  if (!r) throw new Error("Unknown run");
  if (ACTIVE_STAGES.includes(r.stage)) return r;
  if (listRuns().some((x) => x.id !== id && ACTIVE_STAGES.includes(x.stage))) throw new Error("Another run is active.");
  r.stage = "emails";
  r.error = undefined;
  r.emailsPid = undefined;
  r.restarts = 0;
  saveRun(r);
  return r;
}

async function saveLogsAndRemove(r: RunInfo) {
  if (r.mode === "fast") return;
  const file = path.join(runDir(r), "run.log");
  if (!fs.existsSync(file)) {
    const log = await scraperLog(r);
    if (log) fs.writeFileSync(file, log);
  }
  await run("docker", ["rm", r.container]).catch(() => undefined);
}

function startEmails(r: RunInfo) {
  const dir = runDir(r);
  const out = fs.openSync(path.join(dir, "emails.log"), "a");
  const child = spawn(PYTHON, ["-I", path.join(ROOT, "emails2.py"), path.join(dir, "raw.json"), path.join(dir, "emails2.json")], {
    detached: true, stdio: ["ignore", out, out], windowsHide: true,
  });
  child.unref();
  r.emailsPid = child.pid;
}

export async function rebuildLeads() {
  // Oldest first: process.py keeps the first record per place, and fast mode's "main" category is just
  // whatever Google lists first for that search, so a narrow later run must not override a broad one.
  const runs = listRuns().filter((r) => fs.existsSync(path.join(runDir(r), "raw.json"))).reverse();
  if (!runs.length) throw new Error("No scraped data yet.");
  const raws = runs.map((r) => path.join(runDir(r), "raw.json")).join(",");
  const caches = runs.map((r) => path.join(runDir(r), "emails2.json")).join(",");
  const { stdout } = await run(PYTHON, ["-I", path.join(ROOT, "process.py"), raws, caches, LEADS_DIR], { maxBuffer: 16 * 1024 * 1024 });
  return stdout;
}

/** Advance the active run one step and attach live counters. Safe to call repeatedly. */
export async function tick(): Promise<RunInfo[]> {
  const runs = listRuns();
  for (const r of runs) {
    if (!ACTIVE_STAGES.includes(r.stage) || busy.has(r.id)) continue;
    busy.add(r.id);
    try {
      if (r.stage === "scraping" && !(await scrapeRunning(r))) {
        await saveLogsAndRemove(r);
        r.stage = "emails";
      }
      if (r.stage === "emails" && !pidAlive(r.emailsPid)) {
        const log = fs.existsSync(path.join(runDir(r), "emails.log")) ? fs.readFileSync(path.join(runDir(r), "emails.log"), "utf8") : "";
        if (r.emailsPid && /\ndone \d+|^done \d+/m.test(log)) r.stage = "scoring";
        else if (!fs.existsSync(path.join(runDir(r), "raw.json"))) {
          r.stage = "failed";
          r.error = "The scraper produced no results file.";
        } else {
          if (r.emailsPid) r.restarts = (r.restarts ?? 0) + 1;
          if ((r.restarts ?? 0) > 5) throw new Error("The email crawler keeps crashing; see emails.log in the run folder.");
          startEmails(r); // first start, or resume after a dev-server restart
        }
      }
      if (r.stage === "scoring") {
        await rebuildLeads();
        r.stage = "done";
        r.finishedAt = new Date().toISOString();
      }
    } catch (e) {
      r.stage = "failed";
      r.error = e instanceof Error ? e.message.slice(0, 500) : String(e);
    } finally {
      busy.delete(r.id);
      saveRun(r);
    }
  }
  // live counters
  const out: RunInfo[] = [];
  for (const r of listRuns()) {
    const dir = runDir(r);
    const info: RunInfo = { ...r, placesScraped: lineCount(path.join(dir, "raw.json")) };
    if (r.stage === "scraping" || r.id === runs.find((x) => ACTIVE_STAGES.includes(x.stage))?.id) {
      const log = await scraperLog(r);
      const lines = log.split("\n").filter(Boolean);
      const fast = [...log.matchAll(/search (\d+) \/ (\d+)/g)].pop();
      info.searchesDone = r.mode === "fast" ? Number(fast?.[1] ?? 0) : lines.filter((l) => l.includes("places found")).length;
      info.logTail = lines.slice(-8).map(summarise);
    }
    const elog = path.join(dir, "emails.log");
    if (fs.existsSync(elog)) {
      const m = [...fs.readFileSync(elog, "utf8").matchAll(/^(\d+) \/ (\d+)/gm)].pop();
      if (m) {
        info.emailsChecked = Number(m[1]);
        info.emailsTotal = Number(m[2]);
      }
      if (r.stage === "emails") info.logTail = fs.readFileSync(elog, "utf8").trim().split("\n").slice(-4).map((l) => `emails: ${l}`);
    }
    out.push(info);
  }
  return out;
}

// ---- leads + CRM ------------------------------------------------------------------------

export function readLeads(): LeadsPayload {
  const file = path.join(LEADS_DIR, "pickle_bali_venues.json");
  const data = readJson<{ rows: Lead[]; dropped: Record<string, number>; scraped_unique: number } | null>(file, null);
  const crm = readJson<Record<string, CrmEntry>>(CRM_FILE, {});
  if (!data) return { leads: [], generatedAt: null, scrapedUnique: 0, dropped: {} };
  return {
    leads: data.rows.map((l) => ({ ...l, crm: crm[l.place_id] ?? { status: "new", notes: "", updatedAt: "" } })),
    generatedAt: fs.statSync(file).mtime.toISOString(),
    scrapedUnique: data.scraped_unique,
    dropped: data.dropped,
  };
}

export function updateCrm(placeId: string, patch: Partial<Pick<CrmEntry, "status" | "notes">>) {
  const crm = readJson<Record<string, CrmEntry>>(CRM_FILE, {});
  const cur = crm[placeId] ?? { status: "new", notes: "", updatedAt: "" };
  crm[placeId] = { ...cur, ...patch, updatedAt: new Date().toISOString() };
  writeJson(CRM_FILE, crm);
  return crm[placeId];
}

export function leadsCsv() {
  const { leads } = readLeads();
  const cols = ["overall_rank", "name", "pickle_category", "category_rank", "popularity_score", "popularity_tier", "rating", "reviews", "area",
    "emails", "email_source", "phone", "website", "price_tier", "price_tier_basis", "est_ticket_idr", "proposed_offer",
    "est_member_saving_per_visit_idr", "est_member_saving_per_month_idr", "pickle_value_score", "signing_priority",
    "google_categories", "address", "google_maps"] as const;
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = [...cols, "crm_status", "crm_notes"].join(",");
  const body = leads.map((l) => [...cols.map((c) => esc(l[c])), esc(l.crm.status), esc(l.crm.notes)].join(","));
  return "﻿" + [head, ...body].join("\n");
}
