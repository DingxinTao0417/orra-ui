"use client";

import { ChartCard, LineChart } from "@orra-ui/react";

export default function ChartCardStates() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4 md:grid-cols-2">
      <ChartCard title="活跃用户" value="12,480" delta={0.06} loading bodyHeight={180}>
        <LineChart height={180} />
      </ChartCard>
      <ChartCard
        title="退款金额"
        description="近 30 天"
        empty
        emptyTitle="这段时间没有退款"
        emptyDescription="出现退款后，这里会按天展示金额走势。"
        bodyHeight={180}
      />
    </div>
  );
}
