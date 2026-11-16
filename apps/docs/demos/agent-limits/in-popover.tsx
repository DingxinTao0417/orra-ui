"use client";

import { RiDashboard3Line } from "@remixicon/react";
import { AgentLimits, Button, Popover } from "@orra-ui/react";

export default function AgentLimitsInPopover() {
  return (
    <Popover
      aria-label="用量"
      width="md"
      trigger={
        <Button variant="outline" tone="neutral" size="sm" startIcon={<RiDashboard3Line />}>
          上下文 43%
        </Button>
      }
    >
      <AgentLimits
        variant="plain"
        className="py-1"
        context={{
          limit: 200_000,
          segments: [
            { id: "system", label: "系统提示词", value: 8_400 },
            { id: "chat", label: "对话", value: 46_200 },
            { id: "files", label: "文件", value: 31_800 },
          ],
        }}
        quotas={[{ id: "pro", label: "高级模型请求", used: 312, limit: 500, unit: "次", description: "今天 18:00 重置" }]}
      />
    </Popover>
  );
}
