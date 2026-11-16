# Orra UI design rules

Always apply these when writing or editing UI in a project that uses Orra UI.

## Use the library first

- Check the catalog (`components.md`, or the MCP `search_components` tool) before building any UI element by hand.
- npm mode: `import { Button, Select, SelectItem } from "@orra-ui/react"`. Source mode: `npx -y @orra-ui/cli add <name> --yes`, then import from the copied file.
- Compose and wrap existing components instead of writing lookalikes.

## Color: semantic tokens only

- Never raw palette classes (`text-gray-500`, `bg-white`, `border-zinc-200`) or hex/rgb/oklch literals. Dark mode is automatic because every token flips under `.dark`; never write `dark:` overrides.
- Surfaces: `bg-canvas` (page), `bg-surface` (cards, inputs), `bg-surface-muted` (wells, tracks), `bg-surface-raised` (menus, dialogs), `bg-surface-hover` / `bg-surface-active` (interactive rows).
- Text: `text-fg`, `text-fg-muted`, `text-fg-subtle`, `text-fg-disabled`, `text-fg-accent`, `text-fg-on-accent`.
- Lines: `border-line` (hairlines, card borders), `border-line-strong` (control borders).
- Brand: `accent-50 … accent-950`; primary surfaces use `bg-accent-gradient`.
- Status pairs: `text-success` + `bg-success-soft`, likewise `warning`, `danger`, `info`.
- Charts: `var(--color-chart-1)` … `chart-8`, `chart-grid`, `chart-axis`.

## Type

- Size utilities set size, line-height and tracking together: `text-display-lg`, `text-display`, `text-title-lg`, `text-title`, `text-title-sm`, `text-body-lg`, `text-body`, `text-body-sm`, `text-caption`, `text-micro`.
- Pair with a weight: `font-medium` for labels and headings, `font-semibold` for titles and numbers. Use `tabular-nums` for figures.
- Never use Tailwind's raw `text-sm` / `text-xs` scale.

## Shape, space, elevation

- Radii: `rounded-control` (10px: buttons, inputs, rows), `rounded-menu` (14px: menus, popovers), `rounded-card` (20px: cards, dialogs), `rounded-full` (pills, avatars).
- Cards: `rounded-card border border-line bg-surface shadow-card`, padding `p-5`. Floating layers use `shadow-popover`.
- Use the 4px spacing scale and `gap-*` instead of per-child margins.

## Mechanics

- Merge classes with `cx()` from `@orra-ui/react`.
- Icons from `@remixicon/react`, passed as elements: `startIcon={<RiAddLine />}`, `icon={<RiMoreLine />}`.
- Form controls are React Aria based: use `Input`, `Textarea`, `Select`, `Combobox`, `Checkbox`, `Switch`, `NumberField`… and their React Aria props (`isDisabled`, `isInvalid`, `onChange`, `selectedKey`).
- Buttons use `onPress`. Icon-only buttons need `aria-label`.
- Logical properties for RTL (`ms/me`, `ps/pe`, `start/end`, `text-start`).
- Stateful UI, handlers and tables live in `"use client"` modules.
- Built-in copy follows the locale (Chinese or English); wrap the app in `<OrraProvider locale="zh-CN">` to set it explicitly, and use each component's `labels` prop to override strings.
