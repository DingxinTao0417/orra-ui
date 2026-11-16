"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode, Ref } from "react";
import { useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import { chartToneColor, createChartFormatter, useChartLabels, type ChartLabels, type ChartTone, type ChartValueFormat } from "../chart-card/chart-parts";

export interface GaugeThreshold {
  /** From this value upwards the gauge takes `tone`. */
  value: number;
  tone: ChartTone;
}

export interface GaugeChartProps {
  /** Current value (defaults to a clearly-marked sample of 72). */
  value?: number;
  min?: number;
  max?: number;
  /** `semi`: 180° arc; `three-quarter`: 270° arc. */
  variant?: "semi" | "three-quarter";
  /** Goal marker on the arc. */
  target?: number;
  /** Caption under the value. */
  label?: ReactNode;
  /** Extra line under the caption (e.g. a delta badge). */
  description?: ReactNode;
  /** Colour by value: the highest threshold ≤ value wins. */
  thresholds?: GaugeThreshold[];
  /** Fixed tone (ignored when thresholds are given). */
  tone?: ChartTone;
  /** Arc thickness in viewBox units (track radius is 80). */
  thickness?: number;
  valueFormat?: ChartValueFormat;
  /** Show min / max labels at the arc ends. */
  showRange?: boolean;
  /** Max width in px; the gauge scales down with its container. */
  size?: number;
  "aria-label"?: string;
  className?: string;
  labels?: Partial<ChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

const R = 80;
const C = 100;

function polar(angle: number, r = R) {
  const rad = (angle * Math.PI) / 180;
  // Rounded so server and client render identical attributes (no hydration mismatch).
  return { x: Math.round((C + r * Math.cos(rad)) * 100) / 100, y: Math.round((C - r * Math.sin(rad)) * 100) / 100 };
}

function arc(start: number, sweep: number) {
  const a = polar(start);
  const b = polar(start - sweep);
  return `M ${a.x} ${a.y} A ${R} ${R} 0 ${sweep > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}

/**
 * Radial gauge for a score or goal: semi or three-quarter arc, tone by
 * threshold, optional target marker. Exposed to assistive tech as a meter.
 */
export function GaugeChart({
  value = 72,
  min = 0,
  max = 100,
  variant = "semi",
  target,
  label,
  description,
  thresholds,
  tone = "accent",
  thickness = 14,
  valueFormat = "number",
  showRange = true,
  size = 260,
  className,
  labels,
  ref,
  ...rest
}: GaugeChartProps) {
  const { locale } = useLocale();
  const t = useChartLabels(labels);
  const fmt = useMemo(() => createChartFormatter(valueFormat, locale), [valueFormat, locale]);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const semi = variant === "semi";
  const start = semi ? 180 : 225;
  const sweep = semi ? 180 : 270;
  const height = semi ? C + thickness / 2 + 4 : C + R * Math.SQRT1_2 + thickness / 2 + 6;
  const clamp = (v: number) => Math.max(0, Math.min(1, (v - min) / (max - min || 1)));
  const ratio = clamp(value);

  const activeTone = thresholds?.length
    ? ([...thresholds].sort((a, b) => a.value - b.value).filter((th) => value >= th.value).pop()?.tone ?? thresholds[0]!.tone)
    : tone;
  const color = chartToneColor(activeTone);
  const track = arc(start, sweep);
  const targetAngle = target != null ? start - sweep * clamp(target) : null;
  const ends = [polar(start), polar(start - sweep)];

  return (
    <div
      ref={ref}
      role="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={fmt(value)}
      aria-label={rest["aria-label"] ?? (typeof label === "string" ? label : undefined)}
      className={cx("mx-auto flex w-full flex-col items-center", className)}
      style={{ maxWidth: size }}
    >
      <div className="relative w-full">
        <svg viewBox={`0 0 200 ${height.toFixed(1)}`} className="block w-full overflow-visible" aria-hidden>
          {thresholds?.length
            ? [...thresholds]
                .sort((a, b) => a.value - b.value)
                .map((th, i, all) => {
                  const from = clamp(Math.max(th.value, min));
                  const to = clamp(all[i + 1]?.value ?? max);
                  if (to <= from) return null;
                  const r = R + thickness / 2 + 5;
                  const a = polar(start - sweep * from, r);
                  const b = polar(start - sweep * to, r);
                  return (
                    <path
                      key={i}
                      d={`M ${a.x} ${a.y} A ${r} ${r} 0 ${sweep * (to - from) > 180 ? 1 : 0} 1 ${b.x} ${b.y}`}
                      fill="none"
                      stroke={chartToneColor(th.tone)}
                      strokeOpacity={0.45}
                      strokeWidth={2}
                    />
                  );
                })
            : null}
          <path d={track} fill="none" stroke="var(--color-chart-grid)" strokeWidth={thickness} strokeLinecap="round" />
          {ratio > 0 ? (
            <path
              d={track}
              pathLength={100}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${shown ? ratio * 100 : 0} 100`}
              className="transition-[stroke-dasharray,stroke] duration-700 ease-out-soft motion-reduce:transition-none"
            />
          ) : null}
          {targetAngle != null ? (
            <g>
              {(() => {
                const a = polar(targetAngle, R - thickness / 2 - 4);
                const b = polar(targetAngle, R + thickness / 2 + 4);
                return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--color-fg)" strokeWidth={2.5} strokeLinecap="round" />;
              })()}
            </g>
          ) : null}
        </svg>
        <div
          className={cx("pointer-events-none absolute inset-x-0 flex flex-col items-center text-center", semi ? "bottom-0" : "top-0")}
          style={semi ? undefined : { height: `${((2 * C) / height) * 100}%`, justifyContent: "center" }}
        >
          <span className="text-display font-semibold leading-none tabular-nums text-fg">{fmt(value)}</span>
          {label != null ? <span className="mt-1.5 text-body-sm text-fg-muted">{label}</span> : null}
        </div>
        {showRange
          ? ends.map((p, i) => (
              <span
                key={i}
                aria-hidden
                className="absolute text-caption tabular-nums text-fg-subtle"
                style={{ left: `${(p.x / 2).toFixed(2)}%`, top: `${(((p.y + thickness / 2 + 4) / height) * 100).toFixed(2)}%`, transform: "translateX(-50%)" }}
              >
                {fmt(i === 0 ? min : max)}
              </span>
            ))
          : null}
      </div>
      {target != null || description != null ? (
        <div className={cx("flex flex-col items-center gap-1.5 text-caption text-fg-subtle", showRange ? "mt-7" : "mt-3")}>
          {target != null ? (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="h-3 w-0.5 rounded-full bg-fg" />
              {t.target} <span className="font-medium tabular-nums text-fg">{fmt(target)}</span>
            </span>
          ) : null}
          {description}
        </div>
      ) : showRange ? (
        <div className="h-6" />
      ) : null}
    </div>
  );
}
