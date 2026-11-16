"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, Ref } from "react";
import { useLocale } from "react-aria-components";
import { parseDate } from "@internationalized/date";
import { RiArrowDownLine, RiArrowUpLine, RiFilter3Line, RiTableLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { card, controlSize, fieldBox, fieldInput } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { CheckboxIndicator } from "../checkbox/checkbox";
import { SearchField } from "../search-field/search-field";
import { Select, SelectItem } from "../select/select";
import { dataGridSampleColumns, dataGridSampleRows } from "./data-grid-sample";
import type { DataGridCellEdit, DataGridColumn, DataGridSort, DataGridSummary } from "./data-grid-types";

const COPY = {
  en: {
    grid: "Data grid",
    search: "Search rows…",
    filters: "Filters",
    filter: "Filter…",
    numberFilter: "e.g. >100",
    rows: "{count} rows",
    rowsOf: "{count} of {total} rows",
    selected: "{count} selected",
    clear: "Clear",
    selectAll: "Select all rows",
    selectRow: "Select row",
    sum: "Sum",
    avg: "Avg",
    count: "Count",
    min: "Min",
    max: "Max",
    empty: "No matching rows",
    emptyHint: "Try a different search or clear the filters.",
    resize: "Resize column",
    editHint: "Enter to edit",
  },
  zh: {
    grid: "数据网格",
    search: "搜索行…",
    filters: "筛选",
    filter: "筛选…",
    numberFilter: "如 >100",
    rows: "{count} 行",
    rowsOf: "{count} / {total} 行",
    selected: "已选 {count} 行",
    clear: "清除",
    selectAll: "选择全部行",
    selectRow: "选择该行",
    sum: "合计",
    avg: "平均",
    count: "计数",
    min: "最小",
    max: "最大",
    empty: "没有匹配的行",
    emptyHint: "换个关键词，或清除筛选条件。",
    resize: "调整列宽",
    editHint: "按 Enter 编辑",
  },
};
export type DataGridLabels = (typeof COPY)["en"];

type AnyRow = Record<string, unknown>;
const SELECT_W = 44;
const isNumeric = (c: DataGridColumn<AnyRow>) => c.type === "number" || c.type === "currency" || c.type === "percent";

/* --------------------------------------------------------------- helpers */

const norm = (text: string) => text.replace(/[\u2009\u202f\u00a0]/g, " ");

function makeFormatter(col: DataGridColumn<AnyRow>, locale: string): (v: unknown) => string {
  const inner = makeRawFormatter(col, locale);
  return (v) => norm(inner(v));
}

function makeRawFormatter(col: DataGridColumn<AnyRow>, locale: string) {
  const type = col.type ?? "text";
  if (type === "number") {
    const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
    return (v: unknown) => (typeof v === "number" ? nf.format(v) : "");
  }
  if (type === "currency") {
    const nf = new Intl.NumberFormat(locale, { style: "currency", currency: col.currency ?? "USD", maximumFractionDigits: 2, minimumFractionDigits: 0 });
    return (v: unknown) => (typeof v === "number" ? nf.format(v) : "");
  }
  if (type === "percent") {
    const nf = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 });
    return (v: unknown) => (typeof v === "number" ? nf.format(v) : "");
  }
  if (type === "date") {
    const df = new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" });
    return (v: unknown) => {
      if (typeof v !== "string" || !v) return "";
      try {
        return df.format(parseDate(v.slice(0, 10)).toDate("UTC"));
      } catch {
        return v;
      }
    };
  }
  if (type === "select") {
    const labels = new Map(col.options?.map((o) => [o.id, o.label]));
    return (v: unknown) => (v == null ? "" : (labels.get(String(v)) ?? String(v)));
  }
  return (v: unknown) => (v == null ? "" : String(v));
}

/** Raw value → text in the editor. */
function toEditText(col: DataGridColumn<AnyRow>, v: unknown) {
  if (v == null) return "";
  if (col.type === "percent" && typeof v === "number") return String(Math.round(v * 10000) / 100);
  return String(v);
}

/** Editor text → raw value. Returns undefined for invalid numbers. */
function parseEdit(col: DataGridColumn<AnyRow>, text: string): unknown {
  if (isNumeric(col)) {
    const trimmed = text.replace(/[^\d.,\-]/g, "").replace(/,/g, "");
    if (!trimmed) return null;
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return undefined;
    return col.type === "percent" ? n / 100 : n;
  }
  if (col.type === "select") {
    const hit = col.options?.find((o) => o.id === text || o.label.toLowerCase() === text.trim().toLowerCase());
    return hit ? hit.id : undefined;
  }
  return text;
}

