"use client";

import { Fragment, useSyncExternalStore } from "react";
import type { HTMLAttributes, ReactNode, Ref } from "react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import type { Size } from "../../lib/recipes";

export type KbdPlatform = "mac" | "other";

const COPY = {
  en: {
    ctrl: "Control",
    cmd: "Command",
    alt: "Option",
    altOther: "Alt",
    shift: "Shift",
    enter: "Enter",
    esc: "Escape",
    tab: "Tab",
    backspace: "Backspace",
    delete: "Delete",
    space: "Space",
    up: "Arrow up",
    down: "Arrow down",
    left: "Arrow left",
    right: "Arrow right",
    win: "Windows",
  },
  zh: {
    ctrl: "Control",
    cmd: "Command",
    alt: "Option",
    altOther: "Alt",
    shift: "Shift",
    enter: "回车",
    esc: "Esc",
    tab: "Tab",
    backspace: "退格",
    delete: "删除",
    space: "空格",
    up: "上箭头",
    down: "下箭头",
    left: "左箭头",
    right: "右箭头",
    win: "Windows",
  },
};
export type KbdLabels = (typeof COPY)["en"];

/* ------------------------------------------------------------ platform */

function detectPlatform(): KbdPlatform {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const name = nav.userAgentData?.platform || nav.platform || nav.userAgent;
  return /mac|iphone|ipad|ipod/i.test(name) ? "mac" : "other";
}
const noopSubscribe = () => () => {};

/**
 * "mac" on Apple platforms, otherwise "other". Renders "other" on the server
 * and during hydration, then switches without a mismatch.
 */
export function useKeyboardPlatform(): KbdPlatform {
  return useSyncExternalStore(noopSubscribe, detectPlatform, () => "other");
}

/* --------------------------------------------------------------- keys */

type KeyInfo = { glyph: string; label?: keyof KbdLabels; wide?: boolean };

function describeKey(raw: string, platform: KbdPlatform): KeyInfo {
  const key = raw.trim();
  const mac = platform === "mac";
  switch (key.toLowerCase()) {
    case "mod":
      return mac ? { glyph: "⌘", label: "cmd" } : { glyph: "Ctrl", label: "ctrl", wide: true };
    case "cmd":
    case "command":
    case "meta":
      return mac ? { glyph: "⌘", label: "cmd" } : { glyph: "Win", label: "win", wide: true };
    case "ctrl":
    case "control":
      return mac ? { glyph: "⌃", label: "ctrl" } : { glyph: "Ctrl", label: "ctrl", wide: true };
    case "alt":
    case "option":
    case "opt":
      return mac ? { glyph: "⌥", label: "alt" } : { glyph: "Alt", label: "altOther", wide: true };
    case "shift":
      return mac ? { glyph: "⇧", label: "shift" } : { glyph: "Shift", label: "shift", wide: true };
    case "enter":
    case "return":
      return { glyph: "↵", label: "enter" };
    case "esc":
    case "escape":
      return { glyph: "Esc", label: "esc", wide: true };
    case "tab":
      return { glyph: "⇥", label: "tab" };
    case "backspace":
      return { glyph: "⌫", label: "backspace" };
    case "delete":
    case "del":
      return { glyph: "⌦", label: "delete" };
    case "space":
      return { glyph: "␣", label: "space" };
    case "up":
    case "arrowup":
      return { glyph: "↑", label: "up" };
    case "down":
    case "arrowdown":
      return { glyph: "↓", label: "down" };
    case "left":
    case "arrowleft":
      return { glyph: "←", label: "left" };
    case "right":
    case "arrowright":
      return { glyph: "→", label: "right" };
    default:
      return { glyph: key.length === 1 ? key.toUpperCase() : key, wide: key.length > 1 };
  }
}

/* ------------------------------------------------------------- styles */

const KEY_SIZE: Record<Size, string> = {
  sm: "h-[18px] min-w-[18px] px-1 text-[10.5px] rounded-[5px]",
  md: "h-[22px] min-w-[22px] px-1.5 text-caption rounded-[6px]",
  lg: "h-[26px] min-w-[26px] px-2 text-body-sm rounded-[7px]",
};

const VARIANTS = {
  outline: "border border-line-strong border-b-[1.5px] bg-surface text-fg-muted shadow-xs",
  soft: "bg-surface-muted text-fg-muted",
  ghost: "text-fg-subtle",
} as const;
export type KbdVariant = keyof typeof VARIANTS;

export interface KbdProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /**
   * Key combo. A string like "mod+k" / "shift+enter", or an array of keys.
   * `mod` becomes ⌘ on Apple platforms and Ctrl elsewhere.
   */
  keys?: string | string[];
  /** Free content instead of `keys` (rendered as a single key chip). */
  children?: ReactNode;
  size?: Size;
  variant?: KbdVariant;
  /** Render the whole combo in one chip (⌘K) instead of one chip per key. */
  joined?: boolean;
  /** Force a platform; defaults to the detected one. */
  platform?: KbdPlatform;
  labels?: Partial<KbdLabels>;
  ref?: Ref<HTMLElement>;
}

function splitKeys(keys: string | string[]): string[] {
  if (Array.isArray(keys)) return keys;
  // "mod+k", "shift + /" and the literal "+" key all work.
  return keys === "+" ? ["+"] : keys.split(/\s*\+\s*(?!$)/).map((k) => (k === "" ? "+" : k));
}

/**
 * Keyboard key chip. Renders shortcut combos with platform-aware modifier
 * symbols, and gives every symbol a spoken name for screen readers.
 *
 *   <Kbd keys="mod+k" />          → ⌘ K  (Ctrl K on Windows)
 *   <Kbd keys={["shift", "enter"]} joined />
 *   <Kbd>Esc</Kbd>
 */
export function Kbd({ keys, children, size = "md", variant = "outline", joined, platform, labels, className, ref, ...props }: KbdProps) {
  const t = useCopy(COPY, labels);
  const detected = useKeyboardPlatform();
  const os = platform ?? detected;
  const chip = cx(
    "inline-flex shrink-0 select-none items-center justify-center gap-0.5 font-sans font-medium leading-none tabular-nums",
    KEY_SIZE[size],
    VARIANTS[variant],
  );

  if (keys == null) {
    return (
      <kbd {...props} ref={ref} className={cx(chip, className)}>
        {children}
      </kbd>
    );
  }

  const parts = splitKeys(keys).map((k) => describeKey(k, os));
  const render = (p: KeyInfo, i: number) =>
    p.label ? (
      <abbr key={i} title={t[p.label]} aria-label={t[p.label]} className="no-underline">
        {p.glyph}
      </abbr>
    ) : (
      <Fragment key={i}>{p.glyph}</Fragment>
    );

  if (joined) {
    return (
      <kbd {...props} ref={ref} className={cx(chip, os === "mac" ? "gap-0.5" : "gap-1", className)}>
        {parts.map((p, i) => (
          <Fragment key={i}>
            {i > 0 && os !== "mac" ? <span aria-hidden className="opacity-50">+</span> : null}
            {render(p, i)}
          </Fragment>
        ))}
      </kbd>
    );
  }

  return (
    <kbd {...props} ref={ref} className={cx("inline-flex items-center gap-1 align-middle", className)}>
      {parts.map((p, i) => (
        <kbd key={i} className={chip}>
          {render(p, i)}
        </kbd>
      ))}
    </kbd>
  );
}
