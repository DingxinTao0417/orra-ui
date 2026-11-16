"use client";

import { useEffect, useRef } from "react";
import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Disclosure, DisclosurePanel } from "react-aria-components";
import { RiBrain2Line, RiCheckLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { ChevronGlyph } from "../../lib/glyphs";
import { formatAgentDuration, useAgentElapsed } from "./use-agent-elapsed";

const COPY = {
  en: { thinking: "Thinking", thought: "Thought for {time}", thoughtShort: "Thought", seconds: "{s}s", minutes: "{m}m {s}s", showReasoning: "Show reasoning", hideReasoning: "Hide reasoning" },
  zh: { thinking: "思考中", thought: "已思考 {time}", thoughtShort: "思考完成", seconds: "{s} 秒", minutes: "{m} 分 {s} 秒", showReasoning: "展开思考过程", hideReasoning: "收起思考过程" },
};
export type AgentThinkingLabels = (typeof COPY)["en"];

export type AgentThinkingVariant = "shimmer" | "dots" | "pulse";

export interface AgentThinkingProps {
  /** True while the agent is thinking; false once it's done (the label switches to "Thought for …"). Default true. */
  active?: boolean;
  /** Indicator style: `shimmer` (light sweeping across the label), `dots` (three hopping dots) or `pulse` (a breathing orb). */
  variant?: AgentThinkingVariant;
  /** Replace the "Thinking" label. */
  label?: ReactNode;
  /** Replace the finished label ("Thought for 12s"). */
  doneLabel?: ReactNode;
  /** Total seconds, when you track time yourself. Otherwise an internal timer counts while `active`. */
  duration?: number;
  /** Epoch ms the thinking started at, so the timer survives remounts. */
  startedAt?: number;
  /** Show the elapsed time (default true). */
  showTimer?: boolean;
  /** Icon element shown instead of the variant's indicator. */
  icon?: ReactNode;
  /** The reasoning text (streamed). A string keeps line breaks and enables the one-line preview. */
  children?: ReactNode;
  /** While thinking and collapsed, show the latest reasoning line under the header (default true). */
  showPreview?: boolean;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  labels?: Partial<AgentThinkingLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * "Thinking…" indicator for an agent's reasoning: an animated label with an
 * elapsed timer, and an expandable panel that streams the reasoning text.
 *
 *   <AgentThinking active={streaming}>{reasoning}</AgentThinking>
 */
export function AgentThinking({
  active = true,
  variant = "shimmer",
  label,
  doneLabel,
  duration,
  startedAt,
  showTimer = true,
  icon,
  children,
  showPreview = true,
  isExpanded,
  defaultExpanded,
  onExpandedChange,
  labels,
  className,
  ref,
}: AgentThinkingProps) {
  const t = useCopy(COPY, labels);
  const elapsed = useAgentElapsed(active && duration == null, startedAt);
  const seconds = duration ?? elapsed;
  const time = formatAgentDuration(seconds, t);
  const hasContent = children != null && children !== false && children !== "";
  const text = typeof children === "string" ? children : null;
  const lastLine = text ? (text.trim().split(/\n+/).pop() ?? "") : "";

  const panelRef = useRef<HTMLDivElement>(null);
  // Keep the newest reasoning in view while it streams.
  useEffect(() => {
    const el = panelRef.current;
    if (el && active) el.scrollTop = el.scrollHeight;
  }, [children, active]);

  const indicator = icon ? (
    <span className="inline-flex size-4 shrink-0 [&>svg]:size-full">{icon}</span>
  ) : active ? (
    <ThinkingIndicator variant={variant} />
  ) : (
    <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
      <RiCheckLine className="size-3" />
    </span>
  );

  const heading = (
    <>
      {indicator}
      <span
        className={cx(
          "min-w-0 truncate font-medium",
          active ? (variant === "shimmer" ? "text-fg-muted motion-safe:text-shimmer" : "text-fg-muted") : "text-fg-muted",
        )}
      >
        {active ? (label ?? t.thinking) : (doneLabel ?? (showTimer && seconds > 0 ? fill(t.thought, { time }) : t.thoughtShort))}
      </span>
      {active && showTimer ? <span className="shrink-0 text-fg-subtle tabular-nums">{time}</span> : null}
    </>
  );

  const headerClass = "inline-flex max-w-full items-center gap-2 rounded-control py-1 ps-1 pe-2 text-body-sm outline-none";

  if (!hasContent) {
    return (
      <div ref={ref} role="status" aria-live="polite" className={cx("flex flex-col", className)}>
        <div className={headerClass}>{heading}</div>
      </div>
    );
  }

  return (
    <Disclosure
      ref={ref}
      isExpanded={isExpanded}
      defaultExpanded={defaultExpanded}
      onExpandedChange={onExpandedChange}
      className={cx("group flex flex-col", className)}
    >
      {({ isExpanded: open }) => (
        <>
          <AriaButton
            slot="trigger"
            className={cx(
              headerClass,
              "cursor-default self-start transition-colors duration-150 data-[hovered]:bg-surface-hover data-[focus-visible]:focus-ring",
            )}
          >
            {heading}
            <ChevronGlyph className="size-3.5 shrink-0 text-fg-subtle transition-transform duration-200 ease-out-soft group-data-[expanded]:rotate-180" />
            <span className="sr-only">{open ? t.hideReasoning : t.showReasoning}</span>
          </AriaButton>
          {active && !open && showPreview && lastLine ? (
            <p key={lastLine.slice(0, 24)} aria-hidden className="ms-3 truncate border-s border-line ps-[15px] text-body-sm text-fg-subtle motion-safe:animate-fade-in">
              {lastLine}
            </p>
          ) : null}
          <DisclosurePanel className="h-(--disclosure-panel-height) overflow-clip transition-[height] duration-250 ease-out-soft motion-reduce:transition-none">
            <div
              ref={panelRef}
              className="ms-3 mt-1 max-h-64 overflow-y-auto border-s border-line ps-[15px] pb-1 text-body-sm leading-relaxed text-fg-muted"
            >
              {text != null ? <p className="whitespace-pre-wrap">{text}{active ? <StreamCaret /> : null}</p> : <>{children}{active ? <StreamCaret /> : null}</>}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

function StreamCaret() {
  return <span aria-hidden className="ms-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] rounded-full bg-accent-500 motion-safe:animate-pulse" />;
}

function ThinkingIndicator({ variant }: { variant: AgentThinkingVariant }) {
  if (variant === "dots") {
    return (
      <span aria-hidden className="inline-flex h-4 shrink-0 items-center gap-[3px] px-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-[5px] rounded-full bg-accent-500 motion-safe:animate-pulse motion-safe:[animation-duration:1.1s]"
            style={{ animationDelay: `${i * 180}ms` }}
          />
        ))}
      </span>
    );
  }
  if (variant === "pulse") {
    return (
      <span aria-hidden className="relative inline-flex size-4 shrink-0 items-center justify-center">
        <span className="absolute inset-0.5 rounded-full bg-accent-400/50 motion-safe:animate-ping motion-safe:[animation-duration:1.6s]" />
        <span className="relative size-2 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-accent-300),var(--color-accent-600))]" />
      </span>
    );
  }
  return (
    <span aria-hidden className="inline-flex size-4 shrink-0 text-fg-accent [&>svg]:size-full">
      <RiBrain2Line />
    </span>
  );
}
