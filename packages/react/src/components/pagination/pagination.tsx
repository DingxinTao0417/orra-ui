"use client";

import type { Ref } from "react";
import { Button as AriaButton, ListBox, ListBoxItem, Popover as AriaPopover, Select, SelectValue, useLocale } from "react-aria-components";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { CheckGlyph, ChevronGlyph } from "../../lib/glyphs";
import { floatingPanel, focusRing, menuItem, type Size } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";

const COPY = {
  en: {
    pagination: "Pagination",
    previous: "Previous page",
    next: "Next page",
    page: "Page {page}",
    morePages: "More pages",
    summary: "{from}–{to} of {total}",
    compact: "{page} / {count}",
    perPage: "{size} / page",
    pageSize: "Rows per page",
  },
  zh: {
    pagination: "分页",
    previous: "上一页",
    next: "下一页",
    page: "第 {page} 页",
    morePages: "更多页",
    summary: "第 {from}–{to} 条，共 {total} 条",
    compact: "{page} / {count}",
    perPage: "{size} 条/页",
    pageSize: "每页条数",
  },
};
export type PaginationLabels = (typeof COPY)["en"];

type PageToken = number | "gap-start" | "gap-end";

/**
 * Pages to show: the first/last `boundaries` pages, a window of `siblings`
 * around the current page, and gaps. A gap of exactly one page shows that
 * page instead, and the window is shifted near the ends so the control keeps
 * a constant width while paging.
 */
export function paginationRange(page: number, count: number, siblings = 1, boundaries = 1): PageToken[] {
  const slots = boundaries * 2 + siblings * 2 + 3;
  if (count <= slots) return Array.from({ length: count }, (_, i) => i + 1);
  const windowSize = siblings * 2 + 1;
  let start = page - siblings;
  let end = page + siblings;
  const minStart = boundaries + 2;
  const maxEnd = count - boundaries - 1;
  if (start < minStart) {
    start = boundaries + 1;
    end = start + windowSize;
  }
  if (end > maxEnd) {
    end = count - boundaries;
    start = end - windowSize;
  }
  const shown = new Set<number>();
  for (let i = 1; i <= boundaries; i++) shown.add(i);
  for (let i = start; i <= end; i++) shown.add(i);
  for (let i = count - boundaries + 1; i <= count; i++) shown.add(i);
  const sorted = [...shown].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b);
  const out: PageToken[] = [];
  sorted.forEach((n, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && n - prev === 2) out.push(prev + 1);
    else if (prev !== undefined && n - prev > 2) out.push(n < page ? "gap-start" : "gap-end");
    out.push(n);
  });
  return out;
}

const BOX: Record<Size, string> = {
  sm: "h-8 min-w-8 px-1.5 text-body-sm rounded-[9px]",
  md: "h-9 min-w-9 px-2 text-body rounded-control",
  lg: "h-11 min-w-11 px-3 text-body-lg rounded-control",
};

export interface PaginationProps {
  /** Current page, 1-based (controlled). */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Total number of items. Use with `pageSize`, or pass `pageCount` directly. */
  total?: number;
  pageCount?: number;
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (size: number) => void;
  /** Show a page-size select with these options, e.g. [10, 20, 50]. */
  pageSizeOptions?: number[];
  /** Show the "1–10 of 248" summary (needs `total`). */
  showSummary?: boolean;
  /** Pages kept around the current one (default 1). */
  siblings?: number;
  /** Pages kept at each end (default 1). */
  boundaries?: number;
  /** `auto` (default) swaps page numbers for "3 / 12" when the container is narrow. */
  mode?: "auto" | "full" | "compact";
  /** `outline` bordered squares or `plain` (default). */
  variant?: "plain" | "outline";
  size?: Size;
  isDisabled?: boolean;
  className?: string;
  labels?: Partial<PaginationLabels>;
  ref?: Ref<HTMLElement>;
}

/**
 * Page navigation with ellipses, previous / next, an optional page-size
 * select and a range summary. In `auto` mode it becomes a compact "3 / 12"
 * pager when its container is narrow.
 *
 *   <Pagination total={248} pageSize={10} page={page} onPageChange={setPage} showSummary />
 */
