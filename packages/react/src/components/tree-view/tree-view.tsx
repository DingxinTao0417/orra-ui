"use client";

import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Checkbox, Collection, Tree, TreeItem, TreeItemContent } from "react-aria-components";
import type { Key, TreeProps } from "react-aria-components";
import { RiFileTextLine, RiFolder3Line, RiFolderOpenLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { CheckGlyph, ChevronGlyph } from "../../lib/glyphs";

const COPY = {
  en: { empty: "Nothing here yet", select: "Select" },
  zh: { empty: "暂无内容", select: "选择" },
};
export type TreeViewLabels = (typeof COPY)["en"];

export interface TreeViewNode {
  id: Key;
  /** Visible name; also used for type-ahead. */
  name: string;
  /** Icon element; folders and files get default icons. */
  icon?: ReactNode;
  /** Muted text after the name (a size, a count, a status). */
  meta?: ReactNode;
  children?: TreeViewNode[];
  isDisabled?: boolean;
}

export interface TreeViewProps extends Omit<TreeProps<TreeViewNode>, "items" | "children" | "className" | "renderEmptyState"> {
  items: TreeViewNode[];
  /** Accessible name for the tree. */
  "aria-label": string;
  /** Show checkboxes when `selectionMode="multiple"` (default true). */
  showCheckboxes?: boolean;
  /** Actions shown on the end side of a row on hover / focus, e.g. IconButtons. */
  renderActions?: (node: TreeViewNode) => ReactNode;
  /** Use default folder / file icons for nodes without `icon` (default true). */
  defaultIcons?: boolean;
  /** Row height. */
  density?: "compact" | "comfortable";
  className?: string;
  labels?: Partial<TreeViewLabels>;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A nested tree (folders, files, org charts…) with expand / collapse,
 * single or checkbox selection, icons and hover actions. Arrow keys move and
 * expand; type to jump to a node.
 *
 *   <TreeView aria-label="Files" items={files} selectionMode="single" defaultExpandedKeys={["src"]} />
 */
export function TreeView({
  items,
  showCheckboxes = true,
  renderActions,
  defaultIcons = true,
  density = "comfortable",
  className,
  labels,
  ref,
  ...props
}: TreeViewProps) {
  const t = useCopy(COPY, labels);
  const deps = [showCheckboxes, renderActions, defaultIcons, density, t];

  const renderNode = (node: TreeViewNode): ReactNode => {
    const isFolder = !!node.children;
    return (
      <TreeItem
        id={node.id}
        textValue={node.name}
        isDisabled={node.isDisabled}
        className={cx(
          "group relative cursor-default select-none rounded-control text-body text-fg outline-none",
          "data-[hovered]:bg-surface-hover data-[pressed]:bg-surface-active",
          "data-[selected]:bg-accent-50 data-[selected]:text-fg-accent",
          "data-[disabled]:text-fg-disabled",
          "data-[focus-visible]:outline-solid data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-focus",
        )}
      >
        <TreeItemContent>
          {({ hasChildItems, isExpanded, level, selectionMode, selectionBehavior, isSelected }) => (
            <div
              className={cx("flex items-center gap-1.5 pe-2", density === "compact" ? "h-8" : "h-9")}
              style={{ paddingInlineStart: `${(level - 1) * 18 + 6}px` }}
            >
              {hasChildItems ? (
                <AriaButton
                  slot="chevron"
                  className="grid size-5 shrink-0 place-items-center rounded-[5px] text-fg-subtle outline-none data-[hovered]:bg-surface-active data-[hovered]:text-fg"
                >
                  <ChevronGlyph
                    direction="right"
                    className={cx("size-3.5 transition-transform duration-150 rtl:-scale-x-100", isExpanded && "rotate-90 rtl:-rotate-90")}
                  />
                </AriaButton>
              ) : (
                <span className="size-5 shrink-0" />
              )}
              {selectionMode === "multiple" && selectionBehavior === "toggle" && showCheckboxes ? (
                <Checkbox slot="selection" aria-label={`${t.select} ${node.name}`} className="group/cb flex shrink-0 outline-none">
                  <span
                    className={cx(
                      "grid size-4 place-items-center rounded-[5px] border transition-colors duration-150",
                      isSelected ? "border-accent-500 bg-accent-500 text-fg-on-accent" : "border-line-strong bg-surface",
                      "group-data-[focus-visible]/cb:focus-ring",
                    )}
                  >
                    {isSelected ? <CheckGlyph className="size-3" /> : null}
                  </span>
                </Checkbox>
              ) : null}
              {node.icon || defaultIcons ? (
                <span
                  className={cx(
                    "inline-flex size-4 shrink-0 [&>svg]:size-full",
                    isSelected && selectionMode === "single" ? "text-fg-accent" : isFolder ? "text-fg-muted" : "text-fg-subtle",
                  )}
                >
                  {node.icon ?? (isFolder ? isExpanded ? <RiFolderOpenLine /> : <RiFolder3Line /> : <RiFileTextLine />)}
                </span>
              ) : null}
              <span className={cx("min-w-0 flex-1 truncate", isFolder && "font-medium")}>{node.name}</span>
              {node.meta ? <span className="shrink-0 text-caption text-fg-subtle tabular-nums group-data-[hovered]:hidden">{node.meta}</span> : null}
              {renderActions ? (
                <span className="hidden shrink-0 items-center gap-0.5 group-data-[focus-visible-within]:flex group-data-[hovered]:flex group-data-[focus-visible]:flex">
                  {renderActions(node)}
                </span>
              ) : null}
            </div>
          )}
        </TreeItemContent>
        {node.children ? <Collection items={node.children} dependencies={deps}>{renderNode}</Collection> : null}
      </TreeItem>
    );
  };

  return (
    <Tree<TreeViewNode>
      {...props}
      ref={ref}
      items={items}
      dependencies={deps}
      renderEmptyState={() => <div className="px-3 py-6 text-center text-body-sm text-fg-subtle">{t.empty}</div>}
      className={cx("flex w-full flex-col gap-px outline-none", className)}
    >
      {renderNode}
    </Tree>
  );
}
