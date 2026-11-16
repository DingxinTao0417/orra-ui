"use client";

import { Time } from "@internationalized/date";
import { TimeField } from "@orra-ui/react";

export default function TimeFieldOverview() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <TimeField label="每日站会" defaultValue={new Time(9, 30)} hourCycle={24} description="使用 ↑ ↓ 调整，或直接输入数字。" />
      <TimeField label="提醒时间" defaultValue={new Time(20, 15)} hourCycle={12} />
    </div>
  );
}
