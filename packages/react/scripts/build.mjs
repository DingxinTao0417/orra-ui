// Build: tsc (per-file ESM + .d.ts, keeps "use client" directives), then add
// explicit .js extensions to relative imports and copy the CSS.
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const dist = path.join(root, "dist");
// Build into a temp dir and swap it in, so a running dev server never sees dist/ missing.
const tmp = path.join(root, ".dist-tmp");
const watch = process.argv.includes("--watch");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function resolveSpecifier(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  if (fs.existsSync(base + ".js") || fs.existsSync(base + ".d.ts")) return spec + ".js";
  if (fs.existsSync(path.join(base, "index.js")) || fs.existsSync(path.join(base, "index.d.ts"))) return spec + "/index.js";
  return spec;
}

function fixExtensions(out) {
  for (const file of walk(out)) {
    if (!/\.(js|d\.ts)$/.test(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    const next = text.replace(/((?:from|import)\s*\(?\s*)(["'])(\.{1,2}\/[^"']+)\2/g, (all, pre, q, spec) => {
      if (/\.(js|css|json)$/.test(spec)) return all;
      return `${pre}${q}${resolveSpecifier(file, spec)}${q}`;
    });
    if (next !== text) fs.writeFileSync(file, next);
  }
}

function copyCss(out) {
  for (const file of walk(src)) {
    if (!file.endsWith(".css")) continue;
    const target = path.join(out, path.relative(src, file));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(file, target);
  }
}

const strict = process.argv.includes("--strict");

function compile() {
  // Per-process temp dirs so several builds can run at once without clobbering each other.
  const out = `${tmp}-${process.pid}`;
  const old = path.join(root, `.dist-old-${process.pid}`);
  fs.rmSync(out, { recursive: true, force: true });
  try {
    execSync(`npx tsc -p tsconfig.json --outDir ${JSON.stringify(out)}`, { cwd: root, stdio: "inherit" });
  } catch (error) {
    // tsc still emits JS on type errors; only fail hard in --strict (CI / release) builds.
    if (strict) throw error;
    console.warn("[@orra-ui/react] type errors above — dist was still emitted (run with --strict to fail).");
  }
  fixExtensions(out);
  copyCss(out);
  for (let attempt = 0; ; attempt++) {
    try {
      fs.rmSync(old, { recursive: true, force: true });
      if (fs.existsSync(dist)) fs.renameSync(dist, old);
      fs.renameSync(out, dist);
      break;
    } catch (error) {
      if (attempt > 20) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
    }
  }
  fs.rmSync(old, { recursive: true, force: true });
}

function buildOnce() {
  execSync("node scripts/gen-index.mjs", { cwd: root, stdio: "inherit" });
  compile();
}

buildOnce();
if (watch) {
  let timer;
  fs.watch(src, { recursive: true }, (_e, file) => {
    if (file && /index\.ts$/.test(file) && path.dirname(file) === ".") return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        compile();
        console.log("[@orra-ui/react] rebuilt");
      } catch {
        console.error("[@orra-ui/react] build failed");
      }
    }, 150);
  });
  console.log("[@orra-ui/react] watching src/ …");
  spawn(process.execPath, ["-e", "setInterval(()=>{},1<<30)"], { stdio: "ignore" });
}
