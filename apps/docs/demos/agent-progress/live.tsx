"use client";

import { useEffect, useState } from "react";
import { AgentProgress, type AgentStepStatus } from "@orra-ui/react";

const STEPS = ["读取 Q3 销售明细", "按区域汇总收入", "识别异常波动", "生成图表", "撰写分析摘要"];

export default function AgentProgressLive() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (current >= STEPS.length) return;
    const id = window.setTimeout(() => setCurrent((c) => c + 1), 1500);
    return () => window.clearTimeout(id);
  }, [current]);

  const status = (i: number): AgentStepStatus => (i < current ? "done" : i === current ? "active" : "pending");

  return (
    <div className="w-full max-w-md">
      <AgentProgress
        title="分析季度报表"
        steps={STEPS.map((title, i) => ({ id: String(i), title, status: status(i), description: i === current ? "预计还需几秒…" : undefined }))}
      />
    </div>
  );
}
