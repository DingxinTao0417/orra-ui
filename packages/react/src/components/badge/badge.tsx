"use client";

import type { HTMLAttributes, ReactNode, Ref } from "react";
import { cx } from "../../lib/cx";
import type { Size } from "../../lib/recipes";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";
export type BadgeVariant = "soft" | "solid" | "outline";

const TONES: Record<BadgeVariant, Record<BadgeTone, string>> = {
  soft: {
    neutral: "bg-surface-muted text-fg-muted",
    accent: "bg-accent-50 text-fg-accent",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    info: "bg-info-soft text-info",
  },
  solid: {
    neutral: "bg-surface-inverse text-fg-inverse",
    accent: "bg-accent-500 text-fg-on-accent",
    success: "bg-success text-fg-inverse",
    warning: "bg-warning text-fg-inverse",
    danger: "bg-danger text-fg-inverse",
    info: "bg-info text-fg-inverse",
  },
  outline: {
    neutral: "border border-line-strong bg-surface text-fg-muted",
    accent: "border border-accent-500/40 bg-surface text-fg-accent",
    success: "border border-success/40 bg-surface text-success",
    warning: "border border-warning/45 bg-surface text-warning",
    danger: "border border-danger/40 bg-surface text-danger",
    info: "border border-info/40 bg-surface text-info",
  },
};

const DOT_TONE: Record<BadgeTone, string> = {
  neutral: "bg-fg-subtle",
  accent: "bg-accent-500",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

const SIZES: Record<Size, string> = {
  sm: "h-5 gap-1 px-1.5 text-micro",
  md: "h-6 gap-1.5 px-2 text-caption",
  lg: "h-7 gap-1.5 px-2.5 text-body-sm",
};

const ICON: Record<Size, string> = { sm: "size-3", md: "size-3.5", lg: "size-4" };

export interface BadgeStyleOptions {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: Size;
  /** Rounded rectangle instead of a pill. */
  square?: boolean;
}

/** Class string for badge styling, for elements that should look like a Badge. */
export function badgeClass({ tone = "neutral", variant = "soft", size = "md", square = false }: BadgeStyleOptions = {}) {
  return cx(
    "inline-flex w-fit shrink-0 items-center whitespace-nowrap font-medium leading-none tabular-nums",
    square ? "rounded-[6px]" : "rounded-full",
    SIZES[size],
    TONES[variant][tone],
  );
}

export interface BadgeProps extends BadgeStyleOptions, Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Leading status dot in the tone colour. */
  dot?: boolean;
  /** Leading icon element, e.g. `<RiCheckLine />`. */
  icon?: ReactNode;
  children?: ReactNode;
  ref?: Ref<HTMLSpanElement>;
}

/**
 * Small status label.
 *
 *   <Badge tone="success" dot>已上线</Badge>
 *   <Badge tone="accent" variant="solid">新</Badge>
 */
export function Badge({ tone = "neutral", variant = "soft", size = "md", square, dot, icon, className, children, ref, ...props }: BadgeProps) {
  return (
    <span {...props} ref={ref} className={cx(badgeClass({ tone, variant, size, square }), className)}>
      {dot ? <span aria-hidden className={cx("size-1.5 shrink-0 rounded-full", variant === "solid" ? "bg-current opacity-80" : DOT_TONE[tone])} /> : null}
      {icon ? <span aria-hidden className={cx("inline-flex shrink-0 [&>svg]:size-full", ICON[size])}>{icon}</span> : null}
      {children}
    </span>
  );
}

const STATUS_DOT_SIZE: Record<Size, string> = { sm: "size-1.5", md: "size-2", lg: "size-2.5" };

export interface StatusDotProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  tone?: BadgeTone;
  size?: Size;
  /** Soft expanding halo, for live / in-progress states. */
  pulse?: boolean;
  /** Accessible name (e.g. "在线"). Without it the dot is decorative. */
  label?: string;
  ref?: Ref<HTMLSpanElement>;
}

/**
 * A standalone coloured dot for presence / health, optionally pulsing.
 *
 *   <StatusDot tone="success" pulse label="运行中" />
 */
export function StatusDot({ tone = "success", size = "md", pulse, label, className, ref, ...props }: StatusDotProps) {
  return (
    <span
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      {...props}
      ref={ref}
      className={cx("relative inline-flex shrink-0", STATUS_DOT_SIZE[size], className)}
    >
      {pulse ? <span className={cx("absolute inset-0 animate-ping rounded-full opacity-60", DOT_TONE[tone])} /> : null}
      <span className={cx("relative size-full rounded-full", DOT_TONE[tone])} />
    </span>
  );
}
