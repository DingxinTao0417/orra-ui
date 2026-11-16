"use client";

import { useSyncExternalStore } from "react";

/* ===========================================================================
 * Theme mode (light / dark / system) and runtime accent colour.
 * Both persist to localStorage and broadcast a window event so every
 * subscribed component re-renders.
 * ======================================================================== */

export type ThemeMode = "light" | "dark" | "system";

import { ACCENT_STORAGE_KEY, ACCENT_STYLE_ID, THEME_STORAGE_KEY } from "./theme-script";

export { ACCENT_STORAGE_KEY, THEME_STORAGE_KEY, themeScript } from "./theme-script";
const THEME_EVENT = "orra:theme";
const ACCENT_EVENT = "orra:accent";

const isBrowser = () => typeof window !== "undefined";

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: keep the in-memory choice */
  }
}

/* ---------------------------------------------------------------- mode */

export function getThemeMode(): ThemeMode {
  if (!isBrowser()) return "system";
  const stored = readStorage(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode !== "system") return mode;
  return isBrowser() && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Applies a mode: toggles `.dark` on <html>, persists it and notifies subscribers. */
export function setThemeMode(mode: ThemeMode) {
  if (!isBrowser()) return;
  writeStorage(THEME_STORAGE_KEY, mode === "system" ? null : mode);
  document.documentElement.classList.toggle("dark", resolveTheme(mode) === "dark");
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: mode }));
}

function subscribeTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMedia = () => {
    if (getThemeMode() === "system") setThemeMode("system");
    callback();
  };
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  media.addEventListener("change", onMedia);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
    media.removeEventListener("change", onMedia);
  };
}

/** Current mode plus the resolved light/dark value. */
export function useThemeMode() {
  const mode = useSyncExternalStore(subscribeTheme, getThemeMode, () => "system" as ThemeMode);
  const resolved = useSyncExternalStore(
    subscribeTheme,
    () => resolveTheme(getThemeMode()),
    () => "light" as const,
  );
  return { mode, resolved, setMode: setThemeMode };
}

/* -------------------------------------------------------------- accent */

export const ACCENT_PRESETS = {
  blue: "#3B7BF6",
  indigo: "#5B5FEF",
  violet: "#8B5CF6",
  pink: "#E84C9A",
  rose: "#EF4565",
  orange: "#F2711C",
  amber: "#E8A317",
  green: "#22A35A",
  teal: "#14A39A",
  cyan: "#0EA5C6",
  slate: "#5B6577",
} as const;

export type AccentPreset = keyof typeof ACCENT_PRESETS;
export const DEFAULT_ACCENT: AccentPreset = "blue";

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const LIGHT_L = [0.97, 0.94, 0.885, 0.8, 0.7, 0.615, 0.54, 0.47, 0.405, 0.355, 0.26];
const LIGHT_C = [0.07, 0.15, 0.29, 0.53, 0.8, 1, 1.04, 0.95, 0.78, 0.59, 0.41];
const DARK_L = [0.24, 0.29, 0.36, 0.46, 0.58, 0.66, 0.72, 0.79, 0.86, 0.92, 0.96];
const DARK_C = [0.29, 0.41, 0.58, 0.78, 0.93, 0.88, 0.73, 0.54, 0.34, 0.2, 0.1];

/** sRGB hex → OKLCH ({ l: 0–1, c, h: degrees }). Returns null for invalid input. */
export function hexToOklch(hex: string): { l: number; c: number; h: number } | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let v = m[1]!;
  if (v.length === 3) v = v.split("").map((ch) => ch + ch).join("");
  const toLinear = (n: number) => {
    const s = n / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = toLinear(parseInt(v.slice(0, 2), 16));
  const g = toLinear(parseInt(v.slice(2, 4), 16));
  const b = toLinear(parseInt(v.slice(4, 6), 16));
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.sqrt(A * A + B * B);
  let h = (Math.atan2(B, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

/** Builds the light and dark 11-step accent ramps for a seed colour. */
export function buildAccentRamps(seed: string) {
  const o = hexToOklch(seed);
  if (!o) return null;
  const chroma = Math.max(0.02, Math.min(o.c, 0.24));
  const ramp = (ls: number[], cs: number[]) =>
    Object.fromEntries(SHADES.map((s, i) => [s, `oklch(${ls[i]} ${(chroma * cs[i]!).toFixed(4)} ${o.h.toFixed(2)})`])) as Record<(typeof SHADES)[number], string>;
  return { light: ramp(LIGHT_L, LIGHT_C), dark: ramp(DARK_L, DARK_C) };
}

/** CSS that overrides the accent ramp for both themes. */
export function accentCss(seed: string): string | null {
  const ramps = buildAccentRamps(seed);
  if (!ramps) return null;
  const decl = (r: Record<string, string>) => Object.entries(r).map(([s, v]) => `--orra-accent-${s}:${v};`).join("");
  return `:root{${decl(ramps.light)}}.dark{${decl(ramps.dark)}}`;
}

export type AccentChoice = { preset: AccentPreset } | { hex: string };

export function getAccent(): AccentChoice | null {
  if (!isBrowser()) return null;
  const raw = readStorage(ACCENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as { choice: AccentChoice }).choice ?? null;
  } catch {
    return null;
  }
}

/** Re-tints the whole UI. Pass a preset name, any hex colour, or null to reset. */
export function setAccent(choice: AccentChoice | null) {
  if (!isBrowser()) return;
  document.getElementById(ACCENT_STYLE_ID)?.remove();
  const seed = choice ? ("preset" in choice ? ACCENT_PRESETS[choice.preset] : choice.hex) : null;
  const isDefault = !choice || ("preset" in choice && choice.preset === DEFAULT_ACCENT);
  const css = seed && !isDefault ? accentCss(seed) : null;
  if (css) {
    const style = document.createElement("style");
    style.id = ACCENT_STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
    writeStorage(ACCENT_STORAGE_KEY, JSON.stringify({ choice, css }));
  } else {
    writeStorage(ACCENT_STORAGE_KEY, null);
  }
  window.dispatchEvent(new CustomEvent(ACCENT_EVENT));
}

function subscribeAccent(callback: () => void) {
  window.addEventListener(ACCENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(ACCENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

let accentSnapshotKey = "";
let accentSnapshot: AccentChoice | null = null;
function accentSnapshotFn() {
  const raw = isBrowser() ? readStorage(ACCENT_STORAGE_KEY) ?? "" : "";
  if (raw !== accentSnapshotKey) {
    accentSnapshotKey = raw;
    accentSnapshot = getAccent();
  }
  return accentSnapshot;
}

/** The current accent choice (null = default). */
export function useAccent() {
  const accent = useSyncExternalStore(subscribeAccent, accentSnapshotFn, () => null);
  return { accent, setAccent };
}
