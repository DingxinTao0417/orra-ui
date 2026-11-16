"use client";

import { useState } from "react";
import { AgentLimits } from "@orra-ui/react";

const HOUR = 3_600_000;

export default function AgentLimitsOverview() {
  // Reset times are relative to when the demo mounts.
  const [now] = useState(() => Date.now());
  return (
    <div className="w-full max-w-sm">
      <AgentLimits
        plan="Pro"
        context={{
          limit: 200_000,
          segments: [
            { id: "system", label: "系统提示词", value: 8_400 },
            { id: "chat", label: "对话", value: 46_200 },
            { id: "files", label: "文件", value: 31_800 },
          ],
        }}
        quotas={[
          { id: "pro", label: "高级模型请求", used: 312, limit: 500, unit: "次", resetsAt: now + 3 * HOUR + 20 * 60_000 },
          { id: "search", label: "联网搜索", used: 48, limit: 200, unit: "次", resetsAt: now + 26 * HOUR },
        ]}
        upgradeHint="升级到 Team，额度提升 5 倍"
        onUpgrade={() => {}}
      />
    </div>
  );
}
