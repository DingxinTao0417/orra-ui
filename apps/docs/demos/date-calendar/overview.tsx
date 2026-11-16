"use client";

import { useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { DateCalendar } from "@orra-ui/react";

export default function DateCalendarOverview() {
  const [date, setDate] = useState<DateValue | null>(null);
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-card border border-line bg-surface p-4 shadow-card">
        <DateCalendar aria-label="交付日期" value={date} onChange={setDate} minValue={today(getLocalTimeZone())} />
      </div>
      <p className="text-body-sm text-fg-subtle">{date ? `已选择：${date.toString()}` : "今天之前的日期不可选"}</p>
    </div>
  );
}
