import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { loadRegistry, npmDependenciesFor, sourceFilesFor, type RegistryItem } from "./registry";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

export function detectPackageManager(cwd: string): PackageManager {
  let dir = path.resolve(cwd);
  while (true) {
    if (fs.existsSync(path.join(dir, "pnpm-lock.yaml"))) return "pnpm";
    if (fs.existsSync(path.join(dir, "bun.lockb")) || fs.existsSync(path.join(dir, "bun.lock"))) return "bun";
    if (fs.existsSync(path.join(dir, "yarn.lock"))) return "yarn";
    if (fs.existsSync(path.join(dir, "package-lock.json"))) return "npm";
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  const ua = process.env.npm_config_user_agent ?? "";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("yarn")) return "yarn";
  if (ua.startsWith("bun")) return "bun";
  return "npm";
}

export function installCommand(pm: PackageManager, pkgs: string[]): string[] {
  if (pm === "npm") return ["npm", "install", ...pkgs];
  if (pm === "yarn") return ["yarn", "add", ...pkgs];
  if (pm === "bun") return ["bun", "add", ...pkgs];
  return ["pnpm", "add", ...pkgs];
}

function readPackageJson(cwd: string): { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8"));
  } catch {
    return null;
  }
}

/** Packages not yet listed in the project's package.json. */
export function missingPackages(cwd: string, pkgs: string[]): string[] {
  const pj = readPackageJson(cwd);
  const have = new Set([...Object.keys(pj?.dependencies ?? {}), ...Object.keys(pj?.devDependencies ?? {})]);
  return pkgs.filter((spec) => {
    const name = spec.startsWith("@") ? "@" + spec.slice(1).split("@")[0] : spec.split("@")[0];
    return !have.has(name);
  });
}

export function runInstall(cwd: string, pkgs: string[], log: (s: string) => void): boolean {
  if (!pkgs.length) return true;
  const pm = detectPackageManager(cwd);
  const [cmd, ...args] = installCommand(pm, pkgs);
  log(`$ ${[cmd, ...args].join(" ")}`);
  const res = spawnSync(cmd!, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  return res.status === 0;
}

export interface AddOptions {
  cwd: string;
  /** Destination folder for copied source, relative to cwd. */
  dir: string;
  overwrite: boolean;
  install: boolean;
  log: (s: string) => void;
}

export interface AddResult {
  written: string[];
  skipped: string[];
  dependencies: string[];
  installed: boolean;
}

/** Copies component (or template) source into the project and installs missing npm packages. */
export function addItems(items: RegistryItem[], opts: AddOptions): AddResult {
  const reg = loadRegistry();
  const root = path.resolve(opts.cwd, opts.dir);
  const components = items.filter((i) => i.category !== "templates");
  const templates = items.filter((i) => i.category === "templates");
  const files = [
    ...sourceFilesFor(components).map((f) => ({ ...f, dest: path.join(root, f.path) })),
    ...templates.flatMap((t) => t.files.map((f) => ({ ...f, dest: path.join(root, f.path) }))),
  ];
  const written: string[] = [];
  const skipped: string[] = [];
  for (const f of files) {
    if (fs.existsSync(f.dest) && !opts.overwrite) {
      skipped.push(path.relative(opts.cwd, f.dest));
      continue;
    }
    fs.mkdirSync(path.dirname(f.dest), { recursive: true });
    fs.writeFileSync(f.dest, f.content);
    written.push(path.relative(opts.cwd, f.dest));
  }
  // Stylesheets travel with source mode so the copied components are styled.
  if (components.length) {
    for (const [name, css] of Object.entries(reg.styles)) {
      const dest = path.join(root, "styles", name);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, css);
        written.push(path.relative(opts.cwd, dest));
      }
    }
    const entry = path.join(root, "styles.css");
    if (!fs.existsSync(entry)) {
      fs.writeFileSync(entry, `@import "./styles/tokens.css";\n@import "./styles/typography.css";\n@import "./styles/motion.css";\n@import "./styles/base.css";\n`);
      written.push(path.relative(opts.cwd, entry));
    }
  }
  // Images templates reference by absolute URL ("/avatars/…") go into the app's public/ folder.
  for (const t of templates) {
    for (const a of t.assets ?? []) {
      const dest = path.join(opts.cwd, "public", a.path);
      if (fs.existsSync(dest) && !opts.overwrite) continue;
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, a.content);
      written.push(path.relative(opts.cwd, dest));
    }
  }
  const deps = npmDependenciesFor(items);
  if (templates.length) deps.push(`${reg.package}@^${reg.version}`);
  if (components.length) deps.push("tailwind-merge@^3.7.0");
  const missing = missingPackages(opts.cwd, [...new Set(deps)]);
  const installed = opts.install ? runInstall(opts.cwd, missing, opts.log) : false;
  return { written, skipped, dependencies: missing, installed };
}

const CSS_CANDIDATES = ["app/globals.css", "src/app/globals.css", "styles/globals.css", "src/styles/globals.css", "src/index.css", "src/main.css", "app/app.css"];

export function findGlobalCss(cwd: string): string | null {
  for (const c of CSS_CANDIDATES) if (fs.existsSync(path.join(cwd, c))) return c;
  return null;
}

/** Adds `@import "<spec>";` right after the tailwindcss import (or at the top). Returns true if the file changed. */
export function ensureCssImport(cssPath: string, spec: string): boolean {
  const text = fs.readFileSync(cssPath, "utf8");
  if (text.includes(spec)) return false;
  const line = `@import "${spec}";`;
  const tw = text.match(/@import\s+["']tailwindcss["'];?\s*\n?/);
  const next = tw ? text.replace(tw[0], `${tw[0].trimEnd()}\n${line}\n`) : `@import "tailwindcss";\n${line}\n\n${text}`;
  fs.writeFileSync(cssPath, next);
  return true;
}
