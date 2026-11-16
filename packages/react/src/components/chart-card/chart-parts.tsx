"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ToggleButton, useLocale } from "react-aria-components";
import { RiBarChart2Line } from "@remixicon/react";
import { useCopy, type CopyDictionary } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { formatNumber } from "../../lib/format";
import { focusRing } from "../../lib/recipes";

/* ===========================================================================
 * Shared chart language: colours, number formats, copy, tooltip, legend,
 * axis / grid styles and small hooks. Every Orra chart builds on these so a
 * dashboard full of different charts still reads as one system.
 * ======================================================================== */

/* ------------------------------------------------------------------ copy */

export interface ChartLabels extends Record<string, string> {
  noData: string;
  noDataHint: string;
  loading: string;
  range: string;
  total: string;
  other: string;
  share: string;
  value: string;
  target: string;
  conversion: string;
  dropOff: string;
  overall: string;
  showAll: string;
  showLess: string;
  less: string;
  more: string;
  legend: string;
  goal: string;
  sampleCurrent: string;
  samplePrevious: string;
  sampleOrganic: string;
  sampleReferral: string;
  sampleDirect: string;
}

const CHART_COPY: CopyDictionary<ChartLabels> = {
  en: {
    noData: "No data yet",
    noDataHint: "Data will appear here once it is collected.",
    loading: "Loading chart",
    range: "Time range",
    total: "Total",
    other: "Other",
    share: "Share",
    value: "Value",
    target: "Target",
    conversion: "Conversion",
    dropOff: "Drop-off",
    overall: "Overall",
    showAll: "Show all",
    showLess: "Show less",
    less: "Less",
    more: "More",
    legend: "Legend",
    goal: "Goal",
    sampleCurrent: "This period",
    samplePrevious: "Last period",
    sampleOrganic: "Organic",
    sampleReferral: "Referral",
    sampleDirect: "Direct",
  },
  zh: {
    noData: "暂无数据",
    noDataHint: "数据产生后会显示在这里。",
    loading: "图表加载中",
    range: "时间范围",
    total: "合计",
    other: "其他",
    share: "占比",
    value: "数值",
    target: "目标",
    conversion: "转化率",
    dropOff: "流失",
    overall: "整体转化",
    showAll: "查看全部",
    showLess: "收起",
    less: "少",
    more: "多",
    legend: "图例",
    goal: "目标",
    sampleCurrent: "本期",
    samplePrevious: "上期",
    sampleOrganic: "自然流量",
    sampleReferral: "外链推荐",
    sampleDirect: "直接访问",
  },
};

/** Built-in chart copy (en / zh, following the React Aria locale) with optional overrides. */
export function useChartLabels(overrides?: Partial<ChartLabels>): ChartLabels {
  return useCopy(CHART_COPY, overrides);
}

/* ---------------------------------------------------------------- colour */

// Written out literally so Tailwind keeps every referenced theme variable in the CSS.
const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
  "var(--color-chart-8)",
] as const;

/** The n-th categorical chart colour (0-based, wraps after 8): `var(--color-chart-1)` … */
export function chartColor(index: number): string {
  return CHART_COLORS[((index % 8) + 8) % 8]!;
}

/** Mixes a chart colour with the surface, e.g. for soft fills and scale steps. `amount` is 0–1. */
export function chartTint(color: string, amount: number, base = "var(--color-surface)"): string {
  const pct = Math.round(Math.max(0, Math.min(1, amount)) * 100);
  return `color-mix(in oklch, ${color} ${pct}%, ${base})`;
}

/** Status colours for thresholds / tones in gauges and rings. */
export type ChartTone = "accent" | "success" | "warning" | "danger" | "info" | "neutral";

const TONE_COLORS: Record<ChartTone, string> = {
  accent: "var(--color-accent-500)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
  neutral: "var(--color-chart-7)",
};

export function chartToneColor(tone: ChartTone): string {
  return TONE_COLORS[tone];
}

/* ---------------------------------------------------------------- series */

