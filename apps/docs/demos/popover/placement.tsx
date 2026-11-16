"use client";

import { Button, Popover } from "@orra-ui/react";

const PLACEMENTS = [
  { placement: "top", label: "上方" },
  { placement: "bottom", label: "下方" },
  { placement: "start", label: "起始侧" },
  { placement: "end", label: "结束侧" },
] as const;

export default function PopoverPlacement() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {PLACEMENTS.map(({ placement, label }) => (
        <Popover
          key={placement}
          placement={placement}
          width="sm"
          trigger={
            <Button variant="outline" tone="neutral">
              {label}
            </Button>
          }
        >
          箭头会跟随实际位置旋转；空间不足时会自动翻转到另一侧。
        </Popover>
      ))}
    </div>
  );
}
