"use client";

import type { ReactNode, Ref } from "react";
import { Link as AriaLink, useLocale } from "react-aria-components";
import { RiArrowRightUpLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { card, focusRing } from "../../lib/recipes";
import { ChartDeltaBadge } from "../chart-card/chart-card";
import { chartColor, createChartFormatter, type ChartValueFormat } from "../chart-card/chart-parts";
import { Skeleton } from "../skeleton/skeleton";
import { Sparkline } from "../sparkline/sparkline";

const COPY = {
  en: {
    vsPrevious: "vs previous period",
    loading: "Loading",
    revenue: "Revenue",
    activeUsers: "Active users",
    conversion: "Conversion rate",
    churn: "Churn",
    open: "Open details",
  },
  zh: {
    vsPrevious: "较上一周期",
    loading: "加载中",
    revenue: "营收",
    activeUsers: "活跃用户",
    conversion: "转化率",
    churn: "流失率",
    open: "查看详情",
  },
};
export type StatCardsLabels = (typeof COPY)["en"];

export interface StatCardItem {
  id: string;
  label: ReactNode;
  /** A number (formatted with `format`) or a ready-made string. */
  value: number | string;
  /** How to format a numeric value: "number", "compact", "currency", "percent", Intl options or a function. */
  format?: ChartValueFormat;
  /** ISO currency code for `format: "currency"` (default "USD"). */
  currency?: string;
  /** Previous-period value: the delta is computed from it when `delta` is omitted. */
  previous?: number;
  /** Relative change as a fraction (0.124 → +12.4%). */
  delta?: number;
  /** Lower is better (churn, latency): a drop is shown in green. */
  invertDelta?: boolean;
  /** Text after the delta badge (default "vs previous period"). */
  deltaLabel?: ReactNode;
  /** Icon element shown in a tinted tile. */
  icon?: ReactNode;
  /** Trend values for a sparkline. */
  trend?: number[];
  /** Sparkline style (default "area"). */
  trendVariant?: "line" | "area" | "bar";
  /** Sparkline colour (any CSS colour, or "trend"); defaults to the item's chart colour. */
  color?: string;
  /** Small text under the value (target, period…). */
  description?: ReactNode;
  /** Makes the whole tile a link. */
  href?: string;
}

/** Sample KPIs (clearly sample data: pass `stats` to replace them). */
function sampleStats(t: StatCardsLabels): StatCardItem[] {
  return [
    {
      id: "revenue",
      label: t.revenue,
      value: 184_250,
      format: "currency",
      previous: 162_400,
      trend: [118, 124, 121, 133, 140, 138, 152, 160, 158, 171, 176, 184],
    },
    { id: "users", label: t.activeUsers, value: 12_480, format: "number", previous: 11_920, trend: [96, 98, 101, 99, 104, 107, 106, 110, 113, 115, 118, 124] },
    {
      id: "conversion",
      label: t.conversion,
      value: 0.0386,
      format: { style: "percent", maximumFractionDigits: 2 },
      previous: 0.0412,
      trend: [44, 43, 45, 42, 41, 42, 40, 41, 39, 40, 38, 39],
    },
    {
      id: "churn",
      label: t.churn,
      value: 0.021,
      format: { style: "percent", maximumFractionDigits: 1 },
      previous: 0.026,
      invertDelta: true,
      trend: [30, 29, 29, 27, 28, 26, 25, 25, 24, 23, 22, 21],
    },
  ];
}

const COLUMNS = {
  2: "@lg:grid-cols-2",
  3: "@lg:grid-cols-2 @3xl:grid-cols-3",
  4: "@lg:grid-cols-2 @4xl:grid-cols-4",
} as const;

export interface StatCardsProps {
  /** KPI tiles; defaults to sample data. */
  stats?: StatCardItem[];
  /** Maximum columns at full width (default: number of stats, up to 4). Columns collapse by container width. */
  columns?: 2 | 3 | 4;
  /** `cards` (default): separate tiles. `joined`: one card split by hairlines. */
  variant?: "cards" | "joined";
  /** Show skeletons instead of values. */
  loading?: boolean;
  /** Tighter padding. */
  dense?: boolean;
  /** Where the sparkline sits: under the value (default) or beside it. */
  trendPlacement?: "bottom" | "end";
  labels?: Partial<StatCardsLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A responsive grid of KPI tiles: label, value, delta vs previous period,
 * optional icon and sparkline. Columns adapt to the container width.
 *
 *   <StatCards stats={[{ id: "mrr", label: "MRR", value: 48200, format: "currency", previous: 45100, trend }]} />
 */
export function StatCards({ stats, columns, variant = "cards", loading, dense, trendPlacement = "bottom", labels, className, ref }: StatCardsProps) {
  const t = useCopy(COPY, labels);
  const items = stats ?? sampleStats(t);
  const cols = columns ?? (Math.min(4, Math.max(2, items.length)) as 2 | 3 | 4);
  const joined = variant === "joined";

  return (
    <div ref={ref} className={cx("@container w-full", joined && cx(card, "overflow-hidden"), className)}>
      {/* Joined: every tile draws its end + bottom hairline; the outer card clips the outermost ones. */}
      <div className={cx("grid grid-cols-1", COLUMNS[cols], joined ? "-me-px -mb-px" : "gap-4")}>
        {items.map((stat, i) => (
          <StatCard
            key={stat.id}
            stat={stat}
            index={i}
            loading={loading}
            dense={dense}
            trendPlacement={trendPlacement}
            labels={labels}
            className={joined ? "rounded-none border-0 border-e border-b border-line shadow-none" : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export interface StatCardProps {
  stat: StatCardItem;
  /** Position in a set: picks the default chart colour. */
  index?: number;
  loading?: boolean;
  dense?: boolean;
  trendPlacement?: "bottom" | "end";
  labels?: Partial<StatCardsLabels>;
  className?: string;
  ref?: Ref<HTMLElement>;
}

/** One KPI tile (used by StatCards; also usable alone). */
export function StatCard({ stat, index = 0, loading, dense, trendPlacement = "bottom", labels, className, ref }: StatCardProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const format = createChartFormatter(stat.format ?? "number", locale, stat.currency ?? "USD");
  const value = typeof stat.value === "number" ? format(stat.value) : stat.value;
  const delta = stat.delta ?? (typeof stat.value === "number" && stat.previous ? (stat.value - stat.previous) / Math.abs(stat.previous) : undefined);
  const color = stat.color ?? chartColor(index);

  const trend =
    stat.trend && stat.trend.length > 1 ? (
      <Sparkline
        data={stat.trend}
        variant={stat.trendVariant ?? "area"}
        color={color}
        width={trendPlacement === "end" ? 88 : "100%"}
        height={trendPlacement === "end" ? 36 : 40}
        endDot={stat.trendVariant !== "bar"}
      />
    ) : null;

  const body = loading ? (
    <div className="flex flex-col gap-3" aria-busy>
      <span className="sr-only">{t.loading}</span>
      <Skeleton shape="text" width="45%" />
      <Skeleton height={28} width="65%" />
      <Skeleton shape="text" width="55%" />
    </div>
  ) : (
    <>
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="truncate text-body-sm text-fg-muted">{stat.label}</span>
          <span className="truncate text-title-lg font-semibold tracking-tight text-fg tabular-nums">{value}</span>
        </div>
        {stat.icon ? (
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-control [&>svg]:size-[18px]"
            style={{ background: `color-mix(in oklab, ${color} 14%, var(--color-surface))`, color: `color-mix(in oklab, ${color} 80%, var(--color-fg))` }}
          >
            {stat.icon}
          </span>
        ) : null}
        {trendPlacement === "end" && trend ? <span className="shrink-0 self-center">{trend}</span> : null}
        {stat.href ? <RiArrowRightUpLine aria-hidden className="size-4 shrink-0 text-fg-subtle transition-colors group-data-[hovered]:text-fg" /> : null}
      </div>
      {delta !== undefined || stat.description ? (
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          {delta !== undefined ? <ChartDeltaBadge value={delta} invert={stat.invertDelta} size="sm" /> : null}
          {delta !== undefined ? <span className="truncate text-caption text-fg-subtle">{stat.deltaLabel ?? t.vsPrevious}</span> : null}
          {stat.description ? <span className="truncate text-caption text-fg-subtle">{stat.description}</span> : null}
        </div>
      ) : null}
      {trendPlacement === "bottom" && trend ? <div className="-mx-1 -mb-1 mt-auto">{trend}</div> : null}
    </>
  );

  const shell = cx(card, "group flex min-w-0 flex-col gap-3", dense ? "p-4" : "p-5", className);

  if (stat.href && !loading) {
    return (
      <AriaLink
        ref={ref as Ref<HTMLAnchorElement>}
        href={stat.href}
        aria-label={typeof stat.label === "string" ? `${stat.label}: ${value} · ${t.open}` : undefined}
        className={cx(shell, focusRing, "cursor-pointer transition-[border-color,box-shadow] duration-150 data-[hovered]:border-line-strong")}
      >
        {body}
      </AriaLink>
    );
  }
  return (
    <section ref={ref as Ref<HTMLElement>} className={shell}>
      {body}
    </section>
  );
}
