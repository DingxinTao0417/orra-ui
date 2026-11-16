"use client";

import { StatCards } from "@orra-ui/react";

export default function StatCardsJoined() {
  return (
    <div className="w-full max-w-3xl">
      <StatCards
        variant="joined"
        columns={3}
        trendPlacement="end"
        stats={[
          {
            id: "uptime",
            label: "服务可用率",
            value: 0.9993,
            format: { style: "percent", maximumFractionDigits: 2 },
            delta: 0.004,
            deltaLabel: "较上周",
            trend: [97, 99, 98, 99, 100, 99, 100],
            trendVariant: "line",
          },
          {
            id: "latency",
            label: "P95 延迟",
            value: "182 ms",
            delta: -0.083,
            invertDelta: true,
            deltaLabel: "较上周",
            trend: [240, 228, 215, 210, 196, 190, 182],
            trendVariant: "line",
            color: "trend",
          },
          {
            id: "incidents",
            label: "故障工单",
            value: 3,
            delta: -0.4,
            invertDelta: true,
            deltaLabel: "较上周",
            trend: [6, 4, 5, 3, 4, 2, 3],
            trendVariant: "bar",
          },
        ]}
      />
    </div>
  );
}
