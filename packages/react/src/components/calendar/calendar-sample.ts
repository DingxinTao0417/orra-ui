import { CalendarDate, startOfMonth } from "@internationalized/date";
import type { CalendarEvent, CalendarSource } from "./calendar-types";

const COPY = {
  en: {
    work: "Work",
    team: "Team",
    personal: "Personal",
    standup: "Team stand-up",
    review: "Design review",
    oneOnOne: "1:1 with Priya",
    planning: "Sprint planning",
    launch: "Launch day",
    offsite: "Team offsite",
    dentist: "Dentist",
    gym: "Gym",
    lunch: "Lunch with Alex",
    demo: "Customer demo",
    retro: "Retrospective",
    holiday: "Public holiday",
    room: "Room 4B",
    office: "Main office",
  },
  zh: {
    work: "工作",
    team: "团队",
    personal: "个人",
    standup: "团队站会",
    review: "设计评审",
    oneOnOne: "与晓雯 1:1",
    planning: "迭代规划会",
    launch: "新版本发布",
    offsite: "团队团建",
    dentist: "看牙医",
    gym: "健身",
    lunch: "和阿杰吃午饭",
    demo: "客户演示",
    retro: "迭代回顾",
    holiday: "公共假期",
    room: "4B 会议室",
    office: "总部",
  },
};

/** Sample calendars (colour per calendar comes from the chart palette). */
export function sampleCalendarSources(lang: "en" | "zh"): CalendarSource[] {
  const t = COPY[lang];
  return [
    { id: "work", label: t.work },
    { id: "team", label: t.team },
    { id: "personal", label: t.personal },
  ];
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Sample events spread over the month containing `anchor` (clearly sample data). */
export function sampleCalendarEvents(anchor: CalendarDate, lang: "en" | "zh"): CalendarEvent[] {
  const t = COPY[lang];
  const first = startOfMonth(anchor);
  const day = (d: number) => {
    const date = first.add({ days: Math.min(d, first.calendar.getDaysInMonth(first)) - 1 });
    return `${date.year}-${pad(date.month)}-${pad(date.day)}`;
  };
  const at = (d: number, time: string) => `${day(d)}T${time}`;
  const events: CalendarEvent[] = [];
  // Weekday stand-ups at 09:30.
  for (let d = 1; d <= 28; d++) {
    const date = first.add({ days: d - 1 });
    const dow = date.toDate("UTC").getUTCDay();
    if (dow >= 1 && dow <= 5 && d % 2 === 1)
      events.push({ id: `standup-${d}`, title: t.standup, start: at(d, "09:30"), end: at(d, "09:45"), calendarId: "team" });
  }
  events.push(
    {
      id: "review",
      title: t.review,
      start: at(4, "14:00"),
      end: at(4, "15:30"),
      calendarId: "work",
      location: t.room,
      attendees: [{ name: "Priya Shah" }, { name: "Leo Park" }, { name: "Ana Ruiz" }],
    },
    { id: "one", title: t.oneOnOne, start: at(6, "11:00"), end: at(6, "11:30"), calendarId: "work" },
    { id: "planning", title: t.planning, start: at(9, "10:00"), end: at(9, "12:00"), calendarId: "team", location: t.room },
    { id: "dentist", title: t.dentist, start: at(11, "17:30"), end: at(11, "18:30"), calendarId: "personal" },
    { id: "offsite", title: t.offsite, start: day(13), end: day(14), allDay: true, calendarId: "team", location: t.office },
    { id: "lunch", title: t.lunch, start: at(16, "12:30"), end: at(16, "13:30"), calendarId: "personal" },
    { id: "demo", title: t.demo, start: at(17, "15:00"), end: at(17, "16:00"), calendarId: "work", attendees: [{ name: "Maya Chen" }, { name: "Sam Wilson" }] },
    { id: "gym1", title: t.gym, start: at(17, "19:00"), end: at(17, "20:00"), calendarId: "personal" },
    { id: "launch", title: t.launch, start: day(19), allDay: true, calendarId: "work" },
    { id: "review2", title: t.review, start: at(19, "16:00"), end: at(19, "17:00"), calendarId: "work" },
    { id: "retro", title: t.retro, start: at(23, "15:00"), end: at(23, "16:00"), calendarId: "team" },
    { id: "holiday", title: t.holiday, start: day(26), allDay: true, calendarId: "personal" },
    { id: "gym2", title: t.gym, start: at(24, "07:30"), end: at(24, "08:30"), calendarId: "personal" },
  );
  return events;
}
