"use client";

import { ChartCard, LineChart } from "@orra-ui/react";

const HOURS = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
const P95 = [182, 176, 171, 188, 236, 284, 312, 296, 274, 305, 248, 205];
const P50 = [86, 84, 81, 88, 104, 121, 133, 128, 119, 131, 112, 95];
const DATA = HOURS.map((time, i) => ({ time, p95: P95[i], p50: P50[i] }));

export default function LineChartTarget() {
  return (
    <ChartCard className="mx-auto w-full max-w-2xl" title="接口响应时间" description="今日，单位毫秒" value="312 ms" delta={0.087} deltaInvert deltaLabel="峰值 P95">
      <LineChart
        data={DATA}
        index="time"
        series={[
          { key: "p95", label: "P95", color: "var(--color-chart-6)" },
          { key: "p50", label: "P50", color: "var(--color-chart-3)" },
        ]}
        curve="linear"
        dots="always"
        referenceLines={[{ value: 300, label: "SLO 300 ms", color: "var(--color-danger)" }]}
        valueFormat={(v) => `${v} ms`}
        height={220}
      />
    </ChartCard>
  );
}
