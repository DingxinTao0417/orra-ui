"use client";

import { ChartCard, SankeyChart } from "@orra-ui/react";

const DATA = {
  nodes: [
    { name: "订阅收入" },
    { name: "服务收入" },
    { name: "总收入", color: "var(--color-chart-7)" },
    { name: "研发" },
    { name: "销售与市场" },
    { name: "运营" },
    { name: "利润", color: "var(--color-success)" },
  ],
  links: [
    { source: "订阅收入", target: "总收入", value: 4200 },
    { source: "服务收入", target: "总收入", value: 1300 },
    { source: "总收入", target: "研发", value: 2100 },
    { source: "总收入", target: "销售与市场", value: 1400 },
    { source: "总收入", target: "运营", value: 900 },
    { source: "总收入", target: "利润", value: 1100 },
  ],
};

export default function SankeyChartBudget() {
  return (
    <ChartCard className="mx-auto w-full max-w-2xl" title="收入去向" description="单位：万元，节点可用名称连接" value="¥5,500 万">
      <SankeyChart data={DATA} height={260} valueFormat={(v) => `${v.toLocaleString("zh-CN")} 万`} />
    </ChartCard>
  );
}
