"use client";

import { createContext, useContext } from "react";
import type { ReactNode, Ref } from "react";
import {
  Button as AriaButton,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  ToggleButton,
  ToggleButtonGroup,
  useLocale,
} from "react-aria-components";
import type { Key } from "react-aria-components";
import { RiArrowDownLine, RiArrowUpLine, RiSubtractLine } from "@remixicon/react";
import { cx } from "../../lib/cx";
import { CheckGlyph, ChevronGlyph } from "../../lib/glyphs";
import { card, floatingPanel, focusRing, menuItem } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { ChartEmptyState, ChartSkeleton, useChartLabels, type ChartLabels } from "./chart-parts";

/* ------------------------------------------------------------ delta badge */

export interface ChartDeltaBadgeProps {
  /** Relative change as a fraction: 0.124 → +12.4%. */
  value: number;
  /** Lower is better (e.g. churn, latency): flips the colour. */
  invert?: boolean;
  /** Custom text instead of the formatted percentage. */
  children?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

/** Signed change pill: arrow + percentage, green / red by direction. */
export function ChartDeltaBadge({ value, invert, children, size = "md", className }: ChartDeltaBadgeProps) {
  const { locale } = useLocale();
  const dir = value > 0 ? 1 : value < 0 ? -1 : 0;
  const good = invert ? dir < 0 : dir > 0;
  const tone = dir === 0 ? "bg-surface-muted text-fg-muted" : good ? "bg-success-soft text-success" : "bg-danger-soft text-danger";
  const text = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }).format(value);
  const Icon = dir > 0 ? RiArrowUpLine : dir < 0 ? RiArrowDownLine : RiSubtractLine;
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full font-medium tabular-nums",
        size === "sm" ? "h-5 px-1.5 text-micro" : "h-6 px-2 text-caption",
        tone,
        className,
      )}
    >
      <Icon aria-hidden className={size === "sm" ? "size-3" : "size-3.5"} />
      {children ?? text}
    </span>
  );
}

/* --------------------------------------------------------- range selector */

export interface ChartRangeOption {
  id: string;
  label: ReactNode;
  /** Plain-text label for the select variant's accessible value (defaults to `label` when it is a string). */
  textValue?: string;
}

export interface ChartRangeSelectorProps {
  options: ChartRangeOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** `segmented`: inline pill group (best for ≤ 4 options); `select`: compact dropdown. */
  variant?: "segmented" | "select";
  "aria-label"?: string;
  className?: string;
  labels?: Partial<ChartLabels>;
}

