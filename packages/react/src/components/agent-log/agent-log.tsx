"use client";

import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Disclosure, DisclosureGroup, DisclosurePanel, useLocale } from "react-aria-components";
import type { Key } from "react-aria-components";
import {
  RiBrain2Line,
  RiChat3Line,
  RiCloseLine,
  RiEditLine,
  RiFileTextLine,
  RiGlobalLine,
  RiSearch2Line,
  RiTerminalBoxLine,
  RiToolsLine,
} from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { ChevronGlyph } from "../../lib/glyphs";
import { formatAgentDuration, useAgentElapsed } from "../agent-thinking/use-agent-elapsed";

const COPY = {
  en: { log: "Agent activity", working: "Working…", seconds: "{s}s", minutes: "{m}m {s}s", running: "In progress", failed: "Failed", pending: "Queued", details: "Details" },
  zh: { log: "智能体运行记录", working: "正在处理…", seconds: "{s} 秒", minutes: "{m} 分 {s} 秒", running: "进行中", failed: "失败", pending: "排队中", details: "详情" },
};
export type AgentLogLabels = (typeof COPY)["en"];

export type AgentLogKind = "tool" | "edit" | "read" | "search" | "web" | "command" | "message" | "think";
export type AgentLogStatus = "pending" | "running" | "done" | "error";

export interface AgentLogItem {
  id: string;
  /** What kind of step this is; picks the icon. Default `tool`. */
  kind?: AgentLogKind;
  /** One-line summary, e.g. "编辑 LoginForm.tsx". */
  title: ReactNode;
  /** Secondary text on the same line: a path, a diff stat, a result count. */
  meta?: ReactNode;
  /** Collapsible body: tool output, a diff, a message. */
  detail?: ReactNode;
  /** Default `done`. */
  status?: AgentLogStatus;
  /** When the step happened. Rendered as a local time (hh:mm:ss). */
  time?: Date | number;
  /** Icon element overriding the kind's icon. */
  icon?: ReactNode;
}

const KIND_ICON: Record<AgentLogKind, ReactNode> = {
  tool: <RiToolsLine />,
  edit: <RiEditLine />,
  read: <RiFileTextLine />,
  search: <RiSearch2Line />,
  web: <RiGlobalLine />,
  command: <RiTerminalBoxLine />,
  message: <RiChat3Line />,
  think: <RiBrain2Line />,
};

export interface AgentLogProps {
  items: AgentLogItem[];
  /** Show a live "working" row at the end (with an elapsed timer). */
  working?: boolean;
  /** Replace the "Working…" text of the live row. */
  workingLabel?: ReactNode;
  /** Show timestamps (default true when any item has `time`). */
  showTime?: boolean;
  /** Ids of items whose details are open (controlled). */
  expandedKeys?: Iterable<Key>;
  defaultExpandedKeys?: Iterable<Key>;
  onExpandedChange?: (keys: Set<Key>) => void;
  /** Tighter rows. */
  dense?: boolean;
  "aria-label"?: string;
  labels?: Partial<AgentLogLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Vertical activity log of an agent run: tool calls, file edits, searches and
 * messages on a timeline, each with a status, an optional timestamp and
 * collapsible details, plus a live "working" row while the run continues.
 *
 *   <AgentLog items={steps} working={running} />
 */
export function AgentLog({
  items,
  working,
  workingLabel,
  showTime,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  dense,
  "aria-label": ariaLabel,
  labels,
  className,
  ref,
}: AgentLogProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const withTime = showTime ?? items.some((i) => i.time != null);
  const timeFmt = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <DisclosureGroup
      ref={ref}
      allowsMultipleExpanded
      expandedKeys={expandedKeys}
      defaultExpandedKeys={defaultExpandedKeys}
      onExpandedChange={onExpandedChange}
      className={cx("w-full", className)}
    >
      <ol aria-label={ariaLabel ?? t.log} className="flex flex-col">
        {items.map((item, index) => (
          <LogRow
            key={item.id}
            item={item}
            last={index === items.length - 1 && !working}
            dense={dense}
            time={withTime && item.time != null ? timeFmt.format(item.time) : null}
            t={t}
          />
        ))}
        {working ? <WorkingRow label={workingLabel ?? t.working} dense={dense} t={t} /> : null}
      </ol>
    </DisclosureGroup>
  );
}

const NODE = "relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full [&_svg]:size-3.5";