/** One plotted series: which data key it reads, how it is named and coloured. */
export interface ChartSeries {
  /** Key in each data row. */
  key: string;
  /** Display name for legend and tooltip (defaults to the key). */
  label?: string;
  /** Any CSS colour; defaults to the next `--color-chart-n`. */
  color?: string;
  /** Render as a comparison series (dashed line / faded bar), e.g. last period. */
  comparison?: boolean;
  /** Per-series number format (overrides the chart's `valueFormat`). */
  format?: ChartValueFormat;
}

export interface ResolvedChartSeries extends ChartSeries {
  label: string;
  color: string;
}

/** Fills in default labels and colours. */
export function resolveChartSeries(series: ChartSeries[]): ResolvedChartSeries[] {
  return series.map((s, i) => ({ ...s, label: s.label ?? s.key, color: s.color ?? chartColor(i) }));
}

/**
 * Legend ↔ chart interaction state: hide series by clicking legend items and
 * highlight the hovered one. Never hides the last visible series.
 */
export function useChartSeriesState(keys: string[]) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const [active, setActive] = useState<string | null>(null);
  const toggle = useCallback(
    (key: string) =>
      setHidden((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else if (keys.filter((k) => !next.has(k)).length > 1) next.add(key);
        return next;
      }),
    [keys],
  );
  return { hidden, toggle, active, setActive };
}

/* ---------------------------------------------------------------- format */

/**
 * How values are printed: a preset, Intl options, or your own function.
 * `"percent"` expects fractions (0.42 → 42%).
 */
export type ChartValueFormat = "number" | "compact" | "percent" | "currency" | Intl.NumberFormatOptions | ((value: number) => string);

const PRESETS: Record<"number" | "compact" | "percent" | "currency", Intl.NumberFormatOptions> = {
  number: { maximumFractionDigits: 2 },
  compact: { notation: "compact", maximumFractionDigits: 1 },
  percent: { style: "percent", maximumFractionDigits: 1 },
  currency: { style: "currency", maximumFractionDigits: 0 },
};

/** Builds a number formatter for a locale. `axis: true` gives the shorter tick variant. */
export function createChartFormatter(format: ChartValueFormat = "number", locale?: string, currency = "USD", axis = false): (value: number) => string {
  if (typeof format === "function") return format;
  let options: Intl.NumberFormatOptions = typeof format === "string" ? PRESETS[format] : format;
  if (format === "currency") options = { ...options, currency };
  if (axis) {
    if (format === "percent") options = { style: "percent", maximumFractionDigits: 0 };
    else if (format === "number" || format === "compact") options = PRESETS.compact;
    else if (format === "currency") options = { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 };
  }
  const opts = options;
  return (value: number) => (Number.isFinite(value) ? formatNumber(value, locale, opts) : "—");
}

/** Locale-aware value formatter (React Aria locale). */
export function useChartFormatter(format: ChartValueFormat = "number", currency = "USD", axis = false) {
  const { locale } = useLocale();
  return useMemo(() => createChartFormatter(format, locale, currency, axis), [format, locale, currency, axis]);
}

/** Formatter that honours each series' own `format`, falling back to the chart's. */
export function useChartSeriesFormatter(series: readonly ChartSeries[], format: ChartValueFormat = "number", currency = "USD") {
  const { locale } = useLocale();
  return useMemo(() => {
    const base = createChartFormatter(format, locale, currency);
    const per = new Map(series.filter((s) => s.format).map((s) => [s.key, createChartFormatter(s.format, locale, currency)]));
    return (value: number, key: string) => (per.get(key) ?? base)(value);
  }, [series, format, locale, currency]);
}

/** Short month names for the locale, e.g. sample data or month indexes. */
export function chartMonthLabels(locale: string, count = 12, start = new Date(2026, 0, 1)): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { month: "short" });
  return Array.from({ length: count }, (_, i) => fmt.format(new Date(start.getFullYear(), start.getMonth() + i, 1)));
}

/* ------------------------------------------------------- axis / grid / cursor */

