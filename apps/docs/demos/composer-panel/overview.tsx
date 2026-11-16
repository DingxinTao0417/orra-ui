"use client";

import { useEffect, useState } from "react";
import { RiGlobalLine, RiPlugLine } from "@remixicon/react";
import { ComposerPanel, ModelPicker, type ComposerAttachmentItem, type ModelOption } from "@orra-ui/react";

const MODELS: ModelOption[] = [
  { id: "lumen-4-pro", name: "Lumen 4 Pro", provider: "Lumen", description: "复杂推理与多步骤任务", capabilities: ["reasoning", "vision"] },
  { id: "lumen-4-flash", name: "Lumen 4 Flash", provider: "Lumen", description: "快速问答", capabilities: ["fast"] },
  { id: "cobalt-r2", name: "Cobalt R2", provider: "Cobalt", description: "代码审查", capabilities: ["reasoning", "code"] },
];

export default function ComposerPanelOverview() {
  const [files, setFiles] = useState<ComposerAttachmentItem[]>([{ id: "spec", name: "登录页需求 v2.pdf", size: 842_000 }]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const id = window.setTimeout(() => setLoading(false), 4000);
    return () => window.clearTimeout(id);
  }, [loading]);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      {sent ? <p className="self-end rounded-card bg-surface-muted px-4 py-2.5 text-body text-fg">{sent}</p> : null}
      <ComposerPanel
        defaultValue="按照需求文档重构登录页，保留“记住我”功能"
        attachments={files}
        onRemoveAttachment={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
        onFilesSelected={(picked) => setFiles((f) => [...f, ...picked.map((p) => ({ id: crypto.randomUUID(), name: p.name, size: p.size, type: p.type }))])}
        addActions={[
          { id: "web", label: "联网搜索", icon: <RiGlobalLine />, description: "检索最新的网页信息" },
          { id: "mcp", label: "连接器", icon: <RiPlugLine />, description: "GitHub、Linear、飞书文档" },
        ]}
        modelPicker={<ModelPicker models={MODELS} variant="ghost" size="sm" />}
        onVoice={() => setRecording((r) => !r)}
        isRecording={recording}
        loading={loading}
        loadingLabel="正在重构登录页…"
        onStop={() => setLoading(false)}
        onSubmit={({ text }) => {
          setSent(text);
          setFiles([]);
          setLoading(true);
        }}
      />
    </div>
  );
}
