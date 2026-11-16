"use client";

import { CalendarDate } from "@internationalized/date";
import { EventCalendar, type CalendarEvent } from "@orra-ui/react";

const EVENTS: CalendarEvent[] = [
  { id: "a", title: "晨会", start: "2026-11-16T09:00", end: "2026-11-16T09:30", calendarId: "team" },
  { id: "b", title: "面试：前端工程师", start: "2026-11-16T10:00", end: "2026-11-16T11:00", calendarId: "hr" },
  { id: "c", title: "面试：产品经理", start: "2026-11-16T10:30", end: "2026-11-16T11:30", calendarId: "hr" },
  { id: "d", title: "晨会", start: "2026-11-17T09:00", end: "2026-11-17T09:30", calendarId: "team" },
  { id: "e", title: "新人入职培训", start: "2026-11-17T13:30", end: "2026-11-17T17:00", calendarId: "hr", location: "培训室 2" },
  { id: "f", title: "晨会", start: "2026-11-18T09:00", end: "2026-11-18T09:30", calendarId: "team" },
  { id: "g", title: "薪酬校准会", start: "2026-11-18T14:00", end: "2026-11-18T16:00", calendarId: "hr" },
  { id: "h", title: "团队下午茶", start: "2026-11-19T15:30", end: "2026-11-19T16:30", calendarId: "team" },
  { id: "i", title: "全员月会", start: "2026-11-20T16:00", end: "2026-11-20T17:30", calendarId: "team", location: "1F 报告厅" },
  { id: "j", title: "年假", start: "2026-11-20", calendarId: "leave" },
];

export default function EventCalendarWeek() {
  return (
    <div className="h-[600px] w-full">
      <EventCalendar
        events={EVENTS}
        calendars={[
          { id: "team", label: "团队" },
          { id: "hr", label: "招聘" },
          { id: "leave", label: "请假" },
        ]}
        defaultDate={new CalendarDate(2026, 11, 18)}
        defaultView="week"
        views={["week", "month"]}
        dayStartHour={8}
        dayEndHour={19}
        hourCycle={24}
      />
    </div>
  );
}