/** Tick style shared by every cartesian axis. */
export const chartAxisTick = { fill: "var(--color-chart-axis)", fontSize: 12 } as const;

/** Spread onto `<XAxis>` / `<YAxis>`: quiet ticks, no axis or tick lines. */
export const chartAxisProps = {
  tick: chartAxisTick,
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
} as const;

/** Spread onto `<CartesianGrid>`: hairline horizontal rules only. */
export const chartGridProps = {
  stroke: "var(--color-chart-grid)",
  strokeDasharray: "3 4",
  vertical: false,
} as const;

/** Tooltip cursor for line-like charts (dashed crosshair). */
export const chartLineCursor = { stroke: "var(--color-chart-axis)", strokeWidth: 1, strokeDasharray: "4 4" } as const;

/** Tooltip cursor for bar charts (soft band). */
export const chartBarCursor = { fill: "var(--color-chart-grid)", fillOpacity: 0.6, radius: 6 } as const;

/* --------------------------------------------------------------- tooltip */

export interface ChartTooltipRow {
  key: string;
  label: ReactNode;
  value: ReactNode;
  color: string;
  comparison?: boolean;
}

/** The tooltip surface (used by the Recharts tooltip and by the custom SVG charts). */
export function ChartTooltipPanel({ title, rows, footer, className }: { title?: ReactNode; rows?: ChartTooltipRow[]; footer?: ReactNode; className?: string }) {
  return (
    <div className={cx("min-w-36 max-w-64 rounded-[12px] border border-line bg-surface-raised px-3 py-2 text-caption text-fg shadow-popover", className)}>
      {title != null && title !== "" ? <div className="mb-1.5 font-medium text-fg">{title}</div> : null}
      {rows?.length ? (
        <div className="flex flex-col gap-1">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center gap-2">
              <ChartMarker color={row.color} comparison={row.comparison} />
              <span className="min-w-0 flex-1 truncate text-fg-muted">{row.label}</span>
              <span className="ms-3 font-medium tabular-nums text-fg">{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}
      {footer ? <div className="mt-1.5 border-t border-line pt-1.5 text-fg-muted">{footer}</div> : null}
    </div>
  );
}

/** Loose shape of a Recharts tooltip payload entry. */
export interface ChartTooltipEntry {
  dataKey?: unknown;
  name?: unknown;
  value?: unknown;
  color?: string;
  fill?: string;
  stroke?: string;
  payload?: unknown;
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: ReadonlyArray<ChartTooltipEntry>;
  label?: unknown;
  /** Series config, for names, colours and per-series formats. */
  series?: ResolvedChartSeries[];
  /** Formats each value (receives the series key). */
  formatValue?: (value: number, key: string) => string;
  /** Formats the heading (usually the x value). */
  formatLabel?: (label: unknown) => ReactNode;
  hideLabel?: boolean;
  /** Adds a total row (stacked charts). */
  total?: { label: string; format: (value: number) => string };
}

/**
 * Tooltip content for Recharts charts: `<Tooltip content={(p) => <ChartTooltipContent {...p} series={series} />} />`.
 */
export function ChartTooltipContent({ active, payload, label, series, formatValue, formatLabel, hideLabel, total }: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;
  const byKey = new Map(series?.map((s) => [s.key, s]));
  let sum = 0;
  const rows: ChartTooltipRow[] = [];
  for (const entry of payload) {
    const key = String(entry.dataKey ?? entry.name ?? "");
    const s = byKey.get(key);
    const raw = entry.value;
    const num = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(num)) sum += num;
    rows.push({
      key,
      label: s?.label ?? String(entry.name ?? key),
      value: Number.isFinite(num) && formatValue ? formatValue(num, key) : String(raw ?? "—"),
      color: s?.color ?? entry.color ?? entry.stroke ?? entry.fill ?? chartColor(0),
      comparison: s?.comparison,
    });
  }
  const title = hideLabel ? undefined : formatLabel ? formatLabel(label) : (label as ReactNode);
  return (
    <ChartTooltipPanel
      title={title}
      rows={rows}
      footer={
        total ? (
          <span className="flex justify-between gap-3">
            <span>{total.label}</span>
            <span className="font-medium tabular-nums text-fg">{total.format(sum)}</span>
          </span>
        ) : undefined
      }
    />
  );
}

/**
 * Hover tooltip for the custom (non-Recharts) charts. Render inside a
 * `relative` container; `x`/`y` are in that container's pixels.
 */
export function ChartFloatingTooltip({ point, children }: { point: { x: number; y: number } | null; children?: ReactNode }) {
  if (!point || !children) return null;
  return (
    <div
      className="pointer-events-none absolute z-10 animate-fade-in"
      style={{ left: point.x, top: point.y, transform: "translate(-50%, calc(-100% - 10px))" }}
    >
      {children}
    </div>
  );
}

/** Tracks the pointer inside a container, for ChartFloatingTooltip. */
export function useChartPointer<T>() {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ item: T; point: { x: number; y: number } } | null>(null);
  const show = useCallback((item: T, e: { clientX: number; clientY: number }) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setState({ item, point: { x: e.clientX - box.left, y: e.clientY - box.top } });
  }, []);
  /** Anchor to an element's top centre (keyboard focus). */
  const showAt = useCallback((item: T, el: Element) => {
    const box = ref.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (!box) return;
    setState({ item, point: { x: r.left + r.width / 2 - box.left, y: r.top - box.top } });
  }, []);
  const hide = useCallback(() => setState(null), []);
  return { ref, active: state?.item ?? null, point: state?.point ?? null, show, showAt, hide };
}

