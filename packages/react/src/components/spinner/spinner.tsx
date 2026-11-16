"use client";

import { useId } from "react";
import type { HTMLAttributes, ReactNode, Ref } from "react";
import { useReducedMotion } from "motion/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";

const COPY = {
  en: { loading: "Loading" },
  zh: { loading: "加载中" },
};
export type SpinnerLabels = (typeof COPY)["en"];

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerTone = "accent" | "neutral" | "current" | "inverse";
export type SpinnerVariant = "orbit" | "dots" | "ring";

const SIZES: Record<SpinnerSize, string> = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
  xl: "size-10",
};
const TEXT: Record<SpinnerSize, string> = { xs: "text-caption", sm: "text-body-sm", md: "text-body-sm", lg: "text-body", xl: "text-body" };

const TONES: Record<SpinnerTone, string> = {
  accent: "text-accent-500",
  neutral: "text-fg-subtle",
  current: "",
  inverse: "text-fg-inverse",
};

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  /** `orbit` (default): a comet with a glowing head circling a faint ring around a core. `dots`: three hopping dots. `ring`: a plain arc. */
  variant?: SpinnerVariant;
  /** Visible text next to the spinner, e.g. "正在同步…". Without it, a hidden "Loading" label is announced. */
  label?: ReactNode;
  labels?: Partial<SpinnerLabels>;
  ref?: Ref<HTMLSpanElement>;
}

/**
 * Loading indicator. The default `orbit` design is Orra's own: a comet tail
 * with a bright head travelling around a faint track, circling a soft core.
 *
 *   <Spinner />
 *   <Spinner variant="dots" tone="neutral" label="正在生成摘要…" />
 */
export function Spinner({ size = "md", tone = "accent", variant = "orbit", label, labels, className, ref, ...props }: SpinnerProps) {
  const t = useCopy(COPY, labels);
  const glyph = cx("shrink-0", SIZES[size]);
  return (
    <span
      role="status"
      aria-label={label ? undefined : t.loading}
      {...props}
      ref={ref}
      className={cx("inline-flex items-center gap-2 align-middle", TONES[tone], className)}
    >
      {variant === "dots" ? <DotsGlyph className={glyph} /> : variant === "ring" ? <RingGlyph className={glyph} /> : <OrbitGlyph className={glyph} />}
      {label ? <span className={cx("text-fg-muted", TEXT[size])}>{label}</span> : null}
    </span>
  );
}

function OrbitGlyph({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  // Arc from 12 o'clock, 130° clockwise; the head sits at its end.
  const end = { x: 12 + 8.5 * Math.cos((40 * Math.PI) / 180), y: 12 + 8.5 * Math.sin((40 * Math.PI) / 180) };
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cx("animate-spin [animation-duration:1.1s] [animation-timing-function:cubic-bezier(0.55,0.15,0.45,0.85)]", className)}>
      <defs>
        <linearGradient id={`orra-orbit-${id}`} gradientUnits="userSpaceOnUse" x1="12" y1="3.5" x2={end.x} y2={end.y}>
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="1" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeOpacity=".14" strokeWidth="2.4" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" fillOpacity=".28" />
      <path d={`M12 3.5A8.5 8.5 0 0 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`} stroke={`url(#orra-orbit-${id})`} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx={end.x} cy={end.y} r="2.6" fill="currentColor" />
    </svg>
  );
}

function RingGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cx("animate-spin [animation-duration:0.75s]", className)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".18" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function DotsGlyph({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      {[5, 12, 19].map((cx, i) => (
        <circle key={cx} cx={cx} cy="12" r="2.6" opacity={reduce ? 0.7 : 0.35}>
          {reduce ? null : (
            <>
              <animate attributeName="cy" values="12;8.5;12;12" keyTimes="0;0.3;0.6;1" dur="1s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;1;0.35;0.35" keyTimes="0;0.3;0.6;1" dur="1s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
            </>
          )}
        </circle>
      ))}
    </svg>
  );
}
