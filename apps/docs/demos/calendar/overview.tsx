"use client";

import { useState } from "react";
import { CalendarDate } from "@internationalized/date";
import { Button, EventCalendar, type CalendarEvent, type CalendarSource } from "@orra-ui/react";

const CALENDARS: CalendarSource[] = [
  { id: "product", label: "产品" },
  { id: "market", label: "市场" },
  { id: "life", label: "个人" },
];

const EVENTS: CalendarEvent[] = [
  { id: "1", title: "迭代规划会", start: "2026-11-02T10:00", end: "2026-11-02T11:30", calendarId: "product", location: "3F 大会议室" },
  {
    id: "2",
    title: "设计评审：结算页",
    start: "2026-11-04T14:00",
    end: "2026-11-04T15:00",
    calendarId: "product",
    attendees: [{ name: "沈晓雯" }, { name: "朴立恒" }, { name: "林依然" }],
  },
  { id: "3", title: "双十一大促", start: "2026-11-09", end: "2026-11-11", calendarId: "market", description: "主会场 11 日 0 点开启，提前一天完成压测。" },
  { id: "4", title: "直播彩排", start: "2026-11-10T19:30", end: "2026-11-10T21:00", calendarId: "market", location: "演播室 B" },
  { id: "5", title: "健身", start: "2026-11-10T07:00", end: "2026-11-10T08:00", calendarId: "life" },
  { id: "6", title: "供应商对账", start: "2026-11-10T15:00", end: "2026-11-10T16:00", calendarId: "product" },
  { id: "7", title: "客户回访", start: "2026-11-12T11:00", end: "2026-11-12T12:00", calendarId: "market" },
  { id: "8", title: "季度 OKR 复盘", start: "2026-11-16T09:30", end: "2026-11-16T11:00", calendarId: "product", location: "线上 · 腾讯会议" },
  { id: "9", title: "和阿杰吃午饭", start: "2026-11-16T12:00", end: "2026-11-16T13:00", calendarId: "life" },
  { id: "10", title: "新版本发布", start: "2026-11-19", calendarId: "product" },
  { id: "11", title: "品牌片拍摄", start: "2026-11-23", end: "2026-11-24", calendarId: "market", location: "莫干山" },
  { id: "12", title: "看牙医", start: "2026-11-25T17:30", end: "2026-11-25T18:30", calendarId: "life" },
  { id: "13", title: "年终预算会", start: "2026-11-27T14:00", end: "2026-11-27T17:00", calendarId: "product" },
];

export default function EventCalendarOverview() {
  const [events, setEvents] = useState(EVENTS);
  return (
    <div className="h-[680px] w-full">
      <EventCalendar
        events={events}
        calendars={CALENDARS}
        defaultDate={new CalendarDate(2026, 11, 16)}
        onCreate={(date) =>
          setEvents((list) => [...list, { id: crypto.randomUUID(), title: "新日程", start: `${date.toString()}T10:00`, calendarId: "product" }])
        }
        eventActions={(event, close) => (
          <Button
            size="sm"
            variant="outline"
            tone="danger"
            onPress={() => {
              setEvents((list) => list.filter((e) => e.id !== event.id));
              close();
            }}
          >
            删除
          </Button>
        )}
      />
    </div>
  );
}
