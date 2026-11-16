"use client";

import { ChartCard, ScatterChart } from "@orra-ui/react";

const FEATURES = [
  { name: "全局搜索", usage: 0.82, csat: 4.5, area: "核心" },
  { name: "看板视图", usage: 0.64, csat: 4.3, area: "核心" },
  { name: "评论@提及", usage: 0.71, csat: 3.6, area: "协作" },
  { name: "实时协同", usage: 0.38, csat: 4.6, area: "协作" },
  { name: "自动化规则", usage: 0.22, csat: 4.4, area: "效率" },
  { name: "批量导入", usage: 0.18, csat: 3.2, area: "效率" },
  { name: "甘特图", usage: 0.27, csat: 3.4, area: "核心" },
  { name: "AI 摘要", usage: 0.46, csat: 4.1, area: "效率" },
  { name: "访客链接", usage: 0.12, csat: 3.9, area: "协作" },
  { name: "移动端编辑", usage: 0.55, csat: 3.3, area: "核心" },
];

export default function ScatterChartQuadrants() {
  return (
    <ChartCard className="mx-auto w-full max-w-2xl" title="功能使用率 × 满意度">
      <ScatterChart
        data={FEATURES}
        x="usage"
        y="csat"
        groupBy="area"
        nameKey="name"
        xLabel="使用率"
        yLabel="满意度"
        xFormat="percent"
        yFormat={{ maximumFractionDigits: 1 }}
        quadrants={{ x: 0.45, y: 3.9, labels: ["小而美", "明星功能", "待观察", "需改进"] }}
        height={300}
      />
    </ChartCard>
  );
}
