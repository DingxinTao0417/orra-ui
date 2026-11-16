"use client";

import { Slider } from "@orra-ui/react";

export default function SliderMarks() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <Slider
        label="回答风格"
        defaultValue={1}
        minValue={0}
        maxValue={3}
        marks={[
          { value: 0, label: "精确" },
          { value: 1, label: "平衡" },
          { value: 2, label: "灵活" },
          { value: 3, label: "创意" },
        ]}
        showValue={false}
        bubble="never"
      />
      <Slider label="团队规模" defaultValue={20} minValue={0} maxValue={50} step={10} marks formatValue={([v]) => `${v} 人`} />
    </div>
  );
}
