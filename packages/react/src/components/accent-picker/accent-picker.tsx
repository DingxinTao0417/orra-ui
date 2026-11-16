"use client";

import { useRef, useState } from "react";
import type { CSSProperties, Ref } from "react";
import { Button as AriaButton, Dialog, DialogTrigger, Popover as AriaPopover, Radio, RadioGroup } from "react-aria-components";
import { RiAddLine, RiPaletteLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { CheckGlyph } from "../../lib/glyphs";
import { buttonClass } from "../button/button";
import { floatingPanel, type Size } from "../../lib/recipes";
import { ACCENT_PRESETS, DEFAULT_ACCENT, setAccent, useAccent, type AccentChoice, type AccentPreset } from "../../lib/theme";
import { ColorPickerPanel } from "../color-picker/color-picker";
import { PopoverArrow } from "../popover/popover";

const COPY = {
  en: {
    accent: "Accent colour",
    custom: "Custom colour",
    customValue: "Custom {hex}",
    reset: "Reset to default",
    current: "Current: {name}",
    blue: "Blue",
    indigo: "Indigo",
    violet: "Violet",
    pink: "Pink",
    rose: "Rose",
    orange: "Orange",
    amber: "Amber",
    green: "Green",
    teal: "Teal",
    cyan: "Cyan",
    slate: "Slate",
  },
  zh: {
    accent: "主题色",
    custom: "自定义颜色",
    customValue: "自定义 {hex}",
    reset: "恢复默认",
    current: "当前：{name}",
    blue: "海蓝",
    indigo: "靛青",
    violet: "紫罗兰",
    pink: "桃粉",
    rose: "玫红",
    orange: "橙",
    amber: "琥珀",
    green: "翠绿",
    teal: "青碧",
    cyan: "湖蓝",
    slate: "石板灰",
  },
};
export type AccentPickerLabels = (typeof COPY)["en"];

const SWATCH: Record<Size, string> = { sm: "size-6", md: "size-8", lg: "size-10" };
const CHECK: Record<Size, string> = { sm: "size-3", md: "size-4", lg: "size-5" };
const CUSTOM_KEY = "__custom";

/** Display name and hex for the current choice. */
function describe(choice: AccentChoice | null, t: AccentPickerLabels) {
  if (!choice) return { name: t[DEFAULT_ACCENT], hex: ACCENT_PRESETS[DEFAULT_ACCENT] as string };
  if ("preset" in choice) return { name: t[choice.preset], hex: ACCENT_PRESETS[choice.preset] as string };
  return { name: fill(t.customValue, { hex: choice.hex.toUpperCase() }), hex: choice.hex };
}

export interface AccentPickerProps {
  /** Which presets to offer, in order (default: all of `ACCENT_PRESETS`). */
  presets?: AccentPreset[];
  /** Offer a custom colour swatch that opens a full colour picker (default true). */
  allowCustom?: boolean;
  /** `inline` (default): the swatch grid. `popover`: a compact button that opens the grid. */
  variant?: "inline" | "popover";
  size?: Size;
  /** Show the name of the active colour under the swatches. */
  showValue?: boolean;
  /** Called after the accent changes (null = default). */
  onChange?: (choice: AccentChoice | null) => void;
  labels?: Partial<AccentPickerLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Accent colour picker wired to the library theme store (`setAccent` /
 * `useAccent`): preset swatches plus an optional custom colour. Picking one
 * re-tints the whole UI and persists the choice.
 *
 *   <AccentPicker />
 *   <AccentPicker variant="popover" />
 */
export function AccentPicker({ variant = "inline", ...props }: AccentPickerProps) {
  const t = useCopy(COPY, props.labels);
  const { accent } = useAccent();
  if (variant === "inline") return <AccentGrid {...props} />;
  const { hex, name } = describe(accent, t);
  const size = props.size ?? "md";
  return (
    <div ref={props.ref} className={cx("inline-flex", props.className)}>
      <DialogTrigger>
        <AriaButton aria-label={`${t.accent} · ${name}`} className={buttonClass({ variant: "outline", tone: "neutral", size })}>
          <span aria-hidden className="size-4 shrink-0 rounded-full shadow-[inset_0_0_0_1px_var(--color-line)]" style={{ background: hex }} />
          <span className="truncate">{name}</span>
          <RiPaletteLine aria-hidden className="size-4 shrink-0 text-fg-subtle" />
        </AriaButton>
        <AriaPopover placement="bottom start" offset={10} className={cx(floatingPanel, "p-3")}>
          <PopoverArrow />
          <Dialog aria-label={t.accent} className="outline-none">
            <AccentGrid {...props} ref={undefined} className="w-[232px]" showValue={props.showValue ?? true} />
          </Dialog>
        </AriaPopover>
      </DialogTrigger>
    </div>
  );
}

function AccentGrid({
  presets = Object.keys(ACCENT_PRESETS) as AccentPreset[],
  allowCustom = true,
  size = "md",
  showValue = false,
  onChange,
  labels,
  className,
  ref,
}: Omit<AccentPickerProps, "variant">) {
  const t = useCopy(COPY, labels);
  const { accent } = useAccent();
  const [customOpen, setCustomOpen] = useState(false);
  const customRef = useRef<HTMLLabelElement>(null);
  const current = describe(accent, t);
  const isCustom = !!accent && "hex" in accent;
  const selected = !accent ? DEFAULT_ACCENT : "preset" in accent ? accent.preset : CUSTOM_KEY;

  const choose = (choice: AccentChoice | null) => {
    setAccent(choice);
    onChange?.(choice);
  };

  const swatchClass = cx(
    "relative grid shrink-0 cursor-default place-items-center rounded-full outline-none",
    "transition-[scale,box-shadow] duration-150 ease-out-soft data-[hovered]:scale-110 data-[pressed]:scale-95",
    "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-fg)_12%,transparent)]",
    "data-[selected]:ring-2 data-[selected]:ring-[var(--swatch)] data-[selected]:ring-offset-2 data-[selected]:ring-offset-surface",
    "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-4 data-[focus-visible]:outline-focus",
    SWATCH[size],
  );

  return (
    <div ref={ref} className={cx("flex flex-col gap-2.5", className)}>
      <RadioGroup
        aria-label={t.accent}
        orientation="horizontal"
        value={selected}
        onChange={(v) => {
          if (v === CUSTOM_KEY) {
            setCustomOpen(true);
            return;
          }
          choose(v === DEFAULT_ACCENT ? null : { preset: v as AccentPreset });
        }}
        className="flex flex-wrap gap-2.5"
      >
        {presets.map((p) => (
          <Radio
            key={p}
            value={p}
            aria-label={t[p]}
            className={swatchClass}
            style={{ background: ACCENT_PRESETS[p], "--swatch": ACCENT_PRESETS[p] } as CSSProperties}
          >
            {({ isSelected }) => (isSelected ? <CheckGlyph className={cx("text-fg-on-accent drop-shadow-sm", CHECK[size])} /> : null)}
          </Radio>
        ))}
        {allowCustom ? (
          <span
            className="contents"
            onClickCapture={() => {
              if (isCustom) setCustomOpen(true);
            }}
            onKeyDownCapture={(e) => {
              if (isCustom && e.key === "Enter") setCustomOpen(true);
            }}
          >
            <Radio
              ref={customRef}
              value={CUSTOM_KEY}
              aria-label={isCustom ? current.name : t.custom}
              className={cx(swatchClass, !isCustom && "text-fg-muted")}
              style={
                {
                  background: isCustom
                    ? current.hex
                    : "conic-gradient(from 90deg, oklch(0.7 0.16 20), oklch(0.75 0.15 90), oklch(0.72 0.15 160), oklch(0.68 0.15 250), oklch(0.66 0.17 320), oklch(0.7 0.16 20))",
                  "--swatch": isCustom ? current.hex : "var(--color-fg-subtle)",
                } as CSSProperties
              }
            >
              {({ isSelected }) =>
                isSelected ? (
                  <CheckGlyph className={cx("text-fg-on-accent drop-shadow-sm", CHECK[size])} />
                ) : (
                  <span className="grid size-[70%] place-items-center rounded-full bg-surface">
                    <RiAddLine aria-hidden className={CHECK[size]} />
                  </span>
                )
              }
            </Radio>
            <AriaPopover
              triggerRef={customRef}
              isOpen={customOpen}
              onOpenChange={setCustomOpen}
              placement="bottom"
              offset={10}
              className={cx(floatingPanel, "p-3")}
            >
              <PopoverArrow />
              <Dialog aria-label={t.custom} className="outline-none">
                <ColorPickerPanel defaultValue={current.hex} swatches={[]} onChange={(color) => choose({ hex: color.toString("hex") })} />
              </Dialog>
            </AriaPopover>
          </span>
        ) : null}
      </RadioGroup>
      {showValue ? (
        <div className="flex items-center gap-2 text-body-sm text-fg-muted">
          <span className="min-w-0 flex-1 truncate">{fill(t.current, { name: current.name })}</span>
          {accent ? (
            <AriaButton
              onPress={() => choose(null)}
              className="rounded-[6px] text-body-sm font-medium text-fg-accent outline-none data-[hovered]:underline data-[focus-visible]:focus-ring"
            >
              {t.reset}
            </AriaButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
