"use client";

import { ChartCard, RadarChart } from "@orra-ui/react";

export default function RadarChartOverview() {
  return (
    <ChartCard className="mx-auto w-full max-w-lg" title="产品体验评分" description="六个维度，本期与上期对比">
      <RadarChart height={300} />
    </ChartCard>
  );
}
