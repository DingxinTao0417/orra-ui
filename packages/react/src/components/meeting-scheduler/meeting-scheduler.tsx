"use client";

import { useState, useSyncExternalStore } from "react";
import type { ReactNode, Ref } from "react";
import { Radio, RadioGroup, useLocale } from "react-aria-components";
import type { DateValue } from "react-aria-components";
import { getLocalTimeZone, isSameDay, isWeekend, today } from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import { RiGlobalLine, RiMapPinLine, RiPhoneLine, RiTimeLine, RiVideoOnLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { card, focusRing } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { Avatar } from "../avatar/avatar";
import { Button } from "../button/button";
import { DateCalendar } from "../date-calendar/date-calendar";

const COPY = {
  en: {
    minutes: "{n} min",
    video: "Video call",
    phone: "Phone call",
    inPerson: "In person",
    pickDay: "Select a day",
    pickTime: "Available times",
    noSlots: "No times left on this day. Try another date.",
    confirm: "Confirm booking",
    selected: "{date} · {start} – {end}",
    chooseTime: "Choose a time to continue",
    timeZone: "Time zone",
    host: "Host",
  },
  zh: {
    minutes: "{n} 分钟",
    video: "视频会议",
    phone: "电话沟通",
    inPerson: "线下见面",
    pickDay: "选择日期",
    pickTime: "可预约时间",
    noSlots: "这一天已约满，换个日期试试。",
    confirm: "确认预约",
    selected: "{date} · {start} – {end}",
    chooseTime: "选择一个时间段以继续",
    timeZone: "时区",
    host: "主持人",
  },
};
export type MeetingSchedulerLabels = (typeof COPY)["en"];

export interface MeetingHost {
  name: string;
  /** Avatar image; initials are shown without it. */
  avatarSrc?: string;
  /** Role or team under the name. */
  subtitle?: ReactNode;
}

/** A booked slot: the day plus a 24-hour "HH:mm" start time. */
export interface MeetingSlot {
  date: CalendarDate;
  time: string;
}

export type MeetingLocationType = "video" | "phone" | "in-person";

/** Demo availability: weekdays 09:00–17:30 every 30 min, lunch blocked, a few slots already taken. */
export function sampleMeetingSlots(date: CalendarDate): string[] {
  const out: string[] = [];
  for (let minutes = 9 * 60; minutes <= 17 * 60 + 30; minutes += 30) {
    if (minutes >= 12 * 60 && minutes < 13 * 60 + 30) continue;
    const i = out.length;
    if ((date.day * 7 + i * 3 + date.month) % 5 === 0) {
      out.push("");
      continue;
    }
    out.push(`${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`);
  }
  return out.filter(Boolean);
}

const noop = () => () => {};
/** The viewer's IANA time zone; "UTC" while server rendering, so hydration never mismatches. */
function useViewerTimeZone() {
  return useSyncExternalStore(noop, getLocalTimeZone, () => "UTC");
}
/** False during SSR and hydration, true afterwards (ICU data differs between server and browser). */
function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

function addMinutes(time: string, minutes: number) {
  const [h = 0, m = 0] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export interface MeetingSchedulerProps {
  host: MeetingHost;
  /** Meeting name, e.g. "Product demo". */
  title: ReactNode;
  description?: ReactNode;
  /** Length in minutes (default 30). */
  duration?: number;
  locationType?: MeetingLocationType;
  /** Room, address, dial-in or app name. Defaults to the location type label. */
  location?: ReactNode;
  /** IANA zone shown as the time-zone label; defaults to the viewer's zone. */
  timeZone?: string;
  /** Available "HH:mm" start times for a day. Defaults to `sampleMeetingSlots` (demo data). */
  getSlots?: (date: CalendarDate) => string[];
  /** Days that can't be booked (default: weekends for the locale). */
  isDateUnavailable?: (date: DateValue) => boolean;
  /** Earliest bookable day (default today). */
  minValue?: CalendarDate;
  maxValue?: CalendarDate;
  /** Selected slot (controlled). */
  value?: MeetingSlot | null;
  defaultValue?: MeetingSlot | null;
  onChange?: (value: MeetingSlot | null) => void;
  /** Called with the selected slot when the confirm button is pressed. */
  onConfirm?: (value: MeetingSlot) => void;
  /** Shows a pending confirm button. */
  confirming?: boolean;
  /** 12- or 24-hour times (default: the locale's preference). */
  hourCycle?: 12 | 24;
  className?: string;
  labels?: Partial<MeetingSchedulerLabels>;
  ref?: Ref<HTMLElement>;
}

/**
 * A booking panel: host and meeting summary, a calendar of bookable days and
 * the free time slots for the chosen day, with a confirm action. Lays out in
 * three columns when wide and stacks on narrow containers.
 *
 *   <MeetingScheduler host={{ name: "Lin Xiaoyu" }} title="Product demo" duration={30} onConfirm={book} />
 */
export function MeetingScheduler({
  host,
  title,
  description,
  duration = 30,
  locationType = "video",
  location,
  timeZone,
  getSlots = sampleMeetingSlots,
  isDateUnavailable,
  minValue,
  maxValue,
  value,
  defaultValue = null,
  onChange,
  onConfirm,
  confirming,
  hourCycle,
  className,
  labels,
  ref,
}: MeetingSchedulerProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const viewerZone = useViewerTimeZone();
  const hydrated = useHydrated();
  const zone = timeZone ?? viewerZone;
  const [slot, setSlot] = useControllableState<MeetingSlot | null>(value, defaultValue, onChange);
  const [minDay] = useState(() => minValue ?? today(getLocalTimeZone()));
  const unavailable = isDateUnavailable ?? ((d: DateValue) => isWeekend(d, locale));
  const [day, setDay] = useState<CalendarDate>(() => {
    if (slot) return slot.date;
    let d = minDay;
    for (let i = 0; i < 14 && unavailable(d); i++) d = d.add({ days: 1 });
    return d;
  });

  const timeFmt = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    ...(hourCycle ? { hourCycle: hourCycle === 12 ? "h12" : "h23" } : {}),
  });
  const formatTime = (time: string) => {
    const [h = 0, m = 0] = time.split(":").map(Number);
    return timeFmt.format(new Date(Date.UTC(2000, 0, 1, h, m)));
  };
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  const shortDayFmt = new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  const zoneLabel = (() => {
    if (!hydrated) return zone.replace(/_/g, " ");
    try {
      const name = new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: "shortOffset" })
        .formatToParts(new Date(Date.UTC(2026, 0, 1)))
        .find((p) => p.type === "timeZoneName")?.value;
      return name ? `${zone.replace(/_/g, " ")} (${name})` : zone;
    } catch {
      return zone;
    }
  })();

  const slots = unavailable(day) ? [] : getSlots(day);
  const selectedHere = slot && isSameDay(slot.date, day) ? slot.time : null;
  const locationText = location ?? { video: t.video, phone: t.phone, "in-person": t.inPerson }[locationType];
  const LocationIcon = { video: RiVideoOnLine, phone: RiPhoneLine, "in-person": RiMapPinLine }[locationType];

  const meta = "flex items-start gap-2.5 text-body-sm text-fg-muted [&>svg]:mt-px [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-fg-subtle";

  return (
    <section ref={ref} className={cx(card, "@container w-full overflow-hidden", className)}>
      <div className="grid grid-cols-1 @2xl:grid-cols-[auto_minmax(0,1fr)] @5xl:grid-cols-[minmax(0,260px)_auto_minmax(0,1fr)]">
        {/* Summary */}
        <div className="flex flex-col gap-4 border-b border-line p-5 @2xl:col-span-2 @5xl:col-span-1 @5xl:border-e @5xl:border-b-0">
          <div className="flex items-center gap-3">
            <Avatar name={host.name} src={host.avatarSrc} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-body font-medium text-fg">{host.name}</p>
              {host.subtitle ? <p className="truncate text-body-sm text-fg-subtle">{host.subtitle}</p> : null}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-title-sm font-semibold text-fg">{title}</h3>
            {description ? <p className="text-body-sm text-fg-muted">{description}</p> : null}
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2.5 @5xl:flex-col">
            <li className={meta}>
              <RiTimeLine aria-hidden />
              {fill(t.minutes, { n: duration })}
            </li>
            <li className={meta}>
              <LocationIcon aria-hidden />
              {locationText}
            </li>
            <li className={meta}>
              <RiGlobalLine aria-hidden />
              <span>
                <span className="sr-only">{t.timeZone}: </span>
                {zoneLabel}
              </span>
            </li>
          </ul>
        </div>

        {/* Calendar */}
        <div className="flex flex-col gap-2 border-b border-line p-5 @2xl:border-e @2xl:border-b-0">
          <p className="text-body-sm font-medium text-fg">{t.pickDay}</p>
          <DateCalendar
            aria-label={t.pickDay}
            value={day}
            onChange={(d) => {
              setDay(d);
              if (slot && !isSameDay(slot.date, d)) setSlot(null);
            }}
            minValue={minDay}
            maxValue={maxValue}
            isDateUnavailable={unavailable}
            className="mx-auto @2xl:mx-0"
          />
        </div>

        {/* Slots */}
        <div className="flex min-w-0 flex-col gap-3 p-5">
          <div>
            <p className="text-body-sm font-medium text-fg">{t.pickTime}</p>
            <p className="text-caption text-fg-subtle">{dayFmt.format(day.toDate("UTC"))}</p>
          </div>
          {slots.length ? (
            <RadioGroup
              aria-label={t.pickTime}
              value={selectedHere}
              onChange={(time) => setSlot({ date: day, time })}
              className="grid max-h-[300px] grid-cols-3 gap-2 overflow-y-auto p-0.5 @2xl:grid-cols-2"
            >
              {slots.map((time) => (
                <Radio
                  key={time}
                  value={time}
                  className={cx(
                    "flex h-10 cursor-default items-center justify-center rounded-control border text-body-sm font-medium tabular-nums transition-colors duration-150",
                    "border-line-strong bg-surface text-fg data-[hovered]:border-accent-300 data-[hovered]:text-fg-accent",
                    "data-[selected]:border-transparent data-[selected]:bg-accent-gradient data-[selected]:text-fg-on-accent",
                    focusRing,
                  )}
                >
                  {formatTime(time)}
                </Radio>
              ))}
            </RadioGroup>
          ) : (
            <p className="rounded-control bg-surface-muted px-4 py-6 text-center text-body-sm text-fg-subtle">{t.noSlots}</p>
          )}
          <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">
            <p className="text-caption text-fg-muted tabular-nums" aria-live="polite">
              {slot
                ? fill(t.selected, {
                    date: shortDayFmt.format(slot.date.toDate("UTC")),
                    start: formatTime(slot.time),
                    end: formatTime(addMinutes(slot.time, duration)),
                  })
                : t.chooseTime}
            </p>
            <Button fullWidth isDisabled={!slot} loading={confirming} onPress={() => slot && onConfirm?.(slot)}>
              {t.confirm}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
