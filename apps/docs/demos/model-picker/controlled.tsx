"use client";

import { useState } from "react";
import { ModelPicker, type ModelEffort, type ModelOption } from "@orra-ui/react";

const MODELS: ModelOption[] = [
  { id: "lumen-4-pro", name: "Lumen 4 Pro", provider: "Lumen", description: "复杂推理", capabilities: ["reasoning", "vision"] },
  { id: "cobalt-r2", name: "Cobalt R2", provider: "Cobalt", description: "代码审查", capabilities: ["reasoning", "code"] },
  { id: "cobalt-mini", name: "Cobalt Mini", provider: "Cobalt", description: "批量任务", capabilities: ["fast"] },
];

export default function ModelPickerControlled() {
  const [model, setModel] = useState("cobalt-r2");
  const [effort, setEffort] = useState<ModelEffort>("medium");
  return (
    <div className="flex flex-col items-center gap-3">
      <ModelPicker models={MODELS} value={model} onChange={setModel} effort={effort} onEffortChange={setEffort} />
      <p className="text-body-sm text-fg-muted">
        当前：<span className="font-medium text-fg">{MODELS.find((m) => m.id === model)?.name}</span> · 推理强度 {effort}
      </p>
    </div>
  );
}
