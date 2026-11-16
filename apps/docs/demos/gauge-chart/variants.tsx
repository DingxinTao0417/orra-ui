"use client";

import { GaugeChart } from "@orra-ui/react";

const THRESHOLDS = [
  { value: 0, tone: "success" as const },
  { value: 60, tone: "warning" as const },
  { value: 85, tone: "danger" as const },
];

export default function GaugeChartVariants() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-3">
      <GaugeChart variant="three-quarter" value={42} label="CPU" thresholds={THRESHOLDS} valueFormat={(v) => `${v}%`} size={200} />
      <GaugeChart variant="three-quarter" value={71} label="内存" thresholds={THRESHOLDS} valueFormat={(v) => `${v}%`} size={200} />
      <GaugeChart variant="three-quarter" value={93} label="磁盘" thresholds={THRESHOLDS} valueFormat={(v) => `${v}%`} size={200} />
    </div>
  );
}
