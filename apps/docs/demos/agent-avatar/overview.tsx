"use client";

import { AgentAvatar, type AgentAvatarState } from "@orra-ui/react";

const STATES: { state: AgentAvatarState; label: string }[] = [
  { state: "idle", label: "空闲" },
  { state: "thinking", label: "思考中" },
  { state: "speaking", label: "回复中" },
  { state: "working", label: "执行中" },
  { state: "error", label: "需要处理" },
];

export default function AgentAvatarOverview() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      {STATES.map(({ state, label }) => (
        <div key={state} className="flex flex-col items-center gap-3">
          <AgentAvatar name="Orra 助手" state={state} size="xl" />
          <span className="text-body-sm text-fg-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
