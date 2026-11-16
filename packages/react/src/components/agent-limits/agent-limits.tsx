"use client";

import { useEffect, useState } from "react";
import type { ReactNode, Ref } from "react";
import { Meter as AriaMeter, useLocale } from "react-aria-components";
import { RiArrowRightUpLine, RiFlashlightLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { card } from "../../lib/recipes";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Meter, meterLevel } from "../meter/meter";

const COPY = {
  en: {
    usage: "Usage",
    context: "Context window",
    contextValue: "{used} / {limit} tokens",
    free: "Free",
    resetsMinutes: "Resets in {m} min",
    resetsHours: "Resets in {h} h {m} min",
    resetsOn: "Resets {date}",
    resetsSoon: "Resets in under a minute",
    upgrade: "Upgrade",
    of: "{used} / {limit}",
    plan: "Plan",
  },
  zh: {
    usage: "用量",
    context: "上下文窗口",
    contextValue: "{used} / {limit} tokens",
    free: "剩余",
    resetsMinutes: "{m} 分钟后重置",
    resetsHours: "{h} 小时 {m} 分钟后重置",
    resetsOn: "{date} 重置",
    resetsSoon: "即将重置",
    upgrade: "升级方案",
    of: "{used} / {limit}",
    plan: "方案",
  },
};
export type AgentLimitsLabels = (typeof COPY)["en"];

export interface AgentQuota {
  id: string;
  /** e.g. "高级模型请求". */
  label: ReactNode;
  used: number;
  limit: number;
  /** Unit appended to the value text, e.g. "次" or "credits". */
  unit?: string;
  /** When the quota refills. Rendered relative to now ("3 h 20 min") on the client. */
  resetsAt?: Date | number;
  /** Text under the bar, replacing the reset time. */
  description?: ReactNode;
}

export interface AgentContextSegment {
  id: string;
  /** e.g. "系统提示词", "对话", "文件". */
  label: ReactNode;
  /** Tokens. */
  value: number;
  /** CSS colour; defaults to the chart palette in order. */
  color?: string;
}

export interface AgentContextUsage {
  /** Window size in tokens. */
  limit: number;
  /** What fills the window. */
  segments: AgentContextSegment[];
}

export interface AgentLimitsProps {
  /** Card title (default "Usage"). */
  title?: ReactNode;
  /** Plan name shown as a badge in the header, e.g. "Pro". */
  plan?: ReactNode;
  /** Context window breakdown. */
  context?: AgentContextUsage;
  /** Request / token / credit quotas. */
  quotas?: AgentQuota[];
  /** Shows the upgrade button. */
  onUpgrade?: () => void;
  /** Replace the "Upgrade" button text. */
  upgradeLabel?: ReactNode;
  /** Text next to the upgrade button, e.g. "升级到 Team，额度提升 5 倍". */
  upgradeHint?: ReactNode;
  /** `card` (default) or `plain` to embed inside a popover or settings page. */
  variant?: "card" | "plain";
  labels?: Partial<AgentLimitsLabels>;
  className?: string;
  ref?: Ref<HTMLElement>;
}

const SEGMENT_COLORS = [1, 2, 3, 4, 5, 6].map((n) => `var(--color-chart-${n})`);

/** Current time on the client only (null during SSR and the first render), refreshed every 30 s. */
function useClientNow(enabled: boolean) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now;
}

/**
 * Usage card for an AI plan: how full the context window is (with a
 * breakdown), request and token quotas as meters that warn as they fill,
 * reset times, and an upgrade action.
 *
 *   <AgentLimits plan="Pro" context={ctx} quotas={quotas} onUpgrade={openBilling} />
 */
