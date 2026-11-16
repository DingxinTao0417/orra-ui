import type { ReactNode } from "react";
import type { DateValue } from "@internationalized/date";

export interface CalendarEvent {
  id: string;
  title: string;
  /** "2026-11-16" (all-day) or "2026-11-16T09:30" (local time), or a DateValue. */
  start: string | DateValue;
  /** Same formats. All-day ends are inclusive; timed events default to one hour. */
  end?: string | DateValue;
  /** Inferred from a date-only `start` when omitted. */
  allDay?: boolean;
  /** Which calendar (CalendarSource id) it belongs to: sets its colour. */
  calendarId?: string;
  location?: string;
  description?: ReactNode;
  attendees?: { name: string; src?: string }[];
  /** Any CSS colour; overrides the calendar colour. */
  color?: string;
}

export interface CalendarSource {
  id: string;
  label: string;
  /** Any CSS colour (default: the chart palette in order). */
  color?: string;
}

export type EventCalendarView = "month" | "week" | "agenda";
