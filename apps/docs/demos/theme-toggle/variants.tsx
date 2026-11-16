"use client";

import { ThemeToggle } from "@orra-ui/react";

const VARIANTS = [
  { variant: "segmented", label: "分段（segmented）" },
  { variant: "icon", label: "图标按钮（icon）" },
  { variant: "menu", label: "下拉菜单（menu）" },
] as const;

export default function ThemeToggleVariants() {
  return (
    <div className="grid grid-cols-[auto_auto] items-center gap-x-8 gap-y-4">
      {VARIANTS.map(({ variant, label }) => (
        <div key={variant} className="contents">
          <span className="text-body-sm text-fg-muted">{label}</span>
          <ThemeToggle variant={variant} />
        </div>
      ))}
    </div>
  );
}
