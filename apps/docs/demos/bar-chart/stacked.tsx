"use client";

import { BarChart, ChartCard } from "@orra-ui/react";

const DATA = [
  { month: "6 月", basic: 182000, pro: 264000, team: 118000 },
  { month: "7 月", basic: 176000, pro: 281000, team: 132000 },
  { month: "8 月", basic: 191000, pro: 296000, team: 149000 },
  { month: "9 月", basic: 188000, pro: 318000, team: 171000 },
  { month: "10 月", basic: 203000, pro: 337000, team: 186000 },
  { month: "11 月", basic: 214000, pro: 352000, team: 208000 },
];

export default function BarChartStacked() {
  return (
    <ChartCard className="mx-auto w-full max-w-2xl" title="订阅收入构成" value="¥774,000" delta={0.067} deltaLabel="较上月">
      <BarChart
        data={DATA}
        index="month"
        type="stacked"
        valueFormat="currency"
        currency="CNY"
        series={[
          { key: "basic", label: "基础版" },
          { key: "pro", label: "专业版" },
          { key: "team", label: "团队版" },
        ]}
        height={240}
      />
    </ChartCard>
  );
}
