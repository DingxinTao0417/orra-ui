"use client";

import { createContext, useContext } from "react";
import type { CSSProperties, ReactNode, Ref } from "react";
import {
  Cell as AriaCell,
  Checkbox as AriaCheckbox,
  Collection,
  Column as AriaColumn,
  Row as AriaRow,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
  useTableOptions,
} from "react-aria-components";
import type {
  CellProps as AriaCellProps,
  ColumnProps as AriaColumnProps,
  RowProps as AriaRowProps,
  TableBodyProps as AriaTableBodyProps,
  TableHeaderProps as AriaTableHeaderProps,
  TableProps as AriaTableProps,
} from "react-aria-components";
import { RiArrowDownSLine, RiArrowUpSLine, RiExpandUpDownLine, RiInboxLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { CheckGlyph } from "../../lib/glyphs";
import { Avatar, type AvatarStatus } from "../avatar/avatar";
import { Badge, type BadgeTone } from "../badge/badge";

const COPY = {
  en: { emptyTitle: "No data yet", emptyDescription: "Records will appear here once they are created." },
  zh: { emptyTitle: "暂无数据", emptyDescription: "创建记录后会显示在这里。" },
};
export type TableLabels = (typeof COPY)["en"];

export type TableDensity = "comfortable" | "compact";
export type TableAlign = "start" | "center" | "end";

const TableStyleContext = createContext<{ density: TableDensity }>({ density: "comfortable" });

const ALIGN: Record<TableAlign, string> = { start: "text-start", center: "text-center", end: "text-end" };
const JUSTIFY: Record<TableAlign, string> = { start: "justify-start", center: "justify-center", end: "justify-end" };
const CELL_PAD: Record<TableDensity, string> = { comfortable: "px-4 py-3", compact: "px-3 py-1.5" };
const HEAD_PAD: Record<TableDensity, string> = { comfortable: "h-10 px-4", compact: "h-8 px-3" };

/* -------------------------------------------------------------- table */

export interface TableProps extends Omit<AriaTableProps, "className" | "style"> {
  /** Row height: comfortable (default) or compact. */
  density?: TableDensity;
  /** Keep the header visible while the body scrolls (set `maxHeight`). */
  stickyHeader?: boolean;
  /** Max height of the scroll area (number = px). */
  maxHeight?: number | string;
  /** `card` (default): bordered card surface. `plain`: no outer frame, for use inside an existing card. */
  variant?: "card" | "plain";
  /** Zebra striping for dense numeric tables. */
  striped?: boolean;
  className?: string;
  /** Classes for the inner <table>. */
  tableClassName?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLTableElement>;
}

/**
 * Data table on React Aria's Table: sortable columns, row selection with
 * checkboxes, sticky header, density and per-column alignment.
 *
 *   <Table aria-label="团队成员" selectionMode="multiple">
 *     <TableHeader>
 *       <TableColumn isRowHeader>成员</TableColumn>
 *       <TableColumn align="end">席位费</TableColumn>
 *     </TableHeader>
 *     <TableBody items={rows}>{(row) => <TableRow>…</TableRow>}</TableBody>
 *   </Table>
 */
export function Table({
  density = "comfortable",
  stickyHeader = false,
  maxHeight,
  variant = "card",
  striped = false,
  className,
  tableClassName,
  style,
  ref,
  ...props
}: TableProps) {
  return (
    <TableStyleContext.Provider value={{ density }}>
      <div
        data-sticky={stickyHeader || undefined}
        data-striped={striped || undefined}
        style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight, ...style }}
        className={cx(
          "group/table relative w-full overflow-auto",
          variant === "card" && "rounded-card border border-line bg-surface shadow-card",
          className,
        )}
      >
        <AriaTable
          {...props}
          ref={ref}
          className={cx("w-full border-separate border-spacing-0 text-body-sm text-fg outline-none", tableClassName)}
        />
      </div>
    </TableStyleContext.Provider>
  );
}

