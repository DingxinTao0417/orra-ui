# Orra UI brand assets

The mark is a halo ring broken at the top right, with a lit orb resting in the gap: an aura that is "on" — data lighting up, an agent at work.

| File | Use |
| --- | --- |
| `orra-mark.svg` | Primary mark, gradient, transparent background |
| `orra-mark-mono.svg` | Single color (`currentColor`), for print, watermarks, monochrome UI |
| `orra-icon.svg` | App icon / favicon: white mark on the brand-blue tile |
| `orra-icon-dark.svg` | App icon on a dark navy tile |
| `orra-icon-square.svg` | Full-bleed square (platforms that round corners themselves) |
| `orra-avatar.svg` · `png/orra-avatar-1024.png` | GitHub org / npm / social avatar |
| `orra-wordmark.svg` · `orra-wordmark-dark.svg` | Mark + "Orra UI" for light / dark backgrounds (text set in Inter) |
| `orra-og.svg` · `png/orra-og-1200x630.png` | Social share image |
| `png/apple-touch-icon-180.png` | iOS home-screen icon |
| `explore.html` | The four directions that were compared (A was chosen) |

## Geometry (64 × 64 grid)

- Ring: center (32, 32), radius 18, stroke 6.8, round caps, open from 15° to 75°.
- Orb: center (44.73, 19.27), radius 4.8 — on the ring path at 45°, with ≥ 1.2 units of air to each cap.
- Clear space: keep at least the orb's diameter around the mark. Minimum size 16 px.

## Colors

| Role | Value |
| --- | --- |
| Ring gradient | `#38BDF8` → `#3B82F6` → `#8B5CF6` |
| Orb | `#FFFFFF` → `#67E8F9` → `#3B82F6` (radial) |
| Brand tile | `#4F8BFF` → `#4338CA` |
| Dark tile | `#151A33` → `#0B1020` |

On the docs site the tile follows the theme's accent ramp (`--color-accent-400` → `--color-accent-700`), so it re-tints with the accent picker.
