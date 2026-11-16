"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode, Ref } from "react";
import {
  CalendarDate,
  CalendarDateTime,
  endOfMonth,
  endOfWeek,
  getLocalTimeZone,
  getWeeksInMonth,
  isSameDay,
  isSameMonth,
  parseDate,
  parseDateTime,
  startOfMonth,
  startOfWeek,
  toCalendarDate,
  toCalendarDateTime,
  today as todayIn,
  type DateValue,
} from "@internationalized/date";
import { Button as AriaButton, Dialog, DialogTrigger, Heading, Popover as AriaPopover, ToggleButton, useLocale } from "react-aria-components";
import { RiAddLine, RiArrowLeftSLine, RiArrowRightSLine, RiCalendar2Line, RiMapPin2Line, RiTimeLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { card, floatingPanel, focusRing } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { AvatarGroup, Avatar } from "../avatar/avatar";
import { Button } from "../button/button";
import { chartColor } from "../chart-card/chart-parts";
import { CloseButton } from "../close-button/close-button";
import { IconButton } from "../icon-button/icon-button";
import { SegmentedControl } from "../segmented-control/segmented-control";
import { Tooltip } from "../tooltip/tooltip";
import { sampleCalendarEvents, sampleCalendarSources } from "./calendar-sample";
import type { CalendarEvent, CalendarSource, EventCalendarView } from "./calendar-types";

const COPY = {
  en: {
    calendar: "Calendar",
    today: "Today",
    previous: "Previous",
    next: "Next",
    month: "Month",
    week: "Week",
    agenda: "Agenda",
    view: "View",
    calendars: "Calendars",
    newEvent: "New event",
    more: "+{count} more",
    moreLabel: "{count} more events",
    allDay: "All day",
    noEvents: "No events",
    noEventsHint: "Nothing scheduled for this period.",
    eventsOn: "Events on {date}",
    close: "Close",
    attendees: "{count} attendees",
  },
  zh: {
    calendar: "日历",
    today: "今天",
    previous: "上一页",
    next: "下一页",
    month: "月",
    week: "周",
    agenda: "列表",
    view: "视图",
    calendars: "日历",
    newEvent: "新建日程",
    more: "还有 {count} 项",
    moreLabel: "另外 {count} 个日程",
    allDay: "全天",
    noEvents: "暂无日程",
    noEventsHint: "这段时间没有安排。",
    eventsOn: "{date} 的日程",
    close: "关闭",
    attendees: "{count} 位参与者",
  },
};
export type EventCalendarLabels = (typeof COPY)["en"];

/* ------------------------------------------------------------------ model */

interface Normalized {
  event: CalendarEvent;
  start: CalendarDateTime;
  end: CalendarDateTime;
  allDay: boolean;
  startDay: CalendarDate;
  /** Inclusive. */
  endDay: CalendarDate;
  color: string;
  source?: CalendarSource;
}

function toDateTime(value: string | DateValue): { dt: CalendarDateTime; dateOnly: boolean } {
  if (typeof value === "string") {
    if (value.includes("T")) return { dt: parseDateTime(value.slice(0, 19)), dateOnly: false };
    return { dt: toCalendarDateTime(parseDate(value)), dateOnly: true };
  }
  const dateOnly = !("hour" in value);
  return { dt: toCalendarDateTime(value as CalendarDate | CalendarDateTime), dateOnly };
}

function normalize(events: CalendarEvent[], sources: CalendarSource[]): Normalized[] {
  const colorOf = new Map(sources.map((s, i) => [s.id, s.color ?? chartColor(i)]));
  const sourceOf = new Map(sources.map((s) => [s.id, s]));
  return events.map((event) => {
    const s = toDateTime(event.start);
    const allDay = event.allDay ?? s.dateOnly;
    let end = event.end ? toDateTime(event.end).dt : allDay ? s.dt : s.dt.add({ hours: 1 });
    if (end.compare(s.dt) < 0) end = s.dt;
    const startDay = toCalendarDate(s.dt);
    // A timed event ending exactly at midnight belongs to the previous day.
    let endDay = toCalendarDate(end);
    if (!allDay && end.hour === 0 && end.minute === 0 && endDay.compare(startDay) > 0) endDay = endDay.subtract({ days: 1 });
    const color = event.color ?? (event.calendarId ? colorOf.get(event.calendarId) : undefined) ?? "var(--color-accent-500)";
    return { event, start: s.dt, end, allDay, startDay, endDay, color, source: event.calendarId ? sourceOf.get(event.calendarId) : undefined };
  });
}

const onDay = (n: Normalized, day: CalendarDate) => n.startDay.compare(day) <= 0 && n.endDay.compare(day) >= 0;
const byStart = (a: Normalized, b: Normalized) =>
  Number(b.allDay || b.endDay.compare(b.startDay) > 0) - Number(a.allDay || a.endDay.compare(a.startDay) > 0) || a.start.compare(b.start);

/** Today in the user's time zone, known only after mount (avoids SSR / hydration mismatches). */
function useToday() {
  const [value, setValue] = useState<CalendarDate | null>(null);
  useEffect(() => {
    const update = () => setValue(todayIn(getLocalTimeZone()));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return value;
}

function useNowMinutes() {
  const [m, setM] = useState<number | null>(null);
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setM(d.getHours() * 60 + d.getMinutes());
    };
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return m;
}

/** Server (Node) and browser ICU builds disagree on thin / narrow spaces: normalise them so SSR text hydrates cleanly. */
const norm = (text: string) => text.replace(/[\u2009\u202f\u00a0]/g, " ");

const tint = (color: string, pct: number) => `color-mix(in oklab, ${color} ${pct}%, var(--color-surface))`;
const ink = (color: string) => `color-mix(in oklab, ${color} 72%, var(--color-fg))`;

/* -------------------------------------------------------------- component */

export interface EventCalendarProps {
  /** Events to show; defaults to sample events around the current month. */
  events?: CalendarEvent[];
  /** Calendars (colour + filter chip per calendar). */
  calendars?: CalendarSource[];
  /** The focused date: decides the visible month / week (controlled). */
  date?: CalendarDate;
  /** Initial focused date (default: today, resolved on the client). */
  defaultDate?: CalendarDate;
  onDateChange?: (date: CalendarDate) => void;
  view?: EventCalendarView;
  defaultView?: EventCalendarView;
  onViewChange?: (view: EventCalendarView) => void;
  /** Views offered in the switcher (default all three). Pass one to hide the switcher. */
  views?: EventCalendarView[];
  /** Called when an event pill is pressed (the detail popover still opens). */
  onEventPress?: (event: CalendarEvent) => void;
  /** Footer actions inside the event popover (edit, delete…). */
  eventActions?: (event: CalendarEvent, close: () => void) => ReactNode;
  /** Shows a "New event" button; called with the focused date (or the day whose popover it was pressed in). */
  onCreate?: (date: CalendarDate) => void;
  /** Show the header "New event" button when `onCreate` is set (default true). Set false to keep only the per-day create action. */
  showCreateButton?: boolean;
  /** Max pills per day cell before "+N more" (default 3). */
  maxEventsPerDay?: number;
  /** First and last hour of the week time grid (default 7–21). */
  dayStartHour?: number;
  dayEndHour?: number;
  /** Show calendar filter chips (default true when there is more than one calendar). */
  showCalendarFilter?: boolean;
  hourCycle?: 12 | 24;
  /** Extra content on the end of the header. */
  actions?: ReactNode;
  labels?: Partial<EventCalendarLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Full calendar block: month / week / agenda views, events coloured by
 * calendar, "+N more" overflow, today highlight and an event detail popover.
 * Fills its container's height.
 *
 *   <div className="h-[640px]"><EventCalendar events={events} calendars={calendars} /></div>
 */
export function EventCalendar({
  events: eventsProp,
  calendars: calendarsProp,
  date,
  defaultDate,
  onDateChange,
  view: viewProp,
  defaultView = "month",
  onViewChange,
  views = ["month", "week", "agenda"],
  onEventPress,
  eventActions,
  onCreate,
  showCreateButton = true,
  maxEventsPerDay = 3,
  dayStartHour = 7,
  dayEndHour = 21,
  showCalendarFilter,
  hourCycle,
  actions,
  labels,
  className,
  ref,
}: EventCalendarProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const lang = locale.toLowerCase().startsWith("zh") ? "zh" : "en";
  const today = useToday();
  const [focusedState, setFocused] = useControllableState<CalendarDate | null>(date, defaultDate ?? null, onDateChange as (d: CalendarDate | null) => void);
  const focused = focusedState ?? today;
  const [view, setView] = useControllableState(viewProp, defaultView, onViewChange);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const sources = useMemo(() => calendarsProp ?? (eventsProp ? [] : sampleCalendarSources(lang)), [calendarsProp, eventsProp, lang]);
  const events = useMemo(
    () => eventsProp ?? (focused ? sampleCalendarEvents(defaultDate ?? today ?? focused, lang) : []),
    [eventsProp, focused, defaultDate, today, lang],
  );
  const normalized = useMemo(() => normalize(events, sources).filter((n) => !n.event.calendarId || !hidden.has(n.event.calendarId)), [events, sources, hidden]);

  const f = useFormatters(locale, hourCycle);
  const ctx: Ctx = { t, f, locale, today, normalized, maxEventsPerDay, onEventPress, eventActions, onCreate, hourCycle };

  const move = (dir: 1 | -1) => {
    if (!focused) return;
    setFocused(view === "week" ? focused.add({ weeks: dir }) : focused.add({ months: dir }));
  };

  const title = useMemo(() => {
    if (!focused) return "";
    const tz = "UTC";
    if (view === "week") {
      const s = startOfWeek(focused, locale);
      const e = endOfWeek(focused, locale);
      const sameYear = s.year === e.year;
      const left = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }), timeZone: tz }).format(
        s.toDate(tz),
      );
      const right = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", timeZone: tz }).format(e.toDate(tz));
      return norm(`${left} – ${right}`);
    }
    return norm(new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", timeZone: tz }).format(focused.toDate(tz)));
  }, [focused, view, locale]);

  const filterVisible = (showCalendarFilter ?? sources.length > 1) && sources.length > 0;

  return (
    <div ref={ref} className={cx(card, "@container flex h-full min-h-0 w-full flex-col overflow-hidden", className)}>
      {/* header */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-1">
          <IconButton
            size="sm"
            icon={<RiArrowLeftSLine className="rtl:-scale-x-100" />}
            aria-label={t.previous}
            onPress={() => move(-1)}
            isDisabled={!focused}
          />
          <IconButton size="sm" icon={<RiArrowRightSLine className="rtl:-scale-x-100" />} aria-label={t.next} onPress={() => move(1)} isDisabled={!focused} />
          <Heading level={2} aria-live="polite" suppressHydrationWarning className="ms-1.5 min-w-0 truncate text-title-sm font-semibold text-fg tabular-nums">
            {title}
          </Heading>
        </div>
        <Button size="sm" variant="outline" tone="neutral" onPress={() => today && setFocused(today)} isDisabled={!today}>
          {t.today}
        </Button>
        <div className="flex-1" />
        {filterVisible ? (
          <div role="group" aria-label={t.calendars} className="flex flex-wrap items-center gap-1">
            {sources.map((s, i) => {
              const color = s.color ?? chartColor(i);
              return (
                <Tooltip key={s.id} content={s.label} delay={300}>
                  <ToggleButton
                    isSelected={!hidden.has(s.id)}
                    onChange={(on) =>
                      setHidden((prev) => {
                        const next = new Set(prev);
                        if (on) next.delete(s.id);
                        else next.add(s.id);
                        return next;
                      })
                    }
                    className={cx(
                      "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-2 text-body-sm text-fg-muted outline-none transition-colors duration-150 @4xl:px-2.5",
                      "data-[hovered]:bg-surface-hover data-[selected]:text-fg",
                      focusRing,
                    )}
                  >
                    {({ isSelected }) => (
                      <>
                        <span
                          aria-hidden
                          className="size-2.5 rounded-full transition-[background-color] duration-150"
                          style={{ background: isSelected ? color : "transparent", boxShadow: `inset 0 0 0 1.5px ${color}` }}
                        />
                        <span className="sr-only @4xl:not-sr-only">{s.label}</span>
                      </>
                    )}
                  </ToggleButton>
                </Tooltip>
              );
            })}
          </div>
        ) : null}
        {views.length > 1 ? (
          <SegmentedControl
            size="sm"
            aria-label={t.view}
            value={view}
            onChange={(v) => setView(v as EventCalendarView)}
            options={views.map((v) => ({ id: v, label: t[v] }))}
          />
        ) : null}
        {actions}
        {onCreate && showCreateButton ? (
          <Button size="sm" startIcon={<RiAddLine />} onPress={() => focused && onCreate(focused)} isDisabled={!focused}>
            {t.newEvent}
          </Button>
        ) : null}
      </div>

      {/* body */}
      {!focused ? (
        <div className="flex-1" aria-busy />
      ) : view === "month" ? (
        <MonthView ctx={ctx} focused={focused} />
      ) : view === "week" ? (
        <WeekView ctx={ctx} focused={focused} startHour={dayStartHour} endHour={dayEndHour} />
      ) : (
        <AgendaView ctx={ctx} focused={focused} />
      )}
    </div>
  );
}

interface Ctx {
  t: EventCalendarLabels;
  f: ReturnType<typeof useFormatters>;
  locale: string;
  today: CalendarDate | null;
  normalized: Normalized[];
  maxEventsPerDay: number;
  onEventPress?: (event: CalendarEvent) => void;
  eventActions?: (event: CalendarEvent, close: () => void) => ReactNode;
  onCreate?: (date: CalendarDate) => void;
  hourCycle?: 12 | 24;
}

function useFormatters(locale: string, hourCycle?: 12 | 24) {
  return useMemo(() => {
    const tz = "UTC";
    const cycle = hourCycle ? { hour12: hourCycle === 12 } : {};
    const time = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: tz, ...cycle });
    const hour = new Intl.DateTimeFormat(locale, { hour: "numeric", timeZone: tz, ...cycle });
    const longDay = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", timeZone: tz });
    const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: tz });
    const dayNum = new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: tz });
    const monthDay = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: tz });
    return {
      time: (d: CalendarDateTime) => norm(time.format(d.toDate(tz))),
      hour: (h: number) => norm(hour.format(new CalendarDateTime(2026, 1, 1, h).toDate(tz))),
      longDay: (d: CalendarDate) => norm(longDay.format(d.toDate(tz))),
      weekdayShort: (d: CalendarDate) => weekdayShort.format(d.toDate(tz)),
      dayNum: (d: CalendarDate) => dayNum.format(d.toDate(tz)).replace(/\D+$/, ""),
      monthDay: (d: CalendarDate) => norm(monthDay.format(d.toDate(tz))),
    };
  }, [locale, hourCycle]);
}

