"use client";

import { ChartDeltaBadge, ChartLegend, ChartTooltipPanel, chartColor } from "@orra-ui/react";

const ITEMS = [
  { key: "web", label: "网页端", color: chartColor(0), value: "58,210", detail: "52%" },
  { key: "ios", label: "iOS", color: chartColor(1), value: "31,460", detail: "28%" },
  { key: "android", label: "Android", color: chartColor(2), value: "22,380", detail: "20%" },
];

export default function ChartCardParts() {
  return (
    <div className="mx-auto grid w-full max-w-3xl items-start gap-6 md:grid-cols-[1fr_1.3fr_1fr]">
      <div className="flex flex-col gap-3">
        <p className="text-caption font-medium text-fg-subtle">变化徽标</p>
        <div className="flex flex-wrap gap-2">
          <ChartDeltaBadge value={0.184} />
          <ChartDeltaBadge value={-0.072} />
          <ChartDeltaBadge value={-0.031} invert />
          <ChartDeltaBadge value={0} />
        </div>
        <p className="mt-2 text-caption font-medium text-fg-subtle">行内图例</p>
        <ChartLegend items={ITEMS.map(({ key, label, color }) => ({ key, label, color }))} />
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-caption font-medium text-fg-subtle">列表图例（数值 + 占比）</p>
        <ChartLegend variant="list" items={ITEMS} />
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-caption font-medium text-fg-subtle">提示框</p>
        <ChartTooltipPanel
          title="11 月 12 日"
          rows={ITEMS.map((i) => ({ key: i.key, label: i.label, value: i.value, color: i.color }))}
          footer="合计 112,050"
        />
      </div>
    </div>
  );
}
