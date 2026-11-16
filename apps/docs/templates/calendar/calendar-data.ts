import { CalendarDate } from "@internationalized/date";
import type { CalendarEvent, CalendarSource } from "@orra-ui/react";

export const SOURCES: (CalendarSource & { color: string; owner: string })[] = [
  { id: "team", label: "团队会议", color: "var(--color-chart-1)", owner: "Orra 工作室" },
  { id: "release", label: "版本发布", color: "var(--color-chart-2)", owner: "产品组" },
  { id: "focus", label: "专注时间", color: "var(--color-chart-3)", owner: "我的日历" },
  { id: "customer", label: "客户沟通", color: "var(--color-chart-4)", owner: "商务组" },
  { id: "personal", label: "个人", color: "var(--color-chart-5)", owner: "我的日历" },
];

interface Seed {
  id: string;
  title: string;
  /** Days from the Monday of the current week (or from today when `fromToday`). */
  day: number;
  fromToday?: boolean;
  /** "09:30"-style local time; omitted for all-day events. */
  start?: string;
  end?: string;
  /** For multi-day all-day events: inclusive number of extra days. */
  span?: number;
  calendarId: string;
  location?: string;
  description?: string;
  attendees?: string[];
}

/** Recurring weekly rhythm plus one-off events, placed relative to the current week. */
const SEEDS: Seed[] = [
  // last week
  { id: "e01", title: "迭代 13 回顾", day: -3, start: "16:00", end: "17:00", calendarId: "team", location: "3F 星云会议室", attendees: ["周以安", "陈默", "林依然"] },
  { id: "e02", title: "v2.7 正式发布", day: -4, calendarId: "release", description: "灰度 20% → 100%，值班：陈默。" },
  { id: "e03", title: "羽毛球", day: -2, start: "19:30", end: "21:00", calendarId: "personal", location: "体育中心 4 号场" },
  // this week
  { id: "e10", title: "周一站会", day: 0, start: "09:30", end: "09:45", calendarId: "team", location: "线上 · 视频会议" },
  { id: "e11", title: "迭代 14 规划", day: 0, start: "10:00", end: "11:30", calendarId: "team", location: "3F 星云会议室", attendees: ["周以安", "陈默", "沈晓雯", "林依然"], description: "确认看板优先级，拆分组件库 3.0 任务。" },
  { id: "e12", title: "深度工作：DataGrid 冻结列", day: 1, start: "09:00", end: "12:00", calendarId: "focus" },
  { id: "e13", title: "禾木咨询 需求访谈", day: 1, start: "14:00", end: "15:00", calendarId: "customer", location: "客户现场 · 徐汇", attendees: ["林依然", "许嘉禾"] },
  { id: "e14", title: "设计评审：计费页", day: 2, start: "11:00", end: "12:00", calendarId: "team", attendees: ["沈晓雯", "林依然", "朴立恒"] },
  { id: "e15", title: "午餐 · 和阿杰", day: 2, start: "12:15", end: "13:15", calendarId: "personal" },
  { id: "e16", title: "深度工作：文档站模板", day: 3, start: "14:00", end: "17:30", calendarId: "focus" },
  { id: "e17", title: "v2.8 冻结代码", day: 3, calendarId: "release", description: "冻结后只合入 P0 修复。" },
  { id: "e18", title: "周五分享：设计令牌", day: 4, start: "16:00", end: "17:00", calendarId: "team", location: "2F 开放区" },
  { id: "e19", title: "牙医复查", day: 4, start: "18:30", end: "19:15", calendarId: "personal", location: "瑞尔齿科 · 静安" },
  { id: "e20", title: "城市骑行", day: 5, start: "08:00", end: "10:30", calendarId: "personal", location: "滨江绿道" },
  // always around "today", whatever weekday it is
  { id: "t01", title: "整理本周周报", day: 0, fromToday: true, start: "17:00", end: "17:45", calendarId: "focus" },
  { id: "t02", title: "读书会：《设计中的设计》", day: 0, fromToday: true, start: "20:00", end: "21:00", calendarId: "personal", location: "线上" },
  { id: "t03", title: "候选人面试 · 前端", day: 1, fromToday: true, start: "15:30", end: "16:30", calendarId: "team", attendees: ["林依然", "周以安"] },
  // next weeks
  { id: "e30", title: "周一站会", day: 7, start: "09:30", end: "09:45", calendarId: "team", location: "线上 · 视频会议" },
  { id: "e31", title: "v2.8 发布窗口", day: 8, span: 1, calendarId: "release", description: "周二灰度，周三全量。" },
  { id: "e32", title: "星桥实验室 季度复盘", day: 8, start: "15:00", end: "16:30", calendarId: "customer", location: "线上 · 视频会议", attendees: ["林依然", "许嘉禾", "陈默"] },
  { id: "e33", title: "深度工作：组件库 3.0 RFC", day: 9, start: "09:00", end: "12:00", calendarId: "focus" },
  { id: "e34", title: "团队年终聚餐", day: 11, start: "18:30", end: "21:00", calendarId: "team", location: "云间小馆" },
  { id: "e35", title: "周一站会", day: 14, start: "09:30", end: "09:45", calendarId: "team", location: "线上 · 视频会议" },
  { id: "e36", title: "上海设计周", day: 16, span: 2, calendarId: "personal", location: "西岸艺术中心" },
  { id: "e37", title: "合同续签沟通", day: 17, start: "10:30", end: "11:30", calendarId: "customer", attendees: ["林依然", "许嘉禾"] },
  { id: "e38", title: "迭代 15 回顾", day: 18, start: "16:00", end: "17:00", calendarId: "team", location: "3F 星云会议室" },
  { id: "e39", title: "v2.9 Beta", day: 22, calendarId: "release" },
];

export const FALLBACK_TODAY = new CalendarDate(2026, 11, 15);

/** Monday of the week that contains `day`. */
export function mondayOf(day: CalendarDate) {
  const js = new Date(day.year, day.month - 1, day.day).getDay(); // 0 = Sunday
  return day.subtract({ days: (js + 6) % 7 });
}

export function buildEvents(today: CalendarDate): CalendarEvent[] {
  const monday = mondayOf(today);
  return SEEDS.map((s) => {
    const d = (s.fromToday ? today : monday).add({ days: s.day });
    const base = {
      id: s.id,
      title: s.title,
      calendarId: s.calendarId,
      location: s.location,
      description: s.description,
      attendees: s.attendees?.map((name) => ({ name })),
    };
    if (!s.start) return { ...base, start: d.toString(), end: d.add({ days: s.span ?? 0 }).toString(), allDay: true };
    return { ...base, start: `${d.toString()}T${s.start}`, end: `${d.toString()}T${s.end ?? s.start}` };
  });
}
