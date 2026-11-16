"use client";

import type { ReactNode, Ref } from "react";
import { Label as AriaLabel, Meter as AriaMeter, useLocale } from "react-aria-components";
import type { MeterProps as AriaMeterProps } from "react-aria-components";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import type { Size } from "../../lib/recipes";

const COPY = {
  en: { of: "{value} of {max}", ok: "Healthy", warning: "Nearing limit", critical: "At limit", low: "Running low", empty: "Almost empty" },
  zh: { of: "{value} / {max}", ok: "正常", warning: "接近上限", critical: "已达上限", low: "余量不足", empty: "即将耗尽" },
};
export type MeterLabels = (typeof COPY)["en"];

export type MeterLevel = "ok" | "warning" | "critical";

const FILL: Record<MeterLevel, string> = { ok: "bg-success", warning: "bg-warning", critical: "bg-danger" };
const STATUS_TEXT: Record<MeterLevel, string> = { ok: "text-success", warning: "text-warning", critical: "text-danger" };
const TRACK: Record<Size, string> = { sm: "h-1.5", md: "h-2", lg: "h-3" };

export interface MeterProps extends Omit<AriaMeterProps, "className" | "children" | "valueLabel"> {
  /** Visible label, e.g. "存储空间". Without it, pass `aria-label`. */
  label?: ReactNode;
  /** Secondary text under the bar, e.g. "下次重置：12 月 1 日". */
  description?: ReactNode;
  /** Fractions (0–1) of the range where the tone turns warning / critical. */
  thresholds?: { warning?: number; critical?: number };
  /** For "remaining" meters (battery, credits): low values are the bad ones. */
  invert?: boolean;
  /** Draw the bar as N separate segments. */
  segments?: number;
  /** Show the status word (e.g. "接近上限") next to the value when not ok. Default true. */
  showStatus?: boolean;
  /** Replace the "x / y" text. */
  valueLabel?: string;
  /** Use the accent colour at the ok level instead of success green. */
  accentWhenOk?: boolean;
  size?: Size;
  labels?: Partial<MeterLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** Which level a value falls in, given thresholds as fractions of the range. */
export function meterLevel(fraction: number, thresholds: { warning?: number; critical?: number } = {}, invert = false): MeterLevel {
  const warning = thresholds.warning ?? (invert ? 0.3 : 0.75);
  const critical = thresholds.critical ?? (invert ? 0.1 : 0.9);
  if (invert) return fraction <= critical ? "critical" : fraction <= warning ? "warning" : "ok";
  return fraction >= critical ? "critical" : fraction >= warning ? "warning" : "ok";
}

/**
 * Usage meter: a value against a limit whose colour shifts as it fills
 * (ok → warning → critical), with "x / y" text and a status word so colour is
 * never the only signal.
 *
 *   <Meter label="存储空间" value={42} maxValue={50} formatOptions={{ style: "unit", unit: "gigabyte" }} />
 */
export function Meter({
  label,
  description,
  thresholds,
  invert = false,
  segments,
  showStatus = true,
  valueLabel,
  accentWhenOk,
  size = "md",
  labels,
  className,
  ref,
  value = 0,
  minValue = 0,
  maxValue = 100,
  formatOptions,
  ...props
}: MeterProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const range = maxValue - minValue || 1;
  const fraction = Math.min(1, Math.max(0, (value - minValue) / range));
  const level = meterLevel(fraction, thresholds, invert);
  const fmt = new Intl.NumberFormat(locale, formatOptions ?? { maximumFractionDigits: 1 });
  const text = valueLabel ?? fill(t.of, { value: fmt.format(value), max: fmt.format(maxValue) });
  const statusWord = level === "ok" ? null : invert ? (level === "critical" ? t.empty : t.low) : level === "critical" ? t.critical : t.warning;
  const fillClass = level === "ok" && accentWhenOk ? "bg-accent-500" : FILL[level];

  return (
    <AriaMeter
      {...props}
      ref={ref}
      value={value}
      minValue={minValue}
      maxValue={maxValue}
      formatOptions={formatOptions}
      valueLabel={statusWord ? `${text} · ${statusWord}` : text}
      className={cx("flex w-full flex-col gap-2", className)}
    >
      {() => (
        <>
          <div className="flex items-baseline justify-between gap-3 text-body-sm">
            {label != null ? <AriaLabel className="truncate font-medium text-fg">{label}</AriaLabel> : <span />}
            <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
              {showStatus && statusWord ? <span className={cx("text-caption font-medium", STATUS_TEXT[level])}>{statusWord}</span> : null}
              <span className="text-fg-muted">{text}</span>
            </span>
          </div>
          {segments && segments > 1 ? (
            <div className={cx("flex w-full gap-1", TRACK[size])}>
              {Array.from({ length: segments }, (_, i) => {
                const segFill = Math.min(1, Math.max(0, fraction * segments - i));
                return (
                  <div key={i} className="relative h-full flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <div className={cx("h-full rounded-full transition-[width] duration-500 ease-out-soft", fillClass)} style={{ width: `${segFill * 100}%` }} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={cx("w-full overflow-hidden rounded-full bg-surface-muted", TRACK[size])}>
              <div
                className={cx("h-full rounded-full transition-[width,background-color] duration-500 ease-out-soft", fillClass)}
                style={{ width: `${fraction * 100}%` }}
              />
            </div>
          )}
          {description != null ? <span className="text-caption text-fg-subtle">{description}</span> : null}
        </>
      )}
    </AriaMeter>
  );
}
