"use client";

import { useEffect, useState } from "react";
import { AgentLog, type AgentLogItem } from "@orra-ui/react";

const STEPS: AgentLogItem[] = [
  { id: "a", kind: "web", title: "搜索竞品定价页", meta: "3 个站点" },
  { id: "b", kind: "read", title: "阅读 Nimbus 定价说明", meta: "nimbus.example.com" },
  { id: "c", kind: "tool", title: "提取套餐与价格", meta: "12 条记录" },
  { id: "d", kind: "edit", title: "写入 竞品对比.md", meta: "+86 行" },
  { id: "e", kind: "message", title: "整理结论并回复" },
];

export default function AgentLogStreaming() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count >= STEPS.length) return;
    const id = window.setTimeout(() => setCount((c) => c + 1), 1400);
    return () => window.clearTimeout(id);
  }, [count]);

  return (
    <div className="w-full max-w-md">
      <AgentLog items={STEPS.slice(0, count)} working={count < STEPS.length} workingLabel="正在调研竞品…" />
    </div>
  );
}
