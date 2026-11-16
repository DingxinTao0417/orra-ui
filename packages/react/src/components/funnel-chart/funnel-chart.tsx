"use client";

import { useMemo } from "react";
import type { Ref } from "react";
import { useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import { focusRing } from "../../lib/recipes";
import {
  ChartEmptyState,
  ChartFloatingTooltip,
  ChartTooltipPanel,
  chartColor,
  chartTint,
  createChartFormatter,
  useChartLabels,
  useChartPointer,
  useChartWidth,
  type ChartLabels,
  type ChartValueFormat,
} from "../chart-card/chart-parts";

export interface FunnelStage {
  key?: string;
  label: string;
  value: number;
}

export interface FunnelChartLabels extends ChartLabels {
  sampleVisit: string;
  sampleSignup: string;
  sampleActivate: string;
  sampleTrial: string;
  samplePaid: string;
  fromFirst: string;
}

const SAMPLE_COPY = {
  en: { sampleVisit: "Visited", sampleSignup: "Signed up", sampleActivate: "Activated", sampleTrial: "Started trial", samplePaid: "Paid", fromFirst: "Of first stage" },
  zh: { sampleVisit: "访问", sampleSignup: "注册", sampleActivate: "激活", sampleTrial: "开始试用", samplePaid: "付费", fromFirst: "占首阶段" },
};

export interface FunnelChartProps {
  /** Stages in order; defaults to a clearly-marked sample (sign-up funnel). */
  data?: FunnelStage[];
  /** `tapered`: a horizontal band narrowing stage by stage; `bars`: vertical bars with the drop-off ghosted. */
  variant?: "tapered" | "bars";
  /** Plot height in px (stage headers come on top). */
  height?: number;
  color?: string;
  valueFormat?: ChartValueFormat;
  /** Conversion shown per stage: from the previous stage or from the first. */
  conversionBase?: "previous" | "first";
  /** Show the conversion pill on each stage. */
  showConversion?: boolean;
  "aria-label"?: string;
  className?: string;
  labels?: Partial<FunnelChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

function useSample(labels?: Partial<FunnelChartLabels>) {
  const { locale } = useLocale();
  const zh = locale.toLowerCase().startsWith("zh");
  return useMemo(() => {
    const c = { ...(zh ? SAMPLE_COPY.zh : SAMPLE_COPY.en), ...labels };
    return {
      copy: c,
      data: [
        { key: "visit", label: c.sampleVisit, value: 48200 },
        { key: "signup", label: c.sampleSignup, value: 12640 },
        { key: "activate", label: c.sampleActivate, value: 7810 },
        { key: "trial", label: c.sampleTrial, value: 3960 },
        { key: "paid", label: c.samplePaid, value: 1470 },
      ] as FunnelStage[],
    };
  }, [zh, labels]);
}

/**
 * Conversion funnel: stage values with conversion % between stages, drawn as
 * a horizontal tapered band or as vertical bars with the drop-off ghosted.
 */
export function FunnelChart({
  data,
  variant = "tapered",
  height = 200,
  color = chartColor(0),
  valueFormat = "number",
  conversionBase = "previous",
  showConversion = true,
  className,
  labels,
  ref,
  ...rest
}: FunnelChartProps) {
  const { locale } = useLocale();
  const t = useChartLabels(labels);
  const sample = useSample(labels);
  const stages = (data ?? sample.data).map((s, i) => ({ ...s, key: s.key ?? `${i}-${s.label}` }));
  const fmt = useMemo(() => createChartFormatter(valueFormat, locale), [valueFormat, locale]);
  const pct = useMemo(() => createChartFormatter("percent", locale), [locale]);
  const tip = useChartPointer<number>();
  const [boxRef, width] = useChartWidth();

  if (!stages.length) return <ChartEmptyState height={height} labels={labels} className={className} />;

  const max = Math.max(...stages.map((s) => s.value), 0) || 1;
  const first = stages[0]!.value || 1;
  const n = stages.length;
  const conv = (i: number) => (i === 0 ? 1 : stages[i]!.value / ((conversionBase === "first" ? first : stages[i - 1]!.value) || 1));
  const active = tip.active;

  const tooltip =
    active != null ? (
      <ChartTooltipPanel
        title={stages[active]!.label}
        rows={[
          { key: "v", label: t.value, value: fmt(stages[active]!.value), color },
          ...(active > 0
            ? [
                { key: "c", label: t.conversion, value: pct(stages[active]!.value / (stages[active - 1]!.value || 1)), color: chartTint(color, 0.6) },
                { key: "d", label: t.dropOff, value: fmt(stages[active - 1]!.value - stages[active]!.value), color: chartTint(color, 0.25) },
                { key: "f", label: sample.copy.fromFirst, value: pct(stages[active]!.value / first), color: chartTint(color, 0.4) },
              ]
            : []),
        ]}
      />
    ) : null;

  const colW = width / n;
  const mid = height / 2;
  const half = (v: number) => Math.max(1.5, (v / max) * (height / 2));

  return (
    <div ref={ref} className={cx("flex w-full min-w-0 flex-col gap-3", className)} role="group" aria-label={rest["aria-label"]}>
      {/* stage headers */}
      <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {stages.map((s, i) => (
          <div key={s.key} className={cx("flex min-w-0 flex-col gap-0.5 pe-2 transition-opacity duration-150", active != null && active !== i && "opacity-50")}>
            <span className="truncate text-caption text-fg-subtle">{s.label}</span>
            <span className="truncate text-body font-semibold tabular-nums text-fg sm:text-title-sm">{fmt(s.value)}</span>
            {showConversion ? (
              <span className="text-caption tabular-nums text-fg-muted">{pct(conv(i))}</span>
            ) : null}
          </div>
        ))}
      </div>
      {/* plot */}
      <div
        ref={(el) => {
          boxRef.current = el;
          tip.ref.current = el;
        }}
        className="relative w-full"
        style={{ height, minHeight: height }}
        onMouseLeave={tip.hide}
      >
        {variant === "tapered" ? (
          width > 0 ? (
            <svg width={width} height={height} className="block" aria-hidden>
              {stages.map((s, i) => {
                const x0 = i * colW;
                const x1 = (i + 1) * colW;
                const h0 = half(s.value);
                const h1 = half(stages[i + 1]?.value ?? s.value);
                const k = (x1 - x0) * 0.5;
                const d = `M ${x0} ${mid - h0} C ${x0 + k} ${mid - h0} ${x1 - k} ${mid - h1} ${x1} ${mid - h1} L ${x1} ${mid + h1} C ${x1 - k} ${mid + h1} ${x0 + k} ${mid + h0} ${x0} ${mid + h0} Z`;
                return (
                  <g key={s.key}>
                    <path d={d} fill={color} fillOpacity={(1 - (i / Math.max(1, n)) * 0.55) * (active != null && active !== i ? 0.35 : 1)} className="transition-[fill-opacity] duration-150" />
                    {i > 0 ? <line x1={x0} x2={x0} y1={0} y2={height} stroke="var(--color-chart-grid)" strokeDasharray="3 4" /> : null}
                  </g>
                );
              })}
            </svg>
          ) : null
        ) : (
          <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }} aria-hidden>
            {stages.map((s, i) => {
              const prev = i > 0 ? stages[i - 1]!.value : s.value;
              return (
                <div key={s.key} className="relative flex h-full items-end pe-2">
                  {i > 0 ? (
                    <span className="absolute start-0 end-2 bottom-0 rounded-t-[8px] border border-dashed" style={{ height: `${(prev / max) * 100}%`, borderColor: chartTint(color, 0.35), backgroundColor: chartTint(color, 0.07) }} />
                  ) : null}
                  <span
                    className="relative w-full rounded-t-[8px] transition-opacity duration-150"
                    style={{ height: `${Math.max(1, (s.value / max) * 100)}%`, backgroundColor: color, opacity: active != null && active !== i ? 0.35 : 1 }}
                  />
                </div>
              );
            })}
          </div>
        )}
        {/* hit areas: one focusable column per stage */}
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {stages.map((s, i) => (
            <div
              key={s.key}
              tabIndex={0}
              aria-label={`${s.label}: ${fmt(s.value)}${i > 0 ? `, ${t.conversion} ${pct(s.value / (stages[i - 1]!.value || 1))}` : ""}`}
              className={cx("rounded-[8px]", focusRing)}
              onMouseMove={(e) => tip.show(i, e)}
              onFocus={(e) => tip.showAt(i, e.currentTarget)}
              onBlur={tip.hide}
            />
          ))}
        </div>
        <ChartFloatingTooltip point={tip.point}>{tooltip}</ChartFloatingTooltip>
      </div>
      {showConversion && n > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-caption text-fg-muted">
          <span>{t.overall}</span>
          <span className="font-medium tabular-nums text-fg">{pct(stages[n - 1]!.value / first)}</span>
        </div>
      ) : null}
    </div>
  );
}
