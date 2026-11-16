"use client";

import { Meter } from "@orra-ui/react";

export default function MeterOverview() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-card border border-line bg-surface p-5 shadow-card">
      <Meter label="存储空间" value={18.4} maxValue={50} formatOptions={{ style: "unit", unit: "gigabyte", maximumFractionDigits: 1 }} />
      <Meter label="本月 API 调用" value={81200} maxValue={100000} description="12 月 1 日重置" />
      <Meter label="团队席位" value={25} maxValue={25} />
    </div>
  );
}
