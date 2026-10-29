import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = process.cwd();

function tryFiles(base) {
  for (const c of [base, base + ".ts", base + ".tsx", path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
    if (existsSync(c) && !isDir(c)) return c;
  }
  return null;
}
function isDir(p) {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const hit = tryFiles(path.join(ROOT, specifier.slice(2)));
    if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
  }
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:") && !/\.[a-z]+$/.test(specifier)) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const hit = tryFiles(path.resolve(parentDir, specifier));
    if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
  }
  return next(specifier, context);
}
