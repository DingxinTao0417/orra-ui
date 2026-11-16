"use client";

import { BarList, ChartCard } from "@orra-ui/react";

const PAGES = [
  { label: "/", value: 48210 },
  { label: "/pricing", value: 21480 },
  { label: "/docs/getting-started", value: 17320 },
  { label: "/blog/q3-product-update", value: 9840 },
  { label: "/changelog", value: 7610 },
  { label: "/integrations", value: 5230 },
  { label: "/careers", value: 2980 },
];

const REFERRERS = [
  { label: "搜索引擎", value: 38420 },
  { label: "技术社区", value: 14260 },
  { label: "微信公众号", value: 11890 },
  { label: "合作伙伴站点", value: 6340 },
  { label: "邮件订阅", value: 4120 },
  { label: "其他", value: 2210 },
];

const CITIES = [
  { label: "上海", value: 21840 },
  { label: "北京", value: 19370 },
  { label: "深圳", value: 15620 },
  { label: "杭州", value: 11280 },
  { label: "成都", value: 7460 },
  { label: "武汉", value: 5130 },
  { label: "西安", value: 3970 },
];

export default function BarListOverview() {
  return (
    <ChartCard className="mx-auto w-full max-w-xl" title="流量来源" value="77,240" delta={0.052} deltaLabel="本月访客">
      <BarList
        aria-label="流量维度"
        dimensions={[
          { id: "pages", label: "页面", data: PAGES },
          { id: "referrers", label: "来源", data: REFERRERS },
          { id: "cities", label: "城市", data: CITIES },
        ]}
        labelHeading="名称"
        valueHeading="访客"
      />
    </ChartCard>
  );
}
