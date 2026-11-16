# Orra UI — component specs

What each component must do. These are product requirements, not implementations: design the API and visuals yourself, following `CONVENTIONS.md`. Slugs match `apps/docs/registry/items/<slug>.json`.

---

## Form controls

- **input**: Text field with label, description, error message, optional start/end icon or start/end addon (e.g. a URL prefix), clear button option, sizes, and password reveal toggle for `type="password"`. Exports `Input` (all-in-one) and lower-level parts if useful.
- **textarea**: Multi-line field with label/description/error, auto-grow between min and max rows, optional character counter with limit.
- **input-otp**: One-time-code input: N single-character boxes (default 6), optional separator after every K boxes, paste/autofill distributes digits, Backspace/arrow navigation, `onComplete`, invalid state, numeric by default with an alphanumeric option.
- **number-field**: Numeric input with decrement/increment steppers, min/max/step, locale formatting (currency, percent, units via `formatOptions`), label/description/error.
- **search-field**: Search input with leading icon, clear button, Escape to clear, optional keyboard shortcut hint (e.g. ⌘K) on the end side.
- **time-field**: Segmented time entry (hours/minutes, optional seconds), 12/24-hour cycle, label/description/error. Avoid SSR hydration mismatches.
- **select**: Single choice from a list in a popover listbox: label, placeholder, items with optional icon/description, sections, disabled items, sizes. Trigger uses `fieldBox`, popup uses `floatingPanel` + `menuItem`, selected row shows a check.
- **combobox**: Type-to-filter select with the same popup styling; empty state; items with icon/description; plain-string children usable as text values.
- **checkbox**: Checkbox with label and description, indeterminate state, group with a group label, and a "card" style (bordered selectable tile). Animated check mark.
- **radio**: Radio group (vertical/horizontal) with labels/descriptions, and a card-style variant (selectable tiles, e.g. plan picker).
- **switch**: Toggle with label/description, two sizes, and a card/row style for settings lists.
- **slider**: Single-value and range slider with label, value output, min/max/step, optional ticks/marks, tooltips/value bubbles while dragging, formatted values.
- **color-picker**: Saturation/brightness area + hue slider + optional alpha, hex input, preset swatches; a compact swatch trigger that opens it in a popover.
- **file-upload**: Drop zone (drag & drop + click to browse) with accepted types/size hints, list of files with icon, size, progress bar, success/error state, remove/retry. Upload logic is the consumer's: the component reports files and renders the progress you pass in.
- **tag-group**: Group of tags/pills: selectable (single/multiple) filters, removable tags, optional "add" input, empty state.
- **segmented-control**: Inline single-choice switcher with an animated sliding indicator; sizes; icons optional; full-width option.

## Overlays, menus & navigation

- **modal**: Dialog over a dimmed backdrop: title, description, body, footer actions, close button, sizes (sm/md/lg/full), dismissable or not; plus an alert/confirm variant (destructive confirm, async pending state). Enter/exit animation.
- **drawer**: Side sheet from the end/start edge, or a bottom sheet; header/body/footer layout; sizes; sticky footer actions.
- **popover**: Anchored rich content (with or without arrow), placement, title + body + actions pattern, non-modal option.
- **tooltip**: Short hint on hover/focus, placement, delay, optional shortcut chip inside; works on the library's own buttons (export whatever wrapper is needed for non-React-Aria triggers).
- **dropdown**: Action menu from a trigger: items with icon, description, shortcut, sections with headings, separators, destructive items, submenus, checkbox/radio items.
- **context-menu**: Right-click (and long-press / keyboard Shift+F10) menu on any area, same item features as dropdown, opened at the pointer.
- **command-palette**: ⌘K dialog: search input, grouped results (pages, actions, recent), items with icon / description / shortcut, keyboard navigation, empty state, footer with key hints; configurable shortcut (or none).
- **toast**: Imperative `toast()` / `toast.success|error|info|promise` API plus a `<Toaster />` region: stacked, timed, pausable on hover, with title/description/action/close, and update-in-place.
- **notification**: Inline notification/alert banner (info/success/warning/danger) with icon, title, description, actions and dismiss; plus a "card" style for an activity item with avatar.
- **tabs**: Tabs with underline style and pill/segment style, icons and counts, horizontal and vertical orientation (both must look right), keyboard navigation, tab panels.
- **breadcrumb**: Path trail with separators, current page, icons, and collapsing middle levels into a "…" menu when long.
- **pagination**: Page numbers with ellipses, previous/next, compact mode on narrow widths, page-size select and "x–y of z" summary option.
- **accordion**: Expandable sections (single or multiple open), animated height, optional icons and subtitles, a bordered and a flush variant.
- **tree-view**: Nested tree (folders/files), expand/collapse, selection (single/multiple with checkboxes), icons, keyboard navigation, optional actions on hover.
- **date-calendar**: Inline month calendar for a single date and a range variant; min/max, unavailable dates, week starts per locale.
- **date-picker**: Field + calendar popover for a single date, with presets (today, tomorrow, next week) and clear.
- **date-range-picker**: Field + popover with two side-by-side months and preset ranges (last 7/30 days, this month, this year…), apply/cancel.
- **meeting-scheduler**: Booking panel: host summary (avatar, meeting title, duration, location/video), calendar to pick a day, list of time slots for that day, time zone label, confirm action; controlled value; compact layout on narrow widths.

