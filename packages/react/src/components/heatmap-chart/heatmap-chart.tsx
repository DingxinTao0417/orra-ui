"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ReactNode, Ref } from "react";
import { useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import {
  ChartEmptyState,
  ChartFloatingTooltip,
  ChartTooltipPanel,
  chartColor,
  chartSampleRandom,
  chartTint,
  createChartFormatter,
  useChartLabels,
  useChartPointer,
  useChartWidth,
  type ChartLabels,
  type ChartValueFormat,
} from "../chart-card/chart-parts";

export interface HeatmapCell {
  row: string;
  column: string;
  value: number;
}

export interface HeatmapDay {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  value: number;
}

interface HeatmapBaseProps {
  /** Scale colour (the strongest step). */
  color?: string;
  /** Number of colour steps including "none". */
  steps?: number;
  valueFormat?: ChartValueFormat;
  /** Name of the measured value in the tooltip, e.g. "Commits". */
  valueLabel?: string;
  /** Show the Less → More scale legend. */
  showLegend?: boolean;
  /** Extra content on the start side of the legend row, e.g. a total. */
  legendStart?: ReactNode;
  "aria-label"?: string;
  className?: string;
  labels?: Partial<ChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

export interface HeatmapMatrixProps extends HeatmapBaseProps {
  variant?: "matrix";
  /** Cells in long format; defaults to a clearly-marked sample (activity by weekday × hour). */
  data?: HeatmapCell[];
  /** Row order (defaults to first appearance). */
  rows?: string[];
  /** Column order (defaults to first appearance). */
  columns?: string[];
  /** Show every n-th column label (default: auto). */
  columnLabelEvery?: number;
  /** Cell height in px. */
  cellHeight?: number;
}

export interface HeatmapCalendarProps extends HeatmapBaseProps {
  variant: "calendar";
  /** One value per day; defaults to a clearly-marked sample (a year of daily activity). */
  data?: HeatmapDay[];
  /** Last day shown (ISO). Defaults to the latest date in the data. */
  endDate?: string;
  /** Number of weeks shown. */
  weeks?: number;
  /** First day of the week: 0 = Sunday, 1 = Monday. */
  weekStart?: 0 | 1;
}

export type HeatmapChartProps = HeatmapMatrixProps | HeatmapCalendarProps;

/* --------------------------------------------------------------- helpers */

function useScale(values: number[], steps: number, color: string) {
  return useMemo(() => {
    const max = Math.max(0, ...values);
    const palette = Array.from({ length: steps }, (_, i) => (i === 0 ? "var(--color-surface-muted)" : chartTint(color, 0.18 + (0.82 * (i - 1)) / Math.max(1, steps - 2), "var(--color-surface-muted)")));
    const level = (v: number) => (v <= 0 || max <= 0 ? 0 : Math.max(1, Math.ceil((v / max) * (steps - 1))));
    return { palette, level };
  }, [values, steps, color]);
}

function ScaleLegend({ palette, start, labels }: { palette: string[]; start?: ReactNode; labels?: Partial<ChartLabels> }) {
  const t = useChartLabels(labels);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-caption text-fg-subtle">
      <div className="min-w-0">{start}</div>
      <div className="flex items-center gap-1.5" aria-hidden>
        <span>{t.less}</span>
        {palette.map((c, i) => (
          <span key={i} className="size-2.5 rounded-[3px]" style={{ backgroundColor: c }} />
        ))}
        <span>{t.more}</span>
      </div>
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
};

/* ---------------------------------------------------------------- matrix */

function useMatrixSample(locale: string) {
  return useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const days = Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2026, 2, 2 + i)));
    const rand = chartSampleRandom(11);
    const cells: HeatmapCell[] = [];
    days.forEach((day, d) => {
      for (let h = 0; h < 24; h++) {
        const work = d < 5 ? Math.exp(-((h - 10.5) ** 2) / 10) + 0.8 * Math.exp(-((h - 15) ** 2) / 8) : 0.45 * Math.exp(-((h - 14) ** 2) / 18);
        const night = h < 7 ? 0.05 : 0.15;
        cells.push({ row: day, column: String(h), value: Math.round((work + night) * 120 * (0.75 + rand() * 0.5)) });
      }
    });
    return cells;
  }, [locale]);
}