/* ------------------------------------------------------------ event popover */

function EventDetail({ n, ctx, close }: { n: Normalized; ctx: Ctx; close: () => void }) {
  const f = ctx.f;
  const { t } = ctx;
  const multiDay = n.endDay.compare(n.startDay) > 0;
  const when = n.allDay
    ? multiDay
      ? `${f.longDay(n.startDay)} – ${f.longDay(n.endDay)} · ${t.allDay}`
      : `${f.longDay(n.startDay)} · ${t.allDay}`
    : multiDay
      ? `${f.longDay(n.startDay)} ${f.time(n.start)} – ${f.longDay(n.endDay)} ${f.time(n.end)}`
      : `${f.longDay(n.startDay)} · ${f.time(n.start)} – ${f.time(n.end)}`;
  return (
    <div className="flex w-[300px] max-w-full flex-col gap-3 p-4">
      <div className="flex items-start gap-2.5">
        <span aria-hidden className="mt-1.5 size-3 shrink-0 rounded-[4px]" style={{ background: n.color }} />
        <Heading slot="title" className="min-w-0 flex-1 text-body-lg font-semibold text-fg">
          {n.event.title}
        </Heading>
        <CloseButton size="sm" aria-label={t.close} onPress={close} className="-me-1.5 -mt-0.5" />
      </div>
      <div className="flex flex-col gap-2 text-body-sm text-fg-muted">
        <div className="flex items-start gap-2.5">
          <RiTimeLine aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
          <span>{when}</span>
        </div>
        {n.event.location ? (
          <div className="flex items-start gap-2.5">
            <RiMapPin2Line aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
            <span>{n.event.location}</span>
          </div>
        ) : null}
        {n.source ? (
          <div className="flex items-start gap-2.5">
            <RiCalendar2Line aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
            <span>{n.source.label}</span>
          </div>
        ) : null}
      </div>
      {n.event.attendees?.length ? (
        <div className="flex items-center gap-2.5">
          <AvatarGroup size="xs" max={5}>
            {n.event.attendees.map((a) => (
              <Avatar key={a.name} name={a.name} src={a.src} />
            ))}
          </AvatarGroup>
          <span className="text-caption text-fg-subtle">{fill(t.attendees, { count: n.event.attendees.length })}</span>
        </div>
      ) : null}
      {n.event.description ? <div className="text-body-sm text-fg-muted">{n.event.description}</div> : null}
      {ctx.eventActions ? <div className="flex items-center justify-end gap-2 pt-1">{ctx.eventActions(n.event, close)}</div> : null}
    </div>
  );
}

