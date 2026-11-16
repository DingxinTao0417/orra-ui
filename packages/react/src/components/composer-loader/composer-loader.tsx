"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import { Button as AriaButton } from "react-aria-components";
import type { ButtonProps as AriaButtonProps } from "react-aria-components";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { focusRing } from "../../lib/recipes";
import { formatAgentDuration, useAgentElapsed } from "../agent-thinking/use-agent-elapsed";

const COPY = {
  en: { generating: "Generating…", stop: "Stop generating", seconds: "{s}s", minutes: "{m}m {s}s" },
  zh: { generating: "正在生成…", stop: "停止生成", seconds: "{s} 秒", minutes: "{m} 分 {s} 秒" },
};
export type ComposerLoaderLabels = (typeof COPY)["en"];

export type ComposerLoaderRadius = "control" | "menu" | "card";
const RADIUS: Record<ComposerLoaderRadius, string> = {
  control: "rounded-control",
  menu: "rounded-menu",
  card: "rounded-card",
};

/* ------------------------------------------------------------- stop button */

export interface ComposerStopButtonProps extends Omit<AriaButtonProps, "className" | "children"> {
  size?: "sm" | "md";
  /** Draw a rotating arc around the button while work is in progress (default true). */
  spinning?: boolean;
  "aria-label"?: string;
  labels?: Partial<ComposerLoaderLabels>;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Round "stop" button for a running generation: a solid square glyph inside an
 * orbiting arc.
 *
 *   <ComposerStopButton onPress={abort} />
 */
export function ComposerStopButton({ size = "md", spinning = true, labels, className, ref, ...props }: ComposerStopButtonProps) {
  const t = useCopy(COPY, labels);
  return (
    <AriaButton
      aria-label={t.stop}
      {...props}
      ref={ref}
      className={cx(
        "relative inline-flex shrink-0 cursor-default items-center justify-center rounded-full bg-surface-inverse text-fg-inverse shadow-xs",
        "transition-[opacity,transform] duration-150 data-[hovered]:opacity-90 data-[pressed]:scale-95 data-[disabled]:opacity-45",
        focusRing,
        size === "sm" ? "size-8" : "size-9",
        className,
      )}
    >
      {spinning ? (
        <svg viewBox="0 0 36 36" fill="none" aria-hidden className="absolute -inset-[3px] size-[calc(100%+6px)] text-accent-500 motion-safe:animate-spin motion-safe:[animation-duration:1.4s]">
          <path d="M18 1.5A16.5 16.5 0 0 1 34.5 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : null}
      <span aria-hidden className={cx("rounded-[3px] bg-current", size === "sm" ? "size-2.5" : "size-3")} />
    </AriaButton>
  );
}

/* ------------------------------------------------------------------ loader */

export interface ComposerLoaderProps {
  /** Show the working state (default true). When false only `children` render. */
  active?: boolean;
  /** Status text above the composer (default "Generating…"). */
  label?: ReactNode;
  /** Shows a stop button in the status row. */
  onStop?: () => void;
  /** Show the status row above the composer (default true). */
  showStatus?: boolean;
  /** Show the elapsed time in the status row (default true). */
  showTimer?: boolean;
  /** Corner radius of the wrapped element, so the light follows its edge (default `card`). */
  radius?: ComposerLoaderRadius;
  /** The composer (or any panel) to wrap. */
  children?: ReactNode;
  labels?: Partial<ComposerLoaderLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** A comet of light: transparent for most of the turn, then accent → violet. */
const COMET =
  "conic-gradient(from 0deg, transparent 0deg, transparent 200deg, color-mix(in oklab, var(--color-accent-300) 60%, transparent) 260deg, var(--color-accent-500) 315deg, var(--color-chart-2) 345deg, transparent 360deg)";

const RING_MASK = "linear-gradient(black 0 0) content-box exclude, linear-gradient(black 0 0)";

function Sweep({ duration = "3s" }: { duration?: string }) {
  return (
    <span
      className="absolute start-1/2 top-1/2 aspect-square w-[max(150%,40rem)] -translate-x-1/2 -translate-y-1/2 motion-safe:animate-spin rtl:translate-x-1/2"
      style={{ backgroundImage: COMET, animationDuration: duration } as CSSProperties}
    />
  );
}

/**
 * Animated working state for a chat composer: a light sweeps along the
 * composer's border with a soft glow, and a status row above shows what's
 * happening, the elapsed time and a stop button.
 *
 *   <ComposerLoader active={streaming} onStop={abort}><ComposerPanel … /></ComposerLoader>
 */
export function ComposerLoader({
  active = true,
  label,
  onStop,
  showStatus = true,
  showTimer = true,
  radius = "card",
  children,
  labels,
  className,
  ref,
}: ComposerLoaderProps) {
  const t = useCopy(COPY, labels);
  const seconds = useAgentElapsed(active);
  const round = RADIUS[radius];

  return (
    <div ref={ref} className={cx("flex w-full flex-col gap-2", className)} data-active={active || undefined}>
      {active && showStatus ? (
        <div role="status" className="flex min-h-8 items-center gap-2.5 px-1.5 text-body-sm motion-safe:animate-rise">
          <span aria-hidden className="relative inline-flex size-3 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-accent-400/40 motion-safe:animate-ping motion-safe:[animation-duration:1.8s]" />
            <span className="relative size-2 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-accent-300),var(--color-accent-600))]" />
          </span>
          <span className="min-w-0 truncate font-medium text-fg-muted motion-safe:text-shimmer">{label ?? t.generating}</span>
          {showTimer ? <span className="shrink-0 text-caption text-fg-subtle tabular-nums">{formatAgentDuration(seconds, t)}</span> : null}
          <span className="flex-1" />
          {onStop ? <ComposerStopButton size="sm" spinning={false} onPress={onStop} labels={labels} /> : null}
        </div>
      ) : null}
      <div className={cx("relative isolate", round)}>
        {active ? (
          <>
            {/* glow */}
            <span aria-hidden className={cx("pointer-events-none absolute -inset-1 -z-10 overflow-hidden opacity-60 blur-md", round)}>
              <Sweep />
            </span>
            {/* the border light itself, masked to a 1.5px ring over the child's edge */}
            <span
              aria-hidden
              className={cx("pointer-events-none absolute inset-0 z-10 overflow-hidden p-[1.5px]", round)}
              style={{ mask: RING_MASK } as CSSProperties}
            >
              <Sweep />
            </span>
          </>
        ) : null}
        {children}
      </div>
    </div>
  );
}
