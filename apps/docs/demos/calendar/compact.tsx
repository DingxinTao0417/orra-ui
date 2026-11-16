"use client";

import { CalendarDate } from "@internationalized/date";
import { EventCalendar } from "@orra-ui/react";

export default function EventCalendarCompact() {
  return (
    <div className="h-[460px] w-full max-w-[380px]">
      <EventCalendar
        defaultDate={new CalendarDate(2026, 11, 1)}
        views={["month", "agenda"]}
        showCalendarFilter={false}
        events={[
          { id: "1", title: "物业费缴纳", start: "2026-11-05", color: "var(--color-chart-3)" },
          { id: "2", title: "体检", start: "2026-11-08T08:00", end: "2026-11-08T10:00", location: "市一医院" },
          { id: "3", title: "朋友婚礼", start: "2026-11-14T11:30", end: "2026-11-14T14:00" },
          { id: "4", title: "信用卡还款", start: "2026-11-20", color: "var(--color-chart-5)" },
          { id: "5", title: "周末短途旅行", start: "2026-11-21", end: "2026-11-22", color: "var(--color-chart-2)" },
        ]}
      />
    </div>
  );
}
