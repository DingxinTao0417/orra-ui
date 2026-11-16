"use client";

import { useState } from "react";
import { Slider } from "@orra-ui/react";

export default function SliderControlled() {
  const [hours, setHours] = useState<number[]>([9, 18]);
  const total = hours[1]! - hours[0]!;
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Slider
        label="可预约时段"
        value={hours}
        onChange={setHours}
        minValue={0}
        maxValue={24}
        marks={[0, 6, 12, 18, 24].map((h) => ({ value: h, label: `${h}:00` }))}
        bubble="always"
        formatValue={(v) => `${v[0]}:00 – ${v[1]}:00`}
        thumbLabels={["开始时间", "结束时间"]}
      />
      <p className="text-body-sm text-fg-muted">每天开放 {total} 小时</p>
      <Slider aria-label="已禁用" defaultValue={40} isDisabled />
    </div>
  );
}
