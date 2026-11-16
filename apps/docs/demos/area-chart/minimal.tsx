"use client";

import { AreaChart } from "@orra-ui/react";

const DATA = [38, 42, 41, 47, 45, 52, 58, 55, 61, 66, 64, 72, 78, 75, 83].map((v, i) => ({ day: `11/${i + 1}`, cpu: v / 100 }));

export default function AreaChartMinimal() {
  return (
    <div className="mx-auto w-full max-w-md rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-body-sm font-medium text-fg">CPU 使用率</span>
        <span className="text-body-sm font-semibold tabular-nums text-fg">75%</span>
      </div>
      <AreaChart
        data={DATA}
        index="day"
        series={[{ key: "cpu", label: "使用率", color: "var(--color-chart-6)" }]}
        valueFormat="percent"
        yDomain={[0, 1]}
        showXAxis={false}
        showYAxis={false}
        showGrid={false}
        height={96}
      />
    </div>
  );
}
