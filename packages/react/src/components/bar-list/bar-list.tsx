"use client";

import { useMemo, useState } from "react";
import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Link as AriaLink, Tab, TabList, TabPanel, Tabs, useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import { ChevronGlyph } from "../../lib/glyphs";
import { focusRing } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { ChartEmptyState, chartColor, chartTint, createChartFormatter, useChartLabels, type ChartLabels, type ChartValueFormat } from "../chart-card/chart-parts";

export interface BarListItem {
  /** Stable id (defaults to the label when it is a string). */
  key?: string;
  label: ReactNode;
  value: number;
  /** Leading icon element, e.g. a flag or favicon monogram. */
  icon?: ReactNode;
  /** Makes the row a link. */
  href?: string;
  /** Bar colour (defaults to the list colour). */
  color?: string;
}

export interface BarListDimension {
  id: string;
  label: ReactNode;
  data: BarListItem[];
}

export interface BarListProps {
  /** Rows; defaults to a clearly-marked sample (top pages). Ignored when `dimensions` is set. */
  data?: BarListItem[];
  /** Several datasets switched by tabs (e.g. pages / referrers / countries). */
  dimensions?: BarListDimension[];
  dimension?: string;
  defaultDimension?: string;
  onDimensionChange?: (id: string) => void;
  /** Rows shown before "Show all". */
  limit?: number;
  valueFormat?: ChartValueFormat;
  currency?: string;
  /** Show each row's share of the total. */
  showShare?: boolean;
  /** Bar colour. */
  color?: string;
  /** Sort by value, largest first. */
  sort?: boolean;
  /** Column headings above the rows. */
  labelHeading?: ReactNode;
  valueHeading?: ReactNode;
  /** Called when a row without `href` is pressed. */
  onItemAction?: (item: BarListItem) => void;
  "aria-label"?: string;
  className?: string;
  labels?: Partial<ChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

const SAMPLE: BarListItem[] = [
  { label: "/", value: 48210 },
  { label: "/pricing", value: 21480 },
  { label: "/docs/getting-started", value: 17320 },
  { label: "/blog/q3-product-update", value: 9840 },
  { label: "/changelog", value: 7610 },
  { label: "/integrations", value: 5230 },
  { label: "/careers", value: 2980 },
];

function Rows({
  items,
  limit,
  fmt,
  pct,
  showShare,
  color,
  sort,
  onItemAction,
  labels,
  ariaLabel,
}: {
  items: BarListItem[];
  limit: number;
  fmt: (v: number) => string;
  pct: (v: number) => string;
  showShare: boolean;
  color: string;
  sort: boolean;
  onItemAction?: (item: BarListItem) => void;
  labels?: Partial<ChartLabels>;
  ariaLabel?: string;
}) {
  const t = useChartLabels(labels);
  const [expanded, setExpanded] = useState(false);
  const sorted = useMemo(() => (sort ? [...items].sort((a, b) => b.value - a.value) : items), [items, sort]);
  if (!sorted.length) return <ChartEmptyState height={180} labels={labels} />;
  const max = Math.max(...sorted.map((d) => d.value), 0) || 1;
  const total = sorted.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
  const visible = expanded ? sorted : sorted.slice(0, limit);

  return (
    <div className="flex flex-col gap-1">
      <ul aria-label={ariaLabel} className="flex flex-col gap-1">
        {visible.map((item, i) => {
          const key = item.key ?? (typeof item.label === "string" ? item.label : String(i));
          const bar = item.color ?? color;
          const inner = (
            <>
              <span
                aria-hidden
                className="absolute inset-y-0 start-0 rounded-[8px] transition-[width,background-color] duration-500 ease-out-soft"
                style={{ width: `${Math.max(1.5, (Math.max(0, item.value) / max) * 100)}%`, backgroundColor: chartTint(bar, 0.2) }}
              />
              <span className="relative flex min-w-0 flex-1 items-center gap-2 ps-2.5">
                {item.icon ? <span className="inline-flex size-4 shrink-0 text-fg-muted [&>svg]:size-full">{item.icon}</span> : null}
                <span className="truncate text-body-sm text-fg">{item.label}</span>
              </span>
              <span className="relative ms-3 shrink-0 text-body-sm font-medium tabular-nums text-fg">{fmt(item.value)}</span>
              {showShare ? <span className="relative w-14 shrink-0 pe-1 text-end text-caption tabular-nums text-fg-subtle">{pct(item.value / total)}</span> : null}
            </>
          );
          const rowClass = cx("group relative flex h-9 w-full items-center rounded-[8px] text-start", focusRing);
          const interactive = "cursor-default data-[hovered]:bg-surface-hover";
          return (
            <li key={key}>
              {item.href ? (
                <AriaLink href={item.href} className={cx(rowClass, interactive)}>
                  {inner}
                </AriaLink>
              ) : onItemAction ? (
                <AriaButton onPress={() => onItemAction(item)} className={cx(rowClass, interactive)}>
                  {inner}
                </AriaButton>
              ) : (
                <div className={rowClass}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
      {sorted.length > limit ? (
        <AriaButton
          onPress={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={cx(
            "mt-1 inline-flex h-8 cursor-default items-center justify-center gap-1 self-center rounded-control px-3 text-body-sm font-medium text-fg-muted",
            "transition-colors duration-150 data-[hovered]:bg-surface-hover data-[hovered]:text-fg",
            focusRing,
          )}
        >
          {expanded ? t.showLess : `${t.showAll} (${sorted.length})`}
          <ChevronGlyph direction={expanded ? "up" : "down"} className="size-3.5" />
        </AriaButton>
      ) : null}
    </div>
  );
}

/**
 * Ranked rows with proportional bars behind the labels (top pages, countries,
 * referrers…), with value + share columns, dimension tabs and "show all".
 */
export function BarList({
  data,
  dimensions,
  dimension,
  defaultDimension,
  onDimensionChange,
  limit = 5,
  valueFormat = "number",
  currency,
  showShare = true,
  color = chartColor(0),
  sort = true,
  labelHeading,
  valueHeading,
  onItemAction,
  className,
  labels,
  ref,
  ...rest
}: BarListProps) {
  const { locale } = useLocale();
  const fmt = useMemo(() => createChartFormatter(valueFormat, locale, currency), [valueFormat, locale, currency]);
  const pct = useMemo(() => createChartFormatter("percent", locale), [locale]);
  const [current, setCurrent] = useControllableState(dimension, defaultDimension ?? dimensions?.[0]?.id ?? "", onDimensionChange);
  const shared = { limit, fmt, pct, showShare, color, sort, onItemAction, labels };

  const headings =
    labelHeading != null || valueHeading != null ? (
      <div aria-hidden className="flex items-center px-2.5 text-caption font-medium text-fg-subtle">
        <span className="flex-1">{labelHeading}</span>
        <span>{valueHeading}</span>
        {showShare ? <span className="w-14" /> : null}
      </div>
    ) : null;

  if (dimensions?.length) {
    return (
      <Tabs ref={ref} selectedKey={current} onSelectionChange={(k) => setCurrent(String(k))} className={cx("flex w-full min-w-0 flex-col gap-3", className)}>
        <TabList aria-label={rest["aria-label"]} className="flex gap-4 border-b border-line">
          {dimensions.map((d) => (
            <Tab
              key={d.id}
              id={d.id}
              className={cx(
                "-mb-px cursor-default border-b-2 border-transparent pb-2 text-body-sm font-medium text-fg-muted outline-none transition-colors duration-150",
                "data-[hovered]:text-fg data-[selected]:border-fg data-[selected]:text-fg",
                "data-[focus-visible]:rounded-[4px] data-[focus-visible]:focus-ring",
              )}
            >
              {d.label}
            </Tab>
          ))}
        </TabList>
        {headings}
        {dimensions.map((d) => (
          <TabPanel key={d.id} id={d.id} className="outline-none">
            <Rows items={d.data} {...shared} />
          </TabPanel>
        ))}
      </Tabs>
    );
  }

  return (
    <div ref={ref} className={cx("flex w-full min-w-0 flex-col gap-2", className)}>
      {headings}
      <Rows items={data ?? SAMPLE} {...shared} ariaLabel={rest["aria-label"]} />
    </div>
  );
}
