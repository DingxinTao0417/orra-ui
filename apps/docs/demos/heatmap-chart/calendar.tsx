"use client";

import { ChartCard, HeatmapChart } from "@orra-ui/react";

export default function HeatmapChartCalendar() {
  return (
    <ChartCard className="mx-auto w-full max-w-3xl" title="代码提交" description="过去一年每天的提交次数" value="1,284 次">
      <HeatmapChart
        variant="calendar"
        valueLabel="提交"
        aria-label="过去一年代码提交日历热力图"
        legendStart="最长连续提交 23 天"
      />
    </ChartCard>
  );
}
