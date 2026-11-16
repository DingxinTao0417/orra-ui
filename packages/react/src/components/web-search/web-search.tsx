"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode, Ref } from "react";
import { Button as AriaButton, Disclosure, DisclosurePanel, Link as AriaLink, useLocale } from "react-aria-components";
import { RiCheckLine, RiGlobalLine, RiSearch2Line } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { ChevronGlyph } from "../../lib/glyphs";
import { focusRing } from "../../lib/recipes";
import { agentSeedHash } from "../agent-avatar/agent-avatar";
import { Tooltip } from "../tooltip/tooltip";

const COPY = {
  en: {
    searching: "Searching the web",
    reading: "Reading {n} sources",
    readingOne: "Reading 1 source",
    summarizing: "Pulling out the key points",
    done: "Searched {q} times · {s} sources",
    doneOne: "Searched once · {s} sources",
    queries: "Searches",
    sources: "Sources",
    results: "{n} results",
    statusReading: "Reading",
    statusQueued: "Queued",
    statusRead: "Read",
    statusSkipped: "Skipped",
    cited: "Cited as [{n}]",
    more: "{n} more",
    less: "Show less",
    citation: "Source {n}: {title}",
  },
  zh: {
    searching: "正在搜索网页",
    reading: "正在阅读 {n} 个来源",
    readingOne: "正在阅读 1 个来源",
    summarizing: "正在整理要点",
    done: "搜索了 {q} 次 · 浏览 {s} 个来源",
    doneOne: "搜索了 1 次 · 浏览 {s} 个来源",
    queries: "搜索词",
    sources: "来源",
    results: "{n} 条结果",
    statusReading: "阅读中",
    statusQueued: "排队中",
    statusRead: "已阅读",
    statusSkipped: "已跳过",
    cited: "引用为 [{n}]",
    more: "还有 {n} 个",
    less: "收起",
    citation: "来源 {n}：{title}",
  },
};
export type WebSearchLabels = (typeof COPY)["en"];

export type WebSearchStatus = "searching" | "reading" | "summarizing" | "done";

export interface WebSearchQuery {
  id: string;
  query: string;
  /** Default `done`. */
  status?: "running" | "done";
  resultCount?: number;
}

export interface WebSearchSource {
  id: string;
  title: string;
  url: string;
  /** Default `read`. */
  status?: "queued" | "reading" | "read" | "skipped";
  /** Citation number when the answer cites this source. */
  citation?: number;
}

/** Host name without "www.", or the raw string when it isn't a URL. */
export function webSourceDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const ICON_HUES = [1, 2, 3, 4, 5, 6, 7, 8];
const ICON_SIZE = { sm: "size-4 text-[8px]", md: "size-5 text-[10px]" } as const;

export interface WebSourceIconProps {
  /** URL or domain; picks the letter and colour. */
  url: string;
  size?: keyof typeof ICON_SIZE;
  className?: string;
}

/** A generated "favicon": the domain's first letter on a seeded tint (no network requests). */
export function WebSourceIcon({ url, size = "md", className }: WebSourceIconProps) {
  const domain = webSourceDomain(url);
  const hue = `var(--color-chart-${ICON_HUES[agentSeedHash(domain) % ICON_HUES.length]})`;
  const letter = Array.from(domain)[0]?.toUpperCase() ?? "?";
  return (
    <span
      aria-hidden
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-semibold leading-none ring-2 ring-surface", ICON_SIZE[size], className)}
      style={{ background: `color-mix(in oklab, ${hue} 22%, var(--color-surface))`, color: `color-mix(in oklab, ${hue} 70%, var(--color-fg))` } as CSSProperties}
    >
      {letter}
    </span>
  );
}

export interface WebCitationProps {
  /** The citation number. */
  index: number;
  source: Pick<WebSearchSource, "title" | "url">;
  labels?: Partial<WebSearchLabels>;
  className?: string;
}

