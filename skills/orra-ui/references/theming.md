# Orra UI theming

Orra UI is CSS-first Tailwind v4. All design tokens live in `@orra-ui/styles` (`tokens.css`, `typography.css`, `motion.css`, `base.css`), which `@orra-ui/react/styles.css` includes.

## How tokens work

1. Raw values per theme are custom properties named `--orra-*` on `:root` (light) and `.dark` (dark).
2. `@theme inline` maps them to Tailwind utilities (`--color-surface: var(--orra-surface)` → `bg-surface`, `text-surface`…).

Components only use the semantic utilities, so switching the `.dark` class (or overriding `--orra-*` values) restyles everything.

## Token families

| Family | Utilities |
| --- | --- |
| Surfaces | `bg-canvas`, `bg-surface`, `bg-surface-muted`, `bg-surface-hover`, `bg-surface-active`, `bg-surface-raised`, `bg-surface-inverse`, `bg-overlay` |
| Text | `text-fg`, `text-fg-muted`, `text-fg-subtle`, `text-fg-disabled`, `text-fg-inverse`, `text-fg-on-accent`, `text-fg-accent` |
| Lines | `border-line`, `border-line-strong`, `border-line-hover`, `ring-focus` |
| Accent | `accent-50 … accent-950`, `bg-accent-gradient` |
| Status | `success`, `warning`, `danger`, `info`, each with a `-soft` background |
| Charts | `chart-1 … chart-8`, `chart-grid`, `chart-axis` |
| Elevation | `shadow-xs`, `shadow-card`, `shadow-raised`, `shadow-popover`, `shadow-accent` |
| Shape | `rounded-control` (10px), `rounded-menu` (14px), `rounded-card` (20px) |

## Type scale

| Utility | Size / line height | Use |
| --- | --- | --- |
| `text-display-lg` | 48 / 52 | Hero |
| `text-display` | 36 / 42 | Marketing headings |
| `text-title-lg` | 24 / 30 | Page titles |
| `text-title` | 20 / 28 | Section headings |
| `text-title-sm` | 17 / 24 | Card titles |
| `text-body-lg` | 15 / 23 | Lead text |
| `text-body` | 14 / 21 | Default UI text |
| `text-body-sm` | 13 / 19 | Dense UI text |
| `text-caption` | 12 / 16 | Labels, meta |
| `text-micro` | 11 / 14 | Smallest annotations |

Weights are separate: `font-medium`, `font-semibold`.

## Dark mode

Toggle `.dark` on `<html>`. The `ThemeToggle` component and `setThemeMode("light" | "dark" | "system")` do it and persist the choice. To avoid a flash, inline `themeScript` (from `@orra-ui/react/lib/theme-script`) in `<head>`.

## Brand colour

- At runtime: `setAccent({ preset: "violet" })` or `setAccent({ hex: "#7C3AED" })` builds an 11-step OKLCH ramp for light and dark and persists it; `setAccent(null)` resets.
- In CSS: override the ramp after the import.

  ```css
  @import "tailwindcss";
  @import "@orra-ui/react/styles.css";

  :root { --orra-accent-500: oklch(0.6 0.22 295); --orra-accent-600: oklch(0.53 0.23 295); /* … */ }
  ```

- Any other token can be overridden the same way (e.g. `--orra-radius` values via `@theme`, `--orra-canvas`, chart colours).
