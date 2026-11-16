"use client";

import { RiAddLine } from "@remixicon/react";
import { IconButton, ModelPicker, type ModelOption } from "@orra-ui/react";

const MODELS: ModelOption[] = [
  { id: "lumen-4-flash", name: "Lumen 4 Flash", provider: "Lumen", description: "响应快，适合日常写作", capabilities: ["fast"] },
  { id: "cobalt-mini", name: "Cobalt Mini", provider: "Cobalt", description: "轻量低价", capabilities: ["fast"] },
  { id: "fathom-72b", name: "Fathom 72B", provider: "Fathom", description: "开源权重，可私有化部署", capabilities: ["code"] },
];

export default function ModelPickerTemperature() {
  return (
    <div className="flex w-full max-w-md items-center gap-1 rounded-card border border-line bg-surface p-2 shadow-card">
      <IconButton icon={<RiAddLine />} aria-label="添加" size="sm" round />
      <ModelPicker models={MODELS} variant="ghost" size="sm" control="temperature" defaultTemperature={0.9} />
      <span className="flex-1" />
      <span className="pe-2 text-caption text-fg-subtle">文案生成</span>
    </div>
  );
}
