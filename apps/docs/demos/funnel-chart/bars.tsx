"use client";

import { ChartCard, FunnelChart } from "@orra-ui/react";

const STAGES = [
  { label: "浏览商品", value: 86400 },
  { label: "加入购物车", value: 21300 },
  { label: "提交订单", value: 9870 },
  { label: "完成支付", value: 8120 },
];

export default function FunnelChartBars() {
  return (
    <ChartCard className="mx-auto w-full max-w-xl" title="下单漏斗" description="虚线框表示上一步的人数，空白部分即为流失">
      <FunnelChart data={STAGES} variant="bars" color="var(--color-chart-2)" conversionBase="first" height={200} />
    </ChartCard>
  );
}