/* ---------------------------------------------------------------- legend */

/** Colour swatch used by legends and tooltips. */
export function ChartMarker({ color, comparison, shape = "dot", className }: { color: string; comparison?: boolean; shape?: "dot" | "square" | "line"; className?: string }) {
  if (comparison || shape === "line") {
    return (
      <span
        aria-hidden
        className={cx("inline-block h-0 w-3 shrink-0 border-t-2", comparison && "border-dashed", className)}
        style={{ borderColor: color }}
      />
    );
  }
  return <span aria-hidden className={cx("inline-block size-2 shrink-0", shape === "dot" ? "rounded-full" : "rounded-[3px]", className)} style={{ backgroundColor: color }} />;
}

export interface ChartLegendItem {
  key: string;
  label: ReactNode;
  color: string;
  comparison?: boolean;
  /** Value column (list variant). */
  value?: ReactNode;
  /** Secondary column, e.g. share % (list variant). */
  detail?: ReactNode;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  /** `inline`: wrapping row of swatches; `list`: rows with value and detail columns. */
  variant?: "inline" | "list";
  hiddenKeys?: ReadonlySet<string>;
  activeKey?: string | null;
  /** Makes items toggle buttons (show / hide a series). */
  onToggle?: (key: string) => void;
  /** Called on hover / focus, for highlighting. */
  onHighlight?: (key: string | null) => void;
  align?: "start" | "center" | "end";
  className?: string;
  labels?: Partial<ChartLabels>;
}

