---
name: orra-ui
description: >-
  Build UIs with Orra UI, the React + Tailwind CSS v4 design system for
  dashboards and AI-agent interfaces (package @orra-ui/react). Use whenever
  the user asks to build, restyle or extend UI in a project that uses Orra
  UI, mentions its components or templates, or wants a dashboard, chart card,
  AI chat, agent progress view, form, table, auth screen or settings page built
  with it. Enforces: use real Orra UI components instead of hand-built
  lookalikes, style only with semantic tokens and composite type utilities,
  merge classes with cx(), and let dark mode ride the tokens.
metadata:
  version: 0.1.0
---

# Building UIs with Orra UI

Orra UI is a React 19 + Tailwind CSS v4 design system for dashboards and agentic interfaces, built on React Aria (accessibility) and Motion (animation). It ships two ways:

- **npm package** — `@orra-ui/react`. Import from the root: `import { Button, Select, SelectItem } from "@orra-ui/react"`. Deep paths also work: `@orra-ui/react/base/buttons/button`.
- **Source copy (CLI)** — `npx @orra-ui/cli add <name>` copies the component source (plus its internal dependencies) into `components/orra-ui/` so the user owns and edits it.

This skill is the always-loaded knowledge. For live API details, demo code and installs, use the Orra UI MCP server (`npx -y @orra-ui/cli mcp`) when it is connected.

## Workflow

1. **Detect setup.** Look for `@orra-ui/react` in package.json, or a `components/orra-ui/` folder. If neither exists, set it up: `npx -y @orra-ui/cli init --yes` (installs the package and adds the stylesheet import), or follow "Manual setup" below.
2. **Discover.** Component names are exact. Look them up in [references/components.md](references/components.md) (catalog with exports, description and import) or call the MCP `search_components` / `get_component` tools. Do not guess props: read the props table or the component source.
3. **Use, never rebuild.** If the registry has it, import it (npm mode) or `npx -y @orra-ui/cli add <name> --yes` (source mode). Never hand-write a lookalike of an existing component.
4. **Compose** pages from components with the design rules below. Page recipes: [references/patterns.md](references/patterns.md).
5. **Verify before finishing.** No raw palette classes, no hand-stacked type utilities, no `dark:` color overrides, classes merged with `cx()`.

## Manual setup (npm mode)

```bash
npm install @orra-ui/react
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@orra-ui/react/styles.css";
```

Load Inter as the CSS variable `--font-inter` (e.g. `next/font/google` with `variable: "--font-inter"` on `<html>`); without it text falls back to the system font. Dark mode is the `dark` class on `<html>`: use `ThemeToggle` / `setThemeMode`, and inline `themeScript` from `@orra-ui/react/lib/theme-script` in `<head>` to avoid a flash. Optional: `<OrraProvider locale="zh-CN">` to fix the language of built-in copy.

## Design rules (always)

- **Color: semantic tokens only.** Never raw palette classes (`text-gray-500`, `bg-white`) or hex/oklch literals. Surfaces `bg-canvas` (page), `bg-surface` (cards, inputs), `bg-surface-muted` (wells), `bg-surface-raised` (menus, dialogs), `bg-surface-hover`; text `text-fg`, `text-fg-muted`, `text-fg-subtle`, `text-fg-accent`; lines `border-line` (hairlines), `border-line-strong` (controls); status `success | warning | danger | info` with `-soft` backgrounds; charts `chart-1 … chart-8`; brand `accent-50 … accent-950`, `bg-accent-gradient`.
- **Dark mode is automatic.** Tokens flip under `.dark` on `<html>`. Never write `dark:` overrides.
- **Typography.** Size utilities set size + line height + tracking: `text-title-lg`, `text-title`, `text-title-sm`, `text-body-lg`, `text-body`, `text-body-sm`, `text-caption`, `text-micro` (and `text-display*`). Pair with `font-medium` / `font-semibold`; `tabular-nums` for figures. Don't use Tailwind's `text-sm`/`text-xs`.
- **Shape and space.** `rounded-control` (10px: buttons, inputs), `rounded-menu` (14px: menus, popovers), `rounded-card` (20px: cards, dialogs). Cards: `rounded-card border border-line bg-surface shadow-card p-5`. Use `gap-*` over per-child margins.
- **Mechanics.** Merge classes with `cx()` (`import { cx } from "@orra-ui/react"`). Icons from `@remixicon/react`, passed as elements (`startIcon={<RiAddLine />}`, `icon={<RiMoreLine />}`). Buttons use `onPress`. Form controls take React Aria props (`isDisabled`, `isInvalid`, `onChange`). Logical properties (`ms`/`me`, `ps`/`pe`, `start`/`end`) for RTL.
- **Motion.** Reuse `animate-in` / `animate-out`, `animate-dialog-*`, `animate-sheet-*`, `animate-rise`, `text-shimmer`, `bg-skeleton`; hovers 150ms; exits faster than entrances. See [references/motion.md](references/motion.md).

