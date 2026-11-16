"use client";

import { AgentThinking } from "@orra-ui/react";

export default function AgentThinkingVariants() {
  return (
    <div className="flex flex-col gap-4">
      <AgentThinking variant="shimmer" />
      <AgentThinking variant="dots" label="正在规划步骤" />
      <AgentThinking variant="pulse" label="正在检索知识库" showTimer={false} />
    </div>
  );
}
