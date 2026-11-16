"use client";

import { ChartDeltaBadge, Sparkline } from "@orra-ui/react";

const TILES = [
  { label: "营收", value: "¥482,190", delta: 0.124, data: [31, 34, 33, 38, 41, 39, 44, 47, 46, 52] },
  { label: "活跃用户", value: "12,480", delta: 0.061, data: [102, 104, 101, 108, 112, 110, 115, 117, 121, 125], variant: "area" as const },
  { label: "流失率", value: "2.4%", delta: -0.08, data: [3.1, 3.0, 3.2, 2.9, 2.8, 2.9, 2.7, 2.6, 2.5, 2.4], invert: true },
  { label: "工单数", value: "1,205", delta: 0.034, data: [168, 182, 175, 196, 188, 172, 204, 211, 197, 214], variant: "bar" as const },
];

export default function SparklineOverview() {
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-3 sm:grid-cols-2">
      {TILES.map((t) => (
        <div key={t.label} className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4 shadow-card">
          <span className="text-body-sm text-fg-muted">{t.label}</span>
          <span className="text-title font-semibold tabular-nums text-fg">{t.value}</span>
          <div className="flex items-end justify-between gap-2">
            <ChartDeltaBadge value={t.delta} invert={t.invert} size="sm" />
            <Sparkline data={t.data} variant={t.variant} width={88} height={30} color={t.invert ? "var(--color-chart-4)" : undefined} />
          </div>
        </div>
      ))}
    </div>
  );
}
