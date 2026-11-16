"use client";

import { useState } from "react";
import { AreaChart, ChartCard } from "@orra-ui/react";

const RANGES = [
  { id: "7d", label: "7 天" },
  { id: "30d", label: "30 天" },
  { id: "90d", label: "90 天" },
];

function build(days: number, base: number) {
  const count = days > 30 ? 13 : days > 7 ? 15 : 7;
  const step = Math.round(days / count);
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(2026, 9, 31 - (count - 1 - i) * step);
    const wave = Math.sin(i / 1.7) * 0.08 + i * 0.018;
    return {
      date: `${day.getMonth() + 1}/${day.getDate()}`,
      revenue: Math.round(base * (1 + wave)),
      previous: Math.round(base * 0.88 * (1 + Math.cos(i / 2.1) * 0.05 + i * 0.01)),
    };
  });
}

const DATA: Record<string, ReturnType<typeof build>> = {
  "7d": build(7, 16800),
  "30d": build(30, 15400),
  "90d": build(90, 14100),
};

const SUMMARY: Record<string, { value: string; delta: number }> = {
  "7d": { value: "¥124,860", delta: 0.086 },
  "30d": { value: "¥482,190", delta: 0.124 },
  "90d": { value: "¥1,386,400", delta: -0.031 },
};

export default function ChartCardOverview() {
  const [range, setRange] = useState("30d");
  const summary = SUMMARY[range]!;
  return (
    <ChartCard
      className="w-full max-w-2xl"
      title="营收"
      description="已完成订单的含税金额"
      ranges={RANGES}
      range={range}
      onRangeChange={setRange}
      value={summary.value}
      delta={summary.delta}
      deltaLabel="较上一周期"
    >
      <AreaChart
        data={DATA[range]}
        index="date"
        valueFormat="currency"
        currency="CNY"
        series={[
          { key: "revenue", label: "本期" },
          { key: "previous", label: "上一周期", comparison: true },
        ]}
      />
    </ChartCard>
  );
}
