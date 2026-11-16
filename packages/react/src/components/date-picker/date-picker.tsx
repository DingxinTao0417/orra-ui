"use client";

import { useContext } from "react";
import type { ReactNode, Ref } from "react";
import {
  Button as AriaButton,
  ButtonContext,
  DateInput,
  DatePicker as AriaDatePicker,
  DatePickerStateContext,
  DateSegment,
  Dialog,
  Group,
  Popover as AriaPopover,
} from "react-aria-components";
import type { DatePickerProps as AriaDatePickerProps, DateValue } from "react-aria-components";
import { getLocalTimeZone, today } from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import { RiCalendarLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { FieldDescription, FieldErrorText, FieldLabel } from "../../lib/field";
import { CloseGlyph } from "../../lib/glyphs";
import { fieldBox, floatingPanel, focusRing, iconSize, type Size } from "../../lib/recipes";
import { DateCalendar } from "../date-calendar/date-calendar";

const COPY = {
  en: { today: "Today", tomorrow: "Tomorrow", nextWeek: "In a week", clear: "Clear date", open: "Open calendar", presets: "Quick picks" },
  zh: { today: "今天", tomorrow: "明天", nextWeek: "一周后", clear: "清除日期", open: "打开日历", presets: "快捷选择" },
};
export type DatePickerLabels = (typeof COPY)["en"];

export interface DatePickerPreset {
  label: ReactNode;
  /** A date, or a function of today's date. */
  value: DateValue | ((today: CalendarDate) => DateValue);
}

/* Shared with DateRangePicker: field box sizing and segment styling. */
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

function defaultPresets(t: DatePickerLabels): DatePickerPreset[] {
  return [
    { label: t.today, value: (d) => d },
    { label: t.tomorrow, value: (d) => d.add({ days: 1 }) },
    { label: t.nextWeek, value: (d) => d.add({ weeks: 1 }) },
  ];
}

function ClearButton({ label, size }: { label: string; size: Size }) {
  const state = useContext(DatePickerStateContext);
  if (!state?.value) return null;
  return (
    // Reset the picker's ButtonContext so this button doesn't also open the popover.
    <ButtonContext.Provider value={null}>
      <AriaButton aria-label={label} onPress={() => state.setValue(null)} className={cx(ICON_BUTTON, ICON_BUTTON_SIZE[size])}>
        <CloseGlyph className="size-3.5" />
      </AriaButton>
    </ButtonContext.Provider>
  );
}

function PresetList({ presets, title }: { presets: DatePickerPreset[]; title: string }) {
  const state = useContext(DatePickerStateContext);
  return (
    <div
      role="group"
      aria-label={title}
      className="flex gap-1 overflow-x-auto border-b border-line p-2 sm:w-32 sm:flex-col sm:overflow-visible sm:border-e sm:border-b-0"
    >
      {presets.map((preset, i) => (
        <AriaButton
          key={i}
          onPress={() => {
            const now = today(getLocalTimeZone());
            const value = typeof preset.value === "function" ? preset.value(now) : preset.value;
            state?.setValue(value);
            state?.close();
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
  );
}

export interface DatePickerProps<T extends DateValue = DateValue> extends Omit<AriaDatePickerProps<T>, "className" | "children" | "style"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: Size;
  /** Quick picks beside the calendar. Defaults to today / tomorrow / in a week; `false` hides them. */
  presets?: DatePickerPreset[] | false;
  /** Show a clear button when there is a value (default true). */
  isClearable?: boolean;
  className?: string;
  labels?: Partial<DatePickerLabels>;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A date field (type or pick) with a calendar popover, quick-pick presets
 * and a clear button. Segments and calendar follow the React Aria locale.
 *
 *   <DatePicker label="Due date" value={date} onChange={setDate} />
 */
export function DatePicker<T extends DateValue = DateValue>({
  label,
  description,
  errorMessage,
  size = "md",
  presets,
  isClearable = true,
  className,
  labels,
  ref,
  ...props
}: DatePickerProps<T>) {
  const t = useCopy(COPY, labels);
  const list = presets === false ? [] : (presets ?? defaultPresets(t));
  return (
    <AriaDatePicker<T> {...props} ref={ref} className={cx("group flex flex-col gap-1.5", className)}>
      {label ? <FieldLabel required={props.isRequired}>{label}</FieldLabel> : null}
      <Group className={cx(fieldBox, FIELD_HEIGHT[size])}>
        <DateInput className="flex min-w-0 flex-1 items-center overflow-hidden whitespace-nowrap">
          {(segment) => <DateSegment segment={segment} className={SEGMENT} />}
        </DateInput>
        {isClearable && !props.isDisabled && !props.isReadOnly ? <ClearButton label={t.clear} size={size} /> : null}
        <AriaButton aria-label={t.open} className={cx(ICON_BUTTON, ICON_BUTTON_SIZE[size])}>
          <RiCalendarLine className={iconSize[size]} />
        </AriaButton>
      </Group>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldErrorText>{errorMessage}</FieldErrorText>
      <AriaPopover placement="bottom start" offset={6} className={cx(floatingPanel, "max-w-[calc(100vw-1.5rem)] overflow-auto p-0")}>
        <Dialog className="flex flex-col outline-none sm:flex-row">
          {list.length ? <PresetList presets={list} title={t.presets} /> : null}
          <DateCalendar className="p-3" />
        </Dialog>
      </AriaPopover>
    </AriaDatePicker>
  );
}
