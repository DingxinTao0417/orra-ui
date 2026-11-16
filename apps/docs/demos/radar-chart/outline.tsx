"use client";

import { ChartCard, RadarChart } from "@orra-ui/react";

const SKILLS = [
  { skill: "前端", lin: 92, chen: 64, zhou: 75 },
  { skill: "后端", lin: 58, chen: 88, zhou: 70 },
  { skill: "数据", lin: 46, chen: 79, zhou: 86 },
  { skill: "设计", lin: 81, chen: 42, zhou: 60 },
  { skill: "运维", lin: 50, chen: 83, zhou: 54 },
  { skill: "沟通", lin: 77, chen: 69, zhou: 90 },
];

export default function RadarChartOutline() {
  return (
    <ChartCard className="mx-auto w-full max-w-lg" title="团队技能分布">
      <RadarChart
        data={SKILLS}
        index="skill"
        variant="outline"
        dots
        gridShape="circle"
        showRadiusAxis
        max={100}
        series={[
          { key: "lin", label: "林晓" },
          { key: "chen", label: "陈默" },
          { key: "zhou", label: "周一然" },
        ]}
        height={300}
      />
    </ChartCard>
  );
}
