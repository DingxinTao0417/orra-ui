"use client";

import { useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { DateRangeCalendar } from "@orra-ui/react";

export default function DateCalendarRange() {
  const [range, setRange] = useState<{ start: DateValue; end: DateValue } | null>(() => {
    const now = today(getLocalTimeZone());
    return { start: now.add({ days: 3 }), end: now.add({ days: 9 }) };
  });
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-card border border-line bg-surface p-4 shadow-card">
        <DateRangeCalendar aria-label="出差日期" value={range} onChange={setRange} visibleMonths={2} />
      </div>
      <p className="text-body-sm text-fg-subtle tabular-nums">{range ? `${range.start.toString()} → ${range.end.toString()}` : "未选择"}</p>
    </div>
  );
}
