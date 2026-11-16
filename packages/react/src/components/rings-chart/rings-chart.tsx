"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode, Ref } from "react";
import { useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import { ChartEmptyState, ChartLegend, chartColor, createChartFormatter, type ChartLabels, type ChartValueFormat } from "../chart-card/chart-parts";

export interface RingsChartItem {
  key?: string;
  label: string;
  value: number;
  /** Value that completes the ring. */
  goal: number;
  color?: string;
  /** Unit after the numbers, e.g. "kcal". */
  unit?: string;
}

export interface RingsChartLabels extends ChartLabels {
  sampleMove: string;
  sampleExercise: string;
  sampleStand: string;
  unitKcal: string;
  unitMin: string;
  unitHour: string;
}

const SAMPLE_COPY = {
  en: { sampleMove: "Move", sampleExercise: "Exercise", sampleStand: "Stand", unitKcal: "kcal", unitMin: "min", unitHour: "h" },
  zh: { sampleMove: "活动", sampleExercise: "锻炼", sampleStand: "站立", unitKcal: "千卡", unitMin: "分钟", unitHour: "小时" },
};

export interface RingsChartProps {
  /** Rings from outside in; defaults to a clearly-marked sample (activity goals). */
  data?: RingsChartItem[];
  /** Diameter in px. */
  size?: number;
  /** Ring thickness in px. */
  thickness?: number;
  /** Space between rings in px. */
  gap?: number;
  valueFormat?: ChartValueFormat;
  /** Legend placement. */
  legend?: "end" | "bottom" | "none";
  /** Content in the middle of the rings. */
  children?: ReactNode;
  "aria-label"?: string;
  className?: string;
  labels?: Partial<RingsChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

function useSample(labels?: Partial<RingsChartLabels>) {
  const { locale } = useLocale();
  const zh = locale.toLowerCase().startsWith("zh");
  return useMemo<RingsChartItem[]>(() => {
    const c = { ...(zh ? SAMPLE_COPY.zh : SAMPLE_COPY.en), ...labels };
    return [
      { key: "move", label: c.sampleMove, value: 486, goal: 600, unit: c.unitKcal, color: chartColor(5) },
      { key: "exercise", label: c.sampleExercise, value: 34, goal: 30, unit: c.unitMin, color: chartColor(7) },
      { key: "stand", label: c.sampleStand, value: 9, goal: 12, unit: c.unitHour, color: chartColor(2) },
    ];
  }, [zh, labels]);
}

/** Concentric progress rings (one per goal) with legend rows showing value / goal and percentage. */
export function RingsChart({ data, size = 168, thickness = 14, gap = 4, valueFormat = "number", legend = "end", children, className, labels, ref, ...rest }: RingsChartProps) {
  const { locale } = useLocale();
  const sample = useSample(labels);
  const items = useMemo(() => (data ?? sample).map((d, i) => ({ ...d, key: d.key ?? d.label, color: d.color ?? chartColor(i) })), [data, sample]);
  const fmt = useMemo(() => createChartFormatter(valueFormat, locale), [valueFormat, locale]);
  const pct = useMemo(() => createChartFormatter({ style: "percent", maximumFractionDigits: 0 }, locale), [locale]);
  const [active, setActive] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!items.length) return <ChartEmptyState height={size} labels={labels} className={className} />;

  const c = size / 2;
  return (
    <div ref={ref} className={cx("flex w-full min-w-0 items-center gap-6", legend === "end" ? "flex-col sm:flex-row" : "flex-col", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={rest["aria-label"] ?? items.map((d) => `${d.label} ${pct(d.value / (d.goal || 1))}`).join(", ")}>
          {items.map((d, i) => {
            const r = c - thickness / 2 - i * (thickness + gap);
            if (r <= thickness / 2) return null;
            const ratio = Math.max(0, Math.min(1, d.value / (d.goal || 1)));
            const dim = active != null && active !== d.key;
            return (
              <g key={d.key} transform={`rotate(-90 ${c} ${c})`} opacity={dim ? 0.35 : 1} className="transition-opacity duration-150">
                <circle cx={c} cy={c} r={r} fill="none" stroke={d.color} strokeOpacity={0.16} strokeWidth={thickness} />
                {ratio > 0 ? (
                  <circle
                    cx={c}
                    cy={c}
                    r={r}
                    fill="none"
                    stroke={d.color}
                    strokeWidth={thickness}
                    strokeLinecap="round"
                    pathLength={100}
                    strokeDasharray={`${shown ? ratio * 100 : 0} 100`}
                    className="transition-[stroke-dasharray] duration-700 ease-out-soft motion-reduce:transition-none"
                  />
                ) : null}
              </g>
            );
          })}
        </svg>
        {children ? <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div> : null}
      </div>
      {legend !== "none" ? (
        <ChartLegend
          variant="list"
          className={cx("w-full min-w-0", legend === "end" && "sm:flex-1")}
          activeKey={active}
          onHighlight={setActive}
          labels={labels}
          items={items.map((d) => ({
            key: d.key,
            label: d.label,
            color: d.color,
            value: (
              <>
                {fmt(d.value)}
                <span className="font-normal text-fg-subtle">
                  {" / "}
                  {fmt(d.goal)}
                  {d.unit ? ` ${d.unit}` : ""}
                </span>
              </>
            ),
            detail: pct(d.value / (d.goal || 1)),
          }))}
        />
      ) : null}
    </div>
  );
}
