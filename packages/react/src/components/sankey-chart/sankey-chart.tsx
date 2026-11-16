"use client";

import { useId, useMemo, useState } from "react";
import type { Ref } from "react";
import { Sankey, Tooltip } from "recharts";
import type { SankeyLinkProps, SankeyNodeProps } from "recharts";
import { useLocale } from "react-aria-components";
import { cx } from "../../lib/cx";
import { ChartEmptyState, ChartPlot, ChartTooltipPanel, chartColor, createChartFormatter, useChartLabels, useChartWidth, type ChartLabels, type ChartValueFormat } from "../chart-card/chart-parts";

export interface SankeyChartNode {
  name: string;
  color?: string;
}

export interface SankeyChartLink {
  /** Source node index or name. */
  source: number | string;
  /** Target node index or name. */
  target: number | string;
  value: number;
}

export interface SankeyChartData {
  nodes: SankeyChartNode[];
  links: SankeyChartLink[];
}

export interface SankeyChartLabels extends ChartLabels {
  sampleHome: string;
  samplePricing: string;
  sampleDocs: string;
  sampleSignup: string;
  sampleBounce: string;
}

const SAMPLE_COPY = {
  en: { sampleHome: "Home", samplePricing: "Pricing", sampleDocs: "Docs", sampleSignup: "Signed up", sampleBounce: "Left" },
  zh: { sampleHome: "首页", samplePricing: "定价页", sampleDocs: "文档", sampleSignup: "完成注册", sampleBounce: "离开" },
};

export interface SankeyChartProps {
  /** Nodes and links; defaults to a clearly-marked sample (traffic source → landing page → outcome). */
  data?: SankeyChartData;
  height?: number;
  valueFormat?: ChartValueFormat;
  currency?: string;
  /** Node bar width in px. */
  nodeWidth?: number;
  /** Vertical gap between nodes in px. */
  nodePadding?: number;
  /** Show the value next to each node name. */
  showValues?: boolean;
  /** Tint links with a source → target gradient (otherwise the source colour). */
  gradientLinks?: boolean;
  "aria-label"?: string;
  className?: string;
  labels?: Partial<SankeyChartLabels>;
  ref?: Ref<HTMLDivElement>;
}

function useSample(labels?: Partial<SankeyChartLabels>) {
  const { locale } = useLocale();
  const t = useChartLabels(labels);
  const zh = locale.toLowerCase().startsWith("zh");
  return useMemo<SankeyChartData>(() => {
    const c = { ...(zh ? SAMPLE_COPY.zh : SAMPLE_COPY.en), ...labels };
    return {
      nodes: [
        { name: t.sampleOrganic },
        { name: t.sampleReferral },
        { name: t.sampleDirect },
        { name: c.sampleHome },
        { name: c.samplePricing },
        { name: c.sampleDocs },
        { name: c.sampleSignup, color: "var(--color-success)" },
        { name: c.sampleBounce, color: "var(--color-chart-7)" },
      ],
      links: [
        { source: 0, target: 3, value: 8200 },
        { source: 0, target: 5, value: 4600 },
        { source: 0, target: 4, value: 2100 },
        { source: 1, target: 4, value: 3400 },
        { source: 1, target: 3, value: 1900 },
        { source: 2, target: 3, value: 3900 },
        { source: 2, target: 4, value: 1500 },
        { source: 3, target: 6, value: 2600 },
        { source: 3, target: 7, value: 11400 },
        { source: 4, target: 6, value: 3100 },
        { source: 4, target: 7, value: 3900 },
        { source: 5, target: 6, value: 1200 },
        { source: 5, target: 7, value: 3400 },
      ],
    };
  }, [zh, labels, t]);
}

interface NodeDatum {
  name: string;
  color: string;
  value?: number;
  /** Outgoing links (Recharts calls them targetLinks). */
  targetLinks?: unknown[];
}

/**
 * Flow diagram (sources → targets): node bars with names and values, links
 * tinted by their endpoints, hover highlight and the shared tooltip.
 */
