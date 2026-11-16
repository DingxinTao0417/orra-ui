"use client";

import { useContext } from "react";
import type { Ref } from "react";
import {
  Button as AriaButton,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  RangeCalendar,
  RangeCalendarStateContext,
  useLocale,
} from "react-aria-components";
import type { CalendarProps, DateValue, RangeCalendarProps } from "react-aria-components";
import { DateFormatter } from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { ChevronGlyph } from "../../lib/glyphs";
import { focusRing } from "../../lib/recipes";

const COPY = {
  en: { previous: "Previous month", next: "Next month" },
  zh: { previous: "上个月", next: "下个月" },
};
export type DateCalendarLabels = (typeof COPY)["en"];

/* ----------------------------------------------------------------- parts */

function NavButton({ slot, label }: { slot: "previous" | "next"; label: string }) {
  return (
    <AriaButton
      slot={slot}
      aria-label={label}
      className={cx(
        "grid size-8 shrink-0 place-items-center rounded-control text-fg-muted transition-colors duration-150",
        "data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active data-[disabled]:opacity-35",
        focusRing,
      )}
    >
      <ChevronGlyph direction={slot === "previous" ? "left" : "right"} className="size-4 rtl:-scale-x-100" />
    </AriaButton>
  );
}

/** "November 2026" for the month at `offset` within the visible range, formatted with the React Aria locale. */
function MonthTitle({ offset }: { offset: number }) {
  const single = useContext(CalendarStateContext);
  const range = useContext(RangeCalendarStateContext);
  const state = single ?? range;
  const { locale } = useLocale();
  if (!state) return null;
  const month = state.visibleRange.start.add({ months: offset });
  const text = new DateFormatter(locale, { year: "numeric", month: "long", timeZone: state.timeZone }).format(month.toDate(state.timeZone));
  return (
    <span aria-hidden className="flex-1 text-center text-body font-semibold text-fg">
      {text}
    </span>
  );
}

const lastDayOfMonth = (date: CalendarDate) => date.day === date.calendar.getDaysInMonth(date);

function SingleCell({ date, hideOutside }: { date: CalendarDate; hideOutside: boolean }) {
  return (
    <CalendarCell
      date={date}
      className={({ isSelected, isOutsideMonth, isDisabled, isUnavailable, isToday, isFocusVisible, isHovered, isPressed }) =>
        cx(
          "relative mx-auto grid size-9 cursor-default place-items-center rounded-control text-body tabular-nums outline-none transition-colors duration-100",
          isOutsideMonth ? (hideOutside ? "invisible" : "text-fg-disabled") : "text-fg",
          !isSelected && isHovered && "bg-surface-hover",
          !isSelected && isPressed && "bg-surface-active",
          isToday && "after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-current",
          isToday && !isSelected && "font-semibold text-fg-accent",
          isSelected && "bg-accent-gradient font-medium text-fg-on-accent",
          (isDisabled || isUnavailable) && !isOutsideMonth && "pointer-events-none text-fg-disabled",
          isUnavailable && "line-through",
          isFocusVisible && "focus-ring",
        )
      }
    />
  );
}

