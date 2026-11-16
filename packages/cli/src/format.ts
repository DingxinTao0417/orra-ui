import { loadRegistry, type RegistryItem } from "./registry";

const CATEGORY: Record<string, string> = {
  base: "Base component",
  agents: "Agent component",
  blocks: "Block",
  charts: "Chart",
  templates: "Template",
};

export function itemSummaryLine(i: RegistryItem): string {
  return `${i.slug.padEnd(24)} ${i.name} · ${i.title}${i.description ? ` — ${i.description}` : ""}`;
}

/** Markdown documentation for one item: what it is, how to install/import it, props and examples. */
export function itemMarkdown(i: RegistryItem, opts: { examples?: number; source?: boolean } = {}): string {
  const reg = loadRegistry();
  const out: string[] = [];
  out.push(`# ${i.name} (${i.title})`, "", `${CATEGORY[i.category] ?? i.category} · slug \`${i.slug}\``, "");
  if (i.description) out.push(i.description, "");
  if (i.category === "templates") {
    out.push("## Install", "", "```bash", `npx -y @orra-ui/cli add ${i.slug} --yes`, "```", "");
    out.push(`Copies the template source into \`components/orra-ui/templates/\`; it imports from \`${reg.package}\`, which the CLI installs.`, "");
    if (i.exports?.length) {
      const usage = (i as RegistryItem & { usage?: string }).usage ?? `<${i.exports[0]} />`;
      out.push("## Usage", "", "```tsx", `import { ${i.exports[0]} } from "@/components/orra-ui/${(i.entry || i.files[0]?.path || "").replace(/\.tsx?$/, "")}";`, "", `export default function Page() {`, `  return ${usage};`, `}`, "```", "");
    }
  } else {
    out.push("## Install", "", "npm package (import from the root):", "", "```bash", `npm install ${reg.package}`, "```", "", "or copy the source into the project:", "", "```bash", `npx -y @orra-ui/cli add ${i.slug} --yes`, "```", "");
    const ex = i.exports?.length ? i.exports : [i.name.replace(/\s+/g, "")];
    out.push("## Import", "", "```tsx", `import { ${ex.join(", ")} } from "${reg.package}";`, "```", "");
  }
  if (i.notes?.length) out.push("## Notes", "", ...i.notes.map((n) => `- ${n}`), "");
  if (i.props?.length) {
    out.push("## Props", "");
    for (const g of i.props) {
      out.push(`### ${g.component}`, "");
      if (g.description) out.push(g.description, "");
      out.push("| Prop | Type | Default | Description |", "| --- | --- | --- | --- |");
      for (const p of g.props) {
        const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");
        out.push(`| \`${p.name}\`${p.required ? " (required)" : ""} | \`${cell(p.type)}\` | ${p.default ? `\`${cell(p.default)}\`` : "—"} | ${cell(p.description)} |`);
      }
      out.push("");
    }
  }
  const n = opts.examples ?? 3;
  const demos = i.demos.slice(0, n);
  if (demos.length) {
    out.push("## Examples", "");
    for (const d of demos) {
      out.push(`### ${d.title}`, "");
      if (d.description) out.push(d.description, "");
      out.push("```tsx", d.code.trim(), "```", "");
    }
  }
  if (i.dependencies.length) out.push("## npm dependencies", "", i.dependencies.map((d) => `\`${d}\``).join(", "), "");
  out.push("## Files", "", ...i.files.map((f) => `- \`${f.path}\``), "");
  if (opts.source) {
    out.push("## Source", "");
    for (const f of i.files) out.push(`### ${f.path}`, "", "```tsx", f.content.trimEnd(), "```", "");
  }
  return out.join("\n");
}

export const SETUP_GUIDE = `# Orra UI setup

## npm mode (recommended)

1. Requirements: React 19, Tailwind CSS v4.
2. Install: \`npm install @orra-ui/react\` (or \`npx -y @orra-ui/cli init --yes\`, which also wires the CSS).
3. Global CSS (e.g. app/globals.css):

\`\`\`css
@import "tailwindcss";
@import "@orra-ui/react/styles.css";
\`\`\`

4. Font: load Inter as the CSS variable \`--font-inter\` (Next.js: \`Inter({ subsets: ["latin"], variable: "--font-inter" })\`, put \`inter.variable\` on <html>). Monospace uses \`--font-mono-source\` (e.g. JetBrains Mono).
5. Dark mode: toggle the \`dark\` class on <html>; \`ThemeToggle\` / \`setThemeMode\` do it and remember the choice. Inline \`themeScript\` (from \`@orra-ui/react/lib/theme-script\`) in <head> to avoid a flash. Optional: \`<OrraProvider locale="zh-CN">\` to fix the language of built-in copy.
6. Import components: \`import { Button } from "@orra-ui/react";\`

## Source mode

\`npx -y @orra-ui/cli add button select --yes\` copies the components (and the files they import) into \`components/orra-ui/\`, writes \`components/orra-ui/styles.css\`, and installs missing npm packages. Then add to your global CSS:

\`\`\`css
@import "tailwindcss";
@import "../components/orra-ui/styles.css"; /* path relative to the CSS file */
\`\`\`

## Rules for generated code

- Semantic color tokens only (bg-canvas, bg-surface, text-fg, text-fg-muted, border-line…), never raw palette classes or hex.
- Orra type scale (text-title, text-body, text-body-sm, text-caption…) paired with font-medium / font-semibold.
- No dark: color overrides — tokens flip automatically.
- Merge classes with cx(); icons from @remixicon/react passed as elements (startIcon={<RiAddLine />}).
- Tables and anything stateful live in "use client" modules.
`;