/* ------------------------------------------------------------- header */

export interface TableHeaderProps<T extends object> extends Omit<AriaTableHeaderProps<T>, "className"> {
  className?: string;
}

/** Header row. Adds the "select all" checkbox automatically when the table has multiple selection. */
export function TableHeader<T extends object>({ columns, children, className, ...props }: TableHeaderProps<T>) {
  const { selectionBehavior, selectionMode } = useTableOptions();
  const { density } = useContext(TableStyleContext);
  return (
    <AriaTableHeader {...props} className={cx("text-caption font-medium text-fg-subtle", className)}>
      {selectionBehavior === "toggle" ? (
        <AriaColumn className={cx(headCell(density), "w-10 pe-0")}>
          {selectionMode === "multiple" ? <TableCheckbox /> : null}
        </AriaColumn>
      ) : null}
      <Collection items={columns}>{children}</Collection>
    </AriaTableHeader>
  );
}

function headCell(density: TableDensity) {
  return cx(
    "border-b border-line bg-surface-muted/70 text-start font-medium whitespace-nowrap outline-none",
    "group-data-[sticky]/table:sticky group-data-[sticky]/table:top-0 group-data-[sticky]/table:z-10 group-data-[sticky]/table:bg-surface-muted",
    "data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-focus",
    HEAD_PAD[density],
  );
}

export interface TableColumnProps extends Omit<AriaColumnProps, "className" | "children"> {
  /** Horizontal alignment of the header (match it on the cells). */
  align?: TableAlign;
  children?: ReactNode;
  className?: string;
}

/** A column header. `allowsSorting` adds a sort indicator; the table's `sortDescriptor` / `onSortChange` drive it. */
export function TableColumn({ align = "start", children, className, ...props }: TableColumnProps) {
  const { density } = useContext(TableStyleContext);
  return (
    <AriaColumn {...props} className={cx(headCell(density), ALIGN[align], "data-[allows-sorting]:cursor-default", className)}>
      {({ allowsSorting, sortDirection }) => (
        <span className={cx("group/col inline-flex w-full items-center gap-1", JUSTIFY[align])}>
          <span className={cx("truncate", sortDirection && "text-fg")}>{children}</span>
          {allowsSorting ? (
            <span aria-hidden className={cx("inline-flex size-3.5 shrink-0 [&>svg]:size-full", sortDirection ? "text-fg" : "text-fg-disabled group-hover/col:text-fg-subtle")}>
              {sortDirection === "ascending" ? <RiArrowUpSLine /> : sortDirection === "descending" ? <RiArrowDownSLine /> : <RiExpandUpDownLine />}
            </span>
          ) : null}
        </span>
      )}
    </AriaColumn>
  );
}

/* --------------------------------------------------------------- body */

export interface TableBodyProps<T extends object> extends Omit<AriaTableBodyProps<T>, "className"> {
  className?: string;
}

/** Table body. Use `renderEmptyState={() => <TableEmptyState />}` for the empty case. */
export function TableBody<T extends object>({ className, ...props }: TableBodyProps<T>) {
  return <AriaTableBody {...props} className={cx("[&>tr:last-child>td]:border-b-0", className)} />;
}

export interface TableRowProps<T extends object> extends Omit<AriaRowProps<T>, "className"> {
  className?: string;
}

/** A body row. Adds the selection checkbox cell when the table has selection. */
export function TableRow<T extends object>({ id, columns, children, className, ...props }: TableRowProps<T>) {
  const { selectionBehavior } = useTableOptions();
  const { density } = useContext(TableStyleContext);
  return (
    <AriaRow
      id={id}
      {...props}
      className={cx(
        "group/row outline-none transition-colors duration-150",
        "group-data-[striped]/table:even:bg-surface-muted/50",
        "data-[hovered]:bg-surface-hover data-[selected]:bg-accent-50/70 data-[selected]:data-[hovered]:bg-accent-50",
        "data-[href]:cursor-pointer data-[disabled]:text-fg-disabled",
        "data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-focus",
        className,
      )}
    >
      {selectionBehavior === "toggle" ? (
        <AriaCell className={cx(bodyCell(density), "w-10 pe-0")}>
          <TableCheckbox />
        </AriaCell>
      ) : null}
      <Collection items={columns}>{children}</Collection>
    </AriaRow>
  );
}

