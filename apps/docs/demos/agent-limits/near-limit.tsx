"use client";

import { AgentLimits } from "@orra-ui/react";

export default function AgentLimitsNearLimit() {
  return (
    <div className="w-full max-w-sm">
      <AgentLimits
        title="本周用量"
        plan="Free"
        context={{
          limit: 32_000,
          segments: [
            { id: "system", label: "系统提示词", value: 2_100 },
            { id: "chat", label: "对话", value: 24_600 },
            { id: "files", label: "文件", value: 3_900 },
          ],
        }}
        quotas={[
          { id: "msg", label: "消息", used: 46, limit: 50, unit: "条", description: "周一 00:00 重置" },
          { id: "agent", label: "智能体任务", used: 8, limit: 10, unit: "个", description: "周一 00:00 重置" },
        ]}
        upgradeHint="额度即将用完，升级后不限消息数"
        upgradeLabel="升级到 Pro"
        onUpgrade={() => {}}
      />
    </div>
  );
}
