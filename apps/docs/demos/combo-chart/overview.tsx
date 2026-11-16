"use client";

import { ChartCard, ComboChart } from "@orra-ui/react";

export default function ComboChartOverview() {
  return (
    <ChartCard
      className="mx-auto w-full max-w-2xl"
      title="营收与毛利率"
      description="柱状图为营收（左轴），折线为毛利率（右轴）"
      value="48.9%"
      delta={0.027}
      deltaLabel="毛利率环比"
    >
      <ComboChart height={260} />
    </ChartCard>
  );
}
