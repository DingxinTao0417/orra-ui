"use client";

import { Progress, type ProgressTone } from "@orra-ui/react";

const ROWS: { tone: ProgressTone; label: string; value: number; size: "sm" | "md" | "lg" }[] = [
  { tone: "accent", label: "新手任务", value: 60, size: "sm" },
  { tone: "success", label: "测试覆盖率", value: 86, size: "md" },
  { tone: "warning", label: "磁盘写入", value: 74, size: "md" },
  { tone: "danger", label: "错误预算消耗", value: 92, size: "lg" },
];

export default function ProgressSizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      {ROWS.map((r) => (
        <Progress key={r.label} label={r.label} value={r.value} tone={r.tone} size={r.size} />
      ))}
    </div>
  );
}
