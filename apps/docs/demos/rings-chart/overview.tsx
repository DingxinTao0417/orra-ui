"use client";

import { ChartCard, RingsChart } from "@orra-ui/react";

export default function RingsChartOverview() {
  return (
    <ChartCard className="mx-auto w-full max-w-lg" title="今日活动" description="悬停图例突出对应圆环">
      <RingsChart>
        <span className="text-caption text-fg-subtle">完成度</span>
        <span className="text-title font-semibold tabular-nums text-fg">87%</span>
      </RingsChart>
    </ChartCard>
  );
}