export function SankeyChart({
  data,
  height = 300,
  valueFormat = "number",
  currency,
  nodeWidth = 10,
  nodePadding = 18,
  showValues = true,
  gradientLinks = true,
  className,
  labels,
  ref,
  ...rest
}: SankeyChartProps) {
  const { locale } = useLocale();
  const sample = useSample(labels);
  const copy = useChartLabels(labels);
  const src = data ?? sample;
  const fmt = useMemo(() => createChartFormatter(valueFormat, locale, currency), [valueFormat, locale, currency]);
  const uid = useId().replace(/:/g, "");
  const [boxRef, width] = useChartWidth();
  // On narrow containers node values are dropped so labels don't collide (they stay in the tooltip).
  const compact = width > 0 && width < 480;
  const [hoverLink, setHoverLink] = useState<number | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);

  const prepared = useMemo(() => {
    const idx = new Map(src.nodes.map((n, i) => [n.name, i]));
    const resolve = (v: number | string) => (typeof v === "number" ? v : idx.get(v) ?? -1);
    return {
      nodes: src.nodes.map((n, i) => ({ name: n.name, color: n.color ?? chartColor(i) })),
      links: src.links.map((l) => ({ source: resolve(l.source), target: resolve(l.target), value: l.value })).filter((l) => l.source >= 0 && l.target >= 0 && l.value > 0),
    };
  }, [src]);

  if (!prepared.nodes.length || !prepared.links.length) return <ChartEmptyState height={height} labels={labels} className={className} />;

  const renderNode = (p: SankeyNodeProps) => {
    const node = p.payload as unknown as NodeDatum;
    const sink = !node.targetLinks?.length;
    const dim = (hoverNode != null && hoverNode !== node.name) || hoverLink != null;
    const tx = sink ? p.x - 8 : p.x + p.width + 8;
    const ty = p.y + p.height / 2;
    return (
      <g onMouseEnter={() => setHoverNode(node.name)} onMouseLeave={() => setHoverNode(null)}>
        <rect x={p.x} y={p.y} width={p.width} height={Math.max(2, p.height)} rx={2.5} fill={node.color} fillOpacity={dim ? 0.55 : 1} />
        <text
          x={tx}
          y={ty}
          textAnchor={sink ? "end" : "start"}
          dominantBaseline="middle"
          fontSize={compact ? 11 : 12}
          paintOrder="stroke"
          stroke="var(--color-surface)"
          strokeWidth={3}
          strokeLinejoin="round"
          style={{ pointerEvents: "none" }}
        >
          <tspan fill="var(--color-fg)" fontWeight={500}>
            {node.name}
          </tspan>
          {showValues && !compact && node.value != null ? (
            <tspan fill="var(--color-chart-axis)" dx={6}>
              {fmt(node.value)}
            </tspan>
          ) : null}
        </text>
      </g>
    );
  };

  const renderLink = (p: SankeyLinkProps) => {
    const s = p.payload.source as unknown as NodeDatum;
    const t = p.payload.target as unknown as NodeDatum;
    const on = hoverLink === p.index || (hoverNode != null && (s.name === hoverNode || t.name === hoverNode));
    const anyHover = hoverLink != null || hoverNode != null;
    const id = `${uid}-l${p.index}`;
    return (
      <g>
        {gradientLinks ? (
          <defs>
            <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={p.sourceX} x2={p.targetX} y1={0} y2={0}>
              <stop offset="0%" stopColor={s.color} />
              <stop offset="100%" stopColor={t.color} />
            </linearGradient>
          </defs>
        ) : null}
        <path
          d={`M ${p.sourceX},${p.sourceY} C ${p.sourceControlX},${p.sourceY} ${p.targetControlX},${p.targetY} ${p.targetX},${p.targetY}`}
          fill="none"
          stroke={gradientLinks ? `url(#${id})` : s.color}
          strokeWidth={Math.max(1, p.linkWidth)}
          strokeOpacity={on ? 0.5 : anyHover ? 0.12 : 0.28}
          style={{ transition: "stroke-opacity 150ms" }}
          onMouseEnter={() => setHoverLink(p.index)}
          onMouseLeave={() => setHoverLink(null)}
        />
      </g>
    );
  };

  return (
    <div
      ref={(el) => {
        boxRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      className={cx("w-full min-w-0", className)}
    >
      <ChartPlot height={height}>
        <Sankey
          width="100%"
          height={height}
          data={prepared}
          nodeWidth={nodeWidth}
          nodePadding={nodePadding}
          linkCurvature={0.5}
          iterations={48}
          margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
          node={renderNode}
          link={renderLink}
          aria-label={rest["aria-label"]}
        >
          <Tooltip
            animationDuration={150}
            content={({ active, payload }) => {
              const entry = active ? payload?.[0] : undefined;
              const item = (entry?.payload as { payload?: unknown } | undefined)?.payload ?? entry?.payload;
              if (!entry || !item) return null;
              const link = item as { source?: NodeDatum; target?: NodeDatum; value?: number };
              if (link.source && link.target && typeof link.source === "object") {
                return (
                  <ChartTooltipPanel
                    title={`${link.source.name} → ${link.target.name}`}
                    rows={[{ key: "v", label: copy.value, value: fmt(Number(link.value ?? entry.value)), color: link.source.color }]}
                  />
                );
              }
              const node = item as NodeDatum;
              return <ChartTooltipPanel rows={[{ key: "v", label: node.name, value: fmt(Number(node.value ?? entry.value)), color: node.color }]} />;
            }}
          />
        </Sankey>
      </ChartPlot>
    </div>
  );
}
