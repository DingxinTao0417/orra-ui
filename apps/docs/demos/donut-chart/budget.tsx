"use client";

import { ChartCard, DonutChart } from "@orra-ui/react";

const BUDGET = [
  { label: "人力成本", value: 1860000 },
  { label: "云服务", value: 642000 },
  { label: "市场推广", value: 528000 },
  { label: "办公与行政", value: 214000 },
  { label: "差旅", value: 96000 },
];

export default function DonutChartBudget() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4 md:grid-cols-2">
      <ChartCard title="年度预算（饼图）">
        <DonutChart data={BUDGET} variant="pie" size={180} legend="bottom" valueFormat="currency" currency="CNY" />
      </ChartCard>
      <ChartCard title="年度预算（细环）">
        <DonutChart data={BUDGET} thickness={0.12} size={180} legend="bottom" valueFormat="compact" centerLabel="总预算" centerValue="¥334 万" />
      </ChartCard>
    </div>
  );
}
