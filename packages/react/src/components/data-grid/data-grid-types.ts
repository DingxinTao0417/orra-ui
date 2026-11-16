import type { ReactNode } from "react";
import type { BadgeTone } from "../badge/badge";

export type DataGridColumnType = "text" | "number" | "currency" | "percent" | "select" | "date";
export type DataGridSummary = "sum" | "avg" | "count" | "min" | "max";

export interface DataGridOption {
  id: string;
  label: string;
  /** Badge colour for the option. */
  tone?: BadgeTone;
}

export interface DataGridColumn<T extends object = Record<string, unknown>> {
  /** Field of the row this column shows (also the column id). */
  key: Extract<keyof T, string>;
  header: string;
  /** Width in px (default 160). Users can resize it. */
  width?: number;
  /** Minimum width when resizing (default 64). */
  minWidth?: number;
  /**
   * How values are shown, edited, sorted and filtered (default "text").
   * `percent` values are fractions (0.25 = 25%); `date` values are "YYYY-MM-DD".
   */
  type?: DataGridColumnType;
  /** ISO currency for `currency` columns (default "USD"). */
  currency?: string;
  /** Choices for `select` columns (shown as badges). */
  options?: DataGridOption[];
  /** Text alignment (numbers default to end). */
  align?: "start" | "center" | "end";
  /** Override the grid-level `editable` for this column. */
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  /** Footer summary: a built-in aggregate or a function of the visible values. */
  summary?: DataGridSummary | ((values: unknown[], rows: T[]) => ReactNode);
  /** Custom cell content (display only; editing still uses the raw value). */
  render?: (value: unknown, row: T) => ReactNode;
}

export interface DataGridSort {
  key: string;
  direction: "asc" | "desc";
}

export interface DataGridCellEdit<T> {
  rowId: string;
  row: T;
  key: string;
  value: unknown;
  previous: unknown;
}
