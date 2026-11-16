# Orra UI — component conventions

Every component in `@orra-ui/react` follows these rules. Read them before writing or changing a component. The reference implementations are `src/components/button/button.tsx` and `src/components/icon-button/icon-button.tsx`.

## Originality (hard rule)

Orra UI is written from scratch. When building a component, work only from `SPECS.md`, these conventions, and public library docs (React Aria Components, Recharts, Motion, Tailwind). **Never open, search or copy from any other UI library's source**, including anything under a `legacy` folder or the user's Downloads folder. Design your own structure, API, class lists and sample data.

## File layout

- One folder per registry slug: `src/components/<slug>/<slug>.tsx`. Extra files for the same component stay in that folder (`<slug>-data.ts`, `parts.tsx`…).
- First line of every component file: `"use client";`.
- Import shared code relatively from `../../lib/*`, and other components from `../<slug>/<slug>`.
- Don't edit `src/index.ts`: it's generated from every module's exports at build time. Export names must be unique across the library, so prefix generic helpers (`ChartLegend`, not `Legend`).

## Stack

- **Behaviour & accessibility:** `react-aria-components`. Use RAC primitives (Button, TextField, Select, ComboBox, Menu, Popover, Dialog, Modal, Tabs, Table, Tree, Calendar, ColorPicker, Slider, Switch, Checkbox, RadioGroup, TagGroup, Toast…) rather than hand-rolled ARIA.
- **Animation:** CSS first (the `animate-in` / `animate-out` utilities, `transition-*`). Use `motion/react` only for layout or spring animations, and respect `useReducedMotion()`.
- **Charts:** `recharts`.
- **Icons:** `@remixicon/react`. Components take icons as **elements** (`startIcon={<RiAddLine />}`, `icon={<RiMoreLine />}`), not component references.
- **Dates:** `@internationalized/date`.

## Styling: tokens only

Use the semantic utilities from `@orra-ui/styles` (`packages/styles/tokens.css`). No raw palette classes (`gray-500`, `white`, `blue-600`), no hex/rgb in class names, and no `dark:` variants: the tokens flip automatically.

| Need | Utilities |
| --- | --- |
| Page / card / well | `bg-canvas`, `bg-surface`, `bg-surface-muted`, `bg-surface-raised` (menus, dialogs), `bg-surface-inverse` |
| Hover / pressed rows | `bg-surface-hover`, `bg-surface-active` |
| Text | `text-fg`, `text-fg-muted`, `text-fg-subtle`, `text-fg-disabled`, `text-fg-accent`, `text-fg-on-accent`, `text-fg-inverse` |
| Lines | `border-line` (hairlines), `border-line-strong` (control borders), `border-line-hover` |
| Brand | `accent-50 … accent-950` (`bg-accent-500`, `text-accent-600`…), `bg-accent-gradient` for primary surfaces |
| Status | `text-success` + `bg-success-soft`, `warning`, `danger`, `info` (same pattern) |
| Charts | `chart-1 … chart-8`, `chart-grid`, `chart-axis` (as `var(--color-chart-1)` inside SVG props) |
| Elevation | `shadow-xs`, `shadow-card`, `shadow-raised`, `shadow-popover`, `shadow-accent` |
| Shape | `rounded-control` (10px: buttons, inputs, rows), `rounded-menu` (14px: menus, popovers), `rounded-card` (20px: cards, dialogs), `rounded-full` (pills, avatars) |
| Type | `text-display-lg`, `text-display`, `text-title-lg`, `text-title`, `text-title-sm`, `text-body-lg`, `text-body`, `text-body-sm`, `text-caption`, `text-micro`, plus `font-medium` / `font-semibold`. Numbers: `tabular-nums`. |
| Motion | `animate-in` / `animate-out` (popovers, menus), `animate-dialog-in/out`, `animate-sheet-in-right/left/bottom` + `-out-`, `animate-fade-in`, `animate-rise`, `text-shimmer`, `bg-skeleton`, `ease-out-soft`, `ease-in-out-soft` |

Shared recipes in `src/lib/recipes.ts` keep families identical; **use them instead of re-inventing**:

- `controlSize[size]`, `iconSize[size]`: height/padding/text per size for anything control-shaped.
- `fieldBox` + `fieldInput`: the box for every text-like input (Input, Textarea, Select trigger, Combobox, NumberField, TimeField, SearchField, DatePicker field…).
- `floatingPanel`, `menuItem`, `menuHeading`: every popover, menu, listbox, select/combobox popup, context menu and command palette.
- `card`: cards and panels. `overlayBackdrop`: modal backdrops. `focusRing`: keyboard focus.

Merge classes with `cx()` from `src/lib/cx.ts`. Let consumers pass `className` and merge it last.

## API conventions

- **Sizes:** `size?: "sm" | "md" | "lg"` (default `"md"`) wherever size makes sense.
- **Visual style:** `variant` for shape/fill (e.g. `"solid" | "outline" | "soft" | "plain"`), `tone` for colour role (`"accent" | "neutral" | "danger"` or status names).
- **State:** support both controlled and uncontrolled use (`value`/`defaultValue`/`onChange`, `open`/`defaultOpen`/`onOpenChange`, `selectedKey`…). Prefer passing through React Aria's own props; `useControllableState` exists for custom state.
- **Booleans:** use React Aria names (`isDisabled`, `isInvalid`, `isRequired`, `isReadOnly`) for form controls, since they pass straight through. Use plain names (`loading`, `fullWidth`, `round`) for visual flags.
- **Refs:** React 19 `ref` prop on the main element.
- **Copy:** never hard-code user-facing English. Use `useCopy(COPY, props.labels)` from `src/lib/copy.ts`, with `en` and `zh` dictionaries, and expose a `labels?: Partial<…>` prop. The language follows the React Aria locale.
- **Data-driven components** (charts, tables, lists, cards) take data via props and ship sensible demo defaults only if they are clearly marked as such (e.g. `data = SAMPLE_REVENUE`). Write your own sample data: realistic, neutral, varied.
- **Formatting:** numbers/dates via `Intl` with the React Aria locale (`useLocale()`), plus helpers in `src/lib/format.ts`.
- **RTL:** logical properties only (`ms/me`, `ps/pe`, `start/end`, `text-start`, `border-s`, `rounded-e`). Mirror directional icons with `rtl:-scale-x-100`.
- **Accessibility:** icon-only buttons need `aria-label`; overlays trap focus (React Aria does it); tables and lists have labels; colour is never the only signal.

## Look & feel (same family, everywhere)

- Calm, airy, precise. Canvas is a very light grey; content sits on white `bg-surface` cards with a hairline `border-line` and `shadow-card`.
- One accent colour, used sparingly: primary actions, selection, focus, key data.
- Card anatomy: `card` recipe, padding `p-5` (dense `p-4`), header row = title (`text-body font-medium text-fg`) + optional description (`text-body-sm text-fg-subtle`) + actions on the end side.
- Controls are 36px tall by default (`md`) with a 10px radius. Menus and popovers float on `bg-surface-raised` with `shadow-popover`.
- Motion is short and soft: hovers 150ms; overlays rise 6px and fade in 200ms; exits are faster than entrances.

## Checklist before you finish a component

1. `npx tsc -p tsconfig.json --noEmit` in `packages/react` passes.
2. No raw colours, no `dark:`, no hard-coded English UI strings.
3. Works with keyboard only; focus ring visible.
4. Controlled and uncontrolled both work.
5. Demos and registry JSON written (see `apps/docs/registry/AUTHORING.md`).
