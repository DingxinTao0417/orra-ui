"use client";

import { ThemeToggle } from "@orra-ui/react";

export default function ThemeToggleOverview() {
  return (
    <div className="flex flex-col items-center gap-5">
      <ThemeToggle showLabels />
      <div className="flex items-center gap-2 text-body-sm text-fg-muted">
        <ThemeToggle variant="icon" />
        <span>切换后整页颜色平滑过渡，选择会被记住。</span>
      </div>
    </div>
  );
}
