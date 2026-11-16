"use client";

import { ChartCard, FunnelChart } from "@orra-ui/react";

export default function FunnelChartOverview() {
  return (
    <ChartCard className="mx-auto w-full max-w-2xl" title="注册转化漏斗" description="近 30 天，悬停查看每一步的流失" value="3.05%" delta={0.012} deltaLabel="整体转化">
      <FunnelChart height={180} />
    </ChartCard>
  );
}
