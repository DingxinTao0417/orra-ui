"use client";

import { ChartCard, LineChart } from "@orra-ui/react";

export default function LineChartOverview() {
  return (
    <ChartCard
      className="mx-auto w-full max-w-2xl"
      title="各渠道会话数"
      description="点击图例可隐藏或显示某条线"
      value="71,630"
      delta={0.142}
      deltaLabel="较上一年"
    >
      <LineChart height={240} />
    </ChartCard>
  );
}
