"use client";

import { useMemo } from "react";
import type { Ref } from "react";
import { CartesianGrid, Line, LineChart as RLineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import type { ChartCurve } from "../area-chart/area-chart";
import {
  ChartEmptyState,
  ChartLegend,
  ChartPlot,
  ChartTooltipContent,
  chartAxisProps,
  chartAxisTick,
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

const CURVES = { smooth: "monotone", linear: "linear", step: "stepAfter" } as const;

export interface ChartReferenceLine {
  /** y value of the line. */
  value: number;
  label?: string;
  color?: string;
}

export interface LineChartProps {
  /** Rows of data; defaults to a clearly-marked sample (response times by month). */
  data?: readonly object[];
  /** Key of the x value in each row. */
  index?: string;
  series?: ChartSeries[];
  curve?: ChartCurve;
  /** `hover`: dot only on the hovered point; `always`: dots on every point; `none`. */
  dots?: "hover" | "always" | "none";
  /** Horizontal target / reference lines. */
  referenceLines?: ChartReferenceLine[];
  height?: number;
  valueFormat?: ChartValueFormat;
  currency?: string;
  indexFormatter?: (value: unknown) => string;
  showLegend?: boolean;
  interactiveLegend?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  yDomain?: [number | "auto" | "dataMin" | "dataMax", number | "auto" | "dataMin" | "dataMax"];
  /** Bridge gaps (null values) instead of breaking the line. */
  connectNulls?: boolean;
  "aria-label"?: string;
  className?: string;
  labels?: Partial<ChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

function useSample(labels?: Partial<ChartLabels>) {
  const { locale } = useLocale();
  const t = useChartLabels(labels);
  return useMemo(() => {
    const months = chartMonthLabels(locale);
    const organic = [1820, 1960, 2140, 2080, 2310, 2470, 2390, 2620, 2810, 2760, 2990, 3180];
    const referral = [920, 1010, 980, 1120, 1240, 1190, 1330, 1410, 1380, 1520, 1610, 1700];
    const direct = [640, 610, 700, 690, 760, 820, 790, 850, 910, 880, 940, 1010];
    return {
      data: months.map((label, i) => ({ label, organic: organic[i], referral: referral[i], direct: direct[i] })),
      series: [
        { key: "organic", label: t.sampleOrganic },
        { key: "referral", label: t.sampleReferral },
        { key: "direct", label: t.sampleDirect },
      ] as ChartSeries[],
      reference: [{ value: 2500, label: t.target }] as ChartReferenceLine[],
    };
  }, [locale, t]);
}

/**
 * Multi-series line chart with hover dots, curved / straight / step lines,
 * dashed comparison series and optional target lines.
 */
export function LineChart({
  data,
  index = "label",
  series,
  curve = "smooth",
  dots = "hover",
  referenceLines,
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
  connectNulls,
  className,
  labels,
  ref,
  ...rest
}: LineChartProps) {
  const sample = useSample(labels);
  const rows = data ?? sample.data;
  const resolved = useMemo(() => resolveChartSeries(series ?? (data ? [] : sample.series)), [series, data, sample.series]);
  const refs = referenceLines ?? (data ? [] : sample.reference);
  const keys = useMemo(() => resolved.map((s) => s.key), [resolved]);
  const { hidden, toggle, active, setActive } = useChartSeriesState(keys);
  const fmt = useChartSeriesFormatter(resolved, valueFormat, currency);
  const axisFmt = useChartFormatter(valueFormat, currency, true);
  const legend = showLegend ?? resolved.length > 1;

  if (!rows.length) return <ChartEmptyState height={height} labels={labels} className={className} />;

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
        <RLineChart responsive style={{ width: "100%", height: "100%" }} data={rows as object[]} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} aria-label={rest["aria-label"]}>
          {showGrid ? <CartesianGrid {...chartGridProps} /> : null}
          <XAxis dataKey={index} hide={!showXAxis} {...chartAxisProps} minTickGap={16} tickFormatter={indexFormatter} />
          <YAxis hide={!showYAxis} {...chartAxisProps} width="auto" tickFormatter={axisFmt} domain={yDomain} />
          <Tooltip
            cursor={chartLineCursor}
            animationDuration={150}
            content={(p) => <ChartTooltipContent {...p} series={resolved} formatLabel={indexFormatter} formatValue={fmt} />}
          />
          {refs.map((r, i) => (
            <ReferenceLine
              key={`${r.value}-${i}`}
              y={r.value}
              stroke={r.color ?? "var(--color-chart-axis)"}
              strokeDasharray="6 4"
              strokeWidth={1}
              ifOverflow="extendDomain"
              label={r.label ? { value: r.label, position: "insideTopRight", ...chartAxisTick } : undefined}
            />
          ))}
          {resolved.map((s) => {
            const dim = active != null && active !== s.key;
            return (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.label}
                hide={hidden.has(s.key)}
                type={CURVES[curve]}
                stroke={s.color}
                strokeWidth={s.comparison ? 1.5 : 2}
                strokeDasharray={s.comparison ? "5 4" : undefined}
                strokeOpacity={dim ? 0.25 : 1}
                connectNulls={connectNulls}
                dot={dots === "always" ? { r: 3, strokeWidth: 2, fill: "var(--color-surface)", stroke: s.color } : false}
                activeDot={dots === "none" ? false : { r: 4, strokeWidth: 2, stroke: "var(--color-surface)", fill: s.color }}
                animationDuration={600}
              />
            );
          })}
        </RLineChart>
      </ChartPlot>
    </div>
  );
}
