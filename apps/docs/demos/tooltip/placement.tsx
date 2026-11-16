"use client";

import { Button, Tooltip } from "@orra-ui/react";

const PLACEMENTS = [
  { placement: "top", label: "上方" },
  { placement: "bottom", label: "下方" },
  { placement: "start", label: "起始侧" },
  { placement: "end", label: "结束侧" },
] as const;

export default function TooltipPlacement() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {PLACEMENTS.map(({ placement, label }) => (
        <Tooltip key={placement} content={`显示在${label}`} placement={placement} showArrow delay={200}>
          <Button variant="outline" tone="neutral">
            {label}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}
