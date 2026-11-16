"use client";

import { useId, useMemo } from "react";
import type { Ref } from "react";
import { Area, AreaChart as RAreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import {
  ChartEmptyState,
  ChartLegend,
  ChartPlot,
  ChartTooltipContent,
  chartAxisProps,
  chartGridProps,
  chartLineCursor,
  chartMonthLabels,
  resolveChartSeries,
  useChartFormatter,
  useChartSeriesFormatter,
  useChartLabels,
  useChartSeriesState,
  type ChartLabels,
  type ChartSeries,
  type ChartValueFormat,
} from "../chart-card/chart-parts";

export type ChartCurve = "smooth" | "linear" | "step";

const CURVES = { smooth: "monotone", linear: "linear", step: "step" } as const;

export interface AreaChartProps {
  /** Rows of data; defaults to a clearly-marked sample (12 months, this vs last period). */
  data?: readonly object[];
  /** Key of the x value in each row. */
  index?: string;
  series?: ChartSeries[];
  /** `default`: overlapping areas; `stacked`: summed; `percent`: share of 100%. */
  type?: "default" | "stacked" | "percent";
  curve?: ChartCurve;
  /** Vertical gradient fill (otherwise a flat, light fill). */
  gradient?: boolean;
  /** Plot height in px. */
  height?: number;
  valueFormat?: ChartValueFormat;
  currency?: string;
  /** Formats x values (axis ticks and tooltip heading). */
  indexFormatter?: (value: unknown) => string;
  showLegend?: boolean;
  /** Legend items toggle series on click. */
  interactiveLegend?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  /** Fixed y domain, e.g. [0, 100]. */
  yDomain?: [number | "auto", number | "auto"];
  "aria-label"?: string;
  className?: string;
  labels?: Partial<ChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

/** Sample traffic data (demo default only). */
function useSample(labels?: Partial<ChartLabels>) {
  const { locale } = useLocale();
  const t = useChartLabels(labels);
  return useMemo(() => {
    const months = chartMonthLabels(locale);
    const current = [3120, 3480, 3290, 4010, 4380, 4170, 4720, 5160, 4890, 5430, 5880, 6240];
    const previous = [2640, 2810, 2950, 3070, 3320, 3410, 3580, 3720, 3900, 4060, 4210, 4470];
    return {
      data: months.map((label, i) => ({ label, current: current[i], previous: previous[i] })),
      series: [
        { key: "current", label: t.sampleCurrent },
        { key: "previous", label: t.samplePrevious, comparison: true },
      ] as ChartSeries[],
    };
  }, [locale, t]);
}

/**
 * Smooth area chart: overlapping, stacked or 100% areas, gradient fills,
 * dashed comparison series and a hover crosshair with the shared tooltip.
 */
export function AreaChart({
  data,
  index = "label",
  series,
  type = "default",
  curve = "smooth",
  gradient = true,
  height = 240,
  valueFormat = "number",
  currency,
  indexFormatter,
  showLegend,
  interactiveLegend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  yDomain,
  className,
  labels,
  ref,
  ...rest
}: AreaChartProps) {
  const sample = useSample(labels);
  const rows = data ?? sample.data;
  const resolved = useMemo(() => resolveChartSeries(series ?? (data ? [] : sample.series)), [series, data, sample.series]);
  const keys = useMemo(() => resolved.map((s) => s.key), [resolved]);
  const { hidden, toggle, active, setActive } = useChartSeriesState(keys);
  const fmt = useChartSeriesFormatter(resolved, valueFormat, currency);
  const valueFmt = useChartFormatter(valueFormat, currency);
  const axisFmt = useChartFormatter(type === "percent" ? "percent" : valueFormat, currency, true);
  const t = useChartLabels(labels);
  const uid = useId().replace(/:/g, "");
  const legend = showLegend ?? resolved.length > 1;

  if (!rows.length) return <ChartEmptyState height={height} labels={labels} className={className} />;

  const stacked = type !== "default";
  // Stacked bands read better with flat fills; gradients are for overlapping areas.
  const top = gradient && !stacked ? 0.32 : 0.2;
  const bottom = gradient && !stacked ? 0.02 : 0.2;
  return (
    <div ref={ref} className={cx("flex w-full min-w-0 flex-col gap-3", className)}>
      {legend ? (
        <ChartLegend
          items={resolved.map((s) => ({ key: s.key, label: s.label, color: s.color, comparison: s.comparison }))}
          hiddenKeys={hidden}
          activeKey={active}
          onToggle={interactiveLegend ? toggle : undefined}
          onHighlight={setActive}
          labels={labels}
        />
      ) : null}
      <ChartPlot height={height}>
        <RAreaChart
          responsive
          style={{ width: "100%", height: "100%" }}
          data={rows as object[]}
          stackOffset={type === "percent" ? "expand" : undefined}
          margin={{ top: 6, right: 6, bottom: 0, left: 0 }}
          aria-label={rest["aria-label"]}
        >
          <defs>
            {resolved.map((s) => (
              <linearGradient key={s.key} id={`${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={top} />
                <stop offset="100%" stopColor={s.color} stopOpacity={bottom} />
              </linearGradient>
            ))}
          </defs>
          {showGrid ? <CartesianGrid {...chartGridProps} /> : null}
          <XAxis dataKey={index} hide={!showXAxis} {...chartAxisProps} minTickGap={16} tickFormatter={indexFormatter} />
          <YAxis hide={!showYAxis} {...chartAxisProps} width="auto" tickFormatter={axisFmt} domain={yDomain} />
          <Tooltip
            cursor={chartLineCursor}
            animationDuration={150}
            content={(p) => (
              <ChartTooltipContent
                {...p}
                series={resolved}
                formatLabel={indexFormatter}
                formatValue={fmt}
                total={type === "stacked" ? { label: t.total, format: valueFmt } : undefined}
              />
            )}
          />
          {resolved.map((s) => {
            const dim = active != null && active !== s.key;
            return (
              <Area
                key={s.key}
                dataKey={s.key}
                name={s.label}
                hide={hidden.has(s.key)}
                type={CURVES[curve]}
                stackId={stacked ? "stack" : undefined}
                stroke={s.color}
                strokeWidth={s.comparison ? 1.5 : 2}
                strokeDasharray={s.comparison ? "5 4" : undefined}
                strokeOpacity={dim ? 0.35 : 1}
                fill={s.comparison && !stacked ? "transparent" : `url(#${uid}-${s.key})`}
                fillOpacity={dim ? 0.3 : 1}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-surface)", fill: s.color }}
                isAnimationActive
                animationDuration={600}
              />
            );
          })}
        </RAreaChart>
      </ChartPlot>
    </div>
  );
}
