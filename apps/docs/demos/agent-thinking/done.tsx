"use client";

import { AgentThinking } from "@orra-ui/react";

export default function AgentThinkingDone() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <AgentThinking active={false} duration={23}>
        {`季度报表里华东区收入环比下降 12%，但订单量持平，说明客单价下降。
对比促销日历，9 月有两次满减活动，这是客单价下降的主要原因。
结论：收入下滑是促销导致的结构性变化，不是需求萎缩。`}
      </AgentThinking>
      <p className="text-body text-fg">
        华东区收入下滑主要来自 9 月的两次满减活动，订单量并未减少。建议下季度把满减门槛从 199 元提高到 259 元。
      </p>
    </div>
  );
}
