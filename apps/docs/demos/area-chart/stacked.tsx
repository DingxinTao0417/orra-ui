"use client";

import { AreaChart, ChartCard } from "@orra-ui/react";

const DATA = [
  { week: "第 1 周", search: 4210, social: 1830, email: 960 },
  { week: "第 2 周", search: 4480, social: 2120, email: 1040 },
  { week: "第 3 周", search: 4390, social: 2460, email: 1210 },
  { week: "第 4 周", search: 4920, social: 2310, email: 1380 },
  { week: "第 5 周", search: 5260, social: 2780, email: 1290 },
  { week: "第 6 周", search: 5610, social: 3050, email: 1460 },
  { week: "第 7 周", search: 5480, social: 3320, email: 1620 },
  { week: "第 8 周", search: 6020, social: 3610, email: 1750 },
];

const SERIES = [
  { key: "search", label: "搜索" },
  { key: "social", label: "社交媒体" },
  { key: "email", label: "邮件" },
];

export default function AreaChartStacked() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4 md:grid-cols-2">
      <ChartCard title="新增线索（堆叠）" value="11,380" delta={0.093}>
        <AreaChart data={DATA} index="week" series={SERIES} type="stacked" height={200} />
      </ChartCard>
      <ChartCard title="渠道占比（百分比）" description="每周各渠道线索的构成">
        <AreaChart data={DATA} index="week" series={SERIES} type="percent" curve="linear" height={200} />
      </ChartCard>
    </div>
  );
}
