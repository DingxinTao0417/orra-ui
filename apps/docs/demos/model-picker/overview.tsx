"use client";

import { ModelPicker, type ModelOption } from "@orra-ui/react";

// Invented providers and models.
const MODELS: ModelOption[] = [
  { id: "lumen-4-pro", name: "Lumen 4 Pro", provider: "Lumen", description: "擅长复杂推理与多步骤任务", capabilities: ["reasoning", "vision", "long-context"], contextWindow: 400_000 },
  { id: "lumen-4-flash", name: "Lumen 4 Flash", provider: "Lumen", description: "响应快，适合日常问答与改写", capabilities: ["fast", "vision"], contextWindow: 200_000 },
  { id: "cobalt-r2", name: "Cobalt R2", provider: "Cobalt", description: "严谨的规划者，代码审查表现突出", capabilities: ["reasoning", "code"], contextWindow: 256_000, isNew: true },
  { id: "cobalt-mini", name: "Cobalt Mini", provider: "Cobalt", description: "轻量低价，适合批量任务", capabilities: ["fast"], contextWindow: 128_000 },
  { id: "fathom-72b", name: "Fathom 72B", provider: "Fathom", description: "开源权重，可私有化部署", capabilities: ["code"], contextWindow: 128_000 },
  { id: "fathom-vl", name: "Fathom VL", provider: "Fathom", description: "图表与截图理解", capabilities: ["vision"], contextWindow: 64_000 },
];

export default function ModelPickerOverview() {
  return <ModelPicker models={MODELS} defaultValue="lumen-4-pro" defaultEffort="high" />;
}
