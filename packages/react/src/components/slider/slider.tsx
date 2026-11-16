"use client";

import type { ReactNode, Ref } from "react";
import { Label, Slider as AriaSlider, SliderOutput, SliderThumb, SliderTrack, useLocale } from "react-aria-components";
import type { SliderProps as AriaSliderProps } from "react-aria-components";
import { cx } from "../../lib/cx";

export interface SliderMark {
  value: number;
  /** Text under the mark; omit for a bare tick. */
  label?: ReactNode;
}

export interface SliderProps<T extends number | number[] = number | number[]> extends Omit<AriaSliderProps<T>, "className" | "children" | "orientation"> {
  label?: ReactNode;
  /** Show the formatted value next to the label (default true when there is a label). */
  showValue?: boolean;
  /** Custom value text, e.g. `(v) => \`${v[0]}–${v[1]} 元\``. */
  formatValue?: (values: number[]) => ReactNode;
  /**
   * Ticks / labelled marks under the track. `true` draws a tick at every
   * step; a number draws that many evenly spaced ticks; an array places marks.
   */
  marks?: boolean | number | Array<number | SliderMark>;
  /** Value bubble above the thumb: while dragging/focused (default), always, or never. */
  bubble?: "active" | "always" | "never";
  /** Accessible names for the thumbs of a range slider, e.g. ["最低价", "最高价"]. */
  thumbLabels?: string[];
  description?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

function normaliseMarks(marks: SliderProps["marks"], min: number, max: number, step: number): SliderMark[] {
  if (!marks) return [];
  if (marks === true) {
    const count = Math.round((max - min) / step);
    if (count > 40) return [];
    return Array.from({ length: count + 1 }, (_, i) => ({ value: min + i * step }));
  }
  if (typeof marks === "number") {
    return Array.from({ length: marks }, (_, i) => ({ value: min + ((max - min) * i) / Math.max(1, marks - 1) }));
  }
  return marks.map((m) => (typeof m === "number" ? { value: m } : m));
}

/**
 * Single-value or range slider (pass an array value for a range). Shows the
 * formatted value, optional ticks / labelled marks and a value bubble while
 * dragging.
 *
 *   <Slider label="音量" defaultValue={60} />
 *   <Slider label="价格区间" defaultValue={[200, 800]} maxValue={1000} step={50}
 *     formatOptions={{ style: "currency", currency: "CNY", maximumFractionDigits: 0 }} />
 */
export function Slider<T extends number | number[] = number | number[]>({
  label,
  showValue,
  formatValue,
  marks,
  bubble = "active",
  thumbLabels,
  description,
  className,
  ref,
  minValue = 0,
  maxValue = 100,
  step = 1,
  ...props
}: SliderProps<T>) {
  const { locale } = useLocale();
  const fmt = new Intl.NumberFormat(locale, props.formatOptions);
  const markList = normaliseMarks(marks, minValue, maxValue, step);
  const hasLabels = markList.some((m) => m.label != null);
  const pct = (v: number) => ((v - minValue) / (maxValue - minValue)) * 100;

  return (
    <AriaSlider<T>
      {...props}
      ref={ref}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      className={cx("group flex w-full flex-col gap-2 data-[disabled]:opacity-55", className)}
    >
      {({ state }) => {
        const values = state.values;
        const range = values.length > 1;
        const lo = range ? pct(values[0]!) : 0;
        const hi = pct(values[values.length - 1]!);
        return (
          <>
            {label || showValue ? (
              <div className="flex items-center justify-between gap-3">
                {label ? <Label className="text-body-sm font-medium text-fg">{label}</Label> : <span />}
                {showValue ?? !!label ? (
                  <SliderOutput className="text-body-sm font-medium text-fg-muted tabular-nums">
                    {formatValue ? formatValue(values) : values.map((v) => fmt.format(v)).join(" – ")}
                  </SliderOutput>
                ) : null}
              </div>
            ) : null}
            <SliderTrack className={cx("relative h-5 w-full", bubble === "always" && "mt-6")}>
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-active" />
              <div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent-500 group-data-[disabled]:bg-fg-disabled"
                style={{ insetInlineStart: `${lo}%`, width: `${hi - lo}%` }}
              />
              {markList.map((m) => {
                const p = pct(m.value);
                const inside = range ? p >= lo && p <= hi : p <= hi;
                return (
                  <span
                    key={m.value}
                    aria-hidden
                    className={cx("absolute top-1/2 size-1 -translate-1/2 rounded-full rtl:translate-x-1/2", inside ? "bg-fg-on-accent/80" : "bg-fg-subtle/60")}
                    style={{ insetInlineStart: `${p}%` }}
                  />
                );
              })}
              {values.map((v, i) => (
                <SliderThumb
                  key={i}
                  index={i}
                  aria-label={thumbLabels?.[i]}
                  className={cx(
                    "top-1/2 size-[18px] rounded-full border-2 border-accent-500 bg-fg-on-accent shadow-raised outline-none",
                    "transition-[box-shadow,border-color,scale] duration-150 ease-out-soft",
                    "data-[hovered]:ring-6 data-[hovered]:ring-accent-500/15 data-[dragging]:ring-6 data-[dragging]:ring-accent-500/20 data-[dragging]:scale-110",
                    "data-[focus-visible]:focus-ring data-[disabled]:border-fg-disabled",
                  )}
                >
                  {({ isDragging, isFocusVisible }) =>
                    bubble !== "never" ? (
                      <span
                        className={cx(
                          "pointer-events-none absolute bottom-full start-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-inverse px-1.5 py-0.5 text-caption font-medium text-fg-inverse tabular-nums shadow-raised rtl:translate-x-1/2",
                          "transition-[opacity,translate] duration-150 ease-out-soft",
                          bubble === "always" || isDragging || isFocusVisible ? "opacity-100" : "translate-y-1 opacity-0",
                        )}
                      >
                        {fmt.format(v)}
                      </span>
                    ) : null
                  }
                </SliderThumb>
              ))}
            </SliderTrack>
            {hasLabels ? (
              <div className="relative h-4 text-caption text-fg-subtle">
                {markList.map((m) =>
                  m.label != null ? (
                    <span
                      key={m.value}
                      className="absolute top-0 -translate-x-1/2 whitespace-nowrap tabular-nums rtl:translate-x-1/2"
                      style={{ insetInlineStart: `${pct(m.value)}%` }}
                    >
                      {m.label}
                    </span>
                  ) : null,
                )}
              </div>
            ) : null}
            {description ? <span className="text-caption text-fg-subtle">{description}</span> : null}
          </>
        );
      }}
    </AriaSlider>
  );
}
