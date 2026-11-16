"use client";

import { Slider } from "@orra-ui/react";

export default function SliderOverview() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <Slider label="通知音量" defaultValue={64} formatOptions={{ style: "unit", unit: "percent" }} />
      <Slider
        label="价格区间"
        defaultValue={[300, 1200]}
        minValue={0}
        maxValue={2000}
        step={50}
        thumbLabels={["最低价", "最高价"]}
        formatOptions={{ style: "currency", currency: "CNY", maximumFractionDigits: 0 }}
      />
    </div>
  );
}
