"use client";

import { useContext, useState } from "react";
import type { ReactNode, Ref } from "react";
import {
  Button as AriaButton,
  ButtonContext,
  DateInput,
  DateRangePicker as AriaDateRangePicker,
  DateRangePickerStateContext,
  DateSegment,
  Dialog,
  Group,
  Popover as AriaPopover,
  RangeCalendarContext,
  useLocale,
} from "react-aria-components";
import type { DateRangePickerProps as AriaDateRangePickerProps, DateValue } from "react-aria-components";
import { endOfMonth, endOfYear, getLocalTimeZone, startOfMonth, startOfYear, today } from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import { RiCalendarLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { FieldDescription, FieldErrorText, FieldLabel } from "../../lib/field";
import { CloseGlyph } from "../../lib/glyphs";
import { fieldBox, floatingPanel, focusRing, iconSize, type Size } from "../../lib/recipes";
import { Button } from "../button/button";
import { DateRangeCalendar } from "../date-calendar/date-calendar";

const COPY = {
  en: {
    last7: "Last 7 days",
    last30: "Last 30 days",
    thisMonth: "This month",
    lastMonth: "Last month",
    last90: "Last 90 days",
    thisYear: "This year",
    apply: "Apply",
    cancel: "Cancel",
    clear: "Clear dates",
    open: "Open calendar",
    presets: "Preset ranges",
    pickRange: "Pick a start and end date",
    days: "{n} days",
  },
  zh: {
    last7: "最近 7 天",
    last30: "最近 30 天",
    thisMonth: "本月",
    lastMonth: "上个月",
    last90: "最近 90 天",
    thisYear: "今年",
    apply: "应用",
    cancel: "取消",
    clear: "清除日期",
    open: "打开日历",
    presets: "预设范围",
    pickRange: "请选择开始和结束日期",
    days: "共 {n} 天",
  },
};
export type DateRangePickerLabels = (typeof COPY)["en"];

export interface DateRangeValue {
  start: DateValue;
  end: DateValue;
}

export interface DateRangePreset {
  label: ReactNode;
  /** A range, or a function of today's date. */
  value: DateRangeValue | ((today: CalendarDate) => DateRangeValue);
}

const FIELD_HEIGHT: Record<Size, string> = {
  sm: "h-8 ps-2.5 pe-1 text-body-sm gap-1",
  md: "h-9 ps-3 pe-1 text-body gap-1",
  lg: "h-11 ps-4 pe-1.5 text-body-lg gap-1.5",
};
const SEGMENT = cx(
  "rounded-[4px] px-px tabular-nums text-fg caret-transparent outline-none",
  "data-[placeholder]:text-fg-subtle data-[type=literal]:px-0 data-[type=literal]:text-fg-subtle",
  "data-[focused]:bg-accent-500 data-[focused]:text-fg-on-accent data-[disabled]:text-fg-disabled",
);
const ICON_BUTTON = cx(
  "grid shrink-0 place-items-center rounded-[7px] text-fg-subtle transition-colors duration-150",
  "data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active data-[disabled]:pointer-events-none",
  focusRing,
);
const ICON_BUTTON_SIZE: Record<Size, string> = { sm: "size-6", md: "size-7", lg: "size-8" };

function defaultPresets(t: DateRangePickerLabels): DateRangePreset[] {
  return [
    { label: t.last7, value: (d) => ({ start: d.subtract({ days: 6 }), end: d }) },
    { label: t.last30, value: (d) => ({ start: d.subtract({ days: 29 }), end: d }) },
    { label: t.last90, value: (d) => ({ start: d.subtract({ days: 89 }), end: d }) },
    { label: t.thisMonth, value: (d) => ({ start: startOfMonth(d), end: endOfMonth(d) }) },
    {
      label: t.lastMonth,
      value: (d) => {
        const prev = d.subtract({ months: 1 });
        return { start: startOfMonth(prev), end: endOfMonth(prev) };
      },
    },
    { label: t.thisYear, value: (d) => ({ start: startOfYear(d), end: endOfYear(d) }) },
  ];
}

function ClearButton({ label, size }: { label: string; size: Size }) {
  const state = useContext(DateRangePickerStateContext);
  if (!state?.value?.start && !state?.value?.end) return null;
  return (
    <ButtonContext.Provider value={null}>
      <AriaButton aria-label={label} onPress={() => state.setValue(null)} className={cx(ICON_BUTTON, ICON_BUTTON_SIZE[size])}>
        <CloseGlyph className="size-3.5" />
      </AriaButton>
    </ButtonContext.Provider>
  );
}

interface PanelProps {
  presets: DateRangePreset[];
  visibleMonths: 1 | 2;
  t: DateRangePickerLabels;
  calendarProps: Pick<AriaDateRangePickerProps<DateValue>, "minValue" | "maxValue" | "isDateUnavailable" | "firstDayOfWeek" | "allowsNonContiguousRanges">;
}

/** Popover body: presets, a draft range on a two-month calendar, and Apply / Cancel. */
function RangePanel({ presets, visibleMonths, t, calendarProps }: PanelProps) {
  const state = useContext(DateRangePickerStateContext);
  const { locale } = useLocale();
  const current = state?.value?.start && state.value.end ? (state.value as DateRangeValue) : null;
  const [draft, setDraft] = useState<DateRangeValue | null>(current);
  const [focused, setFocused] = useState<DateValue>(current?.start ?? today(getLocalTimeZone()));

  const fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", timeZone: getLocalTimeZone() });
  const tz = getLocalTimeZone();
  const days = draft ? Math.round((draft.end.toDate(tz).getTime() - draft.start.toDate(tz).getTime()) / 86_400_000) + 1 : 0;

  return (
    <div className="flex flex-col sm:flex-row">
      {presets.length ? (
        <div
          role="group"
          aria-label={t.presets}
          className="flex gap-1 overflow-x-auto border-b border-line p-2 sm:w-36 sm:flex-col sm:overflow-visible sm:border-e sm:border-b-0"
        >
          {presets.map((preset, i) => (
            <AriaButton
              key={i}
              onPress={() => {
                const value = typeof preset.value === "function" ? preset.value(today(getLocalTimeZone())) : preset.value;
                setDraft(value);
                setFocused(value.end);
              }}
              className={cx(
                "shrink-0 cursor-default rounded-[8px] px-2.5 py-1.5 text-start text-body-sm text-fg-muted transition-colors duration-150",
                "data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active",
                focusRing,
              )}
            >
              {preset.label}
            </AriaButton>
          ))}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-col">
        {/* Detach the calendar from the picker so edits stay a draft until Apply. */}
        <RangeCalendarContext.Provider value={null}>
          <DateRangeCalendar
            {...calendarProps}
            aria-label={t.pickRange}
            visibleMonths={visibleMonths}
            value={draft}
            onChange={setDraft}
            focusedValue={focused}
            onFocusChange={setFocused}
            className="p-3"
          />
        </RangeCalendarContext.Provider>
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-3 py-2.5">
          <p className="min-w-0 flex-1 text-body-sm text-fg-muted tabular-nums">
            {draft ? (
              <>
                {fmt.formatRange(draft.start.toDate(tz), draft.end.toDate(tz))}
                <span className="ms-2 text-fg-subtle">{fill(t.days, { n: days })}</span>
              </>
            ) : (
              <span className="text-fg-subtle">{t.pickRange}</span>
            )}
          </p>
          <Button size="sm" variant="outline" tone="neutral" onPress={() => state?.close()}>
            {t.cancel}
          </Button>
          <Button
            size="sm"
            isDisabled={!draft}
            onPress={() => {
              if (draft) state?.setValue(draft as never);
              state?.close();
            }}
          >
            {t.apply}
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface DateRangePickerProps<T extends DateValue = DateValue> extends Omit<AriaDateRangePickerProps<T>, "className" | "children" | "style"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: Size;
  /** Preset ranges beside the calendar (last 7 / 30 / 90 days, this / last month, this year by default); `false` hides them. */
  presets?: DateRangePreset[] | false;
  /** Months in the popover: 2 (default) side by side, stacked on narrow screens. */
  visibleMonths?: 1 | 2;
  isClearable?: boolean;
  className?: string;
  labels?: Partial<DateRangePickerLabels>;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Start / end date field with a popover holding preset ranges and two
 * months side by side. Picks are a draft until Apply; Cancel or Escape
 * discards them.
 *
 *   <DateRangePicker label="Report period" value={range} onChange={setRange} />
 */
export function DateRangePicker<T extends DateValue = DateValue>({
  label,
  description,
  errorMessage,
  size = "md",
  presets,
  visibleMonths = 2,
  isClearable = true,
  className,
  labels,
  ref,
  ...props
}: DateRangePickerProps<T>) {
  const t = useCopy(COPY, labels);
  const list = presets === false ? [] : (presets ?? defaultPresets(t));
  return (
    <AriaDateRangePicker<T> {...props} ref={ref} className={cx("group flex flex-col gap-1.5", className)}>
      {label ? <FieldLabel required={props.isRequired}>{label}</FieldLabel> : null}
      <Group className={cx(fieldBox, FIELD_HEIGHT[size])}>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden whitespace-nowrap">
          <DateInput slot="start" className="flex items-center">
            {(segment) => <DateSegment segment={segment} className={SEGMENT} />}
          </DateInput>
          <span aria-hidden className="text-fg-subtle">
            –
          </span>
          <DateInput slot="end" className="flex items-center">
            {(segment) => <DateSegment segment={segment} className={SEGMENT} />}
          </DateInput>
        </div>
        {isClearable && !props.isDisabled && !props.isReadOnly ? <ClearButton label={t.clear} size={size} /> : null}
        <AriaButton aria-label={t.open} className={cx(ICON_BUTTON, ICON_BUTTON_SIZE[size])}>
          <RiCalendarLine className={iconSize[size]} />
        </AriaButton>
      </Group>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldErrorText>{errorMessage}</FieldErrorText>
      <AriaPopover placement="bottom start" offset={6} className={cx(floatingPanel, "max-w-[calc(100vw-1.5rem)] overflow-auto p-0")}>
        <Dialog className="outline-none">
          <RangePanel
            presets={list}
            visibleMonths={visibleMonths}
            t={t}
            calendarProps={{
              minValue: props.minValue,
              maxValue: props.maxValue,
              isDateUnavailable: props.isDateUnavailable,
              firstDayOfWeek: props.firstDayOfWeek,
              allowsNonContiguousRanges: props.allowsNonContiguousRanges,
            }}
          />
        </Dialog>
      </AriaPopover>
    </AriaDateRangePicker>
  );
}
