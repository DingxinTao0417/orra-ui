"use client";

import { ChartCard, ComboChart } from "@orra-ui/react";

const DATA = [
  { week: "W40", online: 1820, store: 940, aov: 268 },
  { week: "W41", online: 1960, store: 910, aov: 274 },
  { week: "W42", online: 2140, store: 980, aov: 281 },
  { week: "W43", online: 2080, store: 1020, aov: 277 },
  { week: "W44", online: 2390, store: 1060, aov: 292 },
  { week: "W45", online: 2610, store: 1110, aov: 305 },
  { week: "W46", online: 2870, store: 1180, aov: 318 },
];

export default function ComboChartOrders() {
  return (
    <ChartCard className="mx-auto w-full max-w-2xl" title="订单量与客单价" description="线上、门店订单堆叠；折线为客单价">
      <ComboChart
        data={DATA}
        index="week"
        stacked
        barSeries={[
          { key: "online", label: "线上订单" },
          { key: "store", label: "门店订单" },
        ]}
        lineSeries={[{ key: "aov", label: "客单价", color: "var(--color-chart-6)" }]}
        lineFormat="currency"
        currency="CNY"
        height={240}
      />
    </ChartCard>
  );
}