const popoverClass = cx(floatingPanel, "max-w-[calc(100vw-1.5rem)] p-0");

/** An event chip that opens its detail popover. */
function EventPill({
  n,
  ctx,
  variant,
  day,
  short,
  className,
  style,
}: {
  n: Normalized;
  ctx: Ctx;
  variant: "month" | "list" | "block";
  day?: CalendarDate;
  /** Block variant: too short for two lines. */
  short?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const f = ctx.f;
  const continues = day && !n.allDay ? false : day ? n.startDay.compare(day) < 0 : false;
  const block = n.allDay || n.endDay.compare(n.startDay) > 0;
  const label = `${n.event.title}, ${n.allDay ? ctx.t.allDay : `${f.time(n.start)} – ${f.time(n.end)}`}`;

  let body: ReactNode;
  let cls: string;
  let st: CSSProperties | undefined = style;
  if (variant === "block") {
    cls = cx("flex h-full w-full overflow-hidden rounded-[8px] border-s-[3px] px-2 text-start", short ? "items-center gap-1.5" : "flex-col items-start py-1");
    st = { ...style, background: tint(n.color, 16), borderColor: n.color, color: ink(n.color) };
    body = short ? (
      <>
        <span className="min-w-0 truncate text-caption font-semibold">{n.event.title}</span>
        <span className="hidden shrink-0 text-micro opacity-80 tabular-nums @3xl:inline">{f.time(n.start)}</span>
      </>
    ) : (
      <>
        <span className="w-full truncate text-caption font-semibold">{n.event.title}</span>
        <span className="w-full truncate text-micro opacity-80 tabular-nums">
          {f.time(n.start)} – {f.time(n.end)}
        </span>
      </>
    );
  } else if (variant === "list") {
    cls = "flex w-full items-center gap-3 rounded-control px-2.5 py-2 text-start data-[hovered]:bg-surface-hover";
    body = (
      <>
        <span className="w-24 shrink-0 text-body-sm text-fg-muted tabular-nums">{n.allDay ? ctx.t.allDay : `${f.time(n.start)} – ${f.time(n.end)}`}</span>
        <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: n.color }} />
        <span className="min-w-0 flex-1 truncate text-body font-medium text-fg">{n.event.title}</span>
        {n.event.location ? <span className="hidden min-w-0 max-w-[40%] truncate text-body-sm text-fg-subtle @lg:block">{n.event.location}</span> : null}
      </>
    );
  } else if (block) {
    cls = cx("flex h-5 w-full items-center rounded-[6px] px-1.5 text-start text-caption font-medium", continues && "rounded-s-none");
    st = { ...style, background: tint(n.color, 18), color: ink(n.color) };
    body = <span className="truncate">{n.event.title}</span>;
  } else {
    cls = "flex h-5 w-full items-center gap-1.5 rounded-[6px] px-1 text-start text-caption data-[hovered]:bg-surface-hover";
    body = (
      <>
        <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ background: n.color }} />
        <span className="hidden shrink-0 text-fg-subtle tabular-nums @3xl:inline">{f.time(n.start)}</span>
        <span className="min-w-0 truncate font-medium text-fg">{n.event.title}</span>
      </>
    );
  }

  return (
    <DialogTrigger>
      <AriaButton
        aria-label={label}
        onPress={() => ctx.onEventPress?.(n.event)}
        className={cx(
          "min-w-0 cursor-pointer outline-none transition-[background-color,filter] duration-150 data-[hovered]:brightness-[0.98]",
          focusRing,
          cls,
          className,
        )}
        style={st}
      >
        {body}
      </AriaButton>
      <AriaPopover placement="bottom start" offset={6} className={popoverClass}>
        <Dialog aria-label={n.event.title} className="outline-none">
          {({ close }) => <EventDetail n={n} ctx={ctx} close={close} />}
        </Dialog>
      </AriaPopover>
    </DialogTrigger>
  );
}

