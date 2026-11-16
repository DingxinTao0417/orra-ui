"use client";

import { ChartCard, SankeyChart } from "@orra-ui/react";

export default function SankeyChartOverview() {
  return (
    <ChartCard className="mx-auto w-full max-w-2xl" title="用户路径" description="渠道 → 着陆页 → 结果，悬停高亮一条路径">
      <SankeyChart height={300} />
    </ChartCard>
  );
}
