"use client";

import { ColorPickerPanel } from "@orra-ui/react";

export default function ColorPickerPanelDemo() {
  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-card">
      <ColorPickerPanel defaultValue="#14A39AE6" showAlpha />
    </div>
  );
}