/** Popover with every event of one day. */
function DayPopover({ day, events, ctx, trigger }: { day: CalendarDate; events: Normalized[]; ctx: Ctx; trigger: ReactNode }) {
  const f = ctx.f;
  return (
    <DialogTrigger>
      {trigger}
      <AriaPopover placement="bottom" offset={6} className={popoverClass}>
        <Dialog aria-label={fill(ctx.t.eventsOn, { date: f.longDay(day) })} className="outline-none">
          {({ close }) => (
            <div className="flex w-[280px] max-w-full flex-col gap-1 p-3">
              <div className="flex items-center gap-2 px-1 pb-1.5">
                <Heading slot="title" className="min-w-0 flex-1 truncate text-body font-semibold text-fg">
                  {f.longDay(day)}
                </Heading>
                <CloseButton size="sm" aria-label={ctx.t.close} onPress={close} className="-me-1" />
              </div>
              {events.length ? (
                events.map((n) => <EventPill key={n.event.id} n={n} ctx={ctx} variant="month" day={day} className="h-6" />)
              ) : (
                <p className="px-1 pb-1 text-body-sm text-fg-subtle">{ctx.t.noEvents}</p>
              )}
              {ctx.onCreate ? (
                <Button
                  size="sm"
                  variant="soft"
                  startIcon={<RiAddLine />}
                  className="mt-1.5"
                  onPress={() => {
                    close();
                    ctx.onCreate?.(day);
                  }}
                >
                  {ctx.t.newEvent}
                </Button>
              ) : null}
            </div>
          )}
        </Dialog>
      </AriaPopover>
    </DialogTrigger>
  );
}

