"use client";

import { Time } from "@internationalized/date";
import { TimeField } from "@orra-ui/react";

export default function TimeFieldSeconds() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-4">
      <TimeField label="开始（含秒）" showSeconds hourCycle={24} defaultValue={new Time(14, 5, 30)} />
      <TimeField label="结束（含秒）" showSeconds hourCycle={24} size="sm" />
      <TimeField label="已禁用" isDisabled defaultValue={new Time(8, 0)} hourCycle={24} />
      <TimeField label="无图标" icon={null} defaultValue={new Time(18, 45)} hourCycle={24} />
    </div>
  );
}