/** Column filter: numbers accept >, <, >=, <=, = and a..b ranges; everything else is "contains". */
function matchFilter(col: DataGridColumn<AnyRow>, value: unknown, display: string, query: string) {
  const q = query.trim();
  if (!q) return true;
  if (isNumeric(col) && typeof value === "number") {
    const scale = col.type === "percent" ? 100 : 1;
    const v = value * scale;
    const range = q.match(/^(-?[\d.]+)\s*\.\.\s*(-?[\d.]+)$/);
    if (range) return v >= Number(range[1]) && v <= Number(range[2]);
    const op = q.match(/^(>=|<=|>|<|=)\s*(-?[\d.]+)$/);
    if (op) {
      const n = Number(op[2]);
      return op[1] === ">" ? v > n : op[1] === "<" ? v < n : op[1] === ">=" ? v >= n : op[1] === "<=" ? v <= n : v === n;
    }
  }
  return display.toLowerCase().includes(q.toLowerCase());
}

function compare(col: DataGridColumn<AnyRow>, a: unknown, b: unknown, display: (v: unknown) => string) {
  if (a == null || a === "") return b == null || b === "" ? 0 : 1;
  if (b == null || b === "") return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (col.type === "date") return String(a).localeCompare(String(b));
  return display(a).localeCompare(display(b));
}

function aggregate(kind: DataGridSummary, values: unknown[]) {
  const nums = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  switch (kind) {
    case "count":
      return values.filter((v) => v != null && v !== "").length;
    case "sum":
      return nums.reduce((a, b) => a + b, 0);
    case "avg":
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    case "min":
      return nums.length ? Math.min(...nums) : null;
    case "max":
      return nums.length ? Math.max(...nums) : null;
  }
}

/* -------------------------------------------------------------- component */

