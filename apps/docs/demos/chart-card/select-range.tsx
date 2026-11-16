"use client";

import { useState } from "react";
import { RiDownloadLine } from "@remixicon/react";
import { BarChart, ChartCard, IconButton } from "@orra-ui/react";

const RANGES = [
  { id: "today", label: "今天" },
  { id: "7d", label: "近 7 天" },
  { id: "30d", label: "近 30 天" },
  { id: "q", label: "本季度" },
  { id: "y", label: "今年" },
];

const WEEK = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const DATA = WEEK.map((label, i) => ({ label, tickets: [182, 214, 196, 238, 205, 96, 74][i]! }));

export default function ChartCardSelectRange() {
  const [range, setRange] = useState("7d");
  return (
    <ChartCard
      className="mx-auto w-full max-w-2xl"
      title="新建工单"
      value="1,205"
      delta={-0.042}
      deltaInvert
      deltaLabel="较上一周期（越少越好）"
      ranges={RANGES}
      range={range}
      onRangeChange={setRange}
      actions={<IconButton size="sm" icon={<RiDownloadLine />} aria-label="导出数据" />}
      footer={
        <span>
          当前范围：<span className="font-medium text-fg">{RANGES.find((r) => r.id === range)?.label}</span> · 数据每 15 分钟刷新
        </span>
      }
    >
      <BarChart data={DATA} series={[{ key: "tickets", label: "工单数" }]} height={200} />
    </ChartCard>
  );
}
