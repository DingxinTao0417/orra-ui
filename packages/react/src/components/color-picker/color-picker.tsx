"use client";

import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Button as AriaButton,
  ColorArea,
  ColorField,
  ColorPicker as AriaColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorThumb,
  Dialog,
  DialogTrigger,
  Input as AriaInput,
  Label,
  Popover,
  SliderTrack,
} from "react-aria-components";
import type { Color, PopoverProps } from "react-aria-components";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { ChevronGlyph } from "../../lib/glyphs";
import { controlSize, fieldBox, fieldInput, floatingPanel, focusRing, type Size } from "../../lib/recipes";

const COPY = {
  en: { area: "Saturation and brightness", hue: "Hue", alpha: "Opacity", hex: "Hex", presets: "Preset colours", pick: "Pick a colour" },
  zh: { area: "饱和度与亮度", hue: "色相", alpha: "不透明度", hex: "HEX", presets: "预设颜色", pick: "选择颜色" },
};
export type ColorPickerLabels = typeof COPY.en;

/** Default swatches (a calm, balanced set — override with `swatches`). */
export const COLOR_PICKER_SWATCHES = [
  "#1F2937",
  "#64748B",
  "#E5484D",
  "#F2711C",
  "#E8A317",
  "#22A35A",
  "#14A39A",
  "#0EA5C6",
  "#3B7BF6",
  "#5B5FEF",
  "#8B5CF6",
  "#E84C9A",
];

/** Checkerboard behind translucent colours, drawn from theme tokens. */
const CHECKER: CSSProperties = {
  backgroundImage: "repeating-conic-gradient(var(--color-surface-active) 0 25%, var(--color-surface) 0 50%)",
  backgroundSize: "8px 8px",
};

const thumbClass = cx(
  "size-5 rounded-full border-2 border-fg-on-accent shadow-raised outline-none",
  "transition-[scale] duration-150 ease-out-soft data-[dragging]:scale-110",
  "data-[focus-visible]:size-6 data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent-500",
);

function ChannelSlider({ channel, label }: { channel: "hue" | "alpha"; label: string }) {
  return (
    <ColorSlider channel={channel} colorSpace="hsb" aria-label={label} className="w-full">
      <div className="relative h-3 w-full rounded-full" style={channel === "alpha" ? CHECKER : undefined}>
        <SliderTrack className="h-3 w-full rounded-full shadow-[inset_0_0_0_1px_var(--color-line)]">
          <ColorThumb className={cx(thumbClass, "top-1/2 size-4 data-[focus-visible]:size-5")} />
        </SliderTrack>
      </div>
    </ColorSlider>
  );
}

export interface ColorPickerPanelProps {
  value?: string | Color;
  defaultValue?: string | Color;
  onChange?: (color: Color) => void;
  /** Show the opacity slider. */
  showAlpha?: boolean;
  /** Preset swatches (hex strings). Pass `[]` to hide. */
  swatches?: string[];
  labels?: Partial<ColorPickerLabels>;
  className?: string;
}

/**
 * The full picker inline: saturation/brightness area, hue slider, optional
 * opacity slider, hex input and preset swatches.
 */
export function ColorPickerPanel({ value, defaultValue = "#3B7BF6", onChange, ...body }: ColorPickerPanelProps) {
  return (
    <AriaColorPicker value={value} defaultValue={value === undefined ? defaultValue : undefined} onChange={onChange}>
      <PanelBody {...body} />
    </AriaColorPicker>
  );
}

