"use client";

import { WebCitation, WebSearch, type WebSearchSource } from "@orra-ui/react";

const SOURCES: WebSearchSource[] = [
  { id: "s1", title: "Nimbus 团队版价格与功能说明", url: "https://nimbus.example.com/pricing", citation: 1 },
  { id: "s2", title: "2026 年开发者工具订阅调查报告", url: "https://devsurvey.example.org/2026", citation: 2 },
  { id: "s3", title: "Kitewise 宣布按用量计费", url: "https://blog.kitewise.example.net/usage-pricing", citation: 3 },
  { id: "s4", title: "如何为 AI 产品定价：五种常见模型", url: "https://pm-notes.example.cn/ai-pricing" },
  { id: "s5", title: "SaaS 席位定价的利与弊", url: "https://saas-weekly.example.com/seats", status: "skipped" },
  { id: "s6", title: "Fieldnote 年度账单折扣政策", url: "https://fieldnote.example.io/billing" },
];

export default function WebSearchCitations() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <WebSearch queries={[{ id: "q1", query: "AI 编程助手 团队版 定价", resultCount: 38 }, { id: "q2", query: "按用量计费 开发者工具", resultCount: 21 }]} sources={SOURCES} />
      <p className="text-body leading-relaxed text-fg">
        主流产品的团队版集中在每席位每月 19–39 美元
        <WebCitation index={1} source={SOURCES[0]!} />
        ，约六成受访团队更偏好固定席位价
        <WebCitation index={2} source={SOURCES[1]!} />
        ，但按用量计费正在成为新趋势
        <WebCitation index={3} source={SOURCES[2]!} />。
      </p>
    </div>
  );
}
