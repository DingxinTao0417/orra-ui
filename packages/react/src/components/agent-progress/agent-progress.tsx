"use client";

import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Disclosure, DisclosurePanel, Heading } from "react-aria-components";
import { RiCloseLine, RiListCheck3, RiSubtractLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { CheckGlyph, ChevronGlyph } from "../../lib/glyphs";
import { card } from "../../lib/recipes";
import { Progress } from "../progress/progress";

const COPY = {
  en: {
    plan: "Plan",
    progress: "Plan progress",
    summary: "{done} of {total} done",
    left: "{n} steps left",
    leftOne: "1 step left",
    complete: "All {total} steps complete",
    failed: "Stopped at step {n}",
    notStarted: "{total} steps planned",
    pending: "Pending",
    active: "In progress",
    done: "Done",
    stepFailed: "Failed",
    skipped: "Skipped",
  },
  zh: {
    plan: "执行计划",
    progress: "计划进度",
    summary: "已完成 {done}/{total}",
    left: "还剩 {n} 步",
    leftOne: "还剩 1 步",
    complete: "全部 {total} 步已完成",
    failed: "第 {n} 步失败，已暂停",
    notStarted: "共 {total} 步",
    pending: "待开始",
    active: "进行中",
    done: "已完成",
    stepFailed: "失败",
    skipped: "已跳过",
  },
};
export type AgentProgressLabels = (typeof COPY)["en"];

export type AgentStepStatus = "pending" | "active" | "done" | "failed" | "skipped";

export interface AgentProgressStep {
  id: string;
  title: ReactNode;
  /** Shown under the title for the active / failed step (or always, with `showDescriptions`). */
  description?: ReactNode;
  /** Short text on the end side: a duration, a count. */
  meta?: ReactNode;
  /** Default `pending`. */
  status?: AgentStepStatus;
}

export interface AgentProgressProps {
  steps: AgentProgressStep[];
  /** Header title (default "Plan"). */
  title?: ReactNode;
  /** Icon element before the title. */
  icon?: ReactNode;
  /** Let the header collapse the list (default true). Collapsed, only the current step is shown. */
  collapsible?: boolean;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  /** Show descriptions for every step, not only the current one. */
  showDescriptions?: boolean;
  /** `card` (default) sits on its own surface; `plain` drops the border and padding to nest in a message. */
  variant?: "card" | "plain";
  /** Content under the list, e.g. a retry button for a failed step. */
  footer?: ReactNode;
  labels?: Partial<AgentProgressLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

function statusOf(step: AgentProgressStep): AgentStepStatus {
  return step.status ?? "pending";
}

/**
 * Multi-step plan progress for an agent run: an overall bar and a "n steps
 * left" summary over a list of steps with pending / active / done / failed
 * states. Collapses to the current step.
 *
 *   <AgentProgress title="重构登录页" steps={plan} />
 */
export function AgentProgress({
  steps,
  title,
  icon,
  collapsible = true,
  isExpanded,
  defaultExpanded = true,
  onExpandedChange,
  showDescriptions,
  variant = "card",
  footer,
  labels,
  className,
  ref,
}: AgentProgressProps) {
  const t = useCopy(COPY, labels);
  const total = steps.length;
  const finished = steps.filter((s) => statusOf(s) === "done" || statusOf(s) === "skipped").length;
  const failedIndex = steps.findIndex((s) => statusOf(s) === "failed");
  const activeIndex = steps.findIndex((s) => statusOf(s) === "active");
  const current = failedIndex >= 0 ? failedIndex : activeIndex >= 0 ? activeIndex : steps.findIndex((s) => statusOf(s) === "pending");
  const left = total - finished;

  const summary =
    failedIndex >= 0
      ? fill(t.failed, { n: failedIndex + 1 })
      : left === 0 && total > 0
        ? fill(t.complete, { total })
        : finished === 0 && activeIndex < 0
          ? fill(t.notStarted, { total })
          : `${fill(t.summary, { done: finished, total })} · ${left === 1 ? t.leftOne : fill(t.left, { n: left })}`;

  const tone = failedIndex >= 0 ? "danger" : left === 0 ? "success" : "accent";

  const header = (open: boolean) => (
    <>
      <span
        className={cx(
          "flex size-8 shrink-0 items-center justify-center rounded-control [&>svg]:size-[18px]",
          failedIndex >= 0 ? "bg-danger-soft text-danger" : left === 0 && total > 0 ? "bg-success-soft text-success" : "bg-accent-50 text-fg-accent",
        )}
      >
        {icon ?? <RiListCheck3 />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body font-medium text-fg">{title ?? t.plan}</span>
        <span className={cx("truncate text-body-sm tabular-nums", failedIndex >= 0 ? "text-danger" : "text-fg-subtle")}>{summary}</span>
      </span>
      {collapsible ? (
        <ChevronGlyph className={cx("size-4 shrink-0 text-fg-subtle transition-transform duration-200 ease-out-soft", open && "rotate-180")} />
      ) : null}
    </>
  );

  const bar = <Progress aria-label={t.progress} value={finished} maxValue={Math.max(total, 1)} tone={tone} size="sm" className="mt-3" />;

  const list = (
    <ol className="mt-3 flex flex-col">
      {steps.map((step, index) => (
        <StepRow
          key={step.id}
          step={step}
          index={index}
          last={index === steps.length - 1}
          showDescription={showDescriptions || index === current}
          t={t}
        />
      ))}
    </ol>
  );

  const shell = cx(variant === "card" ? cx(card, "p-4") : "", "w-full", className);

  if (!collapsible) {
    return (
      <section ref={ref} className={shell}>
        <div className="flex items-center gap-3">{header(true)}</div>
        {bar}
        {list}
        {footer ? <div className="mt-3">{footer}</div> : null}
      </section>
    );
  }

  return (
    <Disclosure ref={ref} isExpanded={isExpanded} defaultExpanded={defaultExpanded} onExpandedChange={onExpandedChange} className={shell}>
      {({ isExpanded: open }) => (
        <>
          <Heading level={3} className="m-0">
            <AriaButton
              slot="trigger"
              className="-m-1.5 flex w-[calc(100%+0.75rem)] cursor-default items-center gap-3 rounded-control p-1.5 text-start outline-none transition-colors duration-150 data-[hovered]:bg-surface-hover/70 data-[focus-visible]:focus-ring"
            >
              {header(open)}
            </AriaButton>
          </Heading>
          {bar}
          {!open && current >= 0 ? (
            <div key={steps[current]!.id} className="mt-3 motion-safe:animate-rise">
              <ol>
                <StepRow step={steps[current]!} index={current} last showDescription t={t} />
              </ol>
            </div>
          ) : null}
          <DisclosurePanel className="h-(--disclosure-panel-height) overflow-clip transition-[height] duration-250 ease-out-soft motion-reduce:transition-none">
            {list}
          </DisclosurePanel>
          {footer ? <div className="mt-3">{footer}</div> : null}
        </>
      )}
    </Disclosure>
  );
}

function StepMarker({ status, index }: { status: AgentStepStatus; index: number }) {
  const base = "relative z-[1] flex size-5 shrink-0 items-center justify-center rounded-full text-micro font-semibold tabular-nums transition-colors duration-300";
  switch (status) {
    case "done":
      return (
        <span className={cx(base, "bg-accent-500 text-fg-on-accent")}>
          <CheckGlyph className="size-3 motion-safe:animate-in" />
        </span>
      );
    case "active":
      return (
        <span className={cx(base, "text-accent-500")}>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden className="absolute inset-0 size-full motion-safe:animate-spin motion-safe:[animation-duration:1.1s]">
            <circle cx="10" cy="10" r="8.75" stroke="currentColor" strokeOpacity=".2" strokeWidth="1.5" />
            <path d="M10 1.25A8.75 8.75 0 0 1 18.75 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="size-2 rounded-full bg-accent-500 motion-safe:animate-glow" />
        </span>
      );
    case "failed":
      return (
        <span className={cx(base, "bg-danger text-fg-on-accent")}>
          <RiCloseLine className="size-3.5" />
        </span>
      );
    case "skipped":
      return (
        <span className={cx(base, "border border-dashed border-line-strong text-fg-subtle")}>
          <RiSubtractLine className="size-3" />
        </span>
      );
    default:
      return <span className={cx(base, "border border-line-strong bg-surface text-fg-subtle")}>{index + 1}</span>;
  }
}

function StepRow({ step, index, last, showDescription, t }: { step: AgentProgressStep; index: number; last: boolean; showDescription?: boolean; t: AgentProgressLabels }) {
  const status = statusOf(step);
  const statusText = { pending: t.pending, active: t.active, done: t.done, failed: t.stepFailed, skipped: t.skipped }[status];
  return (
    <li className={cx("relative flex gap-3", last ? "" : "pb-3.5")} aria-current={status === "active" ? "step" : undefined}>
      {last ? null : (
        <span
          aria-hidden
          className={cx(
            "absolute start-2.5 top-[23px] bottom-[3px] w-px -translate-x-1/2 transition-colors duration-500 rtl:translate-x-1/2",
            status === "done" || status === "skipped" ? "bg-accent-300" : "bg-line",
          )}
        />
      )}
      <StepMarker status={status} index={index} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-h-5 items-center gap-2">
          <span
            className={cx(
              "min-w-0 flex-1 truncate text-body-sm transition-colors duration-300",
              status === "active" && "font-medium text-fg",
              status === "done" && "text-fg-muted",
              status === "pending" && "text-fg-subtle",
              status === "failed" && "font-medium text-danger",
              status === "skipped" && "text-fg-subtle line-through",
            )}
          >
            {step.title}
          </span>
          <span className="sr-only">{statusText}</span>
          {step.meta != null ? <span className="shrink-0 text-caption text-fg-subtle tabular-nums">{step.meta}</span> : null}
        </div>
        {showDescription && step.description != null ? (
          <p className={cx("text-caption leading-relaxed motion-safe:animate-fade-in", status === "failed" ? "text-danger" : "text-fg-subtle")}>{step.description}</p>
        ) : null}
      </div>
    </li>
  );
}
