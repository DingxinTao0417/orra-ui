"use client";

import { useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { DateRangePicker } from "@orra-ui/react";

export default function DateRangePickerOverview() {
  const [range, setRange] = useState<{ start: DateValue; end: DateValue } | null>(() => {
    const now = today(getLocalTimeZone());
    return { start: now.subtract({ days: 6 }), end: now };
  });
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <DateRangePicker label="报表周期" value={range} onChange={setRange} />
      <p className="text-body-sm text-fg-subtle tabular-nums">
        {range ? `${range.start.toString()} 至 ${range.end.toString()}` : "未选择"}
      </p>
    </div>
  );
}
