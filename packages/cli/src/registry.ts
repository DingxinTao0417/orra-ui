import fs from "node:fs";
import { fileURLToPath } from "node:url";

export interface RegistryFile {
  path: string;
  content: string;
}
export interface RegistryDemo {
  file: string;
  title: string;
  description?: string;
  code: string;
}
export interface RegistryProp {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
}
export interface RegistryItem {
  slug: string;
  name: string;
  title: string;
  category: "base" | "agents" | "blocks" | "charts" | "templates";
  description: string;
  keywords?: string[];
  exports?: string[];
  notes?: string[];
  route?: string;
  usage?: string;
  /** Static files (e.g. public/avatars/*.svg) a template references by URL. */
  assets?: RegistryFile[];
  /** Main module path (relative to the package src, or to the docs app for templates). */
  entry?: string;
  importPath: string | null;
  dependencies: string[];
  libImports: string[];
  files: RegistryFile[];
  demos: RegistryDemo[];
  props?: { component: string; description?: string; props: RegistryProp[] }[];
}
export interface Registry {
  name: string;
  package: string;
  version: string;
  peerDependencies: Record<string, string>;
  styles: Record<string, string>;
  sharedFiles: RegistryFile[];
  items: RegistryItem[];
}

let cached: Registry | null = null;

export function loadRegistry(): Registry {
  if (cached) return cached;
  const url = new URL("../registry.json", import.meta.url);
  cached = JSON.parse(fs.readFileSync(fileURLToPath(url), "utf8")) as Registry;
  return cached;
}

export function findItem(name: string): RegistryItem | undefined {
  const n = name.trim().toLowerCase().replace(/\s+/g, "-");
  const items = loadRegistry().items;
  return (
    items.find((i) => i.slug === n) ??
    items.find((i) => i.name.toLowerCase().replace(/\s+/g, "-") === n) ??
    items.find((i) => i.slug === n.replace(/^template-/, "")) ??
    items.find((i) => i.title === name.trim()) ??
    items.find((i) => (i.exports ?? []).some((e) => e.toLowerCase() === n.replace(/-/g, "")))
  );
}

/** Simple ranked search over slug, names, Chinese title, keywords and description. */
export function searchItems(query: string, limit = 10): RegistryItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return loadRegistry().items.slice(0, limit);
  const terms = q.split(/\s+/).filter(Boolean);
  const scored = loadRegistry().items
    .map((item) => {
      const fields = {
        slug: item.slug,
        name: item.name.toLowerCase(),
        title: item.title,
        exports: (item.exports ?? []).join(" ").toLowerCase(),
        keywords: (item.keywords ?? []).join(" ").toLowerCase(),
        description: item.description.toLowerCase(),
      };
      let score = 0;
      const all = Object.values(fields).join(" ");
      // Whole-phrase and every-term matches outrank scattered single-term hits.
      if (terms.length > 1 && all.includes(q)) score += 25;
      if (terms.length > 1 && terms.every((t) => all.includes(t))) score += 15;
      for (const t of terms) {
        if (fields.slug === t || fields.name === t) score += 20;
        if (fields.slug.includes(t) || fields.name.includes(t)) score += 8;
        if (fields.title.includes(t)) score += 8;
        if (fields.exports.includes(t)) score += 6;
        if (fields.keywords.includes(t)) score += 5;
        if (fields.description.includes(t)) score += 2;
      }
      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.item);
}

/** Library files an item needs in source mode: its own files plus everything they import inside the package. */
export function sourceFilesFor(items: RegistryItem[]): RegistryFile[] {
  const reg = loadRegistry();
  const map = new Map<string, RegistryFile>();
  for (const f of reg.sharedFiles) map.set(f.path, f);
  for (const item of items) for (const f of item.files) map.set(f.path, f);
  return [...map.values()].sort((a, b) => a.path.localeCompare(b.path));
}

export function npmDependenciesFor(items: RegistryItem[]): string[] {
  const set = new Set<string>();
  for (const i of items) for (const d of i.dependencies) set.add(d);
  return [...set].sort();
}
