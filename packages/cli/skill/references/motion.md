# Orra UI motion

Motion is short, soft and consistent. Reuse these utilities instead of writing new keyframes.

| Utility | What it does |
| --- | --- |
| `animate-in` / `animate-out` | Popovers, menus, selects, tooltips: fade + 6px rise + 0.97 scale in 200ms; out in 140ms |
| `animate-dialog-in` / `animate-dialog-out` | Modals: 12px rise + 0.96 scale in 320ms |
| `animate-sheet-in-right` (`-left`, `-bottom`) + `-out-` | Drawers and bottom sheets |
| `animate-fade-in` | Backdrops, swapped content |
| `animate-rise` | List items / cards appearing (420ms) |
| `text-shimmer` | Shimmering "working…" text |
| `bg-skeleton` | Loading placeholders |
| `ease-out-soft`, `ease-in-out-soft` | The two easing curves |

With React Aria, apply them to state attributes: `data-[entering]:animate-in data-[exiting]:animate-out`.

Rules:

1. Hover and press feedback: colour transitions at `duration-150`; press darkens or lowers opacity, it never scales.
2. Exits are faster than entrances.
3. Use `motion/react` only for layout and spring animation, and check `useReducedMotion()`.
4. `prefers-reduced-motion` is honoured globally by `@orra-ui/styles`.
