import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SETUP_GUIDE, itemMarkdown, itemSummaryLine } from "./format";
import { addItems } from "./project";
import { findItem, loadRegistry, searchItems } from "./registry";

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const CATEGORIES = ["base", "agents", "blocks", "charts", "templates"] as const;

function skillFile(rel: string): string | null {
  const p = fileURLToPath(new URL(`../skill/${rel}`, import.meta.url));
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

export async function startMcpServer() {
  const reg = loadRegistry();
  const server = new McpServer(
    { name: "orra-ui", version: reg.version },
    {
      instructions:
        "Orra UI is a React + Tailwind CSS v4 design system (npm: @orra-ui/react) for dashboards and AI-agent interfaces. " +
        "Before building UI, search the registry and use real components instead of hand-written lookalikes. " +
        "Call get_design_rules once per task, get_component for exact props and examples, and get_setup_guide if the project is not set up yet.",
    },
  );

  server.registerTool(
    "list_components",
    {
      title: "List components",
      description: "List every Orra UI component and template (slug, name, Chinese title, one-line description). Optionally filter by category.",
      inputSchema: { category: z.enum(CATEGORIES).optional().describe("base | agents | blocks | charts | templates") },
      annotations: { readOnlyHint: true },
    },
    async ({ category }) => {
      const items = reg.items.filter((i) => !category || i.category === category);
      const groups = CATEGORIES.filter((c) => !category || c === category).map((c) => {
        const list = items.filter((i) => i.category === c);
        return list.length ? `## ${c} (${list.length})\n${list.map(itemSummaryLine).join("\n")}` : "";
      });
      return text(groups.filter(Boolean).join("\n\n"));
    },
  );

  server.registerTool(
    "search_components",
    {
      title: "Search components",
      description: "Find components by intent or keyword, in English or Chinese (e.g. 'date range', '下拉选择', 'chat input', 'kpi'). Returns the best matches with slugs to pass to get_component.",
      inputSchema: { query: z.string().describe("What you need"), limit: z.number().int().min(1).max(30).optional() },
      annotations: { readOnlyHint: true },
    },
    async ({ query, limit }) => {
      const hits = searchItems(query, limit ?? 8);
      if (!hits.length) return text(`No component matches "${query}". Try list_components to browse.`);
      return text(hits.map((i) => `- ${i.slug} [${i.category}] ${i.name} · ${i.title}: ${i.description}${i.exports?.length ? ` (exports: ${i.exports.join(", ")})` : ""}`).join("\n"));
    },
  );

  server.registerTool(
    "get_component",
    {
      title: "Get component docs",
      description: "Full documentation for one component or template: description, install, import line, props table, usage notes and working example code. Set includeSource to also get the full source files.",
      inputSchema: {
        name: z.string().describe("Slug, English name, Chinese title or export name, e.g. 'select', 'Date Picker', '按钮', 'StatCards'"),
        examples: z.number().int().min(0).max(10).optional().describe("How many examples to include (default 3)"),
        includeSource: z.boolean().optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ name, examples, includeSource }) => {
      const item = findItem(name);
      if (!item) {
        const hints = searchItems(name, 5).map((i) => i.slug);
        return text(`Unknown component "${name}".${hints.length ? ` Did you mean: ${hints.join(", ")}?` : ""}`);
      }
      return text(itemMarkdown(item, { examples, source: includeSource }));
    },
  );

  server.registerTool(
    "get_component_source",
    {
      title: "Get component source",
      description: "Raw source of a component's files (TypeScript/TSX). Use to understand internals or to customise a copied component.",
      inputSchema: { name: z.string(), file: z.string().optional().describe("Only this file path (as listed by get_component)") },
      annotations: { readOnlyHint: true },
    },
    async ({ name, file }) => {
      const item = findItem(name);
      if (!item) return text(`Unknown component "${name}".`);
      const files = file ? item.files.filter((f) => f.path === file || f.path.endsWith(file)) : item.files;
      if (!files.length) return text(`No file "${file}" in ${item.slug}. Files: ${item.files.map((f) => f.path).join(", ")}`);
      return text(files.map((f) => `// ${f.path}\n${f.content}`).join("\n\n"));
    },
  );

  server.registerTool(
    "get_design_rules",
    {
      title: "Get design rules",
      description: "The always-apply Orra UI rules: semantic color tokens, composite typography, spacing/shape, mechanics (cx, icons, forms, focus, RTL). Read before writing UI code.",
      annotations: { readOnlyHint: true },
    },
    async () => text(skillFile("references/rules.md") ?? SETUP_GUIDE),
  );

  server.registerTool(
    "get_theme",
    {
      title: "Get theme",
      description: "Theming guide (token families, type scale, dark mode, rebranding). Set includeCss to also get the raw tokens.css / typography.css / motion.css definitions.",
      inputSchema: { includeCss: z.boolean().optional() },
      annotations: { readOnlyHint: true },
    },
    async ({ includeCss }) => {
      const parts = [skillFile("references/theming.md") ?? ""];
      if (includeCss) for (const f of ["tokens.css", "typography.css", "motion.css"]) parts.push(`\n\n/* ${f} */\n${reg.styles[f] ?? ""}`);
      return text(parts.join(""));
    },
  );

  server.registerTool(
    "get_patterns",
    {
      title: "Get page patterns",
      description: "Page recipes (dashboard, table page, auth, AI chat, settings) and the motion language (durations, easings, entrance/exit recipes).",
      inputSchema: { topic: z.enum(["patterns", "motion"]).optional() },
      annotations: { readOnlyHint: true },
    },
    async ({ topic }) => text(skillFile(`references/${topic ?? "patterns"}.md`) ?? "Not available."),
  );

  server.registerTool(
    "get_setup_guide",
    {
      title: "Get setup guide",
      description: "How to install and wire Orra UI in a project (npm package or source mode), including the CSS import and font.",
      annotations: { readOnlyHint: true },
    },
    async () => text(SETUP_GUIDE),
  );

  server.registerTool(
    "add_components",
    {
      title: "Add components (copy source)",
      description:
        "Copy components or templates into the project as source (default folder components/orra-ui), including internal dependencies and styles, then install missing npm packages. Only use when the user wants the source in their repo; otherwise import from @orra-ui/react.",
      inputSchema: {
        names: z.array(z.string()).min(1).describe("Slugs, e.g. ['button', 'select', 'finance']"),
        cwd: z.string().optional().describe("Project root (defaults to the server's working directory)"),
        dir: z.string().optional().describe("Destination folder relative to the project root"),
        overwrite: z.boolean().optional(),
        install: z.boolean().optional().describe("Install missing npm packages (default true)"),
      },
      annotations: { destructiveHint: false, openWorldHint: false },
    },
    async ({ names, cwd, dir, overwrite, install }) => {
      const items = names.map((n) => ({ n, item: findItem(n) }));
      const unknown = items.filter((x) => !x.item).map((x) => x.n);
      if (unknown.length) return text(`Unknown: ${unknown.join(", ")}. Use search_components first.`);
      const root = path.resolve(cwd ?? process.cwd());
      if (!fs.existsSync(path.join(root, "package.json"))) return text(`No package.json in ${root}. Pass the project root as cwd.`);
      const logs: string[] = [];
      const res = addItems(
        items.map((x) => x.item!),
        { cwd: root, dir: dir ?? "components/orra-ui", overwrite: overwrite ?? false, install: install ?? true, log: (s) => logs.push(s) },
      );
      return text(
        [
          `Wrote ${res.written.length} file(s)${res.skipped.length ? `, skipped ${res.skipped.length} existing (pass overwrite: true to replace)` : ""}.`,
          ...res.written.map((f) => `+ ${f}`),
          res.dependencies.length ? `npm packages ${res.installed ? "installed" : "to install"}: ${res.dependencies.join(" ")}` : "No new npm packages needed.",
          ...logs,
          `Make sure your global CSS imports the styles: @import "tailwindcss"; then @import "<relative path to ${dir ?? "components/orra-ui"}/styles.css>";`,
        ].join("\n"),
      );
    },
  );

  await server.connect(new StdioServerTransport());
}
