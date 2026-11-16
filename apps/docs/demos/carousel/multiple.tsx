"use client";

import { Carousel, ProgressRing } from "@orra-ui/react";

const GOALS = [
  { name: "华东", value: 82 },
  { name: "华南", value: 64 },
  { name: "华北", value: 91 },
  { name: "西南", value: 47 },
  { name: "海外", value: 58 },
  { name: "线上", value: 73 },
];

export default function CarouselMultiple() {
  return (
    <div className="w-full max-w-xl">
      <Carousel aria-label="区域目标完成度" slideSize="calc((100% - 24px) / 3)" gap={12} arrows="footer" dots={false}>
        {GOALS.map((g) => (
          <div key={g.name} className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-5">
            <ProgressRing value={g.value} aria-label={`${g.name}目标完成度`} />
            <span className="text-body-sm font-medium text-fg">{g.name}</span>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
