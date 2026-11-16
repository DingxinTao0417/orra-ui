"use client";

import { useMemo } from "react";
import type { Ref } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from "recharts";
import { useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import type { ChartCurve } from "../area-chart/area-chart";
import {
  ChartEmptyState,
  ChartLegend,
  ChartPlot,
  ChartTooltipContent,
  chartAxisProps,
  chartBarCursor,
  chartColor,
  chartGridProps,
  chartTint,
  chartMonthLabels,
  createChartFormatter,
  resolveChartSeries,
  useChartLabels,
  useChartSeriesState,
  type ChartLabels,
  type ChartSeries,
  type ChartValueFormat,
} from "../chart-card/chart-parts";

const CURVES = { smooth: "monotone", linear: "linear", step: "stepAfter" } as const;

export interface ComboChartLabels extends ChartLabels {
  sampleRevenue: string;
  sampleMargin: string;
}

const SAMPLE_COPY = {
  en: { sampleRevenue: "Revenue", sampleMargin: "Gross margin" },
  zh: { sampleRevenue: "营收", sampleMargin: "毛利率" },
};

export interface ComboChartProps {
  /** Rows of data; defaults to a clearly-marked sample (revenue + margin %). */
  data?: readonly object[];
  /** Key of the x value in each row. */
  index?: string;
  /** Series drawn as bars on the start (left) axis. */
  barSeries?: ChartSeries[];
  /** Series drawn as lines on the end (right) axis. */
  lineSeries?: ChartSeries[];
  /** Number format of the bar axis. */
  barFormat?: ChartValueFormat;
  /** Number format of the line axis. */
  lineFormat?: ChartValueFormat;
  currency?: string;
  /** Stack the bar series. */
  stacked?: boolean;
  curve?: ChartCurve;
  height?: number;
  indexFormatter?: (value: unknown) => string;
  showLegend?: boolean;
  interactiveLegend?: boolean;
  showGrid?: boolean;
  /** Line axis domain, e.g. [0, 1] for percentages. */
  lineDomain?: [number | "auto", number | "auto"];
  "aria-label"?: string;
  className?: string;
  labels?: Partial<ComboChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

function useSample(labels?: Partial<ComboChartLabels>) {
  const { locale } = useLocale();
  const zh = locale.toLowerCase().startsWith("zh");
  return useMemo(() => {
    const copy = { ...(zh ? SAMPLE_COPY.zh : SAMPLE_COPY.en), ...labels };
    const months = chartMonthLabels(locale);
    const revenue = [84200, 91500, 88700, 102300, 110800, 106400, 118900, 124600, 121300, 133800, 141200, 156700];
    const margin = [0.412, 0.425, 0.418, 0.436, 0.447, 0.441, 0.452, 0.463, 0.458, 0.471, 0.476, 0.489];
    return {
      data: months.map((label, i) => ({ label, revenue: revenue[i], margin: margin[i] })),
      bars: [{ key: "revenue", label: copy.sampleRevenue }] as ChartSeries[],
      lines: [{ key: "margin", label: copy.sampleMargin, color: chartColor(4) }] as ChartSeries[],
    };
  }, [locale, zh, labels]);
}

/**
 * Bars and lines on two axes, e.g. revenue (bars, start axis) with margin %
 * (line, end axis). Each side keeps its own number format.
 */
export function ComboChart({
  data,
  index = "label",
  barSeries,
  lineSeries,
  barFormat = "number",
  lineFormat = "percent",
  currency,
  stacked,
  curve = "smooth",
  height = 260,
  indexFormatter,
  showLegend = true,
  interactiveLegend = true,
  showGrid = true,
  lineDomain,
  className,
  labels,
  ref,
  ...rest
}: ComboChartProps) {
  const { locale } = useLocale();
  const sample = useSample(labels);
  const rows = data ?? sample.data;
  const bars = useMemo(() => resolveChartSeries(barSeries ?? (data ? [] : sample.bars)), [barSeries, data, sample.bars]);
  const lineResolved = useMemo(() => {
    const list = lineSeries ?? (data ? [] : sample.lines);
    return resolveChartSeries(list).map((s, i) => (list[i]?.color ? s : { ...s, color: chartColor(bars.length + i) }));
  }, [lineSeries, data, sample.lines, bars.length]);
  const all = useMemo(
    () => [...bars.map((s) => (s.comparison ? { ...s, color: chartTint(s.color, 0.38), comparison: false } : s)), ...lineResolved],
    [bars, lineResolved],
  );
  const keys = useMemo(() => all.map((s) => s.key), [all]);
  const { hidden, toggle, active, setActive } = useChartSeriesState(keys);

  const fmt = useMemo(() => {
    const b = createChartFormatter(barFormat, locale, currency);
    const l = createChartFormatter(lineFormat, locale, currency);
    const per = new Map(all.filter((s) => s.format).map((s) => [s.key, createChartFormatter(s.format, locale, currency)]));
    const barKeys = new Set(bars.map((s) => s.key));
    return (v: number, key: string) => (per.get(key) ?? (barKeys.has(key) ? b : l))(v);
  }, [barFormat, lineFormat, locale, currency, all, bars]);
  const barAxis = useMemo(() => createChartFormatter(barFormat, locale, currency, true), [barFormat, locale, currency]);
  const lineAxis = useMemo(() => createChartFormatter(lineFormat, locale, currency, true), [lineFormat, locale, currency]);

  if (!rows.length) return <ChartEmptyState height={height} labels={labels} className={className} />;

  const visibleBars = bars.filter((s) => !hidden.has(s.key));
  const lastBar = visibleBars[visibleBars.length - 1]?.key;

  return (
    <div ref={ref} className={cx("flex w-full min-w-0 flex-col gap-3", className)}>
      {showLegend ? (
        <ChartLegend
          items={all.map((s) => ({ key: s.key, label: s.label, color: s.color, comparison: s.comparison }))}
          hiddenKeys={hidden}
          activeKey={active}
          onToggle={interactiveLegend ? toggle : undefined}
          onHighlight={setActive}
          labels={labels}
        />
      ) : null}
      <ChartPlot height={height}>
        <ComposedChart responsive style={{ width: "100%", height: "100%" }} data={rows as object[]} margin={{ top: 8, right: 0, bottom: 0, left: 0 }} barCategoryGap="30%" aria-label={rest["aria-label"]}>
          {showGrid ? <CartesianGrid {...chartGridProps} yAxisId="bars" /> : null}
          <XAxis dataKey={index} {...chartAxisProps} minTickGap={12} tickFormatter={indexFormatter} />
          <YAxis yAxisId="bars" {...chartAxisProps} width="auto" tickFormatter={barAxis} />
          <YAxis yAxisId="lines" orientation="right" {...chartAxisProps} width="auto" tickFormatter={lineAxis} domain={lineDomain} />
          <Tooltip cursor={chartBarCursor} animationDuration={150} content={(p) => <ChartTooltipContent {...p} series={all} formatLabel={indexFormatter} formatValue={fmt} />} />
          {bars.map((s) => (
            <Bar
              key={s.key}
              yAxisId="bars"
              dataKey={s.key}
              name={s.label}
              hide={hidden.has(s.key)}
              stackId={stacked ? "bars" : undefined}
              fill={s.color}
              fillOpacity={(s.comparison ? 0.32 : 1) * (active != null && active !== s.key ? 0.4 : 1)}
              radius={!stacked || s.key === lastBar ? [5, 5, 0, 0] : 0}
              maxBarSize={28}
              animationDuration={600}
            />
          ))}
          {lineResolved.map((s) => (
            <Line
              key={s.key}
              yAxisId="lines"
              dataKey={s.key}
              name={s.label}
              hide={hidden.has(s.key)}
              type={CURVES[curve]}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.comparison ? "5 4" : undefined}
              strokeOpacity={active != null && active !== s.key ? 0.3 : 1}
              dot={{ r: 3, strokeWidth: 2, fill: "var(--color-surface)", stroke: s.color }}
              activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--color-surface)", fill: s.color }}
              animationDuration={600}
            />
          ))}
        </ComposedChart>
      </ChartPlot>
    </div>
  );
}
