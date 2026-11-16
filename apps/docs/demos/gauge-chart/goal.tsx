"use client";

import { GaugeChart } from "@orra-ui/react";

export default function GaugeChartGoal() {
  return (
    <div className="mx-auto w-full max-w-xs">
      <GaugeChart
        value={3_420_000}
        min={0}
        max={5_000_000}
        target={4_000_000}
        tone="accent"
        thickness={10}
        label="季度销售额"
        valueFormat={(v) => `¥${Math.round(v / 10000)} 万`}
      />
    </div>
  );
}
