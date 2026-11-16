"use client";

import { useEffect, useState } from "react";
import { WebSearch, type WebSearchQuery, type WebSearchSource, type WebSearchStatus } from "@orra-ui/react";

const QUERIES: WebSearchQuery[] = [
  { id: "q1", query: "AI 编程助手 团队版 定价 2026", resultCount: 38 },
  { id: "q2", query: "Nimbus 席位计费 变更", resultCount: 12 },
];
const SOURCES: WebSearchSource[] = [
  { id: "s1", title: "Nimbus 团队版价格与功能说明", url: "https://nimbus.example.com/pricing" },
  { id: "s2", title: "2026 年开发者工具订阅调查报告", url: "https://devsurvey.example.org/2026" },
  { id: "s3", title: "Kitewise 宣布按用量计费", url: "https://blog.kitewise.example.net/usage-pricing" },
  { id: "s4", title: "如何为 AI 产品定价：五种常见模型", url: "https://pm-notes.example.cn/ai-pricing" },
];

// [phase, visible queries, visible sources, reading index]
const TIMELINE: [WebSearchStatus, number, number, number][] = [
  ["searching", 1, 0, -1],
  ["searching", 2, 0, -1],
  ["reading", 2, 2, 1],
  ["reading", 2, 4, 3],
  ["summarizing", 2, 4, -1],
  ["done", 2, 4, -1],
];

export default function WebSearchOverview() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= TIMELINE.length - 1) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), 1300);
    return () => window.clearTimeout(id);
  }, [step]);
  const [status, q, s, reading] = TIMELINE[step]!;

  return (
    <div className="w-full max-w-lg">
      <WebSearch
        status={status}
        isExpanded
        queries={QUERIES.slice(0, q).map((x, i) => ({ ...x, status: status === "searching" && i === q - 1 ? "running" : "done" }))}
        sources={SOURCES.slice(0, s).map((x, i) => ({ ...x, status: i === reading ? "reading" : "read", citation: status === "done" && i < 3 ? i + 1 : undefined }))}
      />
    </div>
  );
}
