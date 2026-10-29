// Test-time module resolution: maps the "@/..." alias to the project root and
// adds .ts/.tsx extensions so Node's native type stripping can run the libs.
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register(new URL("./_resolver.mjs", import.meta.url), { parentURL: pathToFileURL(process.cwd() + "/") });
