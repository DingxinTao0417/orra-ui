"use client";

import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";

const COPY = {
  en: { loading: "Loading content" },
  zh: { loading: "内容加载中" },
};
export type SkeletonLabels = (typeof COPY)["en"];

export type SkeletonShape = "rect" | "circle" | "text" | "pill";

/**
 * Sheen built from tokens so it reads in both themes (a slightly brighter
 * band in dark mode, a soft one in light mode).
 */
const SHIMMER =
  "bg-surface-muted bg-[image:linear-gradient(90deg,transparent_0%,color-mix(in_oklab,var(--color-fg)_7%,transparent)_50%,transparent_100%)] bg-[length:200%_100%] bg-no-repeat animate-shimmer";

const SHAPES: Record<SkeletonShape, string> = {
  rect: "rounded-control",
  circle: "rounded-full aspect-square",
  text: "h-3 rounded-full",
  pill: "h-6 rounded-full",
};

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape;
  /** CSS width (number = px), e.g. 120 or "60%". */
  width?: number | string;
  /** CSS height (number = px). Circles only need one of width/height. */
  height?: number | string;
  /** Turn the shimmer off (e.g. many placeholders on one screen). */
  still?: boolean;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A single placeholder shape with a soft shimmer. Decorative: wrap a group of
 * skeletons in `SkeletonSwap` (or set `aria-busy` on the region) so assistive
 * tech hears one "loading" message.
 *
 *   <Skeleton shape="circle" width={40} />
 *   <Skeleton width="60%" shape="text" />
 */
export function Skeleton({ shape = "rect", width, height, still, className, style, ref, ...props }: SkeletonProps) {
  const size: CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };
  if (shape === "circle" && width != null && height == null) size.height = size.width;
  if (shape === "circle" && height != null && width == null) size.width = size.height;
  return (
    <div
      aria-hidden
      {...props}
      ref={ref}
      style={{ ...size, ...style }}
      className={cx("shrink-0", still ? "bg-surface-muted" : SHIMMER, SHAPES[shape], shape === "rect" && height == null && "h-4", className)}
    />
  );
}

export interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of lines. */
  lines?: number;
  /** Width of the last line (the others are full width). */
  lastLineWidth?: string;
  /** Line height preset: `sm` for captions, `md` for body, `lg` for titles. */
  size?: "sm" | "md" | "lg";
  still?: boolean;
  ref?: Ref<HTMLDivElement>;
}

const LINE: Record<"sm" | "md" | "lg", string> = { sm: "h-2.5", md: "h-3", lg: "h-4" };
const LINE_GAP: Record<"sm" | "md" | "lg", string> = { sm: "gap-2", md: "gap-2.5", lg: "gap-3" };

/** A paragraph of placeholder lines; widths vary slightly so it reads as text. */
export function SkeletonText({ lines = 3, lastLineWidth = "62%", size = "md", still, className, ref, ...props }: SkeletonTextProps) {
  const widths = ["100%", "96%", "100%", "92%", "98%"];
  return (
    <div aria-hidden {...props} ref={ref} className={cx("flex w-full flex-col", LINE_GAP[size], className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} shape="text" still={still} className={LINE[size]} width={i === lines - 1 && lines > 1 ? lastLineWidth : widths[i % widths.length]} />
      ))}
    </div>
  );
}

export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Show a media block on top (cover image / chart area). */
  media?: boolean;
  /** Show an avatar + name header row. */
  avatar?: boolean;
  lines?: number;
  still?: boolean;
  ref?: Ref<HTMLDivElement>;
}

/** A ready-made card placeholder: optional media, avatar header and text lines, on the card surface. */
export function SkeletonCard({ media = false, avatar = true, lines = 3, still, className, ref, ...props }: SkeletonCardProps) {
  return (
    <div aria-hidden {...props} ref={ref} className={cx("flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card", className)}>
      {media ? <Skeleton still={still} className="aspect-[16/9] h-auto w-full rounded-menu" /> : null}
      {avatar ? (
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" width={36} still={still} />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton shape="text" width="45%" still={still} />
            <Skeleton shape="text" width="28%" still={still} className="h-2.5" />
          </div>
        </div>
      ) : null}
      <SkeletonText lines={lines} still={still} />
    </div>
  );
}

export interface SkeletonSwapProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** While true the `fallback` is shown; when it flips to false the content fades in. */
  loading: boolean;
  /** The placeholder (usually skeletons shaped like the content). */
  fallback: ReactNode;
  children: ReactNode;
  labels?: Partial<SkeletonLabels>;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Swaps a skeleton placeholder for real content with a soft fade, and
 * announces the loading state once (aria-busy + hidden status text).
 *
 *   <SkeletonSwap loading={!data} fallback={<SkeletonCard />}>
 *     <ProfileCard user={data} />
 *   </SkeletonSwap>
 */
export function SkeletonSwap({ loading, fallback, children, labels, className, ref, ...props }: SkeletonSwapProps) {
  const t = useCopy(COPY, labels);
  return (
    <div {...props} ref={ref} aria-busy={loading || undefined} className={cx("relative", className)}>
      {loading ? (
        <>
          <span role="status" className="sr-only">
            {t.loading}
          </span>
          <div key="fallback" className="animate-fade-in">
            {fallback}
          </div>
        </>
      ) : (
        <div key="content" className="animate-fade-in [animation-duration:320ms]">
          {children}
        </div>
      )}
    </div>
  );
}