/** Picker contents; reads and writes the nearest React Aria ColorPicker. */
function PanelBody({
  showAlpha,
  swatches = COLOR_PICKER_SWATCHES,
  labels,
  className,
}: Pick<ColorPickerPanelProps, "showAlpha" | "swatches" | "labels" | "className">) {
  const t = useCopy(COPY, labels);
  return (
    <div className={cx("flex w-60 flex-col gap-3", className)}>
      <ColorArea
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
        aria-label={t.area}
        className="h-40 w-full rounded-control shadow-[inset_0_0_0_1px_var(--color-line)]"
      >
        <ColorThumb className={thumbClass} />
      </ColorArea>
      <ChannelSlider channel="hue" label={t.hue} />
      {showAlpha ? <ChannelSlider channel="alpha" label={t.alpha} /> : null}
      <div className="flex items-center gap-2">
        <span className="relative size-8 shrink-0 overflow-hidden rounded-lg" style={CHECKER}>
          <ColorSwatch className="absolute inset-0 shadow-[inset_0_0_0_1px_var(--color-line)]" />
        </span>
        <ColorField aria-label={t.hex} className="min-w-0 flex-1">
          <div className={cx(fieldBox, controlSize.sm)}>
            <Label className="text-caption font-medium text-fg-subtle">{t.hex}</Label>
            <AriaInput className={cx(fieldInput, "h-full font-mono uppercase tabular-nums")} />
          </div>
        </ColorField>
      </div>
      {swatches.length ? (
        <ColorSwatchPicker aria-label={t.presets} className="grid grid-cols-[repeat(auto-fill,minmax(1.5rem,1fr))] gap-1.5">
          {swatches.map((c) => (
            <ColorSwatchPickerItem
              key={c}
              color={c}
              className={cx(
                "relative aspect-square cursor-default rounded-md outline-none",
                "data-[selected]:ring-2 data-[selected]:ring-accent-500 data-[selected]:ring-offset-2 data-[selected]:ring-offset-surface-raised",
                "data-[focus-visible]:focus-ring",
              )}
            >
              <ColorSwatch className="size-full rounded-md shadow-[inset_0_0_0_1px_var(--color-line)] transition-[scale] duration-150 hover:scale-110" />
            </ColorSwatchPickerItem>
          ))}
        </ColorSwatchPicker>
      ) : null}
    </div>
  );
}

export interface ColorPickerProps extends ColorPickerPanelProps {
  /** Visible label above the trigger. */
  label?: ReactNode;
  /** `field` (default): swatch + hex in an input-like box. `swatch`: just the colour square. */
  trigger?: "field" | "swatch";
  size?: Size;
  isDisabled?: boolean;
  placement?: PopoverProps["placement"];
  /** Popover open state (optional, controlled). */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const SWATCH_SQ: Record<Size, string> = { sm: "size-8", md: "size-9", lg: "size-11" };

/**
 * A compact colour trigger that opens the full picker in a popover.
 *
 *   <ColorPicker label="品牌色" defaultValue="#5B5FEF" showAlpha />
 */
export function ColorPicker({
  label,
  trigger = "field",
  size = "md",
  isDisabled,
  placement = "bottom start",
  isOpen,
  onOpenChange,
  value,
  defaultValue = "#3B7BF6",
  onChange,
  labels,
  className,
  showAlpha,
  swatches,
}: ColorPickerProps) {
  const t = useCopy(COPY, labels);
  const id = useId();
  return (
    <AriaColorPicker value={value} defaultValue={value === undefined ? defaultValue : undefined} onChange={onChange}>
      {({ color }) => (
        <div className={cx("inline-flex flex-col gap-1.5", trigger === "field" && "w-full", className)}>
          {label ? (
            <span id={`${id}-label`} className="text-body-sm font-medium text-fg">
              {label}
            </span>
          ) : null}
          <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <AriaButton
              isDisabled={isDisabled}
              aria-label={label ? undefined : t.pick}
              aria-labelledby={label ? `${id}-label ${id}-value` : undefined}
              className={
                trigger === "swatch"
                  ? cx("relative cursor-default overflow-hidden rounded-control outline-none data-[disabled]:opacity-50", SWATCH_SQ[size], focusRing)
                  : cx(
                      fieldBox,
                      controlSize[size],
                      "cursor-default ps-1.5 text-start outline-none data-[focus-visible]:border-accent-500 data-[focus-visible]:ring-3 data-[focus-visible]:ring-accent-500/15",
                    )
              }
              data-disabled={isDisabled || undefined}
            >
              {trigger === "swatch" ? (
                <span className="absolute inset-0" style={CHECKER}>
                  <ColorSwatch className="size-full shadow-[inset_0_0_0_1px_var(--color-line)]" />
                </span>
              ) : (
                <>
                  <span className={cx("relative aspect-square h-[calc(100%-10px)] shrink-0 overflow-hidden rounded-md")} style={CHECKER}>
                    <ColorSwatch className="absolute inset-0 shadow-[inset_0_0_0_1px_var(--color-line)]" />
                  </span>
                  <span id={`${id}-value`} className="flex-1 truncate font-mono uppercase tabular-nums">
                    {color.toString(color.getChannelValue("alpha") < 1 ? "hexa" : "hex")}
                  </span>
                  <ChevronGlyph className="size-4 shrink-0 text-fg-subtle" />
                </>
              )}
            </AriaButton>
            <Popover placement={placement} offset={6} className={cx(floatingPanel, "p-3")}>
              <Dialog aria-label={typeof label === "string" ? label : t.pick} className="outline-none">
                <PanelBody showAlpha={showAlpha} swatches={swatches} labels={labels} />
              </Dialog>
            </Popover>
          </DialogTrigger>
        </div>
      )}
    </AriaColorPicker>
  );
}