function Matrix({ data, rows, columns, columnLabelEvery, cellHeight = 22, color = chartColor(0), steps = 5, valueFormat = "number", valueLabel, showLegend = true, legendStart, className, labels, ref, ...rest }: HeatmapMatrixProps) {
  const { locale } = useLocale();
  const t = useChartLabels(labels);
  const sample = useMatrixSample(locale);
  const cells = data ?? sample;
  const rowKeys = useMemo(() => rows ?? [...new Set(cells.map((c) => c.row))], [rows, cells]);
  const colKeys = useMemo(() => columns ?? [...new Set(cells.map((c) => c.column))], [columns, cells]);
  const lookup = useMemo(() => new Map(cells.map((c) => [`${c.row}\u0000${c.column}`, c.value])), [cells]);
  const { palette, level } = useScale(useMemo(() => cells.map((c) => c.value), [cells]), steps, color);
  const fmt = useMemo(() => createChartFormatter(valueFormat, locale), [valueFormat, locale]);
  const tip = useChartPointer<{ row: string; column: string; value: number | undefined }>();

  if (!cells.length) return <ChartEmptyState height={rowKeys.length * cellHeight || 160} labels={labels} className={className} />;
  const every = columnLabelEvery ?? (colKeys.length > 16 ? 3 : colKeys.length > 10 ? 2 : 1);

  return (
    <div ref={ref} className={cx("flex w-full min-w-0 flex-col gap-3", className)}>
      <div ref={tip.ref} className="relative" role="img" aria-label={rest["aria-label"]} onMouseLeave={tip.hide}>
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: `auto repeat(${colKeys.length}, minmax(0, 1fr))` }}>
          {rowKeys.map((r) => (
            <div key={r} className="contents">
              <span className="pe-2 text-caption leading-none text-fg-subtle" style={{ lineHeight: `${cellHeight}px` }}>
                {r}
              </span>
              {colKeys.map((c) => {
                const v = lookup.get(`${r}\u0000${c}`);
                const on = tip.active?.row === r && tip.active.column === c;
                return (
                  <span
                    key={c}
                    className={cx("rounded-[4px] transition-shadow duration-100", on && "ring-2 ring-fg/70")}
                    style={{ height: cellHeight, backgroundColor: palette[v == null ? 0 : level(v)] }}
                    onMouseMove={(e) => tip.show({ row: r, column: c, value: v }, e)}
                  />
                );
              })}
            </div>
          ))}
          <span />
          {colKeys.map((c, i) => (
            <span key={c} className="pt-1 text-center text-micro tabular-nums text-fg-subtle">
              {i % every === 0 ? c : ""}
            </span>
          ))}
        </div>
        <ChartFloatingTooltip point={tip.point}>
          {tip.active ? (
            <ChartTooltipPanel
              title={`${tip.active.row} · ${tip.active.column}`}
              rows={[{ key: "v", label: valueLabel ?? t.value, value: tip.active.value == null ? "—" : fmt(tip.active.value), color: palette[tip.active.value == null ? 0 : level(tip.active.value)]! }]}
            />
          ) : null}
        </ChartFloatingTooltip>
      </div>
      {showLegend ? <ScaleLegend palette={palette} start={legendStart} labels={labels} /> : null}
    </div>
  );
}

/* -------------------------------------------------------------- calendar */

function useCalendarSample() {
  return useMemo(() => {
    const rand = chartSampleRandom(23);
    const end = new Date(2026, 10, 14);
    const out: HeatmapDay[] = [];
    for (let i = 370; i >= 0; i--) {
      const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
      const weekend = d.getDay() === 0 || d.getDay() === 6;
      const busy = 0.5 + 0.5 * Math.sin(i / 23);
      const r = rand();
      const v = r < (weekend ? 0.55 : 0.18) ? 0 : Math.round((weekend ? 2 : 6) * busy * (0.4 + rand() * 1.4));
      out.push({ date: iso(d), value: v });
    }
    return out;
  }, []);
}

