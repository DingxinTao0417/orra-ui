"use client";

import { ColorPicker } from "@orra-ui/react";

const LABEL_COLORS = ["#E5484D", "#F2711C", "#E8A317", "#22A35A", "#0EA5C6", "#5B5FEF", "#E84C9A", "#64748B"];

export default function ColorPickerSwatches() {
  return (
    <div className="flex items-center gap-3">
      <ColorPicker trigger="swatch" size="sm" defaultValue="#E5484D" swatches={LABEL_COLORS} labels={{ pick: "标签颜色：紧急" }} />
      <ColorPicker trigger="swatch" defaultValue="#22A35A" swatches={LABEL_COLORS} labels={{ pick: "标签颜色：已完成" }} />
      <ColorPicker trigger="swatch" size="lg" defaultValue="#5B5FEF99" showAlpha swatches={LABEL_COLORS} labels={{ pick: "背景色" }} />
    </div>
  );
}
