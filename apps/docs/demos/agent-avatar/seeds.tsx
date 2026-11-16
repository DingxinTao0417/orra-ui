"use client";

import { AgentAvatar } from "@orra-ui/react";

const AGENTS = [
  { seed: "research-agent", name: "调研助理" },
  { seed: "code-reviewer", name: "代码审查" },
  { seed: "data-analyst", name: "数据分析师" },
  { seed: "support-desk", name: "客服专员" },
  { seed: "copywriter", name: "文案写手" },
];

export default function AgentAvatarSeeds() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-wrap justify-center gap-6">
        {AGENTS.map((a) => (
          <div key={a.seed} className="flex w-20 flex-col items-center gap-2">
            <AgentAvatar name={a.name} seed={a.seed} size="lg" />
            <span className="text-caption text-fg-muted">{a.name}</span>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-4">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
          <AgentAvatar key={size} name="调研助理" seed="research-agent" size={size} state="thinking" />
        ))}
      </div>
    </div>
  );
}