function bodyCell(density: TableDensity) {
  return cx(
    "border-b border-line align-middle outline-none",
    "data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-focus",
    CELL_PAD[density],
  );
}

export interface TableCellProps extends Omit<AriaCellProps, "className"> {
  align?: TableAlign;
  /** Muted secondary text colour. */
  muted?: boolean;
  /** Tabular figures for numeric columns. */
  numeric?: boolean;
  className?: string;
}

export function TableCell({ align = "start", muted, numeric, className, ...props }: TableCellProps) {
  const { density } = useContext(TableStyleContext);
  return <AriaCell {...props} className={cx(bodyCell(density), ALIGN[align], muted && "text-fg-muted", numeric && "tabular-nums", className)} />;
}

/* ----------------------------------------------------------- checkbox */

function TableCheckbox() {
  return (
    <AriaCheckbox slot="selection" className="group/check flex size-5 cursor-default items-center justify-center outline-none">
      {({ isSelected, isIndeterminate }) => (
        <span
          className={cx(
            "flex size-4 items-center justify-center rounded-[5px] border transition-[background-color,border-color] duration-150",
            "group-data-[focus-visible]/check:focus-ring",
            isSelected || isIndeterminate
              ? "border-transparent bg-accent-500 text-fg-on-accent"
              : "border-line-strong bg-surface group-data-[hovered]/check:border-line-hover",
          )}
        >
          {isIndeterminate ? <span className="h-0.5 w-2 rounded-full bg-current" /> : isSelected ? <CheckGlyph className="size-3" /> : null}
        </span>
      )}
    </AriaCheckbox>
  );
}

/* ------------------------------------------------------- cell helpers */

export interface TableUserProps {
  name: string;
  /** Secondary line: email, handle or title. */
  description?: ReactNode;
  /** Avatar image URL (initials are shown without it). */
  src?: string;
  status?: AvatarStatus;
  className?: string;
}

/** Avatar + name + secondary line, for "person" cells. */
export function TableUser({ name, description, src, status, className }: TableUserProps) {
  const { density } = useContext(TableStyleContext);
  return (
    <span className={cx("flex min-w-0 items-center gap-3", className)}>
      <Avatar name={name} src={src} status={status} size={density === "compact" ? "xs" : "sm"} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium text-fg">{name}</span>
        {description != null && density === "comfortable" ? <span className="truncate text-caption text-fg-subtle">{description}</span> : null}
      </span>
    </span>
  );
}

export interface TableStatusProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/** Status badge with a dot, sized for table rows. */
export function TableStatus({ tone = "neutral", children, className }: TableStatusProps) {
  return (
    <Badge tone={tone} dot size="sm" className={className}>
      {children}
    </Badge>
  );
}

export interface TableEmptyStateProps {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** e.g. a "新建" button. */
  action?: ReactNode;
  labels?: Partial<TableLabels>;
  className?: string;
}

/** Centered empty state for `TableBody renderEmptyState`. */
export function TableEmptyState({ icon, title, description, action, labels, className }: TableEmptyStateProps) {
  const t = useCopy(COPY, labels);
  return (
    <div className={cx("flex flex-col items-center gap-2 px-6 py-12 text-center", className)}>
      <span aria-hidden className="mb-1 flex size-10 items-center justify-center rounded-full bg-surface-muted text-fg-subtle [&>svg]:size-5">
        {icon ?? <RiInboxLine />}
      </span>
      <span className="text-body font-medium text-fg">{title ?? t.emptyTitle}</span>
      <span className="max-w-xs text-body-sm text-fg-subtle">{description ?? t.emptyDescription}</span>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
