"use client";

import { AreaChart, ChartCard } from "@orra-ui/react";

export default function AreaChartOverview() {
  return (
    <ChartCard
      className="mx-auto w-full max-w-2xl"
      title="网站访问量"
      description="按月统计的独立访客"
      value="56,840"
      delta={0.217}
      deltaLabel="较去年同期"
    >
      <AreaChart height={240} />
    </ChartCard>
  );
}