Full rules: [references/rules.md](references/rules.md). Tokens, type scale and rebranding: [references/theming.md](references/theming.md).

## Choosing components

- **Actions.** `Button` (variant `solid | outline | soft | plain` × tone `accent | neutral | danger`), `IconButton` (icon-only, needs `aria-label`), `ButtonLink`, `LinkButton` (inline text action), `ButtonGroup`, `CloseButton`, `SocialButton` (OAuth providers).
- **Forms.** `Input`, `Textarea`, `NumberField`, `SearchField`, `TimeField`, `InputOTP`, `Select` + `SelectItem`, `Combobox` + `ComboboxItem`, `Checkbox` / `CheckboxGroup`, `RadioGroup` + `Radio`, `Switch`, `Slider`, `ColorPicker`, `FileUpload`, `TagGroup`, `SegmentedControl` + `SegmentedControlItem`. All take `label`, `description`, `errorMessage` and React Aria props.
- **Overlays & menus.** `Modal`, `ConfirmDialog`, `Drawer`, `Popover`, `Tooltip` (+ `TooltipTarget` for non-React-Aria triggers), `Dropdown` + `DropdownItem`, `ContextMenu`, `CommandPalette` (⌘K), `toast()` + `<Toaster />`, `Notification`.
- **Navigation.** `Tabs` / `TabList` / `Tab` / `TabPanel`, `Breadcrumb`, `Pagination`, `Accordion`, `TreeView`, `Sidebar` (+ `SidebarTrigger`).
- **Dates.** `DatePicker`, `DateRangePicker`, `DateCalendar`, `DateRangeCalendar`, `TimeField`, `MeetingScheduler`; full calendar views: `EventCalendar`.
- **Data display.** `Table` (+ `TableUser`, `TableStatus`), `DataGrid` (editable spreadsheet), `Badge`, `StatusDot`, `Chip`, `Avatar` / `AvatarGroup`, `Kbd`, `Progress` / `ProgressRing`, `Meter`, `Skeleton`, `Carousel`, `Announcement`, `Divider`.
- **Dashboards.** `StatCards` for KPI rows; charts (`AreaChart`, `LineChart`, `BarChart`, `BarList`, `ComboChart`, `DonutChart`, `GaugeChart`, `RingsChart`, `RadarChart`, `FunnelChart`, `HeatmapChart`, `SankeyChart`, `ScatterChart`, `Sparkline`) are bare plots that fill their width; wrap them in `ChartCard` for the title, headline value, delta badge and range selector.
- **AI / agent interfaces.** `ComposerPanel` (chat input with attachments, model picker, send/stop), `ComposerAttachments`, `ComposerLoader`, `ModelPicker`, `AgentAvatar`, `AgentThinking`, `AgentLog`, `AgentProgress`, `TaskList`, `WebSearch` (+ `WebCitation`), `Questionnaire`, `AgentLimits`.
- **App shell & account.** `Sidebar`, `SettingsModal`, `NotificationCenter` / `NotificationCenterPopover`, `AuthCard`, `ThemeToggle`, `AccentPicker`.
- **Whole pages.** Templates (dashboard, finance, marketing, hr, medical-profile, ai-profile, calendar, project-board, ai-chat, ai-image-generation, multi-agent-chat) install with `npx -y @orra-ui/cli add <template> --yes`; prefer one when the user asks for a page that matches.

## Known gotchas

- **React Aria tables render no columns inside a server component.** Put `Table` / `DataGrid` usage in a `"use client"` module.
- **Runtime accent:** use `setAccent({ preset })` / `setAccent({ hex })`; it writes literal OKLCH ramps for both themes. Don't hand-write `var()` chains into `--orra-accent-*`.
- **Hydration:** render time- or platform-dependent text (today, relative times, time zones, ⌘ vs Ctrl) after mount with `useNow()` / `useHydrated()`.
- **Stylesheet order.** `@import "tailwindcss";` must come before `@import "@orra-ui/react/styles.css";`. The package stylesheet registers its own class names with `@source`, so no extra content config is needed.
- **Source mode.** Copied components keep relative imports inside `components/orra-ui/` (`components/<slug>/<slug>.tsx`, `lib/*`), so no path alias is required.

## Going deeper

- [references/components.md](references/components.md) — full catalog: every component and template with description, exports and install.
- [references/theming.md](references/theming.md) — token architecture, semantic families, type scale, dark mode, rebranding.
- [references/patterns.md](references/patterns.md) — page anatomy recipes (dashboard, table, auth, AI chat, settings).
- [references/motion.md](references/motion.md) — durations, easings, entrance/exit recipes.
- MCP server: `npx -y @orra-ui/cli mcp` — tools `list_components`, `search_components`, `get_component`, `get_component_source`, `get_theme`, `get_setup_guide`, `add_components`.
- Per-item JSON on the docs site: `/r/<name>.json` (source, demos, props).
