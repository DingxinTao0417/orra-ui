"use client";

import type { Ref } from "react";
import { Button as AriaButton } from "react-aria-components";
import { RiComputerLine, RiMoonClearLine, RiSunLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { buttonClass } from "../button/button";
import type { Size } from "../../lib/recipes";
import { setThemeMode, useThemeMode, type ThemeMode } from "../../lib/theme";
import { Dropdown, DropdownItem } from "../dropdown/dropdown";
import { SegmentedControl } from "../segmented-control/segmented-control";
import { Tooltip } from "../tooltip/tooltip";

const COPY = {
  en: { theme: "Theme", light: "Light", dark: "Dark", system: "System", toLight: "Switch to light theme", toDark: "Switch to dark theme" },
  zh: { theme: "主题", light: "浅色", dark: "深色", system: "跟随系统", toLight: "切换到浅色主题", toDark: "切换到深色主题" },
};
export type ThemeToggleLabels = (typeof COPY)["en"];

const MODES: ThemeMode[] = ["light", "system", "dark"];
const ICONS = { light: <RiSunLine />, dark: <RiMoonClearLine />, system: <RiComputerLine /> } as const;

/* ------------------------------------------------------------ transition */

const FADE_STYLE_ID = "orra-theme-fade";

/**
 * Applies a theme mode with a soft cross-fade: a View Transition where the
 * browser supports it, otherwise a short colour transition on every element.
 * Skipped entirely for users who prefer reduced motion.
 */
export function setThemeModeWithTransition(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    setThemeMode(mode);
    return;
  }
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(() => setThemeMode(mode));
    return;
  }
  document.getElementById(FADE_STYLE_ID)?.remove();
  const style = document.createElement("style");
  style.id = FADE_STYLE_ID;
  style.textContent =
    "*,*::before,*::after{transition:background-color 220ms ease,border-color 220ms ease,color 220ms ease,fill 220ms ease,box-shadow 220ms ease!important}";
  document.head.appendChild(style);
  setThemeMode(mode);
  window.setTimeout(() => style.remove(), 280);
}

/* ------------------------------------------------------------ component */

export type ThemeToggleVariant = "segmented" | "icon" | "menu";

export interface ThemeToggleProps {
  /**
   * `segmented` (default): light / system / dark switcher.
   * `icon`: one icon button that flips between light and dark.
   * `menu`: an icon button that opens a menu with all three modes.
   */
  variant?: ThemeToggleVariant;
  size?: Size;
  /** Segmented: show text labels next to the icons. */
  showLabels?: boolean;
  /** Segmented: stretch to the container width. */
  fullWidth?: boolean;
  /** Cross-fade the page while switching (default true). */
  animated?: boolean;
  /** Called after the mode changes. */
  onChange?: (mode: ThemeMode) => void;
  labels?: Partial<ThemeToggleLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Light / dark / system switcher wired to the library theme store
 * (`setThemeMode` / `useThemeMode`): the choice persists and every toggle on
 * the page stays in sync.
 *
 *   <ThemeToggle />                 // segmented
 *   <ThemeToggle variant="icon" />  // sun / moon button
 */
export function ThemeToggle({
  variant = "segmented",
  size = "md",
  showLabels = false,
  fullWidth,
  animated = true,
  onChange,
  labels,
  className,
  ref,
}: ThemeToggleProps) {
  const t = useCopy(COPY, labels);
  const { mode, resolved } = useThemeMode();
  const apply = (next: ThemeMode) => {
    if (next === mode) return;
    (animated ? setThemeModeWithTransition : setThemeMode)(next);
    onChange?.(next);
  };

  if (variant === "segmented") {
    return (
      <SegmentedControl
        ref={ref}
        aria-label={t.theme}
        size={size}
        fullWidth={fullWidth}
        value={mode}
        onChange={(v) => apply(v as ThemeMode)}
        className={className}
        options={MODES.map((m) => ({
          id: m,
          icon: ICONS[m],
          label: showLabels ? t[m] : undefined,
          "aria-label": showLabels ? undefined : t[m],
        }))}
      />
    );
  }

  const square = { sm: "size-8 px-0", md: "size-9 px-0", lg: "size-11 px-0" }[size];
  const glyph = { sm: "size-4", md: "size-[18px]", lg: "size-5" }[size];
  const isDark = resolved === "dark";

  // Sun and moon are stacked; the inactive one rotates and fades out.
  const icon = (
    <span className={cx("relative inline-flex", glyph)} aria-hidden>
      <RiSunLine
        className={cx(
          "absolute inset-0 size-full transition-[opacity,rotate,scale] duration-300 ease-out-soft motion-reduce:transition-none",
          isDark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
      />
      <RiMoonClearLine
        className={cx(
          "absolute inset-0 size-full transition-[opacity,rotate,scale] duration-300 ease-out-soft motion-reduce:transition-none",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0",
        )}
      />
    </span>
  );

  if (variant === "icon") {
    const label = isDark ? t.toLight : t.toDark;
    return (
      <div ref={ref} className={cx("inline-flex", className)}>
        <Tooltip content={label}>
          <AriaButton
            aria-label={label}
            onPress={() => apply(isDark ? "light" : "dark")}
            className={cx(buttonClass({ variant: "plain", tone: "neutral", size }), square)}
          >
            {icon}
          </AriaButton>
        </Tooltip>
      </div>
    );
  }

  return (
    <div ref={ref} className={cx("inline-flex", className)}>
      <Dropdown
        aria-label={t.theme}
        placement="bottom end"
        className="min-w-40"
        selectionMode="single"
        selectedKeys={[mode]}
        disallowEmptySelection
        onSelectionChange={(keys) => {
          const next = [...(keys as Set<string>)][0] as ThemeMode | undefined;
          if (next) apply(next);
        }}
        trigger={
          <AriaButton aria-label={t.theme} className={cx(buttonClass({ variant: "plain", tone: "neutral", size }), square)}>
            {icon}
          </AriaButton>
        }
      >
        {MODES.map((m) => (
          <DropdownItem key={m} id={m} icon={ICONS[m]}>
            {t[m]}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}
