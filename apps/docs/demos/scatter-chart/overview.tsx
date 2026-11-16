"use client";

import { ChartCard, ScatterChart } from "@orra-ui/react";

export default function ScatterChartOverview() {
  return (
    <ChartCard className="mx-auto w-full max-w-2xl" title="投放活动表现" description="横轴访问量、纵轴转化率，气泡大小为营收">
      <ScatterChart height={300} />
    </ChartCard>
  );
}