function StatusNode({ item }: { item: AgentLogItem }) {
  const status = item.status ?? "done";
  const icon = item.icon ?? KIND_ICON[item.kind ?? "tool"];
  if (status === "error") {
    return (
      <span className={cx(NODE, "bg-danger-soft text-danger")}>
        <RiCloseLine />
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className={cx(NODE, "bg-accent-50 text-fg-accent")}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="absolute inset-0 !size-full motion-safe:animate-spin motion-safe:[animation-duration:1.2s]">
          <circle cx="12" cy="12" r="11" stroke="currentColor" strokeOpacity=".18" strokeWidth="1.5" />
          <path d="M12 1a11 11 0 0 1 11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {icon}
      </span>
    );
  }
  if (status === "pending") {
    return <span className={cx(NODE, "border border-dashed border-line-strong bg-surface text-fg-disabled")}>{icon}</span>;
  }
  return <span className={cx(NODE, "border border-line bg-surface text-fg-muted shadow-xs")}>{icon}</span>;
}

function Rail({ last }: { last: boolean }) {
  return last ? null : <span aria-hidden className="absolute start-3 top-7 bottom-0 w-px -translate-x-1/2 bg-line rtl:translate-x-1/2" />;
}

function RowText({ item, time, t }: { item: AgentLogItem; time: string | null; t: AgentLogLabels }) {
  const status = item.status ?? "done";
  return (
    <>
      <span className="flex min-w-0 flex-1 items-baseline gap-2">
        <span
          className={cx(
            "min-w-0 shrink truncate text-body-sm",
            status === "running" ? "font-medium text-fg-muted motion-safe:text-shimmer" : status === "pending" ? "text-fg-subtle" : "font-medium text-fg",
          )}
        >
          {item.title}
        </span>
        {item.meta != null ? (
          <span className={cx("min-w-0 truncate text-caption", status === "error" ? "text-danger" : "text-fg-subtle")}>{item.meta}</span>
        ) : null}
        {status === "error" || status === "running" || status === "pending" ? (
          <span className="sr-only">{status === "error" ? t.failed : status === "running" ? t.running : t.pending}</span>
        ) : null}
      </span>
      {time ? (
        <time suppressHydrationWarning className="shrink-0 text-caption text-fg-subtle tabular-nums">
          {time}
        </time>
      ) : null}
    </>
  );
}

function LogRow({ item, last, dense, time, t }: { item: AgentLogItem; last: boolean; dense?: boolean; time: string | null; t: AgentLogLabels }) {
  const pad = dense ? "pb-2" : "pb-3.5";
  if (item.detail == null) {
    return (
      <li className={cx("relative flex items-start gap-3 motion-safe:animate-rise", pad)}>
        <Rail last={last} />
        <StatusNode item={item} />
        <span className="flex min-h-6 min-w-0 flex-1 items-center gap-3">
          <RowText item={item} time={time} t={t} />
        </span>
      </li>
    );
  }
  return (
    <li className={cx("relative motion-safe:animate-rise", pad)}>
      <Rail last={last} />
      <Disclosure id={item.id} className="group">
        <AriaButton
          slot="trigger"
          className={cx(
            "-mx-1.5 -my-1 flex w-[calc(100%+0.75rem)] cursor-default items-start gap-3 rounded-control px-1.5 py-1 text-start outline-none",
            "transition-colors duration-150 data-[hovered]:bg-surface-hover/70 data-[focus-visible]:focus-ring",
          )}
        >
          <StatusNode item={item} />
          <span className="flex min-h-6 min-w-0 flex-1 items-center gap-3">
            <RowText item={item} time={time} t={t} />
            <ChevronGlyph className="size-3.5 shrink-0 text-fg-subtle transition-transform duration-200 ease-out-soft group-data-[expanded]:rotate-180" />
          </span>
        </AriaButton>
        <DisclosurePanel
          aria-label={t.details}
          className="h-(--disclosure-panel-height) overflow-clip transition-[height] duration-250 ease-out-soft motion-reduce:transition-none"
        >
          <div className="ps-9 pt-2">
            <div className="overflow-x-auto rounded-control border border-line bg-surface-muted px-3 py-2.5 text-body-sm text-fg-muted">{item.detail}</div>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </li>
  );
}

function WorkingRow({ label, dense, t }: { label: ReactNode; dense?: boolean; t: AgentLogLabels }) {
  const seconds = useAgentElapsed(true);
  return (
    <li role="status" className={cx("relative flex items-center gap-3 motion-safe:animate-rise", dense ? "pb-1" : "pb-1.5")}>
      <span className={cx(NODE, "bg-transparent")}>
        <span className="absolute inset-1 rounded-full bg-accent-400/40 motion-safe:animate-ping motion-safe:[animation-duration:1.8s]" />
        <span className="relative size-2.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-accent-300),var(--color-accent-600))] shadow-accent" />
      </span>
      <span className="text-body-sm font-medium text-fg-muted motion-safe:text-shimmer">{label}</span>
      <span className="text-caption text-fg-subtle tabular-nums">{formatAgentDuration(seconds, t)}</span>
    </li>
  );
}
