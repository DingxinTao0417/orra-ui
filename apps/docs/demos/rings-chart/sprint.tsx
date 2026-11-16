"use client";

import { ChartCard, RingsChart } from "@orra-ui/react";

const GOALS = [
  { label: "需求交付", value: 18, goal: 24, unit: "项" },
  { label: "缺陷修复", value: 31, goal: 30, unit: "个" },
  { label: "代码评审", value: 46, goal: 60, unit: "次" },
  { label: "测试覆盖", value: 72, goal: 80, unit: "%" },
];

export default function RingsChartSprint() {
  return (
    <ChartCard className="mx-auto w-full max-w-sm" title="第 46 迭代目标" description="剩余 3 个工作日">
      <RingsChart data={GOALS} size={200} thickness={12} gap={5} legend="bottom" />
    </ChartCard>
  );
}
