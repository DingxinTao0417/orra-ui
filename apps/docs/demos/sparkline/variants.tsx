"use client";

import { Sparkline } from "@orra-ui/react";

const UP = [12, 15, 13, 18, 17, 22, 19, 24, 23, 28, 26, 31];
const DOWN = [31, 29, 30, 26, 27, 23, 24, 21, 22, 18, 19, 16];

export default function SparklineVariants() {
  return (
    <div className="mx-auto grid w-full max-w-lg grid-cols-[auto_1fr] items-center gap-x-6 gap-y-4 text-body-sm text-fg-muted">
      <span>折线 + 末端点</span>
      <Sparkline data={UP} width="100%" height={32} />
      <span>面积 + 最值标记</span>
      <Sparkline data={UP} variant="area" showMinMax width="100%" height={32} color="var(--color-chart-2)" />
      <span>柱状</span>
      <Sparkline data={UP} variant="bar" width="100%" height={32} color="var(--color-chart-3)" />
      <span>按趋势着色（下降）</span>
      <Sparkline data={DOWN} color="trend" curve="linear" width="100%" height={32} aria-label="近 12 周下降 48%" />
    </div>
  );
}
