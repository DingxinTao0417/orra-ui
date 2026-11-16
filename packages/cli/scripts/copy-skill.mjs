// Bundles the agent skill into the CLI package so `orra-ui skill` works offline.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.resolve(pkg, "../../skills/orra-ui");
const dest = path.join(pkg, "skill");
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
if (!fs.existsSync(path.join(pkg, "registry.json"))) {
  console.error("registry.json missing — run `pnpm registry` at the repo root first.");
  process.exit(1);
}
console.log("[cli] skill copied");
