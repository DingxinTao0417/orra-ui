"use client";

import { SegmentedControl, type Size } from "@orra-ui/react";

const OPTIONS = [
  { id: "monthly", label: "按月付" },
  { id: "yearly", label: "按年付 · 省 20%" },
];

export default function SegmentedControlSizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      {(["sm", "md", "lg"] as Size[]).map((size) => (
        <SegmentedControl key={size} aria-label={`计费周期 ${size}`} size={size} options={OPTIONS} defaultValue="yearly" fullWidth />
      ))}
    </div>
  );
}
