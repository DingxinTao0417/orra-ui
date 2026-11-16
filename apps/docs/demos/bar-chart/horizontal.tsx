"use client";

import { BarChart, ChartCard } from "@orra-ui/react";

const DATA = [
  { region: "华东", target: 1.0, actual: 1.12 },
  { region: "华南", target: 1.0, actual: 0.94 },
  { region: "华北", target: 1.0, actual: 1.03 },
  { region: "西南", target: 1.0, actual: 0.81 },
  { region: "华中", target: 1.0, actual: 0.88 },
];

export default function BarChartHorizontal() {
  return (
    <ChartCard className="mx-auto w-full max-w-xl" title="区域目标完成率" description="实际 / 目标">
      <BarChart
        data={DATA}
        index="region"
        orientation="horizontal"
        valueFormat="percent"
        series={[
          { key: "actual", label: "实际完成", color: "var(--color-chart-4)" },
          { key: "target", label: "目标", comparison: true, color: "var(--color-chart-4)" },
        ]}
        height={240}
      />
    </ChartCard>
  );
}