export function AgentLimits({
  title,
  plan,
  context,
  quotas = [],
  onUpgrade,
  upgradeLabel,
  upgradeHint,
  variant = "card",
  labels,
  className,
  ref,
}: AgentLimitsProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const now = useClientNow(quotas.some((q) => q.resetsAt != null));
  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const plain = new Intl.NumberFormat(locale);
  const dateFmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

  const resetText = (at: Date | number) => {
    if (now == null) return " ";
    const ms = +at - now;
    if (ms < 60_000) return t.resetsSoon;
    const mins = Math.round(ms / 60_000);
    if (mins < 60) return fill(t.resetsMinutes, { m: mins });
    if (mins < 24 * 60) return fill(t.resetsHours, { h: Math.floor(mins / 60), m: mins % 60 });
    return fill(t.resetsOn, { date: dateFmt.format(at) });
  };

  const worst = quotas.reduce((acc, q) => Math.max(acc, q.used / (q.limit || 1)), 0);
  const urgent = meterLevel(worst) !== "ok";

  return (
    <section ref={ref} className={cx(variant === "card" && cx(card, "p-5"), "flex w-full flex-col gap-5", className)}>
      <header className="flex items-center gap-2">
        <h3 className="min-w-0 flex-1 truncate text-body font-medium text-fg">{title ?? t.usage}</h3>
        {plan != null ? (
          <Badge tone="accent" icon={<RiFlashlightLine />}>
            {plan}
          </Badge>
        ) : null}
      </header>

      {context ? <ContextBar context={context} t={t} compact={compact} /> : null}

      {quotas.length ? (
        <div className="flex flex-col gap-4">
          {quotas.map((q) => (
            <Meter
              key={q.id}
              label={q.label}
              value={q.used}
              maxValue={q.limit}
              accentWhenOk
              size="sm"
              valueLabel={`${fill(t.of, { used: plain.format(q.used), limit: plain.format(q.limit) })}${q.unit ? ` ${q.unit}` : ""}`}
              description={q.description ?? (q.resetsAt != null ? <span suppressHydrationWarning>{resetText(q.resetsAt)}</span> : undefined)}
            />
          ))}
        </div>
      ) : null}

      {onUpgrade ? (
        <footer className={cx("flex items-center gap-3", (context || quotas.length > 0) && "border-t border-line pt-4")}>
          <p className="min-w-0 flex-1 text-body-sm text-fg-subtle">{upgradeHint}</p>
          <Button size="sm" variant={urgent ? "solid" : "outline"} tone={urgent ? "accent" : "neutral"} endIcon={<RiArrowRightUpLine />} onPress={onUpgrade}>
            {upgradeLabel ?? t.upgrade}
          </Button>
        </footer>
      ) : null}
    </section>
  );
}

function ContextBar({ context, t, compact }: { context: AgentContextUsage; t: AgentLimitsLabels; compact: Intl.NumberFormat }) {
  const used = context.segments.reduce((sum, s) => sum + s.value, 0);
  const limit = Math.max(context.limit, 1);
  const fraction = Math.min(1, used / limit);
  const level = meterLevel(fraction);
  const pct = Math.round(fraction * 100);
  const valueText = fill(t.contextValue, { used: compact.format(used), limit: compact.format(context.limit) });

  return (
    <AriaMeter value={used} maxValue={limit} valueLabel={`${valueText} · ${pct}%`} className="flex flex-col gap-2.5">
      {() => (
        <>
          <div className="flex items-baseline justify-between gap-3 text-body-sm">
            <span className="font-medium text-fg">{t.context}</span>
            <span className="flex items-baseline gap-2 tabular-nums">
              <span className="text-fg-muted">{valueText}</span>
              <span className={cx("text-caption font-medium", level === "critical" ? "text-danger" : level === "warning" ? "text-warning" : "text-fg-subtle")}>
                {pct}%
              </span>
            </span>
          </div>
          <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-surface-muted">
            {context.segments.map((s, i) => (
              <span
                key={s.id}
                className="h-full transition-[width] duration-500 ease-out-soft first:rounded-s-full last:rounded-e-full"
                style={{ width: `${(s.value / limit) * 100}%`, background: s.color ?? SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
              />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-caption text-fg-subtle">
            {context.segments.map((s, i) => (
              <li key={s.id} className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-2 rounded-[3px]" style={{ background: s.color ?? SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
                <span className="text-fg-muted">{s.label}</span>
                <span className="tabular-nums">{compact.format(s.value)}</span>
              </li>
            ))}
            <li className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-[3px] border border-line-strong bg-surface-muted" />
              <span className="text-fg-muted">{t.free}</span>
              <span className="tabular-nums">{compact.format(Math.max(0, context.limit - used))}</span>
            </li>
          </ul>
        </>
      )}
    </AriaMeter>
  );
}
