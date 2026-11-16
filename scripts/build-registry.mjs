// Builds the Orra UI registry from apps/docs/registry/{items,templates}/*.json.
//
// Outputs
//   apps/docs/generated/registry.ts   docs-site metadata + demo loaders
//   apps/docs/generated/search.json   slim search index for ⌘K
//   apps/docs/public/r/*.json         per-item JSON (source, demos, props) — the public registry
//   packages/cli/registry.json        everything the CLI / MCP server needs, bundled offline
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIB = path.join(ROOT, "packages/react/src");
const DOCS = path.join(ROOT, "apps/docs");
const REG = path.join(DOCS, "registry");
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, "packages/react/package.json"), "utf8"));

const CATEGORY_ORDER = ["foundations", "base", "agents", "blocks", "charts", "templates"];
const read = (p) => fs.readFileSync(p, "utf8");
const exists = (p) => fs.existsSync(p);

function resolveModule(fromDir, spec) {
  const base = path.resolve(fromDir, spec);
  for (const c of [base, base + ".tsx", base + ".ts", path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
    if (exists(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

// Real module specifiers only: static import/export-from at the start of a line, side-effect imports and dynamic import().
const IMPORT_RE = /(?:^[ \t]*(?:import|export)\b[^;"'`]*?\bfrom\s*|^[ \t]*import\s*|\bimport\s*\(\s*)(["'])([^"']+)\1/gm;
const pkgName = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);

/** Walk relative imports from the entry files; collect files + npm packages. */
function closure(entries, { aliases = {} } = {}) {
  const files = new Set();
  const npm = new Set();
  const lib = new Set();
  const stack = [...entries];
  while (stack.length) {
    const file = stack.pop();
    if (files.has(file)) continue;
    files.add(file);
    const text = read(file);
    for (const m of text.matchAll(IMPORT_RE)) {
      const spec = m[2];
      if (spec.startsWith(".")) {
        const r = resolveModule(path.dirname(file), spec);
        if (r) stack.push(r);
        continue;
      }
      const alias = Object.keys(aliases).find((a) => spec.startsWith(a));
      if (alias) {
        const r = resolveModule(aliases[alias], spec.slice(alias.length));
        if (r) stack.push(r);
        continue;
      }
      if (spec.startsWith("@orra-ui/react")) {
        lib.add(spec);
        continue;
      }
      if (spec === "react" || spec.startsWith("react/") || spec === "react-dom" || spec.startsWith("react-dom/") || spec.startsWith("next")) continue;
      npm.add(pkgName(spec));
    }
  }
  return { files: [...files].sort(), npm: [...npm].sort(), lib: [...lib].sort() };
}

function readJsonDir(dir) {
  if (!exists(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(read(path.join(dir, f))));
}

const items = readJsonDir(path.join(REG, "items"));
const templates = readJsonDir(path.join(REG, "templates")).map((t) => ({ ...t, category: "templates" }));

const depVersions = { ...PKG.dependencies, ...(PKG.peerDependencies ?? {}) };
const docsPkg = JSON.parse(read(path.join(DOCS, "package.json")));
const allVersions = { ...docsPkg.dependencies, ...depVersions };
const withVersion = (name) => (allVersions[name] ? `${name}@${allVersions[name]}` : name);

const problems = [];
const out = [];

for (const item of [...items, ...templates]) {
  const isTemplate = item.category === "templates";
  let files, npm, lib;
  if (isTemplate) {
    const entries = (item.files ?? []).map((f) => path.join(DOCS, f));
    ({ files, npm, lib } = closure(entries, { aliases: { "@/": DOCS + "/" } }));
  } else {
    const entries = item.files.map((f) => path.join(LIB, f));
    for (const e of entries) if (!exists(e)) problems.push(`${item.slug}: missing ${path.relative(ROOT, e)}`);
    ({ files, npm, lib } = closure(entries.filter(exists)));
  }
  const demos = (item.demos ?? []).map((d) => {
    const file = path.join(DOCS, "demos", d.file);
    if (!exists(file)) problems.push(`${item.slug}: missing demo ${d.file}`);
    return { ...d, code: exists(file) ? read(file) : "" };
  });
  const rel = (f) => (isTemplate ? path.relative(DOCS, f) : path.relative(LIB, f)).replace(/\\/g, "/");
  const sourceFiles = files.map((f) => {
    let content = read(f);
    if (isTemplate) {
      // make template sources self-contained: "@/x" → relative path inside the copied tree
      content = content.replace(IMPORT_RE, (all, q, spec) => {
        if (!spec.startsWith("@/")) return all;
        const target = path.join(DOCS, spec.slice(2));
        let r = path.relative(path.dirname(f), target).replace(/\\/g, "/");
        if (!r.startsWith(".")) r = "./" + r;
        return all.replace(spec, r);
      });
    }
    return { path: rel(f), content };
  });
  // Static assets the sources reference from the docs app's public/ (e.g. "/avatars/x.svg",
  // or a template-literal folder like `/ai-chat/gallery/${id}.svg`), so installs aren't missing images.
  const assets = new Map();
  const PUBLIC = path.join(DOCS, "public");
  for (const f of sourceFiles) {
    for (const m of f.content.matchAll(/["'`](\/[a-z0-9-]+\/[^"'`$\s]*)(\$\{)?/gi)) {
      const ref = m[1];
      const abs = path.join(PUBLIC, ref);
      if (m[2] || ref.endsWith("/")) {
        const dir = ref.endsWith("/") ? abs : path.dirname(abs);
        if (exists(dir) && fs.statSync(dir).isDirectory())
          for (const name of fs.readdirSync(dir)) assets.set(path.relative(PUBLIC, path.join(dir, name)), path.join(dir, name));
      } else if (exists(abs) && fs.statSync(abs).isFile()) assets.set(ref.slice(1), abs);
    }
  }
  const assetFiles = [...assets.entries()]
    .filter(([, abs]) => /\.(svg|json|txt)$/i.test(abs))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([p, abs]) => ({ path: p.replace(/\\/g, "/"), content: read(abs) }));
  out.push({
    ...item,
    ...(assetFiles.length ? { assets: assetFiles } : {}),
    // The module users import from (first declared file), before `files` becomes the full closure.
    entry: (item.files?.[0] ?? "").replace(/\\/g, "/"),
    importPath: isTemplate ? null : "@orra-ui/react",
    dependencies: npm.map(withVersion),
    libImports: lib,
    files: sourceFiles,
    demos,
  });
}

out.sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.name.localeCompare(b.name));

// ---------- docs: generated/registry.ts + search.json
const gen = path.join(DOCS, "generated");
fs.mkdirSync(gen, { recursive: true });
const meta = out.map(({ files, demos, assets, ...rest }) => ({
  ...rest,
  fileList: files.map((f) => f.path),
  demos: demos.map(({ code, ...d }) => d),
}));
const loaders = out
  .flatMap((i) => i.demos)
  .map((d) => `  ${JSON.stringify(d.file)}: () => import(${JSON.stringify("@/demos/" + d.file.replace(/\.tsx?$/, ""))}),`)
  .join("\n");
fs.writeFileSync(
  path.join(gen, "registry.ts"),
  `// AUTO-GENERATED by scripts/build-registry.mjs — do not edit.
import type { ComponentType } from "react";
import type { RegistryItem } from "@/lib/registry-types";

export const registry: RegistryItem[] = ${JSON.stringify(meta, null, 2)};

export const demoLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
${loaders}
};
`,
);
fs.writeFileSync(
  path.join(gen, "search.json"),
  JSON.stringify(out.map((i) => ({ slug: i.slug, name: i.name, title: i.title, category: i.category, description: i.description, keywords: i.keywords ?? [] }))),
);

// ---------- public registry: /r/<slug>.json + /r/index.json
const pub = path.join(DOCS, "public/r");
fs.rmSync(pub, { recursive: true, force: true });
fs.mkdirSync(pub, { recursive: true });
for (const i of out) fs.writeFileSync(path.join(pub, `${i.slug}.json`), JSON.stringify(i, null, 2));
fs.writeFileSync(
  path.join(pub, "index.json"),
  JSON.stringify({ name: "orra-ui", version: PKG.version, items: meta.map(({ slug, name, title, category, description }) => ({ slug, name, title, category, description })) }, null, 2),
);

// ---------- CLI bundle: registry + theme stylesheets
const styles = {};
for (const f of ["tokens.css", "typography.css", "motion.css", "base.css"]) styles[f] = read(path.join(ROOT, "packages/styles", f));
const shared = closure(["lib/cx.ts", "lib/recipes.ts", "lib/copy.ts"].map((f) => path.join(LIB, f)));
fs.writeFileSync(
  path.join(ROOT, "packages/cli/registry.json"),
  JSON.stringify({ name: "orra-ui", package: PKG.name, version: PKG.version, peerDependencies: PKG.peerDependencies, styles, sharedFiles: shared.files.map((f) => ({ path: path.relative(LIB, f), content: read(f) })), items: out }),
);

// ---------- skill catalog: skills/orra-ui/references/components.md
const CAT_LABEL = { base: "Base components", agents: "Agent components", blocks: "Blocks", charts: "Charts", templates: "Templates" };
const md = [
  "# Orra UI component catalog",
  "",
  "<!-- AUTO-GENERATED by scripts/build-registry.mjs from apps/docs/registry — do not edit by hand. -->",
  "",
  "Every component and template, with its exports and a working example. npm mode imports from `@orra-ui/react`; source mode installs with `npx -y @orra-ui/cli add <slug> --yes`. Props tables: MCP `get_component` or the docs site.",
  "",
];
for (const cat of ["base", "agents", "blocks", "charts", "templates"]) {
  const list = out.filter((i) => i.category === cat);
  if (!list.length) continue;
  md.push(`## ${CAT_LABEL[cat]}`, "");
  for (const i of list) {
    md.push(`### ${i.name} — \`${i.slug}\``, "");
    if (i.description) md.push(i.description, "");
    if (cat === "templates") {
      md.push(`- Install: \`npx -y @orra-ui/cli add ${i.slug} --yes\` (copies the page and its template-only parts; needs \`@orra-ui/react\`)`, "");
      continue;
    }
    const exportsList = i.exports?.length ? i.exports : [];
    if (exportsList.length) md.push(`- Exports: ${exportsList.map((e) => `\`${e}\``).join(", ")}`);
    md.push(`- Install (source): \`npx -y @orra-ui/cli add ${i.slug} --yes\``, "");
    const first = i.demos[0];
    if (first?.code) md.push("```tsx", first.code.trim(), "```", "");
  }
}
fs.writeFileSync(path.join(ROOT, "skills/orra-ui/references/components.md"), md.join("\n"));

if (problems.length) {
  console.warn("[registry] problems:\n  " + problems.join("\n  "));
}
console.log(`[registry] ${items.length} components, ${templates.length} templates → generated/, public/r/, packages/cli/registry.json`);
