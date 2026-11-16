"use client";

import { ProgressRing } from "@orra-ui/react";

export default function ProgressRingDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <ProgressRing value={72} size="lg" aria-label="资料完整度" />
      <ProgressRing value={45} tone="warning" aria-label="本月预算使用" />
      <ProgressRing value={100} tone="success" aria-label="迁移进度" />
      <ProgressRing isIndeterminate size="sm" label="正在同步…" />
    </div>
  );
}
