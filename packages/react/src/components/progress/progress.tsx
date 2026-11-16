"use client";

import type { ReactNode, Ref } from "react";
import { Label as AriaLabel, ProgressBar as AriaProgressBar } from "react-aria-components";
import type { ProgressBarProps as AriaProgressBarProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import type { Size } from "../../lib/recipes";

export type ProgressTone = "accent" | "success" | "warning" | "danger" | "neutral";

const FILL: Record<ProgressTone, string> = {
  accent: "bg-accent-500",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-fg-muted",
};
const STROKE: Record<ProgressTone, string> = {
  accent: "text-accent-500",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-fg-muted",
};
/** Indeterminate sweep: a soft band of the tone colour sliding across the track. */
const SWEEP: Record<ProgressTone, string> = {
  accent: "via-accent-500",
  success: "via-success",
  warning: "via-warning",
  danger: "via-danger",
  neutral: "via-fg-muted",
};

const TRACK: Record<Size, string> = { sm: "h-1", md: "h-1.5", lg: "h-2.5" };

/* -------------------------------------------------------------- linear */

export interface ProgressProps extends Omit<AriaProgressBarProps, "className" | "children"> {
  /** Visible label above the bar. Without it, pass `aria-label`. */
  label?: ReactNode;
  /** Secondary text under the bar, e.g. "约 2 分钟". */
  description?: ReactNode;
  /** Show the formatted value at the end of the label row (default true when there is a label). */
  showValue?: boolean;
  tone?: ProgressTone;
  size?: Size;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Linear progress bar on React Aria's ProgressBar: determinate or
 * indeterminate (`isIndeterminate`), with label, value text and tones.
 *
 *   <Progress label="上传中" value={64} />
 *   <Progress aria-label="正在同步" isIndeterminate size="sm" />
 */
export function Progress({ label, description, showValue, tone = "accent", size = "md", className, ref, ...props }: ProgressProps) {
  const withValue = showValue ?? label != null;
  return (
    <AriaProgressBar {...props} ref={ref} className={cx("flex w-full flex-col gap-2", className)}>
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          {label != null || (withValue && !isIndeterminate) ? (
            <div className="flex items-baseline justify-between gap-3 text-body-sm">
              {label != null ? <AriaLabel className="truncate font-medium text-fg">{label}</AriaLabel> : <span />}
              {withValue && !isIndeterminate ? <span className="shrink-0 text-fg-muted tabular-nums">{valueText}</span> : null}
            </div>
          ) : null}
          <div className={cx("relative w-full overflow-hidden rounded-full bg-surface-muted", TRACK[size])}>
            {isIndeterminate ? (
              <div
                className={cx(
                  "absolute inset-0 animate-shimmer bg-linear-to-r from-transparent to-transparent bg-[length:55%_100%] bg-no-repeat",
                  "-scale-x-100 rtl:scale-x-100",
                  SWEEP[tone],
                )}
              />
            ) : (
              <div
                className={cx("h-full rounded-full transition-[width] duration-500 ease-out-soft", FILL[tone])}
                style={{ width: `${percentage ?? 0}%` }}
              />
            )}
          </div>
          {description != null ? <span className="text-caption text-fg-subtle">{description}</span> : null}
        </>
      )}
    </AriaProgressBar>
  );
}

/* ---------------------------------------------------------------- ring */

const RING: Record<Size, { box: string; px: number; stroke: number; text: string }> = {
  sm: { box: "size-8", px: 32, stroke: 3.5, text: "text-[9px]" },
  md: { box: "size-14", px: 56, stroke: 5, text: "text-caption" },
  lg: { box: "size-24", px: 96, stroke: 7, text: "text-title-sm" },
};

export interface ProgressRingProps extends Omit<AriaProgressBarProps, "className" | "children"> {
  tone?: ProgressTone;
  size?: Size;
  /** Show the value in the centre (default: true for md/lg). */
  showValue?: boolean;
  /** Custom centre content (replaces the value). */
  children?: ReactNode;
  /** Text next to the ring. Without it, pass `aria-label`. */
  label?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Circular progress ring, determinate or indeterminate, with the value (or
 * any content) in the centre.
 *
 *   <ProgressRing value={72} aria-label="资料完整度" />
 */
export function ProgressRing({ tone = "accent", size = "md", showValue, children, label, className, ref, ...props }: ProgressRingProps) {
  const spec = RING[size];
  const r = (spec.px - spec.stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const withValue = showValue ?? size !== "sm";
  return (
    <AriaProgressBar {...props} ref={ref} className={cx("inline-flex items-center gap-3", className)}>
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <div className={cx("relative shrink-0", spec.box)}>
            <svg
              viewBox={`0 0 ${spec.px} ${spec.px}`}
              fill="none"
              aria-hidden
              className={cx("size-full -rotate-90", isIndeterminate && "animate-spin [animation-duration:0.9s]", STROKE[tone])}
            >
              <circle cx={spec.px / 2} cy={spec.px / 2} r={r} strokeWidth={spec.stroke} className="stroke-surface-muted" />
              <circle
                cx={spec.px / 2}
                cy={spec.px / 2}
                r={r}
                stroke="currentColor"
                strokeWidth={spec.stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={isIndeterminate ? circumference * 0.72 : circumference * (1 - (percentage ?? 0) / 100)}
                className="transition-[stroke-dashoffset] duration-500 ease-out-soft"
              />
            </svg>
            {children != null || (withValue && !isIndeterminate) ? (
              <span className={cx("absolute inset-0 flex items-center justify-center font-semibold text-fg tabular-nums", spec.text)}>
                {children ?? valueText}
              </span>
            ) : null}
          </div>
          {label != null ? <AriaLabel className="text-body-sm text-fg-muted">{label}</AriaLabel> : null}
        </>
      )}
    </AriaProgressBar>
  );
}
