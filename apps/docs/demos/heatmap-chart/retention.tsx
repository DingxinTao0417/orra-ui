"use client";

import { HeatmapChart } from "@orra-ui/react";

const COHORTS = ["6 月", "7 月", "8 月", "9 月", "10 月"];
const RATES = [
  [1, 0.46, 0.38, 0.33, 0.31, 0.29],
  [1, 0.49, 0.41, 0.36, 0.33],
  [1, 0.52, 0.44, 0.39],
  [1, 0.55, 0.47],
  [1, 0.58],
];

const DATA = COHORTS.flatMap((row, r) => RATES[r]!.map((value, m) => ({ row, column: `第 ${m} 月`, value })));

export default function HeatmapChartRetention() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <HeatmapChart
        data={DATA}
        columns={Array.from({ length: 6 }, (_, m) => `第 ${m} 月`)}
        valueFormat="percent"
        valueLabel="留存率"
        color="var(--color-chart-2)"
        steps={6}
        cellHeight={30}
        legendStart="按注册月份分组的留存"
        aria-label="月度留存同期群"
      />
    </div>
  );
}
