"use client";

import { ChartCard, ChartDeltaBadge, GaugeChart } from "@orra-ui/react";

export default function GaugeChartOverview() {
  return (
    <ChartCard className="mx-auto w-full max-w-sm" title="客户满意度" description="近 30 天 NPS 问卷综合得分">
      <GaugeChart
        value={78}
        target={85}
        label="综合得分"
        thresholds={[
          { value: 0, tone: "danger" },
          { value: 50, tone: "warning" },
          { value: 70, tone: "success" },
        ]}
        description={<ChartDeltaBadge value={0.052} size="sm" />}
      />
    </ChartCard>
  );
}
