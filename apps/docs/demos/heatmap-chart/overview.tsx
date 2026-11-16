"use client";

import { ChartCard, HeatmapChart } from "@orra-ui/react";

export default function HeatmapChartOverview() {
  return (
    <ChartCard className="mx-auto w-full max-w-2xl" title="活跃时段分布" description="按星期 × 小时统计的会话数（0–23 时）">
      <HeatmapChart valueLabel="会话数" aria-label="一周各时段会话热力图" />
    </ChartCard>
  );
}