/* -------------------------------------------------------------- month view */

function MonthView({ ctx, focused }: { ctx: Ctx; focused: CalendarDate }) {
  const f = ctx.f;
  const weeks = getWeeksInMonth(focused, ctx.locale);
  const first = startOfWeek(startOfMonth(focused), ctx.locale);
  const days = Array.from({ length: weeks * 7 }, (_, i) => first.add({ days: i }));
  const max = Math.max(1, ctx.maxEventsPerDay);

  return (
    <div
      role="table"
      aria-label={new Intl.DateTimeFormat(ctx.locale, { year: "numeric", month: "long", timeZone: "UTC" }).format(focused.toDate("UTC"))}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div role="row" className="grid shrink-0 grid-cols-7 border-b border-line">
        {days.slice(0, 7).map((d) => (
          <div key={d.toString()} role="columnheader" className="px-2 py-2 text-caption font-medium text-fg-subtle">
            {f.weekdayShort(d)}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1" style={{ gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))` }}>
        {Array.from({ length: weeks }, (_, w) => (
          <div key={w} role="row" className="grid min-h-0 grid-cols-7 border-b border-line last:border-b-0">
            {days.slice(w * 7, w * 7 + 7).map((day) => {
              const list = ctx.normalized.filter((n) => onDay(n, day)).sort(byStart);
              const outside = !isSameMonth(day, focused);
              const isToday = !!ctx.today && isSameDay(day, ctx.today);
              const visible = list.length > max ? list.slice(0, max - 1) : list;
              const hiddenCount = list.length - visible.length;
              return (
                <div
                  key={day.toString()}
                  role="cell"
                  aria-current={isToday ? "date" : undefined}
                  className={cx(
                    "flex min-h-0 min-w-0 flex-col gap-0.5 overflow-hidden border-e border-line p-1 last:border-e-0",
                    outside && "bg-surface-muted/50",
                  )}
                >
                  <DayPopover
                    day={day}
                    events={list}
                    ctx={ctx}
                    trigger={
                      <AriaButton
                        aria-label={`${f.longDay(day)}${list.length ? ` · ${list.length}` : ""}`}
                        className={cx(
                          "ms-0.5 grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-caption font-medium tabular-nums outline-none transition-colors",
                          focusRing,
                          isToday
                            ? "bg-accent-500 text-fg-on-accent"
                            : outside
                              ? "text-fg-disabled data-[hovered]:bg-surface-hover"
                              : "text-fg data-[hovered]:bg-surface-hover",
                        )}
                      >
                        {f.dayNum(day)}
                      </AriaButton>
                    }
                  />
                  {/* wide: pills */}
                  <div className="hidden min-h-0 flex-col gap-0.5 @2xl:flex">
                    {visible.map((n) => (
                      <EventPill key={n.event.id} n={n} ctx={ctx} variant="month" day={day} />
                    ))}
                    {hiddenCount > 0 ? (
                      <DayPopover
                        day={day}
                        events={list}
                        ctx={ctx}
                        trigger={
                          <AriaButton
                            aria-label={fill(ctx.t.moreLabel, { count: hiddenCount })}
                            className={cx(
                              "h-5 cursor-pointer rounded-[6px] px-1.5 text-start text-caption font-medium text-fg-subtle outline-none data-[hovered]:bg-surface-hover data-[hovered]:text-fg",
                              focusRing,
                            )}
                          >
                            {fill(ctx.t.more, { count: hiddenCount })}
                          </AriaButton>
                        }
                      />
                    ) : null}
                  </div>
                  {/* narrow: dots */}
                  {list.length ? (
                    <div aria-hidden className="flex flex-wrap gap-0.5 px-1 @2xl:hidden">
                      {list.slice(0, 4).map((n) => (
                        <span key={n.event.id} className="size-1.5 rounded-full" style={{ background: n.color }} />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- week view */

const HOUR_PX = 48;

function layoutLanes(items: Normalized[]) {
  // Greedy lanes: events that overlap share the column width.
  const sorted = [...items].sort((a, b) => a.start.compare(b.start) || b.end.compare(a.end));
  const out: { n: Normalized; lane: number; lanes: number }[] = [];
  let cluster: { n: Normalized; lane: number }[] = [];
  let clusterEnd: CalendarDateTime | null = null;
  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((c) => c.lane + 1));
    for (const c of cluster) out.push({ ...c, lanes });
    cluster = [];
  };
  for (const n of sorted) {
    if (clusterEnd && n.start.compare(clusterEnd) >= 0) {
      flush();
      clusterEnd = null;
    }
    const used = new Set(cluster.filter((c) => c.n.end.compare(n.start) > 0).map((c) => c.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    cluster.push({ n, lane });
    clusterEnd = !clusterEnd || n.end.compare(clusterEnd) > 0 ? n.end : clusterEnd;
  }
  flush();
  return out;
}

function WeekView({ ctx, focused, startHour, endHour }: { ctx: Ctx; focused: CalendarDate; startHour: number; endHour: number }) {
  const f = ctx.f;
  const nowMin = useNowMinutes();
  const scrollRef = useRef<HTMLDivElement>(null);
  const first = startOfWeek(focused, ctx.locale);
  const days = Array.from({ length: 7 }, (_, i) => first.add({ days: i }));
  const hours = Array.from({ length: Math.max(1, endHour - startHour) }, (_, i) => startHour + i);
  const gridHeight = hours.length * HOUR_PX;

  useEffect(() => {
    // Start scrolled to 8:00 (or the first hour).
    if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, (8 - startHour) * HOUR_PX - 8);
  }, [startHour]);

  const allDayByDay = days.map((d) => ctx.normalized.filter((n) => onDay(n, d) && (n.allDay || n.endDay.compare(n.startDay) > 0)).sort(byStart));
  const timedByDay = days.map((d) => ctx.normalized.filter((n) => !n.allDay && n.startDay.compare(n.endDay) === 0 && isSameDay(n.startDay, d)));
  const hasAllDay = allDayByDay.some((l) => l.length);
  const gutter = "w-14 shrink-0";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 border-b border-line">
        <div className={gutter} />
        <div className="grid flex-1 grid-cols-7">
          {days.map((d) => {
            const isToday = !!ctx.today && isSameDay(d, ctx.today);
            return (
              <div key={d.toString()} aria-current={isToday ? "date" : undefined} className="flex flex-col items-center gap-0.5 border-s border-line py-2">
                <span className={cx("text-caption", isToday ? "font-medium text-fg-accent" : "text-fg-subtle")}>{f.weekdayShort(d)}</span>
                <span
                  className={cx(
                    "grid size-7 place-items-center rounded-full text-body font-semibold tabular-nums",
                    isToday ? "bg-accent-500 text-fg-on-accent" : "text-fg",
                  )}
                >
                  {f.dayNum(d)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {hasAllDay ? (
        <div className="flex shrink-0 border-b border-line">
          <div className={cx(gutter, "px-2 py-1.5 text-end text-micro text-fg-subtle")}>{ctx.t.allDay}</div>
          <div className="grid flex-1 grid-cols-7">
            {allDayByDay.map((list, i) => (
              <div key={i} className="flex min-w-0 flex-col gap-0.5 border-s border-line p-1">
                {list.map((n) => (
                  <EventPill key={n.event.id} n={n} ctx={ctx} variant="month" day={days[i]} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex" style={{ height: gridHeight }}>
          <div className={cx(gutter, "relative")}>
            {hours.map((h, i) =>
              i === 0 ? null : (
                <span key={h} className="absolute end-2 -translate-y-1/2 text-micro text-fg-subtle tabular-nums" style={{ top: i * HOUR_PX }}>
                  {f.hour(h)}
                </span>
              ),
            )}
          </div>
          <div className="relative grid flex-1 grid-cols-7">
            {hours.map((h, i) => (
              <div
                key={h}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 border-t border-line"
                style={{ top: i * HOUR_PX, opacity: i === 0 ? 0 : 1 }}
              />
            ))}
            {days.map((d, di) => {
              const isToday = !!ctx.today && isSameDay(d, ctx.today);
              return (
                <div key={d.toString()} className="relative border-s border-line">
                  {layoutLanes(timedByDay[di]!).map(({ n, lane, lanes }) => {
                    const startMin = Math.max(n.start.hour * 60 + n.start.minute, startHour * 60);
                    const endMin = Math.min(n.end.hour * 60 + n.end.minute || 24 * 60, endHour * 60);
                    if (endMin <= startHour * 60 || startMin >= endHour * 60) return null;
                    const top = ((startMin - startHour * 60) / 60) * HOUR_PX;
                    const height = Math.max(20, ((endMin - startMin) / 60) * HOUR_PX - 2);
                    return (
                      <EventPill
                        key={n.event.id}
                        n={n}
                        ctx={ctx}
                        variant="block"
                        short={height < 40}
                        className="absolute"
                        style={{ top: top + 1, height, insetInlineStart: `calc(${(lane / lanes) * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }}
                      />
                    );
                  })}
                  {isToday && nowMin != null && nowMin >= startHour * 60 && nowMin <= endHour * 60 ? (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                      style={{ top: ((nowMin - startHour * 60) / 60) * HOUR_PX }}
                    >
                      <span className="-ms-1 size-2 rounded-full bg-danger" />
                      <span className="h-px flex-1 bg-danger" />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- agenda view */

function AgendaView({ ctx, focused }: { ctx: Ctx; focused: CalendarDate }) {
  const f = ctx.f;
  const start = startOfMonth(focused);
  const end = endOfMonth(focused);
  const days: { day: CalendarDate; list: Normalized[] }[] = [];
  for (let d = start; d.compare(end) <= 0; d = d.add({ days: 1 })) {
    const list = ctx.normalized.filter((n) => onDay(n, d)).sort(byStart);
    if (list.length) days.push({ day: d, list });
  }
  if (!days.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 p-10 text-center">
        <RiCalendar2Line aria-hidden className="mb-1 size-6 text-fg-subtle" />
        <p className="text-body font-medium text-fg">{ctx.t.noEvents}</p>
        <p className="text-body-sm text-fg-subtle">{ctx.t.noEventsHint}</p>
      </div>
    );
  }
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ul className="flex flex-col">
        {days.map(({ day, list }) => {
          const isToday = !!ctx.today && isSameDay(day, ctx.today);
          return (
            <li key={day.toString()} aria-current={isToday ? "date" : undefined} className="flex gap-4 border-b border-line px-4 py-3 last:border-b-0">
              <div className="flex w-12 shrink-0 flex-col items-center pt-1">
                <span className={cx("text-caption", isToday ? "font-medium text-fg-accent" : "text-fg-subtle")}>{f.weekdayShort(day)}</span>
                <span
                  className={cx(
                    "grid size-8 place-items-center rounded-full text-title-sm font-semibold tabular-nums",
                    isToday ? "bg-accent-500 text-fg-on-accent" : "text-fg",
                  )}
                >
                  {f.dayNum(day)}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="sr-only">{f.longDay(day)}</span>
                {list.map((n) => (
                  <EventPill key={n.event.id} n={n} ctx={ctx} variant="list" day={day} />
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