/** Inline citation marker for an answer: a small numbered pill that links to the source and previews it on hover. */
export function WebCitation({ index, source, labels, className }: WebCitationProps) {
  const t = useCopy(COPY, labels);
  return (
    <Tooltip
      delay={250}
      content={
        <span className="flex flex-col gap-0.5 py-0.5">
          <span className="line-clamp-2">{source.title}</span>
          <span className="font-normal opacity-70">{webSourceDomain(source.url)}</span>
        </span>
      }
    >
      <AriaLink
        href={source.url}
        target="_blank"
        rel="noreferrer"
        aria-label={fill(t.citation, { n: index, title: source.title })}
        className={cx(
          "mx-0.5 inline-flex h-4 min-w-4 -translate-y-px cursor-pointer items-center justify-center rounded-[5px] bg-surface-muted px-1 align-middle text-[10px] font-semibold text-fg-muted tabular-nums no-underline",
          "transition-colors duration-150 data-[hovered]:bg-accent-100 data-[hovered]:text-fg-accent",
          focusRing,
          className,
        )}
      >
        {index}
      </AriaLink>
    </Tooltip>
  );
}

export interface WebSearchProps {
  /** Overall phase (default `done`). */
  status?: WebSearchStatus;
  queries?: WebSearchQuery[];
  sources?: WebSearchSource[];
  /** Replace the header text. */
  label?: ReactNode;
  isExpanded?: boolean;
  /** Default: expanded while working, collapsed when done. */
  defaultExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  /** Show this many sources before a "n more" toggle (default 5). */
  maxSources?: number;
  labels?: Partial<WebSearchLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * The research trail of an agent's web search: the queries it ran, the
 * sources it opened (with generated favicons, titles and domains), live
 * reading / summarizing states, and citation numbers. Collapses to a
 * one-line summary.
 *
 *   <WebSearch status="reading" queries={queries} sources={sources} />
 */
export function WebSearch({
  status = "done",
  queries = [],
  sources = [],
  label,
  isExpanded,
  defaultExpanded,
  onExpandedChange,
  maxSources = 5,
  labels,
  className,
  ref,
}: WebSearchProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const [showAll, setShowAll] = useState(false);
  const active = status !== "done";
  const reading = sources.filter((s) => s.status === "reading").length;
  const nf = new Intl.NumberFormat(locale);

  const headerText =
    label ??
    (status === "searching"
      ? t.searching
      : status === "reading"
        ? reading === 1
          ? t.readingOne
          : fill(t.reading, { n: reading || sources.length })
        : status === "summarizing"
          ? t.summarizing
          : queries.length === 1
            ? fill(t.doneOne, { s: sources.length })
            : fill(t.done, { q: queries.length, s: sources.length }));

  const visible = showAll ? sources : sources.slice(0, maxSources);
  const hidden = sources.length - visible.length;

  return (
    <Disclosure
      ref={ref}
      isExpanded={isExpanded}
      defaultExpanded={defaultExpanded ?? active}
      onExpandedChange={onExpandedChange}
      className={cx("group w-full", className)}
    >
      <AriaButton
        slot="trigger"
        className={cx(
          "-ms-1.5 inline-flex max-w-full cursor-default items-center gap-2 rounded-control py-1 ps-1.5 pe-2 text-body-sm outline-none transition-colors duration-150",
          "data-[hovered]:bg-surface-hover data-[focus-visible]:focus-ring",
        )}
      >
        <span className={cx("relative flex size-5 shrink-0 items-center justify-center", active ? "text-fg-accent" : "text-fg-subtle")}>
          {active ? (
            <svg viewBox="0 0 20 20" fill="none" aria-hidden className="absolute inset-0 size-full motion-safe:animate-spin motion-safe:[animation-duration:1.3s]">
              <path d="M10 1a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : null}
          <RiGlobalLine className="size-3.5" />
        </span>
        <span className={cx("min-w-0 truncate font-medium", active ? "text-fg-muted motion-safe:text-shimmer" : "text-fg-muted")} role={active ? "status" : undefined}>
          {headerText}
        </span>
        {sources.length ? (
          <span aria-hidden className="flex shrink-0 -space-x-1 ps-0.5 rtl:space-x-reverse">
            {sources.slice(0, 4).map((s) => (
              <WebSourceIcon key={s.id} url={s.url} size="sm" />
            ))}
          </span>
        ) : null}
        <ChevronGlyph className="size-3.5 shrink-0 text-fg-subtle transition-transform duration-200 ease-out-soft group-data-[expanded]:rotate-180" />
      </AriaButton>
      <DisclosurePanel className="h-(--disclosure-panel-height) overflow-clip transition-[height] duration-250 ease-out-soft motion-reduce:transition-none">
        <div className="ms-[9px] mt-1.5 flex flex-col gap-3 border-s border-line ps-[17px] pb-1">
          {queries.length ? (
            <ul aria-label={t.queries} className="flex flex-wrap gap-1.5">
              {queries.map((q) => (
                <li
                  key={q.id}
                  className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 text-body-sm shadow-xs motion-safe:animate-in"
                >
                  <RiSearch2Line aria-hidden className="size-3.5 shrink-0 text-fg-subtle" />
                  <span className={cx("truncate", q.status === "running" ? "text-fg-muted motion-safe:text-shimmer" : "text-fg")}>{q.query}</span>
                  {q.resultCount != null && q.status !== "running" ? (
                    <span className="shrink-0 text-caption text-fg-subtle tabular-nums">{fill(t.results, { n: nf.format(q.resultCount) })}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          {sources.length ? (
            <div className="flex flex-col">
              <ul aria-label={t.sources} className="flex flex-col">
                {visible.map((s) => (
                  <SourceRow key={s.id} source={s} t={t} />
                ))}
              </ul>
              {sources.length > maxSources ? (
                <AriaButton
                  onPress={() => setShowAll((v) => !v)}
                  className={cx("-ms-1.5 mt-1 self-start rounded-[6px] px-1.5 py-0.5 text-caption font-medium text-fg-subtle data-[hovered]:bg-surface-hover data-[hovered]:text-fg", focusRing)}
                >
                  {showAll ? t.less : fill(t.more, { n: hidden })}
                </AriaButton>
              ) : null}
            </div>
          ) : null}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}

function SourceRow({ source, t }: { source: WebSearchSource; t: WebSearchLabels }) {
  const status = source.status ?? "read";
  const domain = webSourceDomain(source.url);
  return (
    <li className="motion-safe:animate-rise">
      <AriaLink
        href={source.url}
        target="_blank"
        rel="noreferrer"
        className={cx(
          "-mx-1.5 flex cursor-pointer items-center gap-2.5 rounded-control px-1.5 py-1.5 outline-none transition-colors duration-150",
          "data-[hovered]:bg-surface-hover data-[focus-visible]:focus-ring",
          status === "skipped" && "opacity-55",
        )}
      >
        <WebSourceIcon url={source.url} />
        <span className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className={cx("min-w-0 truncate text-body-sm", status === "queued" ? "text-fg-subtle" : "text-fg")}>{source.title}</span>
          <span className="shrink-0 text-caption text-fg-subtle">{domain}</span>
        </span>
        {status === "reading" ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-caption text-fg-accent">
            <span aria-hidden className="size-1.5 rounded-full bg-accent-500 motion-safe:animate-pulse" />
            {t.statusReading}
          </span>
        ) : status === "queued" ? (
          <span className="shrink-0 text-caption text-fg-subtle">{t.statusQueued}</span>
        ) : status === "skipped" ? (
          <span className="shrink-0 text-caption text-fg-subtle">{t.statusSkipped}</span>
        ) : source.citation != null ? (
          <span
            aria-label={fill(t.cited, { n: source.citation })}
            className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-[5px] bg-accent-50 px-1 text-[10px] font-semibold text-fg-accent tabular-nums"
          >
            {source.citation}
          </span>
        ) : (
          <RiCheckLine aria-label={t.statusRead} className="size-3.5 shrink-0 text-fg-subtle" />
        )}
      </AriaLink>
    </li>
  );
}
