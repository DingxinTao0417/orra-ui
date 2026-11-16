import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { itemMarkdown, itemSummaryLine } from "./format";
import { addItems, ensureCssImport, findGlobalCss, missingPackages, runInstall } from "./project";
import { findItem, loadRegistry, searchItems } from "./registry";

const HELP = `orra-ui — CLI and MCP server for the Orra UI design system

Usage
  orra-ui init [--source] [--css <file>] [--yes]   Set up a project (npm package + stylesheet import)
  orra-ui add <name...> [--dir <folder>] [--overwrite] [--no-install] [--yes]
                                                     Copy component / template source into the project
  orra-ui list [category]                          List components (base | agents | blocks | charts | templates)
  orra-ui search <query>                           Search by keyword (English or Chinese)
  orra-ui info <name> [--source]                   Docs for one component: install, import, props, examples
  orra-ui skill [--target claude|cursor|agents|all] [--global]
                                                     Install the agent skill / always-on rules
  orra-ui mcp                                      Start the MCP server (stdio) for AI agents

Options
  --cwd <dir>     Project root (default: current directory)
  -y, --yes       Don't ask; use defaults
  -v, --version   Print version
`;

type Flags = Record<string, string | boolean>;

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const flags: Flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "-y") flags.yes = true;
    else if (a === "-v") flags.version = true;
    else if (a === "-h") flags.help = true;
    else if (a.startsWith("--no-")) flags[a.slice(5)] = false;
    else if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      const nextVal = argv[i + 1];
      if (v !== undefined) flags[k!] = v;
      else if (["dir", "css", "cwd", "target"].includes(k!) && nextVal && !nextVal.startsWith("-")) {
        flags[k!] = nextVal;
        i++;
      } else flags[k!] = true;
    } else positional.push(a);
  }
  return { positional, flags };
}

const log = (s = "") => process.stdout.write(s + "\n");
const err = (s: string) => process.stderr.write(s + "\n");
const color = (code: number) => (s: string) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const dim = color(2);
const green = color(32);
const bold = color(1);

function cmdList(category?: string) {
  const reg = loadRegistry();
  const cats = ["base", "agents", "blocks", "charts", "templates"].filter((c) => !category || c === category);
  for (const c of cats) {
    const items = reg.items.filter((i) => i.category === c);
    if (!items.length) continue;
    log(bold(`\n${c} (${items.length})`));
    for (const i of items) log("  " + itemSummaryLine(i));
  }
}

function cmdSearch(query: string) {
  const hits = searchItems(query, 15);
  if (!hits.length) return log(`No results for "${query}".`);
  for (const i of hits) log(`  ${itemSummaryLine(i)} ${dim(`[${i.category}]`)}`);
}

function cmdInfo(name: string, flags: Flags) {
  const item = findItem(name);
  if (!item) {
    err(`Unknown component "${name}".`);
    const hints = searchItems(name, 5);
    if (hints.length) err(`Did you mean: ${hints.map((h) => h.slug).join(", ")}?`);
    process.exit(1);
  }
  log(itemMarkdown(item, { source: flags.source === true }));
}

function cmdAdd(names: string[], flags: Flags) {
  if (!names.length) {
    err("Usage: orra-ui add <name...>   (see `orra-ui list`)");
    process.exit(1);
  }
  const cwd = path.resolve(String(flags.cwd ?? process.cwd()));
  if (!fs.existsSync(path.join(cwd, "package.json"))) {
    err(`No package.json in ${cwd}. Run inside your project (or pass --cwd).`);
    process.exit(1);
  }
  const items = [];
  for (const n of names) {
    const item = findItem(n);
    if (!item) {
      const hints = searchItems(n, 3).map((h) => h.slug);
      err(`Unknown component "${n}".${hints.length ? ` Did you mean: ${hints.join(", ")}?` : ""}`);
      process.exit(1);
    }
    items.push(item);
  }
  const dir = String(flags.dir ?? "components/orra-ui");
  const res = addItems(items, { cwd, dir, overwrite: flags.overwrite === true, install: flags.install !== false, log });
  for (const f of res.written) log(green("  + ") + f);
  for (const f of res.skipped) log(dim(`  = ${f} (exists, use --overwrite)`));
  if (res.dependencies.length && !res.installed) log(`\nInstall the npm packages: ${res.dependencies.join(" ")}`);
  const css = findGlobalCss(cwd);
  if (items.some((i) => i.category !== "templates")) {
    const rel = css ? path.relative(path.dirname(path.join(cwd, css)), path.join(cwd, dir, "styles.css")).replace(/\\/g, "/") : `${dir}/styles.css`;
    const spec = rel.startsWith(".") ? rel : `./${rel}`;
    if (css && !fs.readFileSync(path.join(cwd, css), "utf8").includes("@orra-ui/react/styles.css") && ensureCssImport(path.join(cwd, css), spec)) {
      log(`\nAdded ${bold(`@import "${spec}"`)} to ${css}`);
    } else if (!css) {
      log(`\nAdd to your global CSS:\n  @import "tailwindcss";\n  @import "${spec}";`);
    }
  }
  log(`\n${green("Done.")} Import from the copied files, e.g. ${dim(`import { ${items[0]!.exports?.[0] ?? "Button"} } from "@/${dir}/${(items[0]!.entry || items[0]!.files[0]?.path || "").replace(/\.tsx?$/, "")}";`)}`);
}

