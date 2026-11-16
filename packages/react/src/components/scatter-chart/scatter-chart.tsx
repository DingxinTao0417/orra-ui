"use client";

import { useMemo } from "react";
import type { ReactNode, Ref } from "react";
import { CartesianGrid, ReferenceLine, Scatter, ScatterChart as RScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import {
  ChartEmptyState,
  ChartLegend,
  ChartPlot,
  ChartTooltipPanel,
  chartAxisProps,
  chartColor,
  chartGridProps,
  chartLineCursor,
  chartSampleRandom,
  createChartFormatter,
  useChartLabels,
  useChartSeriesState,
  type ChartLabels,
  type ChartValueFormat,
} from "../chart-card/chart-parts";

export interface ScatterChartGroup {
  /** Value of the `groupBy` field. */
  key: string;
  label?: string;
  color?: string;
}

export interface ScatterChartQuadrants {
  /** x position of the vertical divider. */
  x: number;
  /** y position of the horizontal divider. */
  y: number;
  /** Corner captions: top-start, top-end, bottom-start, bottom-end. */
  labels?: [ReactNode?, ReactNode?, ReactNode?, ReactNode?];
}

export interface ScatterChartLabels extends ChartLabels {
  sampleX: string;
  sampleY: string;
  sampleSize: string;
}

const SAMPLE_COPY = {
  en: { sampleX: "Sessions", sampleY: "Conversion", sampleSize: "Revenue" },
  zh: { sampleX: "访问量", sampleY: "转化率", sampleSize: "营收" },
};

export interface ScatterChartProps {
  /** Rows of data; defaults to a clearly-marked sample (campaigns by channel). */
  data?: readonly object[];
  /** Key of the x value. */
  x?: string;
  /** Key of the y value. */
  y?: string;
  /** Key of the bubble size value (turns it into a bubble chart). */
  size?: string;
  /** Key used to split points into coloured groups. */
  groupBy?: string;
  /** Names / colours per group (otherwise derived from the data). */
  groups?: ScatterChartGroup[];
  /** Key of a point's name, shown as the tooltip heading. */
  nameKey?: string;
  xLabel?: string;
  yLabel?: string;
  sizeLabel?: string;
  xFormat?: ChartValueFormat;
  yFormat?: ChartValueFormat;
  sizeFormat?: ChartValueFormat;
  currency?: string;
  /** Rendered bubble area range in px² (min, max). */
  sizeRange?: [number, number];
  /** Divider lines (and optional corner captions) that split the plot into four quadrants. */
  quadrants?: ScatterChartQuadrants;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  "aria-label"?: string;
  className?: string;
  labels?: Partial<ScatterChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

function useSample(labels?: Partial<ScatterChartLabels>) {
  const { locale } = useLocale();
  const t = useChartLabels(labels);
  const zh = locale.toLowerCase().startsWith("zh");
  return useMemo(() => {
    const copy = { ...(zh ? SAMPLE_COPY.zh : SAMPLE_COPY.en), ...labels };
    const rand = chartSampleRandom(7);
    const channels = [
      { key: "organic", base: [5200, 0.034], spread: [3600, 0.014] },
      { key: "referral", base: [2600, 0.052], spread: [2400, 0.02] },
      { key: "direct", base: [1400, 0.041], spread: [1800, 0.018] },
    ];
    const data = channels.flatMap((c) =>
      Array.from({ length: 9 }, () => {
        const sessions = Math.round(c.base[0]! + (rand() - 0.3) * c.spread[0]!);
        const rate = +(c.base[1]! + (rand() - 0.5) * c.spread[1]!).toFixed(4);
        return { sessions, rate, revenue: Math.round(sessions * rate * (120 + rand() * 80)), channel: c.key };
      }),
    );
    return {
      data,
      groups: [
        { key: "organic", label: t.sampleOrganic },
        { key: "referral", label: t.sampleReferral },
        { key: "direct", label: t.sampleDirect },
      ],
      copy,
    };
  }, [locale, zh, labels, t]);
}

const get = (row: object, key?: string) => (key ? (row as Record<string, unknown>)[key] : undefined);

/**
 * Scatter / bubble chart: x–y points, optional size dimension, colour groups
 * and quadrant reference lines.
 */
export function ScatterChart({
  data,
  x,
  y,
  size,
  groupBy,
  groups,
  nameKey,
  xLabel,
  yLabel,
  sizeLabel,
  xFormat,
  yFormat,
  sizeFormat,
  currency,
  sizeRange = [36, 420],
  quadrants,
  height = 280,
  showLegend,
  showGrid = true,
  className,
  labels,
  ref,
  ...rest
}: ScatterChartProps) {
  const { locale } = useLocale();
  const sample = useSample(labels);
  const usingSample = !data;
  const rows = data ?? sample.data;
  const xKey = x ?? (usingSample ? "sessions" : "x");
  const yKey = y ?? (usingSample ? "rate" : "y");
  const sizeKey = size ?? (usingSample ? "revenue" : undefined);
  const groupKey = groupBy ?? (usingSample ? "channel" : undefined);
  const xName = xLabel ?? (usingSample ? sample.copy.sampleX : xKey);
  const yName = yLabel ?? (usingSample ? sample.copy.sampleY : yKey);
  const sizeName = sizeLabel ?? (usingSample ? sample.copy.sampleSize : sizeKey);
  const xf = xFormat ?? "number";
  const yf = yFormat ?? (usingSample ? "percent" : "number");
  const sf = sizeFormat ?? (usingSample ? "currency" : "number");

  const resolvedGroups = useMemo(() => {
    const given: ScatterChartGroup[] | undefined = groups ?? (usingSample ? sample.groups : undefined);
    const keys = given?.map((g) => g.key) ?? (groupKey ? [...new Set(rows.map((r) => String(get(r, groupKey))))] : ["all"]);
    return keys.map((key, i) => {
      const g = given?.find((item) => item.key === key);
      return { key, label: g?.label ?? key, color: g?.color ?? chartColor(i) };
    });
  }, [groups, usingSample, sample.groups, groupKey, rows]);
  const { hidden, toggle, active, setActive } = useChartSeriesState(useMemo(() => resolvedGroups.map((g) => g.key), [resolvedGroups]));

  const fmt = useMemo(
    () => ({
      x: createChartFormatter(xf, locale, currency),
      y: createChartFormatter(yf, locale, currency),
      s: createChartFormatter(sf, locale, currency),
      xa: createChartFormatter(xf, locale, currency, true),
      ya: createChartFormatter(yf, locale, currency, true),
    }),
    [xf, yf, sf, locale, currency],
  );

  if (!rows.length) return <ChartEmptyState height={height} labels={labels} className={className} />;

  const legend = showLegend ?? resolvedGroups.length > 1;
  const byGroup = (key: string) => (groupKey ? rows.filter((r) => String(get(r, groupKey)) === key) : rows);

  return (
    <div ref={ref} className={cx("flex w-full min-w-0 flex-col gap-3", className)}>
      {legend ? (
        <ChartLegend
          items={resolvedGroups.map((g) => ({ key: g.key, label: g.label, color: g.color }))}
          hiddenKeys={hidden}
          activeKey={active}
          onToggle={toggle}
          onHighlight={setActive}
          labels={labels}
        />
      ) : null}
      <ChartPlot height={height}>
        <RScatterChart responsive style={{ width: "100%", height: "100%" }} margin={{ top: 10, right: 12, bottom: 0, left: 0 }} aria-label={rest["aria-label"]}>
          {showGrid ? <CartesianGrid {...chartGridProps} vertical /> : null}
          <XAxis type="number" dataKey={xKey} name={xName} {...chartAxisProps} tickFormatter={fmt.xa} domain={["auto", "auto"]} />
          <YAxis type="number" dataKey={yKey} name={yName} {...chartAxisProps} width="auto" tickFormatter={fmt.ya} domain={["auto", "auto"]} />
          {sizeKey ? <ZAxis type="number" dataKey={sizeKey} name={sizeName} range={sizeRange} /> : <ZAxis range={[72, 72]} />}
          {quadrants ? (
            <>
              <ReferenceLine x={quadrants.x} stroke="var(--color-chart-axis)" strokeDasharray="6 4" ifOverflow="extendDomain" />
              <ReferenceLine y={quadrants.y} stroke="var(--color-chart-axis)" strokeDasharray="6 4" ifOverflow="extendDomain" />
            </>
          ) : null}
          <Tooltip
            cursor={chartLineCursor}
            animationDuration={150}
            content={({ active: on, payload }) => {
              const row = on ? (payload?.[0]?.payload as object | undefined) : undefined;
              if (!row) return null;
              const g = resolvedGroups.find((item) => item.key === (groupKey ? String(get(row, groupKey)) : "all")) ?? resolvedGroups[0]!;
              const n = (k?: string) => Number(get(row, k));
              return (
                <ChartTooltipPanel
                  title={nameKey ? String(get(row, nameKey) ?? "") : groupKey ? g.label : undefined}
                  rows={[
                    { key: "x", label: xName, value: fmt.x(n(xKey)), color: g.color },
                    { key: "y", label: yName, value: fmt.y(n(yKey)), color: g.color },
                    ...(sizeKey ? [{ key: "s", label: sizeName ?? sizeKey, value: fmt.s(n(sizeKey)), color: g.color }] : []),
                  ]}
                />
              );
            }}
          />
          {resolvedGroups.map((g) => {
            const dim = active != null && active !== g.key;
            return (
              <Scatter
                key={g.key}
                name={g.label}
                data={byGroup(g.key) as object[]}
                hide={hidden.has(g.key)}
                fill={g.color}
                fillOpacity={dim ? 0.15 : sizeKey ? 0.55 : 0.85}
                stroke={g.color}
                strokeOpacity={dim ? 0.3 : 1}
                strokeWidth={1}
                animationDuration={600}
              />
            );
          })}
        </RScatterChart>
        {quadrants?.labels ? (
          <div aria-hidden className="pointer-events-none absolute inset-0 text-micro font-medium text-fg-subtle">
            {quadrants.labels.map((label, i) =>
              label ? (
                <span key={i} className={cx("absolute", i < 2 ? "top-1" : "bottom-8", i % 2 === 0 ? "start-16" : "end-4")}>
                  {label}
                </span>
              ) : null,
            )}
          </div>
        ) : null}
      </ChartPlot>
    </div>
  );
}
