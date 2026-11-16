"use client";

import { useState } from "react";
import { ColorPicker } from "@orra-ui/react";

export default function ColorPickerOverview() {
  const [brand, setBrand] = useState("#5B5FEF");
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <ColorPicker label="品牌主色" value={brand} onChange={(c) => setBrand(c.toString("hex"))} />
      <div className="flex items-center gap-3 rounded-control border border-line bg-surface p-3">
        <span className="size-8 rounded-lg" style={{ background: brand }} />
        <span className="text-body-sm text-fg-muted">
          按钮、链接和选中态会使用 <span className="font-mono text-fg">{brand}</span>
        </span>
      </div>
    </div>
  );
}
