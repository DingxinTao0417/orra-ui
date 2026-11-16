"use client";

import { useMemo } from "react";
import type { Ref } from "react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart as RRadarChart, Tooltip } from "recharts";
import { useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import {
  ChartEmptyState,
  ChartLegend,
  ChartPlot,
  ChartTooltipContent,
  chartAxisTick,
  resolveChartSeries,
  useChartFormatter,
  useChartSeriesFormatter,
  useChartLabels,
  useChartSeriesState,
  type ChartLabels,
  type ChartSeries,
  type ChartValueFormat,
} from "../chart-card/chart-parts";

export interface RadarChartLabels extends ChartLabels {
  sampleSpeed: string;
  sampleQuality: string;
  sampleCost: string;
  sampleSupport: string;
  sampleSecurity: string;
  sampleUsability: string;
}

const SAMPLE_COPY = {
  en: { sampleSpeed: "Speed", sampleQuality: "Quality", sampleCost: "Cost", sampleSupport: "Support", sampleSecurity: "Security", sampleUsability: "Usability" },
  zh: { sampleSpeed: "速度", sampleQuality: "质量", sampleCost: "成本", sampleSupport: "支持", sampleSecurity: "安全", sampleUsability: "易用性" },
};

export interface RadarChartProps {
  /** One row per axis; defaults to a clearly-marked sample (scores on six dimensions). */
  data?: readonly object[];
  /** Key of the axis name in each row. */
  index?: string;
  series?: ChartSeries[];
  /** `filled`: translucent areas; `outline`: strokes only. */
  variant?: "filled" | "outline";
  /** Show a dot on every vertex. */
  dots?: boolean;
  /** Grid drawn as polygons or circles. */
  gridShape?: "polygon" | "circle";
  /** Show the radius scale ticks. */
  showRadiusAxis?: boolean;
  /** Max value of the radius scale (default: auto). */
  max?: number;
  height?: number;
  valueFormat?: ChartValueFormat;
  currency?: string;
  showLegend?: boolean;
  "aria-label"?: string;
  className?: string;
  labels?: Partial<RadarChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

function useSample(labels?: Partial<RadarChartLabels>) {
  const { locale } = useLocale();
  const t = useChartLabels(labels);
  const zh = locale.toLowerCase().startsWith("zh");
  return useMemo(() => {
    const c = { ...(zh ? SAMPLE_COPY.zh : SAMPLE_COPY.en), ...labels };
    const axes = [c.sampleSpeed, c.sampleQuality, c.sampleCost, c.sampleSupport, c.sampleSecurity, c.sampleUsability];
    const current = [86, 78, 64, 82, 91, 74];
    const previous = [72, 74, 70, 66, 84, 69];
    return {
      data: axes.map((label, i) => ({ label, current: current[i], previous: previous[i] })),
      series: [
        { key: "current", label: t.sampleCurrent },
        { key: "previous", label: t.samplePrevious, comparison: true },
      ] as ChartSeries[],
    };
  }, [zh, labels, t]);
}

/** Radar chart with one or more series, filled or outlined, optional vertex dots. */
export function RadarChart({
  data,
  index = "label",
  series,
  variant = "filled",
  dots = false,
  gridShape = "polygon",
  showRadiusAxis = false,
  max,
  height = 300,
  valueFormat = "number",
  currency,
  showLegend,
  className,
  labels,
  ref,
  ...rest
}: RadarChartProps) {
  const sample = useSample(labels);
  const rows = data ?? sample.data;
  const resolved = useMemo(() => resolveChartSeries(series ?? (data ? [] : sample.series)), [series, data, sample.series]);
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
          onToggle={toggle}
          onHighlight={setActive}
          align="center"
          labels={labels}
        />
      ) : null}
      <ChartPlot height={height}>
        <RRadarChart responsive style={{ width: "100%", height: "100%" }} data={rows as object[]} outerRadius="74%" margin={{ top: 8, right: 16, bottom: 8, left: 16 }} aria-label={rest["aria-label"]}>
          <PolarGrid gridType={gridShape} stroke="var(--color-chart-grid)" />
          <PolarAngleAxis dataKey={index} tick={chartAxisTick} tickLine={false} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, max ?? "auto"]}
            tick={showRadiusAxis ? { ...chartAxisTick, fontSize: 10 } : false}
            tickFormatter={axisFmt}
            axisLine={false}
            tickCount={5}
          />
          <Tooltip cursor={false} animationDuration={150} content={(p) => <ChartTooltipContent {...p} series={resolved} formatValue={fmt} />} />
          {resolved.map((s) => {
            const dim = active != null && active !== s.key;
            return (
              <Radar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                hide={hidden.has(s.key)}
                stroke={s.color}
                strokeWidth={s.comparison ? 1.5 : 2}
                strokeDasharray={s.comparison ? "5 4" : undefined}
                strokeOpacity={dim ? 0.3 : 1}
                fill={s.color}
                fillOpacity={variant === "outline" || s.comparison ? 0 : dim ? 0.06 : 0.2}
                dot={dots ? { r: 3, strokeWidth: 2, fill: "var(--color-surface)", stroke: s.color } : false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-surface)", fill: s.color }}
                animationDuration={600}
              />
            );
          })}
        </RRadarChart>
      </ChartPlot>
    </div>
  );
}
