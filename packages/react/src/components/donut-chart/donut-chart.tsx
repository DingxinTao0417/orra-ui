"use client";

import { useMemo, useState } from "react";
import type { ReactNode, Ref } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import {
  ChartEmptyState,
  ChartLegend,
  chartColor,
  createChartFormatter,
  useChartLabels,
  type ChartLabels,
  type ChartValueFormat,
} from "../chart-card/chart-parts";

export interface ChartSlice {
  /** Stable id (defaults to the label). */
  key?: string;
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartLabels extends ChartLabels {
  sampleSocial: string;
  sampleEmail: string;
}

const SAMPLE_COPY = {
  en: { sampleSocial: "Social", sampleEmail: "Email" },
  zh: { sampleSocial: "社交媒体", sampleEmail: "邮件营销" },
};

export interface DonutChartProps {
  /** Slices; defaults to a clearly-marked sample (traffic by source). */
  data?: ChartSlice[];
  /** `donut` (ring with centre total) or `pie`. */
  variant?: "donut" | "pie";
  /** Ring thickness as a fraction of the radius (donut only). */
  thickness?: number;
  /** Diameter of the chart in px. */
  size?: number;
  /** Caption in the centre (default: "Total"). */
  centerLabel?: ReactNode;
  /** Value in the centre (default: formatted sum). */
  centerValue?: ReactNode;
  valueFormat?: ChartValueFormat;
  currency?: string;
  /** Legend placement. */
  legend?: "end" | "bottom" | "none";
  /** Show each slice's share in the legend. */
  showShare?: boolean;
  /** Highlighted slice key (controlled). */
  activeKey?: string | null;
  onActiveChange?: (key: string | null) => void;
  "aria-label"?: string;
  className?: string;
  labels?: Partial<DonutChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

function useSample(labels?: Partial<DonutChartLabels>) {
  const { locale } = useLocale();
  const t = useChartLabels(labels);
  const zh = locale.toLowerCase().startsWith("zh");
  return useMemo<ChartSlice[]>(() => {
    const c = { ...(zh ? SAMPLE_COPY.zh : SAMPLE_COPY.en), ...labels };
    return [
      { key: "organic", label: t.sampleOrganic, value: 18420 },
      { key: "direct", label: t.sampleDirect, value: 9630 },
      { key: "referral", label: t.sampleReferral, value: 6210 },
      { key: "social", label: c.sampleSocial, value: 4870 },
      { key: "email", label: c.sampleEmail, value: 2140 },
    ];
  }, [zh, labels, t]);
}

/**
 * Donut / pie chart with a centre total, a legend with values and shares,
 * and hover highlight (the centre shows the hovered slice).
 */
export function DonutChart({
  data,
  variant = "donut",
  thickness = 0.24,
  size = 200,
  centerLabel,
  centerValue,
  valueFormat = "number",
  currency,
  legend = "end",
  showShare = true,
  activeKey,
  onActiveChange,
  className,
  labels,
  ref,
  ...rest
}: DonutChartProps) {
  const { locale } = useLocale();
  const t = useChartLabels(labels);
  const sample = useSample(labels);
  const [innerActive, setInnerActive] = useState<string | null>(null);
  const active = activeKey !== undefined ? activeKey : innerActive;
  const setActive = (key: string | null) => {
    if (activeKey === undefined) setInnerActive(key);
    onActiveChange?.(key);
  };

  const slices = useMemo(() => (data ?? sample).map((s, i) => ({ ...s, key: s.key ?? s.label, color: s.color ?? chartColor(i) })), [data, sample]);
  const total = slices.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const fmt = useMemo(() => createChartFormatter(valueFormat, locale, currency), [valueFormat, locale, currency]);
  const pct = useMemo(() => createChartFormatter("percent", locale), [locale]);

  if (!slices.length || total <= 0) return <ChartEmptyState height={size} labels={labels} className={className} />;

  const hovered = slices.find((s) => s.key === active);
  const donut = variant === "donut";
  const outer = size / 2 - 4;

  const chart = (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <PieChart width={size} height={size} aria-label={rest["aria-label"]} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          data={slices}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={outer}
          innerRadius={donut ? outer * (1 - thickness) : 0}
          startAngle={90}
          endAngle={-270}
          paddingAngle={donut ? 1.5 : 0.5}
          cornerRadius={donut ? 4 : 2}
          stroke="var(--color-surface)"
          strokeWidth={donut ? 0 : 1.5}
          animationDuration={700}
          onMouseEnter={(_, i) => setActive(slices[i]?.key ?? null)}
          onMouseLeave={() => setActive(null)}
        >
          {slices.map((s) => (
            <Cell key={s.key} fill={s.color} fillOpacity={active != null && active !== s.key ? 0.3 : 1} style={{ transition: "fill-opacity 150ms", outline: "none" }} />
          ))}
        </Pie>
      </PieChart>
      {donut ? (
        <div aria-live="polite" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[18%] text-center">
          <span className="max-w-full truncate text-caption text-fg-subtle">{hovered ? hovered.label : centerLabel ?? t.total}</span>
          <span className="max-w-full truncate text-title font-semibold tabular-nums text-fg">{hovered ? fmt(hovered.value) : centerValue ?? fmt(total)}</span>
          {hovered ? <span className="text-caption tabular-nums text-fg-muted">{pct(hovered.value / total)}</span> : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      ref={ref}
      className={cx(
        "flex w-full min-w-0 items-center gap-6",
        legend === "end" ? "flex-col sm:flex-row" : "flex-col",
        className,
      )}
    >
      {chart}
      {legend !== "none" ? (
        <ChartLegend
          variant="list"
          className={cx("w-full min-w-0", legend === "end" && "sm:flex-1")}
          items={slices.map((s) => ({ key: s.key, label: s.label, color: s.color, value: fmt(s.value), detail: showShare ? pct(s.value / total) : undefined }))}
          activeKey={active}
          onHighlight={setActive}
          labels={labels}
        />
      ) : null}
    </div>
  );
}