function RangeCell({ date }: { date: CalendarDate }) {
  return (
    <CalendarCell
      date={date}
      className={({ isSelected, isSelectionStart, isSelectionEnd, isOutsideMonth }) =>
        cx(
          "relative h-9 w-9 cursor-default outline-none",
          isOutsideMonth && "invisible",
          isSelected && "bg-accent-50",
          isSelected && (isSelectionStart || date.day === 1) && "rounded-s-control",
          isSelected && (isSelectionEnd || lastDayOfMonth(date)) && "rounded-e-control",
          isSelected && "[td:first-child>&]:rounded-s-control [td:last-child>&]:rounded-e-control",
        )
      }
    >
      {({ formattedDate, isSelected, isSelectionStart, isSelectionEnd, isHovered, isToday, isDisabled, isUnavailable, isFocusVisible }) => {
        const edge = isSelectionStart || isSelectionEnd;
        return (
          <span
            className={cx(
              "relative grid size-full place-items-center rounded-control text-body tabular-nums transition-colors duration-100",
              edge ? "bg-accent-gradient font-medium text-fg-on-accent" : isSelected ? "text-fg-accent" : "text-fg",
              !isSelected && isHovered && "bg-surface-hover",
              isToday && "after:absolute after:bottom-1 after:size-1 after:rounded-full after:bg-current",
              isToday && !isSelected && "font-semibold text-fg-accent",
              (isDisabled || isUnavailable) && "text-fg-disabled",
              isUnavailable && "line-through",
              isFocusVisible && "focus-ring",
            )}
          >
            {formattedDate}
          </span>
        );
      }}
    </CalendarCell>
  );
}

function Months({ count, range, hideOutside, labels }: { count: number; range: boolean; hideOutside: boolean; labels: DateCalendarLabels }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="flex h-8 items-center gap-1">
            {i === 0 ? <NavButton slot="previous" label={labels.previous} /> : <span className="size-8 shrink-0" />}
            <MonthTitle offset={i} />
            {i === count - 1 ? <NavButton slot="next" label={labels.next} /> : <span className="size-8 shrink-0" />}
          </div>
          <CalendarGrid offset={{ months: i }} className="border-separate border-spacing-x-0 border-spacing-y-0.5">
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCell className="h-8 w-9 text-caption font-medium text-fg-subtle">{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>{(date) => (range ? <RangeCell date={date} /> : <SingleCell date={date} hideOutside={hideOutside} />)}</CalendarGridBody>
          </CalendarGrid>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- calendars */

export interface DateCalendarProps<T extends DateValue = DateValue> extends Omit<CalendarProps<T>, "className" | "children" | "visibleDuration" | "style"> {
  /** Months shown side by side (stacked on narrow screens). */
  visibleMonths?: 1 | 2 | 3;
  className?: string;
  labels?: Partial<DateCalendarLabels>;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Inline month calendar for picking one date. Respects `minValue` /
 * `maxValue`, `isDateUnavailable`, and the locale's first day of week
 * (override with `firstDayOfWeek`).
 *
 *   <DateCalendar aria-label="Delivery date" value={date} onChange={setDate} />
 */
export function DateCalendar<T extends DateValue = DateValue>({ visibleMonths = 1, className, labels, ref, ...props }: DateCalendarProps<T>) {
  const t = useCopy(COPY, labels);
  return (
    <Calendar<T> {...props} ref={ref} visibleDuration={{ months: visibleMonths }} className={cx("w-fit text-fg", className)}>
      <Months count={visibleMonths} range={false} hideOutside={visibleMonths > 1} labels={t} />
    </Calendar>
  );
}

export interface DateRangeCalendarProps<T extends DateValue = DateValue> extends Omit<RangeCalendarProps<T>, "className" | "children" | "visibleDuration" | "style"> {
  /** Months shown side by side (stacked on narrow screens). */
  visibleMonths?: 1 | 2 | 3;
  className?: string;
  labels?: Partial<DateCalendarLabels>;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Inline calendar for picking a start and end date, with a continuous
 * highlight band. Show two months with `visibleMonths={2}`.
 *
 *   <DateRangeCalendar aria-label="Trip dates" value={range} onChange={setRange} visibleMonths={2} />
 */
export function DateRangeCalendar<T extends DateValue = DateValue>({ visibleMonths = 1, className, labels, ref, ...props }: DateRangeCalendarProps<T>) {
  const t = useCopy(COPY, labels);
  return (
    <RangeCalendar<T> {...props} ref={ref} visibleDuration={{ months: visibleMonths }} className={cx("w-fit text-fg", className)}>
      <Months count={visibleMonths} range hideOutside labels={t} />
    </RangeCalendar>
  );
}