## Display & feedback

- **badge**: Small status label: tones (neutral, accent, success, warning, danger, info), soft/solid/outline variants, optional dot or icon; plus a standalone `StatusDot` with an optional pulse.
- **chip**: Interactive compact token: selectable, removable, with avatar/icon; used for filters and recipients.
- **avatar**: Image with fallback initials (deterministic colour from the name), sizes, status indicator, square option; `AvatarGroup` with overlap and "+N".
- **kbd**: Keyboard key chip; renders combos like ⌘ K with platform-aware modifier symbols.
- **divider**: Horizontal/vertical separator, optional centred label ("or"), dashed variant.
- **spinner**: Loading indicator in sizes and tones; a distinctive Orra design (e.g. orbiting dot around a ring).
- **skeleton**: Placeholder shapes (text lines, circle, rect, card) with shimmer; a helper that swaps skeleton → content with a soft fade.
- **progress**: Linear bar and circular ring, determinate and indeterminate, label + value, tones, sizes.
- **meter**: Usage meter (value against a limit) whose tone shifts as it fills (ok → warning → critical), label and "x of y" text, segmented style option.
- **announcement**: Dismissible top banner / inline pill for product news: badge ("New"), message, link, close.
- **carousel**: Horizontal slider of cards: snap scrolling, previous/next buttons, dots, optional autoplay, keyboard support, peeking next slide.
- **table**: Styled data table on React Aria Table: sortable columns, row selection with checkboxes, sticky header, density (comfortable/compact), alignment per column, empty state; cell helpers (user cell with avatar, status badge).
- **link-button**: Inline text action that looks like a link (underline on hover), tones, optional icon, works as <a> or <button>.
- **close-button**: The small × button for dialogs, panels, toasts; sizes; accessible label from copy.
- **button-group**: Fused row of buttons (shared borders, first/last radius), optional selected item, works with icon buttons; size flows to children.
- **social-button**: Sign-in buttons for common providers (Google, GitHub, Apple, Microsoft, X, Facebook, Discord, GitLab, Slack, LinkedIn, WeChat, Alipay…): brand logo, "Continue with …" localized label, outline / filled / icon-only styles. Draw logos as inline SVG.

## Charts

All charts render inside the shared `chart-card` shell unless used bare. Colours come from `chart-1…8`. Tooltips, legends and axes share one style. Each chart accepts data + series config and has neutral sample data.