/** Period / range picker used in chart headers. */
export function ChartRangeSelector({ options, value, defaultValue, onChange, variant = "segmented", className, labels, ...rest }: ChartRangeSelectorProps) {
  const t = useChartLabels(labels);
  const [current, setCurrent] = useControllableState(value, defaultValue ?? options[0]?.id ?? "", onChange);
  const ariaLabel = rest["aria-label"] ?? t.range;

  if (variant === "select") {
    return (
      <Select
        aria-label={ariaLabel}
        selectedKey={current}
        onSelectionChange={(key: Key | null) => key != null && setCurrent(String(key))}
        className={cx("inline-flex", className)}
      >
        <AriaButton
          className={cx(
            "inline-flex h-8 cursor-default items-center gap-1.5 rounded-control border border-line-strong bg-surface ps-2.5 pe-2 text-body-sm text-fg shadow-xs",
            "transition-colors duration-150 data-[hovered]:border-line-hover data-[pressed]:bg-surface-hover",
            focusRing,
          )}
        >
          <SelectValue className="truncate" />
          <ChevronGlyph className="size-3.5 text-fg-subtle" />
        </AriaButton>
        <Popover placement="bottom end" offset={6} className={cx(floatingPanel, "min-w-(--trigger-width)")}>
          <ListBox className="outline-none" items={options}>
            {(item) => (
              <ListBoxItem id={item.id} textValue={item.textValue ?? (typeof item.label === "string" ? item.label : item.id)} className={cx(menuItem, "pe-8 text-body-sm")}>
                {({ isSelected }) => (
                  <>
                    {item.label}
                    {isSelected ? <CheckGlyph className="absolute end-2.5 size-4 text-fg-accent" /> : null}
                  </>
                )}
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </Select>
    );
  }

  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[current]}
      onSelectionChange={(keys) => {
        const next = [...keys][0];
        if (next != null) setCurrent(String(next));
      }}
      className={cx("inline-flex shrink-0 items-center gap-0.5 rounded-control bg-surface-muted p-0.5", className)}
    >
      {options.map((o) => (
        <ToggleButton
          key={o.id}
          id={o.id}
          className={cx(
            "inline-flex h-7 cursor-default items-center rounded-[8px] px-2.5 text-caption font-medium text-fg-muted",
            "transition-[background-color,color,box-shadow] duration-150 data-[hovered]:text-fg",
            "data-[selected]:bg-surface data-[selected]:text-fg data-[selected]:shadow-xs",
            focusRing,
          )}
        >
          {o.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

/* ---------------------------------------------------------------- card */

const RangeContext = createContext<string | null>(null);

/** The range currently selected in the nearest ChartCard (null outside one). */
export function useChartCardRange(): string | null {
  return useContext(RangeContext);
}

export interface ChartCardProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Headline value, e.g. a formatted total. */
  value?: ReactNode;
  /** Relative change shown as a badge next to the value (fraction, 0.12 → +12%). */
  delta?: number;
  /** Lower-is-better metric: a negative delta is shown as good. */
  deltaInvert?: boolean;
  /** Text after the badge, e.g. "vs last month". */
  deltaLabel?: ReactNode;
  /** Range options; renders a selector in the header. */
  ranges?: ChartRangeOption[];
  range?: string;
  defaultRange?: string;
  onRangeChange?: (range: string) => void;
  /** Range selector style (default: segmented for ≤ 4 options, otherwise select). */
  rangeVariant?: "segmented" | "select";
  /** Extra header actions (end side), e.g. an IconButton menu. */
  actions?: ReactNode;
  /** Legend slot rendered under the header. */
  legend?: ReactNode;
  /** Footer slot, separated by a hairline. */
  footer?: ReactNode;
  loading?: boolean;
  /** Shows the empty state instead of the body. */
  empty?: boolean;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  /** Height of the loading / empty placeholders (match your plot). */
  bodyHeight?: number;
  /** Dense padding. */
  dense?: boolean;
  /** Body: a node, or a render function receiving the selected range. */
  children?: ReactNode | ((range: string) => ReactNode);
  className?: string;
  labels?: Partial<ChartLabels>;
  ref?: Ref<HTMLElement>;
}

/**
 * Card shell shared by all charts: title, headline value + delta badge,
 * range selector, legend, body and footer, with loading and empty states.
 *
 *   <ChartCard title="Revenue" value="$48,210" delta={0.124} ranges={RANGES}>
 *     {(range) => <AreaChart data={byRange[range]} … />}
 *   </ChartCard>
 */
export function ChartCard({
  title,
  description,
  value,
  delta,
  deltaInvert,
  deltaLabel,
  ranges,
  range,
  defaultRange,
  onRangeChange,
  rangeVariant,
  actions,
  legend,
  footer,
  loading,
  empty,
  emptyTitle,
  emptyDescription,
  bodyHeight = 240,
  dense,
  children,
  className,
  labels,
  ref,
}: ChartCardProps) {
  const [current, setCurrent] = useControllableState(range, defaultRange ?? ranges?.[0]?.id ?? "", onRangeChange);
  const hasHeader = title != null || description != null || value != null || ranges?.length || actions;
  const body = typeof children === "function" ? children(current) : children;

  return (
    <section ref={ref} aria-busy={loading || undefined} className={cx(card, "flex min-w-0 flex-col gap-4", dense ? "p-4" : "p-5", className)}>
      {hasHeader ? (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 flex-col gap-1">
            {title != null ? <h3 className="text-body font-medium text-fg">{title}</h3> : null}
            {description != null ? <p className="text-body-sm text-fg-subtle">{description}</p> : null}
            {value != null || delta != null ? (
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                {loading ? (
                  <span className="h-8 w-28 rounded-[8px] bg-skeleton" />
                ) : (
                  <>
                    {value != null ? <span className="text-title-lg font-semibold tabular-nums text-fg">{value}</span> : null}
                    {delta != null ? <ChartDeltaBadge value={delta} invert={deltaInvert} /> : null}
                    {deltaLabel != null ? <span className="text-caption text-fg-subtle">{deltaLabel}</span> : null}
                  </>
                )}
              </div>
            ) : null}
          </div>
          {ranges?.length || actions ? (
            <div className="flex shrink-0 items-center gap-1.5">
              {ranges?.length ? (
                <ChartRangeSelector
                  options={ranges}
                  value={current}
                  onChange={setCurrent}
                  variant={rangeVariant ?? (ranges.length > 4 ? "select" : "segmented")}
                  labels={labels}
                />
              ) : null}
              {actions}
            </div>
          ) : null}
        </header>
      ) : null}
      {legend ? <div>{legend}</div> : null}
      <div className="min-w-0">
        {loading ? (
          <ChartSkeleton height={bodyHeight} labels={labels} />
        ) : empty ? (
          <ChartEmptyState height={bodyHeight} title={emptyTitle} description={emptyDescription} labels={labels} />
        ) : (
          <RangeContext.Provider value={current || null}>{body}</RangeContext.Provider>
        )}
      </div>
      {footer ? <footer className="-mb-1 border-t border-line pt-3 text-body-sm text-fg-muted">{footer}</footer> : null}
    </section>
  );
}
