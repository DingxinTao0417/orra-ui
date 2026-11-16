"use client";

import { useId, useMemo } from "react";
import type { Ref } from "react";
import { cx } from "../../lib/cx";
import { chartColor, useChartWidth } from "../chart-card/chart-parts";

export interface SparklineProps {
  /** Values in order; defaults to a clearly-marked sample. */
  data?: readonly number[];
  /** `line`, `area` (line + soft fill) or `bar`. */
  variant?: "line" | "area" | "bar";
  /** Width in px, or "100%" to fill the container. */
  width?: number | "100%";
  height?: number;
  /** Any CSS colour, or "trend" for green when rising / red when falling. */
  color?: string;
  curve?: "smooth" | "linear";
  /** Dot on the last value (line / area). */
  endDot?: boolean;
  /** Mark the lowest and highest values. */
  showMinMax?: boolean;
  strokeWidth?: number;
  /** Fixed value range; defaults to the data's min / max. */
  domain?: [number, number];
  /** Accessible description, e.g. "Revenue, rising 12% over 30 days". Without it the sparkline is decorative. */
  "aria-label"?: string;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
}

const SAMPLE = [12, 14, 13, 17, 16, 19, 18, 22, 21, 24, 23, 27];

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 3) return points.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const k = 0.18;
    const c1 = { x: p1.x + (p2.x - p0.x) * k, y: p1.y + (p2.y - p0.y) * k };
    const c2 = { x: p2.x - (p3.x - p1.x) * k, y: p2.y - (p3.y - p1.y) * k };
    // Keep control points inside the segment's y range so the curve never overshoots.
    const lo = Math.min(p1.y, p2.y);
    const hi = Math.max(p1.y, p2.y);
    c1.y = Math.max(lo, Math.min(hi, c1.y));
    c2.y = Math.max(lo, Math.min(hi, c2.y));
    d += ` C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)} ${c2.x.toFixed(2)} ${c2.y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

/**
 * Tiny inline trend for stat tiles and table cells: line, area or bars,
 * with an optional end dot and min / max markers. No axes, no tooltip.
 */
export function Sparkline({
  data = SAMPLE,
  variant = "line",
  width = 96,
  height = 28,
  color = chartColor(0),
  curve = "smooth",
  endDot = true,
  showMinMax = false,
  strokeWidth = 1.5,
  domain,
  className,
  ref,
  ...rest
}: SparklineProps) {
  const [boxRef, measured] = useChartWidth<HTMLSpanElement>(typeof width === "number" ? width : 0);
  const w = typeof width === "number" ? width : measured;
  const gid = useId().replace(/:/g, "");
  const values = data.filter((v) => Number.isFinite(v));
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const stroke = color === "trend" ? (last > first ? "var(--color-success)" : last < first ? "var(--color-danger)" : chartColor(6)) : color;

  const geo = useMemo(() => {
    if (!values.length || w <= 0) return null;
    const pad = endDot || showMinMax ? 3 : strokeWidth;
    const min = domain?.[0] ?? Math.min(...values, variant === "bar" ? 0 : Infinity);
    const max = domain?.[1] ?? Math.max(...values);
    const span = max - min || 1;
    const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);
    if (variant === "bar") {
      const slot = w / values.length;
      const bw = Math.max(1, slot * 0.68);
      return {
        bars: values.map((v, i) => ({ x: i * slot + (slot - bw) / 2, y: y(v), w: bw, h: Math.max(1, height - pad - y(v)) })),
      };
    }
    const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
    const points = values.map((v, i) => ({ x: +(pad + i * step).toFixed(2), y: +y(v).toFixed(2) }));
    const line = curve === "smooth" ? smoothPath(points) : points.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
    const area = `${line} L ${points[points.length - 1]!.x} ${height} L ${points[0]!.x} ${height} Z`;
    const iMin = values.indexOf(Math.min(...values));
    const iMax = values.indexOf(Math.max(...values));
    return { points, line, area, iMin, iMax };
  }, [values, w, height, variant, curve, endDot, showMinMax, strokeWidth, domain]);

  const label = rest["aria-label"];
  return (
    <span
      ref={(el) => {
        boxRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cx("inline-block shrink-0 align-middle", width === "100%" && "block w-full", className)}
      style={{ width: typeof width === "number" ? width : undefined, height }}
    >
      {geo ? (
        <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} className="block overflow-visible">
          {"bars" in geo && geo.bars
            ? geo.bars.map((b, i) => (
                <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={Math.min(2, b.w / 2)} fill={stroke} fillOpacity={i === geo.bars.length - 1 ? 1 : 0.45} />
              ))
            : null}
          {"line" in geo && geo.line ? (
            <>
              {variant === "area" ? (
                <>
                  <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <path d={geo.area} fill={`url(#${gid})`} />
                </>
              ) : null}
              <path d={geo.line} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
              {showMinMax && geo.points.length > 1 ? (
                <>
                  <circle cx={geo.points[geo.iMax]!.x} cy={geo.points[geo.iMax]!.y} r={2.25} fill="var(--color-surface)" stroke={stroke} strokeWidth={1.25} />
                  <circle cx={geo.points[geo.iMin]!.x} cy={geo.points[geo.iMin]!.y} r={2.25} fill="var(--color-surface)" stroke={stroke} strokeWidth={1.25} />
                </>
              ) : null}
              {endDot ? (
                <circle cx={geo.points[geo.points.length - 1]!.x} cy={geo.points[geo.points.length - 1]!.y} r={2.5} fill={stroke} stroke="var(--color-surface)" strokeWidth={1.25} />
              ) : null}
            </>
          ) : null}
        </svg>
      ) : null}
    </span>
  );
}
