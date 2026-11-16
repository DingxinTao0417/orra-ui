"use client";

import { getLocalTimeZone, today } from "@internationalized/date";
import { DateRangePicker } from "@orra-ui/react";

export default function DateRangePickerCustom() {
  const now = today(getLocalTimeZone());
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <DateRangePicker
        label="入住与离店"
        description="最多提前 90 天预订"
        minValue={now}
        maxValue={now.add({ days: 90 })}
        presets={[
          { label: "本周末", value: (d) => ({ start: d.add({ days: (6 - d.toDate(getLocalTimeZone()).getDay() + 7) % 7 }), end: d.add({ days: ((6 - d.toDate(getLocalTimeZone()).getDay() + 7) % 7) + 1 }) }) },
          { label: "住 3 晚", value: (d) => ({ start: d, end: d.add({ days: 3 }) }) },
          { label: "住一周", value: (d) => ({ start: d, end: d.add({ days: 7 }) }) },
        ]}
      />
      <DateRangePicker label="单月视图" visibleMonths={1} presets={false} size="sm" />
    </div>
  );
}
