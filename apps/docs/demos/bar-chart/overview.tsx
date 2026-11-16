"use client";

import { BarChart, ChartCard } from "@orra-ui/react";

export default function BarChartOverview() {
  return (
    <ChartCard
      className="mx-auto w-full max-w-2xl"
      title="每日订单"
      description="本周与上周同日对比"
      value="3,871"
      delta={0.083}
      deltaLabel="较上周"
    >
      <BarChart height={240} />
    </ChartCard>
  );
}
