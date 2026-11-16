"use client";

import { ChartCard, DonutChart } from "@orra-ui/react";

export default function DonutChartOverview() {
  return (
    <ChartCard className="mx-auto w-full max-w-xl" title="访问来源构成" description="悬停扇区或图例查看明细" value="41,270" delta={0.064}>
      <DonutChart />
    </ChartCard>
  );
}
