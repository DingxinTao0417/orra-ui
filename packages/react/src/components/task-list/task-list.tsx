"use client";

import { useRef, useState } from "react";
import type { CSSProperties, ReactNode, Ref } from "react";
import { Button as AriaButton } from "react-aria-components";
import { RiCloseLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { ChevronGlyph } from "../../lib/glyphs";
import { focusRing } from "../../lib/recipes";

const COPY = {
  en: { tasks: "Tasks", count: "{done}/{total}", completed: "Completed {n} tasks", completedOne: "Completed 1 task", pending: "To do", working: "In progress", done: "Done", failed: "Failed", show: "Show tasks", hide: "Hide tasks" },
  zh: { tasks: "任务", count: "{done}/{total}", completed: "已完成 {n} 项任务", completedOne: "已完成 1 项任务", pending: "待处理", working: "进行中", done: "已完成", failed: "失败", show: "展开任务", hide: "收起任务" },
};
export type TaskListLabels = (typeof COPY)["en"];

export type TaskStatus = "pending" | "working" | "done" | "failed";

export interface TaskListItem {
  id: string;
  label: ReactNode;
  /** Small text under the label (a file, a result). */
  detail?: ReactNode;
  /** Default `pending`. */
  status?: TaskStatus;
}

export interface TaskListProps {
  items: TaskListItem[];
  /** Optional heading above the list. */
  title?: ReactNode;
  /** Show the "done/total" count next to the title (default true). */
  showCount?: boolean;
  /** Stagger the rows in when the list first mounts (default true). Rows added later rise in on their own. */
  reveal?: boolean;
  /** Delay between rows for the first reveal, in ms (default 90). */
  revealStagger?: number;
  /** Fold into a one-line "Completed n tasks" summary once every task is done. */
  collapseOnComplete?: boolean;
  labels?: Partial<TaskListLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

function TaskMark({ status }: { status: TaskStatus }) {
  const base = "relative mt-px flex size-[18px] shrink-0 items-center justify-center rounded-full transition-[background-color,border-color,color] duration-300 ease-out-soft";
  if (status === "failed") {
    return (
      <span className={cx(base, "bg-danger text-fg-on-accent")}>
        <RiCloseLine className="size-3" />
      </span>
    );
  }
  if (status === "working") {
    return (
      <span className={cx(base, "text-accent-500")}>
        <svg viewBox="0 0 18 18" fill="none" aria-hidden className="absolute inset-0 size-full motion-safe:animate-spin motion-safe:[animation-duration:0.9s]">
          <circle cx="9" cy="9" r="7.75" stroke="currentColor" strokeOpacity=".2" strokeWidth="1.5" />
          <path d="M9 1.25A7.75 7.75 0 0 1 16.75 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  const done = status === "done";
  return (
    <span className={cx(base, done ? "bg-accent-gradient text-fg-on-accent" : "border-[1.5px] border-line-strong")}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-3">
        <path
          d="M3.5 8.4 6.6 11.4 12.5 4.8"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={done ? 0 : 1}
          className="transition-[stroke-dashoffset] delay-100 duration-300 ease-out-soft"
        />
      </svg>
    </span>
  );
}

/**
 * A streaming checklist for agent work: tasks rise in one by one, the current
 * one shimmers while it runs, finished ones get a drawn check, and the list
 * can fold into a one-line summary once everything is done.
 *
 *   <TaskList items={tasks} collapseOnComplete />
 */
export function TaskList({ items, title, showCount = true, reveal = true, revealStagger = 90, collapseOnComplete, labels, className, ref }: TaskListProps) {
  const t = useCopy(COPY, labels);
  const initial = useRef<Map<string, number> | null>(null);
  if (initial.current === null) initial.current = new Map(items.map((item, i) => [item.id, i]));
  const [expanded, setExpanded] = useState(false);

  const total = items.length;
  const done = items.filter((i) => i.status === "done").length;
  const complete = total > 0 && done === total;
  const collapsed = !!collapseOnComplete && complete && !expanded;
  const statusText: Record<TaskStatus, string> = { pending: t.pending, working: t.working, done: t.done, failed: t.failed };

  return (
    <div ref={ref} className={cx("flex w-full flex-col gap-2", className)}>
      {title != null || (collapseOnComplete && complete) ? (
        <div className="flex min-h-6 items-center gap-2">
          {collapseOnComplete && complete ? (
            <AriaButton
              aria-expanded={!collapsed}
              onPress={() => setExpanded((v) => !v)}
              className={cx(
                "-ms-1.5 inline-flex cursor-default items-center gap-2 rounded-control py-0.5 ps-1.5 pe-2 text-body-sm font-medium text-fg-muted transition-colors duration-150 data-[hovered]:bg-surface-hover",
                focusRing,
              )}
            >
              <TaskMark status="done" />
              <span>{title != null && !collapsed ? title : total === 1 ? t.completedOne : fill(t.completed, { n: total })}</span>
              <ChevronGlyph className={cx("size-3.5 text-fg-subtle transition-transform duration-200 ease-out-soft", !collapsed && "rotate-180")} />
              <span className="sr-only">{collapsed ? t.show : t.hide}</span>
            </AriaButton>
          ) : (
            <span className="text-body-sm font-medium text-fg">{title}</span>
          )}
          {showCount && !collapsed && total > 0 ? (
            <span className="text-caption text-fg-subtle tabular-nums">{fill(t.count, { done, total })}</span>
          ) : null}
        </div>
      ) : null}
      {collapsed ? null : (
        <ul aria-label={typeof title === "string" ? title : t.tasks} className="flex flex-col gap-2.5">
          {items.map((item) => {
            const status = item.status ?? "pending";
            const order = initial.current?.get(item.id);
            const style: CSSProperties | undefined = reveal && order != null ? { animationDelay: `${order * revealStagger}ms` } : undefined;
            return (
              <li key={item.id} className={cx("flex items-start gap-2.5", (reveal || order == null) && "motion-safe:animate-rise")} style={style}>
                <TaskMark status={status} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={cx(
                      "text-body-sm transition-colors duration-300",
                      status === "done" && "text-fg-muted line-through decoration-line-strong",
                      status === "working" && "font-medium text-fg-muted motion-safe:text-shimmer",
                      status === "pending" && "text-fg-subtle",
                      status === "failed" && "text-danger",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="sr-only">{statusText[status]}</span>
                  {item.detail != null ? <span className="text-caption text-fg-subtle">{item.detail}</span> : null}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
