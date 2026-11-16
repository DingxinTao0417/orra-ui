"use client";

import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  RiArrowDownLine,
  RiArrowUpDoubleLine,
  RiArrowUpLine,
  RiAttachment2,
  RiCalendarLine,
  RiChat3Line,
  RiCheckboxLine,
  RiDraggable,
  RiSubtractLine,
} from "@remixicon/react";
import { Avatar, AvatarGroup, Badge } from "@orra-ui/react";
import { cx } from "@orra-ui/react/lib/cx";
import { LABELS, MEMBERS, PRIORITIES, type Priority, type Task } from "./board-data";

export const PRIORITY_ICON: Record<Priority, { icon: ReactNode; className: string }> = {
  urgent: { icon: <RiArrowUpDoubleLine />, className: "text-danger" },
  high: { icon: <RiArrowUpLine />, className: "text-warning" },
  medium: { icon: <RiSubtractLine />, className: "text-info" },
  low: { icon: <RiArrowDownLine />, className: "text-fg-subtle" },
};

export const labelOf = (id: string) => LABELS.find((l) => l.id === id);
export const memberOf = (id: string) => MEMBERS.find((m) => m.id === id);
export const priorityLabel = (p: Priority) => PRIORITIES.find((x) => x.id === p)?.label ?? p;

interface CardViewProps {
  task: Task;
  onOpen?: () => void;
  /** Props for the keyboard drag handle. */
  handleProps?: HTMLAttributes<HTMLButtonElement> & { ref?: Ref<HTMLButtonElement> };
  overlay?: boolean;
  dragging?: boolean;
}

export function CardView({ task, onOpen, handleProps, overlay, dragging }: CardViewProps) {
  const done = task.checklist.filter((c) => c.done).length;
  const total = task.checklist.length;
  const pr = PRIORITY_ICON[task.priority];
  return (
    <article
      className={cx(
        "group relative flex flex-col gap-2.5 rounded-menu border border-line bg-surface p-3.5 shadow-xs transition-[box-shadow,border-color,opacity] duration-150",
        "hover:border-line-hover hover:shadow-card",
        overlay && "cursor-grabbing border-line-hover shadow-raised",
        dragging && "opacity-40",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-caption tabular-nums text-fg-subtle">{task.code}</span>
        <span className={cx("flex items-center [&>svg]:size-3.5", pr.className)} title={`优先级：${priorityLabel(task.priority)}`}>
          {pr.icon}
          <span className="sr-only">优先级：{priorityLabel(task.priority)}</span>
        </span>
        <button
          type="button"
          aria-label={`拖动「${task.title}」`}
          {...handleProps}
          className={cx(
            "relative z-10 ms-auto -me-1.5 -mt-1 flex size-6 cursor-grab items-center justify-center rounded-[6px] text-fg-subtle opacity-0 transition-opacity duration-150",
            "group-hover:opacity-100 hover:bg-surface-hover focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent-500",
            overlay && "opacity-100",
          )}
        >
          <RiDraggable className="size-4" aria-hidden />
        </button>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="text-start text-body-sm font-medium text-fg outline-none after:absolute after:inset-0 after:rounded-menu after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-accent-500"
      >
        {task.title}
      </button>
      {task.labels.length ? (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((id) => {
            const l = labelOf(id);
            return l ? (
              <Badge key={id} size="sm" tone={l.tone}>
                {l.label}
              </Badge>
            ) : null;
          })}
        </div>
      ) : null}
      <div className="flex items-center gap-2.5 whitespace-nowrap text-caption text-fg-subtle">
        {task.due ? (
          <span className="flex items-center gap-1">
            <RiCalendarLine className="size-3.5" aria-hidden />
            {task.due}
          </span>
        ) : null}
        {total ? (
          <span className={cx("flex items-center gap-1 tabular-nums", done === total && "text-success")}>
            <RiCheckboxLine className="size-3.5" aria-hidden />
            {done}/{total}
          </span>
        ) : null}
        {task.comments.length ? (
          <span className="flex items-center gap-1 tabular-nums">
            <RiChat3Line className="size-3.5" aria-hidden />
            {task.comments.length}
          </span>
        ) : null}
        {task.attachments ? (
          <span className="flex items-center gap-1 tabular-nums">
            <RiAttachment2 className="size-3.5" aria-hidden />
            {task.attachments}
          </span>
        ) : null}
        <span className="ms-auto">
          <AvatarGroup size="xs" max={3}>
            {task.assignees.map((id) => (
              <Avatar key={id} name={memberOf(id)?.name ?? id} />
            ))}
          </AvatarGroup>
        </span>
      </div>
    </article>
  );
}

export function SortableCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const { onKeyDown, ...pointerListeners } = listeners ?? {};
  const style: CSSProperties = { transform: CSS.Translate.toString(transform), transition };
  return (
    <li ref={setNodeRef} style={style} {...pointerListeners} className="touch-manipulation list-none">
      <CardView
        task={task}
        onOpen={onOpen}
        dragging={isDragging}
        handleProps={{ ...(attributes as HTMLAttributes<HTMLButtonElement>), onKeyDown: onKeyDown as HTMLAttributes<HTMLButtonElement>["onKeyDown"], ref: setActivatorNodeRef }}
      />
    </li>
  );
}
