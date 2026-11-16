"use client";

import type { ReactNode, Ref } from "react";
import {
  Breadcrumb as AriaBreadcrumb,
  Breadcrumbs as AriaBreadcrumbs,
  Button as AriaButton,
  Link as AriaLink,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover as AriaPopover,
} from "react-aria-components";
import type { Key } from "react-aria-components";
import { RiMoreLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { ChevronGlyph } from "../../lib/glyphs";
import { floatingPanel, focusRing, menuItem } from "../../lib/recipes";

const COPY = {
  en: { breadcrumb: "Breadcrumb", more: "Show hidden levels" },
  zh: { breadcrumb: "面包屑导航", more: "显示折叠的层级" },
};
export type BreadcrumbLabels = (typeof COPY)["en"];

export interface BreadcrumbItemData {
  /** Unique id (defaults to the index). */
  id?: Key;
  label: ReactNode;
  /** Link target; items without `href` call `onAction`. */
  href?: string;
  icon?: ReactNode;
  /** Plain-text label for the overflow menu when `label` isn't a string. */
  textValue?: string;
  isDisabled?: boolean;
}

export interface BreadcrumbProps {
  /** Path from the root to the current page (last item). */
  items: BreadcrumbItemData[];
  /** `chevron` (default), `slash`, or any element. */
  separator?: "chevron" | "slash" | ReactNode;
  /** Collapse middle levels into a "…" menu when there are more items than this. */
  maxItems?: number;
  /** Items kept before the "…" (default 1). */
  itemsBeforeCollapse?: number;
  /** Items kept after the "…" (default 2). */
  itemsAfterCollapse?: number;
  size?: "sm" | "md";
  /** Called with the item id for items without `href`. */
  onAction?: (id: Key) => void;
  className?: string;
  labels?: Partial<BreadcrumbLabels>;
  ref?: Ref<HTMLElement>;
}

type Entry = { kind: "item"; item: BreadcrumbItemData; id: Key } | { kind: "collapsed"; items: { item: BreadcrumbItemData; id: Key }[] };

/**
 * A path trail with separators, icons and a current page. Long paths fold
 * their middle levels into a "…" menu.
 *
 *   <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Projects", href: "/projects" }, { label: "Atlas" }]} />
 */
export function Breadcrumb({
  items,
  separator = "chevron",
  maxItems,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 2,
  size = "md",
  onAction,
  className,
  labels,
  ref,
}: BreadcrumbProps) {
  const t = useCopy(COPY, labels);
  const withIds = items.map((item, i) => ({ item, id: item.id ?? i }));

  let entries: Entry[] = withIds.map((e) => ({ kind: "item", ...e }));
  if (maxItems && items.length > maxItems && items.length > itemsBeforeCollapse + itemsAfterCollapse) {
    entries = [
      ...withIds.slice(0, itemsBeforeCollapse).map((e) => ({ kind: "item" as const, ...e })),
      { kind: "collapsed", items: withIds.slice(itemsBeforeCollapse, items.length - itemsAfterCollapse) },
      ...withIds.slice(items.length - itemsAfterCollapse).map((e) => ({ kind: "item" as const, ...e })),
    ];
  }

  const sep =
    separator === "chevron" ? (
      <ChevronGlyph direction="right" className="size-3.5 rtl:-scale-x-100" />
    ) : separator === "slash" ? (
      <span className="px-0.5 text-fg-disabled">/</span>
    ) : (
      separator
    );

  const text = size === "sm" ? "text-body-sm" : "text-body";
  const linkClass = cx(
    "inline-flex items-center gap-1.5 rounded-[6px] px-1 py-0.5 text-fg-muted outline-none transition-colors duration-150",
    "data-[hovered]:text-fg data-[hovered]:bg-surface-hover data-[disabled]:not-data-[current]:text-fg-disabled",
    "data-[current]:font-medium data-[current]:text-fg data-[current]:data-[hovered]:bg-transparent",
    focusRing,
  );
  const iconClass = "inline-flex size-4 shrink-0 text-fg-subtle [&>svg]:size-full";

  return (
    <nav ref={ref} aria-label={t.breadcrumb} className={cx("min-w-0", className)}>
      <AriaBreadcrumbs onAction={onAction} className={cx("flex flex-wrap items-center gap-1", text)}>
        {entries.map((entry, index) => {
          const last = index === entries.length - 1;
          const separatorEl = last ? null : (
            <span aria-hidden className="inline-flex items-center text-fg-subtle">
              {sep}
            </span>
          );
          if (entry.kind === "collapsed") {
            return (
              <AriaBreadcrumb key="__collapsed" id="__collapsed" className="flex items-center gap-1">
                <MenuTrigger>
                  <AriaButton
                    aria-label={t.more}
                    className={cx(
                      "inline-grid size-6 place-items-center rounded-[6px] text-fg-muted transition-colors duration-150",
                      "data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active",
                      focusRing,
                    )}
                  >
                    <RiMoreLine className="size-4" />
                  </AriaButton>
                  <AriaPopover placement="bottom start" offset={6} className={cx(floatingPanel, "min-w-44")}>
                    <Menu className="outline-none" onAction={(key) => onAction?.(key)}>
                      {entry.items.map(({ item, id }) => (
                        <MenuItem
                          key={String(id)}
                          id={id}
                          href={item.href}
                          isDisabled={item.isDisabled}
                          textValue={item.textValue ?? (typeof item.label === "string" ? item.label : undefined)}
                          className={menuItem}
                        >
                          {item.icon ? <span className={iconClass}>{item.icon}</span> : null}
                          <span className="truncate">{item.label}</span>
                        </MenuItem>
                      ))}
                    </Menu>
                  </AriaPopover>
                </MenuTrigger>
                {separatorEl}
              </AriaBreadcrumb>
            );
          }
          const { item, id } = entry;
          return (
            <AriaBreadcrumb key={String(id)} id={id} className="flex min-w-0 items-center gap-1">
              <AriaLink href={item.href} isDisabled={item.isDisabled} className={linkClass}>
                {item.icon ? <span className={iconClass}>{item.icon}</span> : null}
                <span className="max-w-48 truncate">{item.label}</span>
              </AriaLink>
              {separatorEl}
            </AriaBreadcrumb>
          );
        })}
      </AriaBreadcrumbs>
    </nav>
  );
}