/** Legend shared by every chart: inline swatches or value rows, optionally interactive. */
export function ChartLegend({ items, variant = "inline", hiddenKeys, activeKey, onToggle, onHighlight, align = "start", className, labels }: ChartLegendProps) {
  const t = useChartLabels(labels);
  if (variant === "list") {
    return (
      <ul aria-label={t.legend} className={cx("flex flex-col", className)}>
        {items.map((item) => {
          const dim = activeKey != null && activeKey !== item.key;
          return (
            <li
              key={item.key}
              tabIndex={onHighlight ? 0 : undefined}
              onMouseEnter={() => onHighlight?.(item.key)}
              onMouseLeave={() => onHighlight?.(null)}
              onFocus={() => onHighlight?.(item.key)}
              onBlur={() => onHighlight?.(null)}
              className={cx(
                "flex items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-body-sm transition-opacity duration-150",
                onHighlight && cx("hover:bg-surface-hover", focusRing),
                dim && "opacity-50",
              )}
            >
              <ChartMarker color={item.color} comparison={item.comparison} shape="square" />
              <span className="min-w-0 flex-1 truncate text-fg-muted">{item.label}</span>
              {item.value != null ? <span className="font-medium tabular-nums text-fg">{item.value}</span> : null}
              {item.detail != null ? <span className="w-12 text-end tabular-nums text-fg-subtle">{item.detail}</span> : null}
            </li>
          );
        })}
      </ul>
    );
  }
  const justify = align === "center" ? "justify-center" : align === "end" ? "justify-end" : "justify-start";
  return (
    <div role="group" aria-label={t.legend} className={cx("flex flex-wrap items-center gap-x-4 gap-y-1.5", justify, className)}>
      {items.map((item) => {
        const off = hiddenKeys?.has(item.key);
        const dim = !off && activeKey != null && activeKey !== item.key;
        const content = (
          <>
            <ChartMarker color={item.color} comparison={item.comparison} />
            <span className={cx(off && "line-through decoration-fg-subtle")}>{item.label}</span>
            {item.value != null ? <span className="font-medium tabular-nums text-fg">{item.value}</span> : null}
          </>
        );
        const base = cx("inline-flex items-center gap-1.5 text-caption text-fg-muted transition-opacity duration-150", (off || dim) && "opacity-45");
        if (!onToggle) {
          return (
            <span key={item.key} className={base} onMouseEnter={() => onHighlight?.(item.key)} onMouseLeave={() => onHighlight?.(null)}>
              {content}
            </span>
          );
        }
        return (
          <ToggleButton
            key={item.key}
            isSelected={!off}
            onChange={() => onToggle(item.key)}
            onHoverStart={() => onHighlight?.(item.key)}
            onHoverEnd={() => onHighlight?.(null)}
            className={cx(base, "-mx-1 cursor-default rounded-[6px] px-1 py-0.5 data-[hovered]:text-fg", focusRing)}
          >
            {content}
          </ToggleButton>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------- plot / states */

/** Fixed-height, full-width box for a chart plot (never collapses in a plain block layout). */
export function ChartPlot({ height, className, style, children }: { height: number; className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={cx("relative w-full min-w-0", className)} style={{ height, minHeight: height, ...style }}>
      {children}
    </div>
  );
}

/** Empty state sized like the plot it replaces. */
export function ChartEmptyState({ height = 240, title, description, icon, className, labels }: { height?: number; title?: ReactNode; description?: ReactNode; icon?: ReactNode; className?: string; labels?: Partial<ChartLabels> }) {
  const t = useChartLabels(labels);
  return (
    <div
      className={cx("flex w-full flex-col items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-line px-6 text-center", className)}
      style={{ minHeight: height }}
    >
      <span className="mb-1 grid size-9 place-items-center rounded-full bg-surface-muted text-fg-subtle [&>svg]:size-[18px]">{icon ?? <RiBarChart2Line />}</span>
      <p className="text-body-sm font-medium text-fg">{title ?? t.noData}</p>
      <p className="max-w-64 text-caption text-fg-subtle">{description ?? t.noDataHint}</p>
    </div>
  );
}

/** Loading placeholder sized like the plot it replaces. */
export function ChartSkeleton({ height = 240, className, labels }: { height?: number; className?: string; labels?: Partial<ChartLabels> }) {
  const t = useChartLabels(labels);
  const bars = [46, 62, 54, 78, 66, 88, 72, 94];
  return (
    <div role="status" aria-label={t.loading} className={cx("flex w-full items-end gap-2 px-1", className)} style={{ height, minHeight: height }}>
      {bars.map((h, i) => (
        <span key={i} className="flex-1 rounded-t-[6px] bg-skeleton" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

/** Measures an element's width (for the custom SVG charts). */
export function useChartWidth<T extends HTMLElement = HTMLDivElement>(fallback = 0) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Deterministic pseudo-random generator for sample data (same output on server and client). */
export function chartSampleRandom(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
