"use client";

import { AccentPicker } from "@orra-ui/react";

export default function AccentPickerPresets() {
  return (
    <div className="flex flex-col items-center gap-2">
      <AccentPicker presets={["blue", "violet", "rose", "orange", "green", "slate"]} allowCustom={false} size="lg" />
      <span className="text-caption text-fg-subtle">只提供品牌规范内的 6 种颜色，不允许自定义</span>
    </div>
  );
}
