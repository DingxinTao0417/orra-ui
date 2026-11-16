"use client";

import { useMemo } from "react";
import type { Ref } from "react";
import { Bar, BarChart as RBarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import {
  ChartEmptyState,
  ChartLegend,
  ChartPlot,
  ChartTooltipContent,
  chartAxisProps,
  chartBarCursor,
  chartGridProps,
  chartTint,
  resolveChartSeries,
  useChartFormatter,
  useChartSeriesFormatter,
  useChartLabels,
  useChartSeriesState,
  type ChartLabels,
  type ChartSeries,
  type ChartValueFormat,
} from "../chart-card/chart-parts";

export interface BarChartProps {
  /** Rows of data; defaults to a clearly-marked sample (orders per weekday, this vs last week). */
  data?: readonly object[];
  /** Key of the category value in each row. */
  index?: string;
  series?: ChartSeries[];
  /** `grouped`: side by side; `stacked`: summed; `percent`: share of 100%. */
  type?: "grouped" | "stacked" | "percent";
  /** `vertical`: columns (default); `horizontal`: bars growing along the x axis. */
  orientation?: "vertical" | "horizontal";
  /** Corner radius of the bar ends. */
  radius?: number;
  /** Max bar thickness in px. */
  barSize?: number;
  height?: number;
  valueFormat?: ChartValueFormat;
  currency?: string;
  indexFormatter?: (value: unknown) => string;
  showLegend?: boolean;
  interactiveLegend?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  "aria-label"?: string;
  className?: string;
  labels?: Partial<ChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

function useSample(labels?: Partial<ChartLabels>) {
  const { locale } = useLocale();
  const t = useChartLabels(labels);
  return useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // 2026-03-02 is a Monday.
    const days = Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2026, 2, 2 + i)));
    const current = [428, 512, 486, 561, 634, 712, 538];
    const previous = [396, 450, 472, 498, 587, 655, 560];
    return {
      data: days.map((label, i) => ({ label, current: current[i], previous: previous[i] })),
      series: [
        { key: "current", label: t.sampleCurrent },
        { key: "previous", label: t.samplePrevious, comparison: true, color: "var(--color-chart-1)" },
      ] as ChartSeries[],
    };
  }, [locale, t]);
}

/**
 * Bar chart: grouped, stacked or 100% bars with rounded ends, vertical or
 * horizontal, and faded comparison series for period-over-period views.
 */
export function BarChart({
  data,
  index = "label",
  series,
  type = "grouped",
  orientation = "vertical",
  radius = 6,
  barSize,
  height = 240,
  valueFormat = "number",
  currency,
  indexFormatter,
  showLegend,
  interactiveLegend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  className,
  labels,
  ref,
  ...rest
}: BarChartProps) {
  const sample = useSample(labels);
  const rows = data ?? sample.data;
  const resolved = useMemo(() => resolveChartSeries(series ?? (data ? [] : sample.series)), [series, data, sample.series]);
  // Comparison bars are drawn faded; legend and tooltip show the same faded swatch.
  const display = useMemo(() => resolved.map((s) => (s.comparison ? { ...s, color: chartTint(s.color, 0.38), comparison: false } : s)), [resolved]);
  const keys = useMemo(() => resolved.map((s) => s.key), [resolved]);
  const { hidden, toggle, active, setActive } = useChartSeriesState(keys);
  const fmt = useChartSeriesFormatter(resolved, valueFormat, currency);
  const totalFmt = useChartFormatter(valueFormat, currency);
  const axisFmt = useChartFormatter(type === "percent" ? "percent" : valueFormat, currency, true);
  const t = useChartLabels(labels);
  const legend = showLegend ?? resolved.length > 1;

  if (!rows.length) return <ChartEmptyState height={height} labels={labels} className={className} />;

  const stacked = type !== "grouped";
  const horizontal = orientation === "horizontal";
  const visible = resolved.filter((s) => !hidden.has(s.key));
  const lastKey = visible[visible.length - 1]?.key;
  const end = horizontal ? ([0, radius, radius, 0] as [number, number, number, number]) : ([radius, radius, 0, 0] as [number, number, number, number]);

  const valueAxis = { ...chartAxisProps, tickFormatter: axisFmt };
  const categoryAxis = { ...chartAxisProps, dataKey: index, tickFormatter: indexFormatter };

  return (
    <div ref={ref} className={cx("flex w-full min-w-0 flex-col gap-3", className)}>
      {legend ? (
        <ChartLegend
          items={display.map((s) => ({ key: s.key, label: s.label, color: s.color }))}
          hiddenKeys={hidden}
          activeKey={active}
          onToggle={interactiveLegend ? toggle : undefined}
          onHighlight={setActive}
          labels={labels}
        />
      ) : null}
      <ChartPlot height={height}>
        <RBarChart
          responsive
          style={{ width: "100%", height: "100%" }}
          data={rows as object[]}
          layout={horizontal ? "vertical" : "horizontal"}
          stackOffset={type === "percent" ? "expand" : undefined}
          barGap={3}
          barCategoryGap={horizontal ? "24%" : "28%"}
          margin={{ top: 6, right: 6, bottom: 0, left: 0 }}
          aria-label={rest["aria-label"]}
        >
          {showGrid ? <CartesianGrid {...chartGridProps} vertical={horizontal} horizontal={!horizontal} /> : null}
          {horizontal ? (
            <>
              <XAxis type="number" hide={!showXAxis} {...valueAxis} />
              <YAxis type="category" hide={!showYAxis} {...categoryAxis} width="auto" />
            </>
          ) : (
            <>
              <XAxis hide={!showXAxis} {...categoryAxis} minTickGap={8} />
              <YAxis hide={!showYAxis} {...valueAxis} width="auto" />
            </>
          )}
          <Tooltip
            cursor={chartBarCursor}
            animationDuration={150}
            content={(p) => (
              <ChartTooltipContent
                {...p}
                series={display}
                formatLabel={indexFormatter}
                formatValue={fmt}
                total={stacked ? { label: t.total, format: totalFmt } : undefined}
              />
            )}
          />
          {resolved.map((s) => {
            const dim = active != null && active !== s.key;
            return (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                hide={hidden.has(s.key)}
                stackId={stacked ? "stack" : undefined}
                fill={s.color}
                fillOpacity={(s.comparison ? 0.32 : 1) * (dim ? 0.4 : 1)}
                radius={!stacked || s.key === lastKey ? end : 0}
                maxBarSize={barSize ?? (horizontal ? 18 : 28)}
                animationDuration={600}
              />
            );
          })}
        </RBarChart>
      </ChartPlot>
    </div>
  );
}