export function Pagination({
  page,
  defaultPage = 1,
  onPageChange,
  total,
  pageCount,
  pageSize,
  defaultPageSize = 10,
  onPageSizeChange,
  pageSizeOptions,
  showSummary,
  siblings = 1,
  boundaries = 1,
  mode = "auto",
  variant = "plain",
  size = "md",
  isDisabled,
  className,
  labels,
  ref,
}: PaginationProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const nf = new Intl.NumberFormat(locale);
  const [perPage, setPerPage] = useControllableState(pageSize, defaultPageSize, onPageSizeChange);
  const count = Math.max(1, pageCount ?? Math.ceil((total ?? 0) / perPage));
  const [rawPage, setPage] = useControllableState(page, defaultPage, onPageChange);
  const current = Math.min(Math.max(1, rawPage), count);
  const go = (p: number) => setPage(Math.min(Math.max(1, p), count));
  const tokens = paginationRange(current, count, siblings, boundaries);

  const box = cx(
    "inline-flex shrink-0 cursor-default select-none items-center justify-center font-medium tabular-nums transition-colors duration-150",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
    focusRing,
    BOX[size],
  );
  const idle = cx(
    "text-fg-muted data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active",
    variant === "outline" && "border border-line-strong bg-surface shadow-xs",
  );
  const active = cx("bg-accent-50 text-fg-accent", variant === "outline" && "border border-accent-300");

  const showNumbers = mode !== "compact";
  const showCompact = mode !== "full";

  const from = total ? (current - 1) * perPage + 1 : 0;
  const to = total ? Math.min(total, current * perPage) : 0;

  return (
    <nav ref={ref} aria-label={t.pagination} className={cx(mode === "auto" && "@container w-full", className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {showSummary && total != null ? (
          <p className="text-body-sm text-fg-subtle tabular-nums">
            {fill(t.summary, { from: nf.format(from), to: nf.format(to), total: nf.format(total) })}
          </p>
        ) : null}
        {pageSizeOptions?.length ? (
          <Select
            aria-label={t.pageSize}
            selectedKey={perPage}
            onSelectionChange={(key) => {
              if (key == null) return;
              const next = Number(key);
              const firstItem = (current - 1) * perPage;
              setPerPage(next);
              go(Math.floor(firstItem / next) + 1);
            }}
            isDisabled={isDisabled}
            className="shrink-0"
          >
            <AriaButton
              className={cx(
                "inline-flex h-8 items-center gap-1.5 rounded-control border border-line-strong bg-surface ps-2.5 pe-2 text-body-sm text-fg shadow-xs",
                "transition-colors duration-150 data-[hovered]:border-line-hover",
                focusRing,
              )}
            >
              <SelectValue className="tabular-nums">{({ selectedText }) => selectedText}</SelectValue>
              <ChevronGlyph className="size-3.5 text-fg-subtle" />
            </AriaButton>
            <AriaPopover offset={6} className={cx(floatingPanel, "min-w-(--trigger-width)")}>
              <ListBox className="outline-none">
                {pageSizeOptions.map((opt) => (
                  <ListBoxItem key={opt} id={opt} textValue={fill(t.perPage, { size: opt })} className={cx(menuItem, "text-body-sm")}>
                    {({ isSelected }) => (
                      <>
                        <span className="flex-1 tabular-nums">{fill(t.perPage, { size: nf.format(opt) })}</span>
                        {isSelected ? <CheckGlyph className="size-4 text-fg-accent" /> : null}
                      </>
                    )}
                  </ListBoxItem>
                ))}
              </ListBox>
            </AriaPopover>
          </Select>
        ) : null}
        <div className={cx("flex items-center gap-1", (showSummary || pageSizeOptions) && "ms-auto")}>
          <AriaButton aria-label={t.previous} isDisabled={isDisabled || current <= 1} onPress={() => go(current - 1)} className={cx(box, idle)}>
            <ChevronGlyph direction="left" className="size-4 rtl:-scale-x-100" />
          </AriaButton>

          {showNumbers ? (
            <ul className={cx("items-center gap-1", mode === "auto" ? "hidden @md:flex" : "flex")}>
              {tokens.map((token) =>
                typeof token === "number" ? (
                  <li key={token}>
                    <AriaButton
                      aria-label={fill(t.page, { page: nf.format(token) })}
                      aria-current={token === current ? "page" : undefined}
                      isDisabled={isDisabled}
                      onPress={() => go(token)}
                      className={cx(box, token === current ? active : idle)}
                    >
                      {nf.format(token)}
                    </AriaButton>
                  </li>
                ) : (
                  <li key={token} aria-hidden className={cx("inline-flex items-center justify-center text-fg-subtle", BOX[size])}>
                    …
                  </li>
                ),
              )}
            </ul>
          ) : null}

          {showCompact ? (
            <span
              aria-live="polite"
              className={cx(
                "min-w-16 px-2 text-center text-body-sm font-medium text-fg-muted tabular-nums",
                mode === "auto" ? "inline-block @md:hidden" : "inline-block",
              )}
            >
              {fill(t.compact, { page: nf.format(current), count: nf.format(count) })}
            </span>
          ) : null}

          <AriaButton aria-label={t.next} isDisabled={isDisabled || current >= count} onPress={() => go(current + 1)} className={cx(box, idle)}>
            <ChevronGlyph direction="right" className="size-4 rtl:-scale-x-100" />
          </AriaButton>
        </div>

      </div>
    </nav>
  );
}