function Calendar({ data, endDate, weeks = 53, weekStart = 1, color = chartColor(3), steps = 5, valueFormat = "number", valueLabel, showLegend = true, legendStart, className, labels, ref, ...rest }: HeatmapCalendarProps) {
  const { locale } = useLocale();
  const t = useChartLabels(labels);
  const sample = useCalendarSample();
  const days = data ?? sample;
  const map = useMemo(() => new Map(days.map((d) => [d.date, d.value])), [days]);
  const { palette, level } = useScale(useMemo(() => days.map((d) => d.value), [days]), steps, color);
  const fmt = useMemo(() => createChartFormatter(valueFormat, locale), [valueFormat, locale]);
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", weekday: "short" }), [locale]);
  const monthFmt = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short" }), [locale]);
  const dayFmt = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short" }), [locale]);
  const tip = useChartPointer<{ date: Date; value: number | undefined }>();
  const [boxRef, width] = useChartWidth();
  const scroller = useRef<HTMLDivElement>(null);

  const last = useMemo(() => (endDate ? parse(endDate) : days.length ? parse(days.reduce((m, d) => (d.date > m ? d.date : m), days[0]!.date)) : new Date()), [endDate, days]);
  const grid = useMemo(() => {
    const offset = (last.getDay() - weekStart + 7) % 7;
    const firstDay = new Date(last.getFullYear(), last.getMonth(), last.getDate() - offset - (weeks - 1) * 7);
    return Array.from({ length: weeks }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const date = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + w * 7 + d);
        return date > last ? null : date;
      }),
    );
  }, [last, weekStart, weeks]);

  const gutter = 30;
  const top = 18;
  const step = Math.max(10, Math.min(18, Math.floor((width - gutter) / weeks)));
  const cell = step - 3;
  const svgW = gutter + weeks * step;
  const svgH = top + 7 * step;

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [width]);

  if (!days.length) return <ChartEmptyState height={140} labels={labels} className={className} />;

  return (
    <div ref={ref} className={cx("flex w-full min-w-0 flex-col gap-3", className)}>
      <div
        ref={(el) => {
          boxRef.current = el;
          tip.ref.current = el;
        }}
        className="relative w-full"
        onMouseLeave={tip.hide}
      >
        <div ref={scroller} className="w-full overflow-x-auto" style={{ minHeight: svgH }}>
          {width > 0 ? (
            <svg width={svgW} height={svgH} role="img" aria-label={rest["aria-label"]} className="block">
              {grid.map((week, w) => {
                const head = week[0];
                const prev = grid[w - 1]?.[0];
                const changes = (a?: Date | null, b?: Date | null) => !!a && !!b && a.getMonth() !== b.getMonth();
                const showMonth = head && (w === 0 ? !changes(head, grid[1]?.[0]) && !changes(head, grid[2]?.[0]) : changes(head, prev));
                return (
                  <g key={w}>
                    {showMonth ? (
                      <text x={gutter + w * step} y={11} fontSize={11} fill="var(--color-chart-axis)">
                        {monthFmt.format(week[0]!)}
                      </text>
                    ) : null}
                    {week.map((date, d) => {
                      if (!date) return null;
                      const key = iso(date);
                      const v = map.get(key);
                      const on = tip.active && iso(tip.active.date) === key;
                      return (
                        <rect
                          key={d}
                          x={gutter + w * step}
                          y={top + d * step}
                          width={cell}
                          height={cell}
                          rx={Math.min(3, cell / 3)}
                          fill={palette[v == null ? 0 : level(v)]}
                          stroke={on ? "var(--color-fg)" : "none"}
                          strokeOpacity={0.7}
                          strokeWidth={1.5}
                          onMouseMove={(e) => tip.show({ date, value: v }, e)}
                        />
                      );
                    })}
                  </g>
                );
              })}
              {[0, 1, 2, 3, 4, 5, 6]
                .filter((d) => [1, 3, 5].includes((d + weekStart) % 7))
                .map((d) => (
                <text key={d} x={0} y={top + d * step + cell / 2} dominantBaseline="middle" fontSize={10} fill="var(--color-chart-axis)">
                  {dayFmt.format(new Date(2026, 2, 1 + ((d + weekStart) % 7)))}
                </text>
              ))}
            </svg>
          ) : null}
        </div>
        <ChartFloatingTooltip point={tip.point}>
          {tip.active ? (
            <ChartTooltipPanel
              title={dateFmt.format(tip.active.date)}
              rows={[{ key: "v", label: valueLabel ?? t.value, value: tip.active.value == null ? "—" : fmt(tip.active.value), color: palette[tip.active.value == null ? 0 : level(tip.active.value)]! }]}
            />
          ) : null}
        </ChartFloatingTooltip>
      </div>
      {showLegend ? <ScaleLegend palette={palette} start={legendStart} labels={labels} /> : null}
    </div>
  );
}

/**
 * Heatmap: a rows × columns matrix (e.g. weekday × hour) or a calendar of
 * daily values over a year, with a stepped colour scale and its legend.
 */
export function HeatmapChart(props: HeatmapChartProps) {
  return props.variant === "calendar" ? <Calendar {...props} /> : <Matrix {...props} />;
}
