"use client";

import { RiGroupLine, RiMoneyCnyCircleLine, RiShoppingBag3Line, RiUserUnfollowLine } from "@remixicon/react";
import { StatCards, type StatCardItem } from "@orra-ui/react";

const STATS: StatCardItem[] = [
  {
    id: "gmv",
    label: "本月成交额",
    value: 1286400,
    format: "currency",
    currency: "CNY",
    previous: 1104800,
    icon: <RiMoneyCnyCircleLine />,
    trend: [82, 88, 85, 94, 101, 98, 107, 112, 109, 118, 124, 128],
  },
  {
    id: "orders",
    label: "订单数",
    value: 8932,
    previous: 8410,
    icon: <RiShoppingBag3Line />,
    trend: [620, 640, 610, 680, 700, 690, 720, 735, 760, 742, 780, 812],
  },
  {
    id: "members",
    label: "新增会员",
    value: 2148,
    previous: 2302,
    icon: <RiGroupLine />,
    trend: [210, 205, 220, 198, 190, 201, 188, 180, 186, 176, 181, 172],
  },
  {
    id: "refund",
    label: "退款率",
    value: 0.018,
    format: { style: "percent", maximumFractionDigits: 1 },
    previous: 0.023,
    invertDelta: true,
    icon: <RiUserUnfollowLine />,
    trend: [26, 25, 25, 24, 23, 23, 22, 21, 20, 20, 19, 18],
  },
];

export default function StatCardsOverview() {
  return (
    <div className="w-full">
      <StatCards stats={STATS} />
    </div>
  );
}