function cmdInit(flags: Flags) {
  const cwd = path.resolve(String(flags.cwd ?? process.cwd()));
  const reg = loadRegistry();
  if (!fs.existsSync(path.join(cwd, "package.json"))) {
    err(`No package.json in ${cwd}.`);
    process.exit(1);
  }
  const css = typeof flags.css === "string" ? flags.css : findGlobalCss(cwd);
  if (flags.source) {
    const res = addItems([], { cwd, dir: String(flags.dir ?? "components/orra-ui"), overwrite: false, install: false, log });
    for (const f of res.written) log(green("  + ") + f);
    log("\nSource mode ready — add components with `orra-ui add <name>`.");
    return;
  }
  const needed = missingPackages(cwd, [`${reg.package}@^${reg.version}`, "tailwindcss@^4", "@tailwindcss/postcss@^4"]);
  if (needed.length && flags.install !== false) runInstall(cwd, needed, log);
  if (css && fs.existsSync(path.join(cwd, css))) {
    if (ensureCssImport(path.join(cwd, css), `${reg.package}/styles.css`)) log(`Added ${bold(`@import "${reg.package}/styles.css"`)} to ${css}`);
    else log(`${css} already imports the stylesheet.`);
  } else {
    log(`\nAdd to your global CSS:\n  @import "tailwindcss";\n  @import "${reg.package}/styles.css";`);
  }
  log(`
${green("Orra UI is ready.")}
  • Font: load Inter as the CSS variable --font-inter (Next.js: next/font/google, variable: "--font-inter").
  • Dark mode: the "dark" class on <html> (or use <ThemeToggle />).
  • Use it: import { Button } from "${reg.package}";
  • AI agents: run \`orra-ui skill\` and add the MCP server (\`npx -y @orra-ui/cli mcp\`).`);
}

const MARK_START = "<!-- orra-ui:start -->";
const MARK_END = "<!-- orra-ui:end -->";

function cmdSkill(flags: Flags) {
  const cwd = path.resolve(String(flags.cwd ?? process.cwd()));
  const target = String(flags.target ?? "claude,agents");
  const targets = target === "all" ? ["claude", "cursor", "agents"] : target.split(",");
  const skillDir = fileURLToPath(new URL("../skill", import.meta.url));
  const rules = fs.readFileSync(path.join(skillDir, "references/rules.md"), "utf8");
  if (targets.includes("claude")) {
    const base = flags.global ? path.join(os.homedir(), ".claude/skills/orra-ui") : path.join(cwd, ".claude/skills/orra-ui");
    fs.rmSync(base, { recursive: true, force: true });
    fs.cpSync(skillDir, base, { recursive: true });
    log(green("  + ") + `${flags.global ? base : path.relative(cwd, base)}/ (Claude Code skill)`);
  }
  if (targets.includes("cursor")) {
    const file = path.join(cwd, ".cursor/rules/orra-ui.mdc");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `---\ndescription: Orra UI design system rules. Apply when writing or editing UI code.\nalwaysApply: true\n---\n\n${rules}`);
    log(green("  + ") + path.relative(cwd, file));
  }
  if (targets.includes("agents")) {
    const file = path.join(cwd, "AGENTS.md");
    const block = `${MARK_START}\n${rules.trim()}\n\nFor component APIs and examples use the Orra UI MCP server (\`npx -y @orra-ui/cli mcp\`) or \`npx @orra-ui/cli info <name>\`.\n${MARK_END}`;
    const prev = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
    const next = prev.includes(MARK_START)
      ? prev.replace(new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}`), block)
      : `${prev}${prev && !prev.endsWith("\n") ? "\n" : ""}${prev ? "\n" : ""}${block}\n`;
    fs.writeFileSync(file, next);
    log(green("  + ") + "AGENTS.md (always-on rules section)");
  }
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const [cmd, ...rest] = positional;
  if (flags.version) return log(loadRegistry().version);
  if (!cmd || flags.help || cmd === "help") return log(HELP);
  switch (cmd) {
    case "list":
    case "ls":
      return cmdList(rest[0]);
    case "search":
      return cmdSearch(rest.join(" "));
    case "info":
    case "docs":
      return cmdInfo(rest.join(" "), flags);
    case "add":
      return cmdAdd(rest, flags);
    case "init":
      return cmdInit(flags);
    case "skill":
      return cmdSkill(flags);
    case "mcp": {
      const { startMcpServer } = await import("./mcp");
      return startMcpServer();
    }
    default:
      err(`Unknown command "${cmd}".\n`);
      log(HELP);
      process.exit(1);
  }
}

main().catch((e) => {
  err(e instanceof Error ? e.stack ?? e.message : String(e));
  process.exit(1);
});