export interface DataGridProps<T extends object = AnyRow> {
  /** Column definitions; defaults to a sample sales ledger. */
  columns?: DataGridColumn<T>[];
  /** Rows (controlled). Each needs a stable id (see `getRowId`). */
  rows?: T[];
  defaultRows?: T[];
  /** Called with the full updated rows after an edit. */
  onRowsChange?: (rows: T[]) => void;
  /** Called after a single cell edit is committed. */
  onCellEdit?: (edit: DataGridCellEdit<T>) => void;
  /** Row id accessor (default `row.id`). */
  getRowId?: (row: T) => string;
  /** Allow inline editing (default true). Columns can opt out with `editable: false`. */
  editable?: boolean;
  /** Show a checkbox column for row selection (default true). */
  selectable?: boolean;
  selectedKeys?: Set<string>;
  defaultSelectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  sort?: DataGridSort | null;
  defaultSort?: DataGridSort | null;
  onSortChange?: (sort: DataGridSort | null) => void;
  /** Per-column filter row visibility. */
  showFilters?: boolean;
  defaultShowFilters?: boolean;
  onShowFiltersChange?: (show: boolean) => void;
  /** Toolbar with search, filter toggle and counts (default true). */
  toolbar?: boolean;
  /** Title on the start side of the toolbar. */
  title?: ReactNode;
  /** Extra buttons on the end side of the toolbar. */
  toolbarActions?: ReactNode;
  /** Keep the first data column pinned while scrolling sideways (default true). */
  stickyFirstColumn?: boolean;
  /** `comfortable` (40px rows, default) or `compact` (32px). */
  density?: "comfortable" | "compact";
  /** Footer with column summaries (default: shown when any column has `summary`). */
  showFooter?: boolean;
  /** Content when no rows match. */
  emptyState?: ReactNode;
  /** Height of the grid (px or CSS). Default: fill the parent (give it a height). */
  height?: number | string;
  /** Rows rendered beyond the viewport (default 8). */
  overscan?: number;
  "aria-label"?: string;
  labels?: Partial<DataGridLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

interface Pos {
  /** -1 = header row. */
  r: number;
  /** Index into navigable columns (selection column first when selectable). */
  c: number;
}

/**
 * Spreadsheet-like grid: keyboard cell navigation, inline editing, column
 * resizing, sort, filters, row selection, a pinned first column, footer
 * summaries and row virtualization for large data sets.
 *
 *   <div className="h-[560px]"><DataGrid columns={columns} rows={rows} onRowsChange={setRows} /></div>
 */
export function DataGrid<T extends object = AnyRow>(props: DataGridProps<T>) {
  const {
    getRowId = (row: T) => String((row as AnyRow).id),
    editable = true,
    selectable = true,
    toolbar = true,
    title,
    toolbarActions,
    stickyFirstColumn = true,
    density = "comfortable",
    emptyState,
    height,
    overscan = 8,
    labels,
    className,
    ref,
  } = props;
  const t = useCopy(COPY, labels);
  const { locale, direction } = useLocale();
  const lang = locale.toLowerCase().startsWith("zh") ? "zh" : "en";
  const sampleCols = useMemo(() => dataGridSampleColumns(lang), [lang]);
  const sampleRows = useMemo(() => dataGridSampleRows(lang), [lang]);
  const columns = (props.columns ?? sampleCols) as unknown as DataGridColumn<AnyRow>[];
  const [rows, setRows] = useControllableState<AnyRow[]>(
    props.rows as AnyRow[] | undefined,
    (props.defaultRows ?? (props.columns ? [] : sampleRows)) as AnyRow[],
    props.onRowsChange as ((rows: AnyRow[]) => void) | undefined,
  );
  const rowId = getRowId as unknown as (row: AnyRow) => string;
  const [selected, setSelected] = useControllableState(props.selectedKeys, props.defaultSelectedKeys ?? new Set<string>(), props.onSelectionChange);
  const [sort, setSort] = useControllableState<DataGridSort | null>(props.sort, props.defaultSort ?? null, props.onSortChange);
  const [showFilters, setShowFilters] = useControllableState(props.showFilters, props.defaultShowFilters ?? false, props.onShowFiltersChange);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [active, setActive] = useState<Pos>({ r: 0, c: selectable ? 1 : 0 });
  const [editing, setEditing] = useState<{ r: number; c: number; draft: string } | null>(null);
  const rowH = density === "compact" ? 32 : 40;
  const [hasFocus, setHasFocus] = useState(false);

  const formatters = useMemo(() => new Map(columns.map((c) => [c.key, makeFormatter(c, locale)])), [columns, locale]);
  const fmt = (col: DataGridColumn<AnyRow>, v: unknown) => formatters.get(col.key)!(v);

  /* ---- derived rows: search → filters → sort */
  const view = useMemo(() => {
    let list = rows;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((row) => columns.some((c) => fmt(c, row[c.key]).toLowerCase().includes(q)));
    const active = Object.entries(filters).filter(([, v]) => v.trim());
    if (active.length) {
      list = list.filter((row) =>
        active.every(([key, query]) => {
          const col = columns.find((c) => c.key === key);
          return !col || matchFilter(col, row[key], fmt(col, row[key]), query);
        }),
      );
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col) {
        const dir = sort.direction === "asc" ? 1 : -1;
        const display = formatters.get(col.key)!;
        list = [...list].sort((a, b) => compare(col, a[col.key], b[col.key], display) * dir);
      }
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, filters, sort, columns, formatters]);

  /* ---- layout */
  const colWidth = (c: DataGridColumn<AnyRow>) => widths[c.key] ?? c.width ?? 160;
  const navCols: ("select" | DataGridColumn<AnyRow>)[] = selectable ? ["select", ...columns] : [...columns];
  const totalWidth = (selectable ? SELECT_W : 0) + columns.reduce((s, c) => s + colWidth(c), 0);
  const stickyCount = (selectable ? 1 : 0) + (stickyFirstColumn && columns.length ? 1 : 0);
  const stickyOffset = (navIndex: number) => (navIndex === 0 || !selectable ? 0 : SELECT_W);
  const stickyWidth = (selectable ? SELECT_W : 0) + (stickyFirstColumn && columns[0] ? colWidth(columns[0]) : 0);
  const showFooter = props.showFooter ?? columns.some((c) => c.summary);

  /* ---- virtualization */
  const scrollRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(600);
  const [viewportW, setViewportW] = useState<number | undefined>(undefined);
  const [headH, setHeadH] = useState(rowH);
  const [footH, setFootH] = useState(0);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      setViewportH(el.clientHeight);
      setViewportW(el.clientWidth);
      setHeadH(headRef.current?.offsetHeight ?? rowH);
      setFootH(footRef.current?.offsetHeight ?? 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (headRef.current) ro.observe(headRef.current);
    return () => ro.disconnect();
  }, [rowH, showFilters, showFooter]);

  const first = Math.max(0, Math.floor(scrollTop / rowH) - overscan);
  const last = Math.min(view.length, Math.ceil((scrollTop + viewportH) / rowH) + overscan);
  const visibleRows = view.slice(first, last);

