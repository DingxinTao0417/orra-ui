"use client";

import { useState } from "react";
import { SegmentedControl } from "@orra-ui/react";

const RANGES = [
  { id: "7d", label: "近 7 天" },
  { id: "30d", label: "近 30 天" },
  { id: "90d", label: "近 90 天" },
  { id: "1y", label: "全年" },
];

export default function SegmentedControlOverview() {
  const [range, setRange] = useState("30d");
  return (
    <div className="flex flex-col items-center gap-3">
      <SegmentedControl aria-label="统计周期" options={RANGES} value={range} onChange={setRange} />
      <p className="text-body-sm text-fg-muted">当前周期：{RANGES.find((r) => r.id === range)?.label}</p>
    </div>
  );
}