- **chart-card**: Card shell for charts: title, headline value with delta badge, description, period/range selector (segmented or select), legend, body slot, footer slot, loading and empty states. Also export shared parts: tooltip content, legend, axis tick styles, range hooks.
- **area-chart**: Smooth area series (single, stacked, percent, overlapping), comparison series dashed, gradient fill, hover crosshair.
- **line-chart**: Lines with dots on hover, curved or straight, multiple series, target/reference line.
- **bar-chart**: Vertical bars, grouped or stacked, rounded tops, period comparison (this vs last), horizontal option.
- **bar-list**: Ranked rows with proportional bars behind labels (e.g. top pages / countries), value + share, tabs to switch dimension, "show all".
- **combo-chart**: Bars + line on dual axes (e.g. revenue + margin %).
- **donut-chart**: Donut / pie with centre total, legend with values and shares, hover highlight.
- **gauge-chart**: Semi- or three-quarter radial gauge for a score / goal (0–100), with label, target marker, tone by threshold.
- **rings-chart**: Concentric progress rings (e.g. move/exercise/stand goals) with legend rows.
- **radar-chart**: Radar with one or more series, filled or outlined, dots option.
- **funnel-chart**: Conversion funnel with stage values, conversion % between stages, horizontal tapered or vertical bars.
- **heatmap-chart**: Matrix heatmap (rows × columns, e.g. weekday × hour) with a colour scale legend; plus a calendar/contribution variant (weeks × days over a year).
- **sankey-chart**: Flow diagram (sources → targets) with tinted links and node values.
- **scatter-chart**: Scatter / bubble chart with optional size dimension and quadrant reference lines.
- **sparkline**: Tiny inline trend line/area/bars for stat tiles and tables, with optional end dot and min/max markers.

## Agent (AI) components

- **agent-avatar**: Animated identity for an AI agent: a generative orb/blob whose colours derive from a seed/name, with states (idle, thinking, speaking, working, error) expressed by motion; sizes; static fallback for reduced motion.
- **agent-thinking**: "Thinking…" indicator with an elapsed timer and an expandable reasoning section (streaming text), several indicator styles (dots, pulse, shimmer).
- **agent-log**: Vertical activity log of an agent run: steps (tool call, file edit, search, message) with icons, status, timestamps, collapsible details, live "working" row.
- **agent-progress**: Multi-step plan progress: list of steps with pending/active/done/failed states, overall progress bar, collapsible, "n steps left" summary, animated transitions.
- **agent-limits**: Usage card for an AI plan: context window used, token/requests quotas with meters, reset times, upgrade action.
- **composer-loader**: Animated working state around/inside a chat composer (e.g. a light sweeping along the border) with a stop button.
- **composer-panel**: Chat input panel: auto-growing textarea, attachments row, toolbar with add-menu (files, images, tools), model picker, mode/permission picker, voice button, send/stop button; ⌘/Ctrl+Enter to send; disabled & loading states.
- **composer-attachments**: Attachment tiles for a composer: image thumbnails and file tiles (icon, name, size), upload progress, remove buttons, appear-animation.
- **model-picker**: Popover to pick an AI model grouped by provider (provider monogram/logo), search, model badges (fast, reasoning, vision), and an effort/temperature control.
- **questionnaire**: Clarifying questions an agent asks before acting: one question at a time with single/multi-choice options, free-text "other", progress dots, back/next/skip, summary at the end.
- **task-list**: Streaming checklist of tasks that reveal one by one, with done/working states and optional collapse when complete.
- **web-search**: Research trail: queries the agent ran, sources it opened (favicon monogram, title, domain), reading/summarizing states, citations.

## Blocks

- **auth-card**: Sign-in / sign-up card: logo slot, title, email (+ password) fields, social buttons, divider, terms text, and a one-time-code step; switch between modes.
- **calendar**: Full month-view calendar block: month header with navigation and view switch, day grid with event pills (colour per calendar), "+N more", today highlight, event detail popover; takes events as props.
- **data-grid**: Spreadsheet-like editable grid: cell selection with keyboard, inline editing, column resizing, sort, filter, row selection, sticky first column, footer summaries (sum/avg/count), virtual height.
- **notification-center**: Inbox popover/panel: tabs (all/unread/mentions), grouped by day, items with avatar/icon, actions (accept/decline), mark all read, empty state.
- **settings-modal**: Multi-page settings dialog: left nav of sections (general, profile, notifications, appearance, billing…), each page built from setting rows (label + description + control), save state.
- **sidebar**: App navigation sidebar: workspace switcher, search button, nav sections with icons/badges/nested items, collapse to icon rail, user menu at the bottom, mobile drawer mode.
- **stat-cards**: KPI tiles in a grid: label, value, delta badge vs previous period, optional icon and sparkline, loading state; responsive columns.
- **theme-toggle**: Light/dark/system switcher (segmented and icon-button styles) using `setThemeMode` / `useThemeMode` from `src/lib/theme.ts`; smooth theme transition.
- **accent-picker**: Accent colour picker: grid of preset swatches + custom colour, using `setAccent` / `useAccent` from `src/lib/theme.ts`; shows the active choice.
