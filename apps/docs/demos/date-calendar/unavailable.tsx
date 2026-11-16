"use client";

import { getLocalTimeZone, isWeekend, today } from "@internationalized/date";
import { useLocale } from "react-aria-components";
import { DateCalendar } from "@orra-ui/react";

export default function DateCalendarUnavailable() {
  const { locale } = useLocale();
  const now = today(getLocalTimeZone());
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4 shadow-card">
        <p className="text-body-sm font-medium text-fg">工作日预约（周末不可选）</p>
        <DateCalendar aria-label="预约日期" isDateUnavailable={(d) => isWeekend(d, locale)} minValue={now} maxValue={now.add({ days: 45 })} />
      </div>
      <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4 shadow-card">
        <p className="text-body-sm font-medium text-fg">每周从周日开始</p>
        <DateCalendar aria-label="周日开始的日历" firstDayOfWeek="sun" />
      </div>
    </div>
  );
}