  /* ---- focus management */
  const pendingFocus = useRef(false);
  const gridId = `dg${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const cellId = (p: Pos) => `${gridId}-${p.r}-${p.c}`;

  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const el = scrollRef.current;
    if (!el) return;
    if (active.r >= 0) {
      const top = active.r * rowH;
      const bodyH = el.clientHeight - headH - footH;
      if (top < el.scrollTop) el.scrollTop = top;
      else if (top + rowH > el.scrollTop + bodyH) el.scrollTop = top + rowH - bodyH;
    }
    requestAnimationFrame(() => {
      const cell = document.getElementById(cellId(active));
      if (!cell) return;
      cell.focus({ preventScroll: true });
      // Horizontal: keep the cell clear of the pinned columns.
      if (active.c >= stickyCount) {
        const box = el.getBoundingClientRect();
        const r = cell.getBoundingClientRect();
        const rtl = direction === "rtl";
        const startEdge = rtl ? box.right - stickyWidth : box.left + stickyWidth;
        if (!rtl && r.left < startEdge) el.scrollLeft -= startEdge - r.left;
        else if (!rtl && r.right > box.right) el.scrollLeft += r.right - box.right;
        else if (rtl && r.right > startEdge) el.scrollLeft += r.right - startEdge;
        else if (rtl && r.left < box.left) el.scrollLeft -= box.left - r.left;
      }
    });
  });

  const clamp = (p: Pos): Pos => ({
    r: Math.max(-1, Math.min(view.length - 1, p.r)),
    c: Math.max(0, Math.min(navCols.length - 1, p.c)),
  });
  const moveTo = (p: Pos) => {
    pendingFocus.current = true;
    setActive(clamp(p));
  };

  /* ---- editing */
  const canEdit = (col: "select" | DataGridColumn<AnyRow> | undefined): col is DataGridColumn<AnyRow> =>
    !!col && col !== "select" && (col.editable ?? editable);

  const writeCell = useCallback(
    (r: number, col: DataGridColumn<AnyRow>, value: unknown) => {
      const row = view[r];
      if (!row) return;
      const previous = row[col.key];
      if (Object.is(previous, value)) return;
      const id = rowId(row);
      const next = rows.map((x) => (rowId(x) === id ? { ...x, [col.key]: value } : x));
      setRows(next);
      props.onCellEdit?.({ rowId: id, row: { ...row, [col.key]: value } as unknown as T, key: col.key, value, previous });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, rows, setRows, props.onCellEdit],
  );

  const startEdit = (p: Pos, draft?: string) => {
    const col = navCols[p.c];
    const row = view[p.r];
    if (!canEdit(col) || !row) return;
    setEditing({ r: p.r, c: p.c, draft: draft ?? toEditText(col, row[col.key]) });
  };

  const commitEdit = (then?: Pos | null) => {
    if (!editing) return;
    const col = navCols[editing.c];
    if (canEdit(col)) {
      const value = parseEdit(col, editing.draft);
      if (value !== undefined) writeCell(editing.r, col, value);
    }
    setEditing(null);
    moveTo(then ?? { r: editing.r, c: editing.c });
  };

  const cancelEdit = () => {
    if (!editing) return;
    const at = { r: editing.r, c: editing.c };
    setEditing(null);
    moveTo(at);
  };

  /* ---- selection */
  const allIds = view.map(rowId);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = !allSelected && allIds.some((id) => selected.has(id));
  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) allIds.forEach((id) => next.delete(id));
    else allIds.forEach((id) => next.add(id));
    setSelected(next);
  };

  const cycleSort = (col: DataGridColumn<AnyRow>) => {
    if (col.sortable === false) return;
    if (!sort || sort.key !== col.key) setSort({ key: col.key, direction: "asc" });
    else if (sort.direction === "asc") setSort({ key: col.key, direction: "desc" });
    else setSort(null);
  };

  const resizeBy = (col: DataGridColumn<AnyRow>, delta: number) =>
    setWidths((w) => ({ ...w, [col.key]: Math.max(col.minWidth ?? 64, Math.round((w[col.key] ?? col.width ?? 160) + delta)) }));

  /* ---- keyboard */
  const onGridKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (editing) return;
    const target = e.target as HTMLElement;
    if (!target.closest("[data-dg-cell]")) return; // filter inputs etc.
    const { r, c } = active;
    const col = navCols[c];
    const pageRows = Math.max(1, Math.floor((viewportH - headH - footH) / rowH) - 1);
    const mod = e.metaKey || e.ctrlKey;
    const rtl = direction === "rtl";
    const left = rtl ? 1 : -1;
    let handled = true;
    switch (e.key) {
      case "ArrowUp":
        moveTo({ r: mod ? 0 : r - 1, c });
        break;
      case "ArrowDown":
        moveTo({ r: mod ? view.length - 1 : r + 1, c });
        break;
      case "ArrowLeft":
      case "ArrowRight": {
        const dir = e.key === "ArrowLeft" ? left : -left;
        if (r === -1 && e.altKey && col && col !== "select") resizeBy(col, dir * (rtl ? -16 : 16));
        else moveTo({ r, c: mod ? (dir < 0 ? 0 : navCols.length - 1) : c + dir });
        break;
      }
      case "Home":
        moveTo(mod ? { r: 0, c: 0 } : { r, c: 0 });
        break;
      case "End":
        moveTo(mod ? { r: view.length - 1, c: navCols.length - 1 } : { r, c: navCols.length - 1 });
        break;
      case "PageDown":
        moveTo({ r: r + pageRows, c });
        break;
      case "PageUp":
        moveTo({ r: Math.max(0, r - pageRows), c });
        break;
      case "Enter":
      case "F2":
        if (r === -1) {
          if (col === "select") toggleAll();
          else if (col) cycleSort(col);
        } else if (col === "select") toggleRow(rowId(view[r]!));
        else startEdit(active);
        break;
      case " ":
        if (r === -1 && col === "select") toggleAll();
        else if (r === -1 && col && col !== "select") cycleSort(col);
        else if (r >= 0 && (col === "select" || e.shiftKey)) toggleRow(rowId(view[r]!));
        else handled = false;
        break;
      case "Delete":
      case "Backspace":
        if (r >= 0 && canEdit(col)) writeCell(r, col, isNumeric(col) ? null : "");
        else handled = false;
        break;
      default:
        handled = false;
        if (mod && e.key.toLowerCase() === "c" && r >= 0 && col && col !== "select") {
          void navigator.clipboard?.writeText(fmt(col, view[r]![col.key])).catch(() => {});
          handled = true;
        } else if (mod && e.key.toLowerCase() === "v" && r >= 0 && canEdit(col)) {
          void navigator.clipboard
            ?.readText()
            .then((text) => {
              const v = parseEdit(col, text.trim());
              if (v !== undefined) writeCell(r, col, v);
            })
            .catch(() => {});
          handled = true;
        } else if (!mod && !e.altKey && e.key.length === 1 && r >= 0 && canEdit(col)) {
          if (col.type === "select") startEdit(active);
          else startEdit(active, e.key);
          handled = true;
        }
    }
    if (handled) e.preventDefault();
  };

  /* ---- column resize (pointer) */
  const dragRef = useRef<{ key: string; x: number; w: number } | null>(null);
  const onResizeStart = (e: ReactPointerEvent, col: DataGridColumn<AnyRow>) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { key: col.key, x: e.clientX, w: colWidth(col) };
  };
  const onResizeMove = (e: ReactPointerEvent, col: DataGridColumn<AnyRow>) => {
    const d = dragRef.current;
    if (!d || d.key !== col.key) return;
    const delta = (e.clientX - d.x) * (direction === "rtl" ? -1 : 1);
    setWidths((w) => ({ ...w, [col.key]: Math.max(col.minWidth ?? 64, Math.round(d.w + delta)) }));
  };
  const onResizeEnd = () => {
    dragRef.current = null;
  };

  /* ---- cell chrome */
  const cellStyle = (navIndex: number): CSSProperties => {
    const col = navCols[navIndex]!;
    const w = col === "select" ? SELECT_W : colWidth(col);
    const sticky = navIndex < stickyCount;
    return {
      width: w,
      minWidth: w,
      ...(sticky ? { position: "sticky", insetInlineStart: stickyOffset(navIndex), zIndex: 2 } : null),
    };
  };
  const pinnedEdge = (navIndex: number) => navIndex === stickyCount - 1 && "border-e-line-strong";
  const alignOf = (col: DataGridColumn<AnyRow>) => col.align ?? (isNumeric(col) ? "end" : "start");
  const alignClass = { start: "justify-start text-start", center: "justify-center text-center", end: "justify-end text-end" } as const;

  const filteredCount = view.length;
  const total = rows.length;

  return (
    <div
      ref={ref}
      className={cx(card, "flex min-h-0 w-full flex-col overflow-hidden", height == null && "h-full", className)}
      style={height != null ? { height } : undefined}
    >
      {toolbar ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line px-3 py-2.5">
          {title ? <div className="me-1 min-w-0 truncate ps-1 text-body font-semibold text-fg">{title}</div> : null}
          <SearchField aria-label={t.search} placeholder={t.search} size="sm" value={search} onChange={setSearch} className="w-56 max-w-full" />
          <Button
            size="sm"
            variant={showFilters ? "soft" : "outline"}
            tone={showFilters ? "accent" : "neutral"}
            startIcon={<RiFilter3Line />}
            aria-pressed={showFilters}
            onPress={() => setShowFilters(!showFilters)}
          >
            {t.filters}
            {Object.values(filters).filter((v) => v.trim()).length ? (
              <span className="ms-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-micro text-fg-on-accent tabular-nums">
                {Object.values(filters).filter((v) => v.trim()).length}
              </span>
            ) : null}
          </Button>
          <div className="flex-1" />
          <span className="text-body-sm text-fg-subtle tabular-nums" aria-live="polite">
            {selected.size ? fill(t.selected, { count: selected.size }) + " · " : ""}
            {filteredCount === total ? fill(t.rows, { count: total }) : fill(t.rowsOf, { count: filteredCount, total })}
          </span>
          {selected.size ? (
            <Button size="sm" variant="plain" tone="neutral" onPress={() => setSelected(new Set())}>
              {t.clear}
            </Button>
          ) : null}
          {toolbarActions}
        </div>
      ) : null}

      <div
        ref={scrollRef}
        role="grid"
        aria-label={props["aria-label"] ?? (typeof title === "string" ? title : t.grid)}
        aria-rowcount={view.length + 1}
        aria-colcount={navCols.length}
        aria-multiselectable={selectable || undefined}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        onKeyDown={onGridKeyDown}
        onFocus={() => setHasFocus(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHasFocus(false);
        }}
        className="relative min-h-0 flex-1 overflow-auto overscroll-contain [scrollbar-width:thin]"
      >
        <div style={{ width: totalWidth, minWidth: "100%" }} className="flex min-h-full flex-col">
          {/* header + filters */}
          <div ref={headRef} role="rowgroup" className="sticky top-0 z-10 bg-surface-muted">
            <div role="row" aria-rowindex={1} className="flex border-b border-line" style={{ height: rowH }}>
              {navCols.map((col, ci) => {
                const isActive = active.r === -1 && active.c === ci;
                const common = {
                  id: cellId({ r: -1, c: ci }),
                  "data-dg-cell": "",
                  tabIndex: isActive ? 0 : -1,
                  "aria-colindex": ci + 1,
                  onFocus: () => {
                    if (!isActive) setActive({ r: -1, c: ci });
                  },
                };
                if (col === "select") {
                  return (
                    <div
                      key="select"
                      role="columnheader"
                      aria-label={t.selectAll}
                      {...common}
                      onClick={toggleAll}
                      className={cx(
                        "flex shrink-0 cursor-pointer items-center justify-center border-e border-line bg-surface-muted outline-none",
                        isActive && hasFocus && "outline-solid outline-2 -outline-offset-2 outline-accent-500",
                        pinnedEdge(ci),
                      )}
                      style={cellStyle(ci)}
                    >
                      <CheckboxIndicator size="sm" isSelected={allSelected} isIndeterminate={someSelected} />
                    </div>
                  );
                }
                const sorted = sort?.key === col.key ? sort.direction : null;
                return (
                  <div
                    key={col.key}
                    role="columnheader"
                    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : col.sortable === false ? undefined : "none"}
                    {...common}
                    onClick={() => cycleSort(col)}
                    className={cx(
                      "group/head relative flex shrink-0 select-none items-center gap-1 border-e border-line bg-surface-muted px-3 text-caption font-medium text-fg-muted outline-none",
                      isActive && hasFocus && "outline-solid outline-2 -outline-offset-2 outline-accent-500",
                      col.sortable !== false && "cursor-pointer hover:text-fg",
                      alignClass[alignOf(col)],
                      pinnedEdge(ci),
                    )}
                    style={cellStyle(ci)}
                  >
                    <span className="truncate">{col.header}</span>
                    {sorted ? (
                      sorted === "asc" ? (
                        <RiArrowUpLine aria-hidden className="size-3.5 shrink-0 text-fg-accent" />
                      ) : (
                        <RiArrowDownLine aria-hidden className="size-3.5 shrink-0 text-fg-accent" />
                      )
                    ) : null}
                    <span
                      aria-hidden
                      title={t.resize}
                      onPointerDown={(e) => onResizeStart(e, col)}
                      onPointerMove={(e) => onResizeMove(e, col)}
                      onPointerUp={onResizeEnd}
                      onPointerCancel={onResizeEnd}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setWidths((w) => {
                          const next = { ...w };
                          delete next[col.key];
                          return next;
                        });
                      }}
                      className="absolute inset-y-0 -end-1 z-[1] w-2 cursor-col-resize touch-none after:absolute after:inset-y-2 after:start-[3px] after:w-0.5 after:rounded-full after:bg-accent-500 after:opacity-0 after:transition-opacity hover:after:opacity-100"
                    />
                  </div>
                );
              })}
            </div>
            {showFilters ? (
              <div role="row" className="flex border-b border-line bg-surface">
                {navCols.map((col, ci) =>
                  col === "select" ? (
                    <div key="select" role="gridcell" className={cx("shrink-0 border-e border-line bg-surface", pinnedEdge(ci))} style={cellStyle(ci)} />
                  ) : (
                    <div key={col.key} role="gridcell" className={cx("shrink-0 border-e border-line bg-surface p-1", pinnedEdge(ci))} style={cellStyle(ci)}>
                      {col.filterable === false ? null : (
                        <div className={cx(fieldBox, controlSize.sm, "h-7 rounded-[8px] px-2 shadow-none")}>
                          <input
                            aria-label={`${t.filters}: ${col.header}`}
                            placeholder={isNumeric(col) ? t.numberFilter : t.filter}
                            value={filters[col.key] ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFilters((f) => ({ ...f, [col.key]: value }));
                            }}
                            className={cx(fieldInput, "h-full text-body-sm")}
                          />
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            ) : null}
          </div>

          {/* body */}
          <div role="rowgroup" className="relative flex-1">
            <div aria-hidden style={{ height: first * rowH }} />
            {visibleRows.map((row, i) => {
              const r = first + i;
              const id = rowId(row);
              const isSelected = selected.has(id);
              return (
                <div
                  key={id}
                  role="row"
                  aria-rowindex={r + 2}
                  aria-selected={selectable ? isSelected : undefined}
                  className="group/row flex"
                  style={{ height: rowH }}
                >
                  {navCols.map((col, ci) => {
                    const pos = { r, c: ci };
                    const isActive = active.r === r && active.c === ci;
                    const isEditing = editing?.r === r && editing.c === ci;
                    const base = cx(
                      "relative flex shrink-0 items-center border-e border-b border-line text-body outline-none",
                      isActive && hasFocus && "z-[3] outline-solid outline-2 -outline-offset-2 outline-accent-500",
                      isSelected ? "bg-accent-50" : "bg-surface group-hover/row:bg-surface-hover",
                      pinnedEdge(ci),
                    );
                    const common = {
                      id: cellId(pos),
                      "data-dg-cell": "",
                      role: "gridcell",
                      "aria-colindex": ci + 1,
                      tabIndex: isActive && !isEditing ? 0 : -1,
                      onFocus: () => {
                        if (!isActive) setActive(pos);
                      },
                      onMouseDown: () => {
                        if (editing && !isEditing) commitEdit(pos);
                      },
                    };
                    if (col === "select") {
                      return (
                        <div
                          key="select"
                          {...common}
                          aria-label={t.selectRow}
                          onClick={() => toggleRow(id)}
                          className={cx(base, "cursor-pointer justify-center")}
                          style={cellStyle(ci)}
                        >
                          <CheckboxIndicator size="sm" isSelected={isSelected} />
                        </div>
                      );
                    }
                    const value = row[col.key];
                    const option = col.type === "select" ? col.options?.find((o) => o.id === value) : undefined;
                    const content = col.render ? (
                      col.render(value, row)
                    ) : option ? (
                      <Badge size="sm" tone={option.tone ?? "neutral"}>
                        {option.label}
                      </Badge>
                    ) : (
                      <span className={cx("truncate", isNumeric(col) && "tabular-nums", col.type === "date" && "text-fg-muted tabular-nums")}>
                        {fmt(col, value)}
                      </span>
                    );
                    return (
                      <div
                        key={col.key}
                        {...common}
                        aria-readonly={!canEdit(col) || undefined}
                        onDoubleClick={() => startEdit(pos)}
                        className={cx(base, "px-3 text-fg", alignClass[alignOf(col)], canEdit(col) && "cursor-cell")}
                        style={cellStyle(ci)}
                      >
                        {isEditing ? (
                          <CellEditor
                            col={col}
                            draft={editing.draft}
                            align={alignOf(col)}
                            onDraft={(draft) => setEditing((e) => (e ? { ...e, draft } : e))}
                            onCommit={(dir) => {
                              if (dir === "down") commitEdit({ r: r + 1, c: ci });
                              else if (dir === "up") commitEdit({ r: r - 1, c: ci });
                              else if (dir === "next") commitEdit({ r, c: ci + 1 });
                              else if (dir === "prev") commitEdit({ r, c: ci - 1 });
                              else commitEdit();
                            }}
                            onSelectValue={(v) => {
                              writeCell(r, col, v);
                              setEditing(null);
                              moveTo(pos);
                            }}
                            onCancel={cancelEdit}
                          />
                        ) : (
                          content
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div aria-hidden style={{ height: Math.max(0, view.length - last) * rowH }} />
            {view.length === 0 ? (
              <div className="sticky start-0 flex flex-col items-center gap-1.5 px-6 py-14 text-center" style={{ width: viewportW }}>
                {emptyState ?? (
                  <>
                    <RiTableLine aria-hidden className="mb-1 size-6 text-fg-subtle" />
                    <p className="text-body font-medium text-fg">{t.empty}</p>
                    <p className="text-body-sm text-fg-subtle">{t.emptyHint}</p>
                  </>
                )}
              </div>
            ) : null}
          </div>

          {/* footer */}
          {showFooter ? (
            <div ref={footRef} role="row" className="sticky bottom-0 z-10 flex border-t border-line bg-surface-muted" style={{ minHeight: rowH }}>
              {navCols.map((col, ci) => {
                if (col === "select")
                  return (
                    <div key="select" role="gridcell" className={cx("shrink-0 border-e border-line bg-surface-muted", pinnedEdge(ci))} style={cellStyle(ci)} />
                  );
                const summary = col.summary;
                let node: ReactNode = null;
                if (typeof summary === "function")
                  node = summary(
                    view.map((r) => r[col.key]),
                    view,
                  );
                else if (summary) {
                  const v = aggregate(
                    summary,
                    view.map((r) => r[col.key]),
                  );
                  const text = v == null ? "—" : summary === "count" ? new Intl.NumberFormat(locale).format(v) : fmt(col, v);
                  node = (
                    <>
                      <span className="shrink-0 whitespace-nowrap text-micro font-medium uppercase tracking-wide text-fg-subtle">{t[summary]}</span>
                      <span className="min-w-0 truncate font-semibold text-fg tabular-nums" title={text}>
                        {text}
                      </span>
                    </>
                  );
                }
                return (
                  <div
                    key={col.key}
                    role="gridcell"
                    className={cx(
                      "flex shrink-0 items-center gap-1.5 border-e border-line bg-surface-muted px-3 text-body-sm",
                      alignClass[alignOf(col)],
                      pinnedEdge(ci),
                    )}
                    style={cellStyle(ci)}
                  >
                    {node}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- editor */

function CellEditor({
  col,
  draft,
  align,
  onDraft,
  onCommit,
  onSelectValue,
  onCancel,
}: {
  col: DataGridColumn<AnyRow>;
  draft: string;
  align: "start" | "center" | "end";
  onDraft: (v: string) => void;
  onCommit: (dir?: "down" | "up" | "next" | "prev") => void;
  onSelectValue: (v: unknown) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    // Typing to start editing keeps the caret at the end; Enter / F2 selects the value.
    if (draft.length > 1) el.select();
    else el.setSelectionRange(draft.length, draft.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (col.type === "select") {
    return (
      <Select
        aria-label={col.header}
        defaultOpen
        autoFocus
        size="sm"
        selectedKey={draft || null}
        onSelectionChange={(k) => {
          done.current = true;
          onSelectValue(k == null ? null : String(k));
        }}
        onOpenChange={(open) => {
          if (!open) window.setTimeout(() => !done.current && onCancel(), 0);
        }}
        className="absolute inset-0 z-[4]"
        triggerClassName="h-full rounded-none border-0 shadow-none ring-2 ring-inset ring-accent-500"
      >
        {(col.options ?? []).map((o) => (
          <SelectItem key={o.id} id={o.id}>
            {o.label}
          </SelectItem>
        ))}
      </Select>
    );
  }

  return (
    <input
      ref={inputRef}
      aria-label={col.header}
      value={draft}
      inputMode={col.type === "number" || col.type === "currency" || col.type === "percent" ? "decimal" : undefined}
      type={col.type === "date" ? "date" : "text"}
      onChange={(e) => onDraft(e.target.value)}
      onBlur={() => {
        if (!done.current) {
          done.current = true;
          onCommit();
        }
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        const finish = (dir?: "down" | "up" | "next" | "prev") => {
          e.preventDefault();
          done.current = true;
          onCommit(dir);
        };
        if (e.key === "Enter") finish(e.shiftKey ? "up" : "down");
        else if (e.key === "Tab") finish(e.shiftKey ? "prev" : "next");
        else if (e.key === "Escape") {
          e.preventDefault();
          done.current = true;
          onCancel();
        }
      }}
      className={cx(
        "absolute inset-0 z-[4] w-full bg-surface px-3 text-body text-fg outline-none ring-2 ring-inset ring-accent-500",
        col.type !== "text" && "tabular-nums",
        align === "end" ? "text-end" : align === "center" ? "text-center" : "text-start",
      )}
    />
  );
}
