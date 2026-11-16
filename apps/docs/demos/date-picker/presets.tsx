"use client";

import { endOfMonth, startOfWeek } from "@internationalized/date";
import { DatePicker } from "@orra-ui/react";

export default function DatePickerPresets() {
  return (
    <div className="flex w-full max-w-md flex-wrap items-start justify-center gap-4">
      <DatePicker
        className="w-56"
        label="复盘会议"
        presets={[
          { label: "下周一", value: (d) => startOfWeek(d.add({ weeks: 1 }), "zh-CN") },
          { label: "两周后", value: (d) => d.add({ weeks: 2 }) },
          { label: "月底", value: (d) => endOfMonth(d) },
        ]}
      />
      <DatePicker className="w-56" label="生日" presets={false} isClearable={false} />
    </div>
  );
}
