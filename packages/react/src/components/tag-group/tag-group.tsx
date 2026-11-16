"use client";

import { createContext, useContext, useRef, useState } from "react";
import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Label, Tag as AriaTag, TagGroup as AriaTagGroup, TagList, Text } from "react-aria-components";
import type { TagGroupProps as AriaTagGroupProps, TagProps as AriaTagProps } from "react-aria-components";
import { RiAddLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { CheckGlyph, CloseGlyph } from "../../lib/glyphs";
import { focusRing } from "../../lib/recipes";

const COPY = {
  en: { add: "Add", addPlaceholder: "New tag", addLabel: "New tag name", empty: "No tags yet", remove: "Remove {name}" },
  zh: { add: "添加", addPlaceholder: "新标签", addLabel: "新标签名称", empty: "暂无标签", remove: "移除 {name}" },
};
export type TagGroupLabels = typeof COPY.en;

type TagSize = "sm" | "md";
const SizeContext = createContext<{ size: TagSize; t: TagGroupLabels }>({ size: "md", t: COPY.en });

const TAG_SIZE: Record<TagSize, string> = {
  sm: "h-6 gap-1 px-2 text-caption [&_[data-slot=icon]>svg]:size-3",
  md: "h-7 gap-1.5 px-2.5 text-body-sm [&_[data-slot=icon]>svg]:size-3.5",
};

export interface TagProps extends Omit<AriaTagProps, "className" | "children"> {
  /** Icon element (or a small dot / avatar) before the text. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A tag / pill inside a `TagGroup`. Shows a check when selected and a × when the group is removable. */
export function Tag({ icon, children, textValue, className, ...props }: TagProps) {
  const { size, t } = useContext(SizeContext);
  const text = textValue ?? (typeof children === "string" ? children : undefined);
  return (
    <AriaTag
      {...props}
      textValue={text}
      className={cx(
        "group inline-flex max-w-full cursor-default select-none items-center rounded-full border border-line-strong bg-surface font-medium text-fg-muted shadow-xs outline-none",
        "transition-[background-color,border-color,color] duration-150",
        "data-[hovered]:border-line-hover data-[hovered]:text-fg",
        "data-[selected]:border-accent-500 data-[selected]:bg-accent-50 data-[selected]:text-fg-accent",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        "data-[focus-visible]:focus-ring",
        TAG_SIZE[size],
        className,
      )}
    >
      {({ allowsRemoving, isSelected, selectionMode }) => (
        <>
          {selectionMode !== "none" ? (
            <span className={cx("-ms-0.5 inline-flex overflow-hidden transition-[width] duration-200 ease-out-soft", isSelected ? "w-3.5" : "w-0")}>
              <CheckGlyph className="size-3.5 shrink-0" />
            </span>
          ) : null}
          {icon ? (
            <span data-slot="icon" className="inline-flex shrink-0">
              {icon}
            </span>
          ) : null}
          <span className="truncate">{children}</span>
          {allowsRemoving ? (
            <AriaButton
              slot="remove"
              aria-label={fill(t.remove, { name: text ?? "" })}
              className="-me-1 inline-flex size-4 shrink-0 cursor-default items-center justify-center rounded-full text-fg-subtle outline-none transition-colors data-[hovered]:bg-surface-active data-[hovered]:text-fg"
            >
              <CloseGlyph className="size-3" />
            </AriaButton>
          ) : null}
        </>
      )}
    </AriaTag>
  );
}

export interface TagGroupProps<T extends object = object> extends Omit<AriaTagGroupProps, "className" | "children"> {
  label?: ReactNode;
  description?: ReactNode;
  /** Static `<Tag>`s, or a render function used with `items`. */
  children?: ReactNode | ((item: T) => ReactNode);
  items?: Iterable<T>;
  size?: TagSize;
  /**
   * Shows an "Add" pill that turns into a small input. Called with the trimmed
   * text on Enter; you add the tag to your own list.
   */
  onAdd?: (text: string) => void;
  /** Shown when there are no tags (default: "No tags yet"). */
  emptyState?: ReactNode;
  labels?: Partial<TagGroupLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A group of tags: plain, selectable as filters (`selectionMode`), removable
 * (`onRemove`), with an optional inline "add" input. Arrow keys move between
 * tags, Backspace / Delete removes.
 *
 *   <TagGroup label="技能" onRemove={remove} onAdd={add} items={tags}>
 *     {(tag) => <Tag>{tag.name}</Tag>}
 *   </TagGroup>
 */
export function TagGroup<T extends object = object>({
  label,
  description,
  children,
  items,
  size = "md",
  onAdd,
  emptyState,
  labels,
  className,
  ref,
  ...props
}: TagGroupProps<T>) {
  const t = useCopy(COPY, labels);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const text = draft.trim();
    if (text) onAdd?.(text);
    setDraft("");
  };

  return (
    <SizeContext.Provider value={{ size, t }}>
      <AriaTagGroup {...props} ref={ref} className={cx("flex flex-col gap-2", className)}>
        {label ? <Label className="text-body-sm font-medium text-fg">{label}</Label> : null}
        <div className="flex flex-wrap items-center gap-1.5">
          <TagList<T>
            items={items}
            className="flex flex-wrap items-center gap-1.5 empty:hidden"
            renderEmptyState={() => (onAdd ? null : <span className="text-body-sm text-fg-subtle">{emptyState ?? t.empty}</span>)}
          >
            {children}
          </TagList>
          {onAdd ? (
            adding ? (
              <input
                ref={inputRef}
                autoFocus
                value={draft}
                aria-label={t.addLabel}
                placeholder={t.addPlaceholder}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submit();
                  } else if (e.key === "Escape") {
                    setDraft("");
                    setAdding(false);
                  }
                }}
                onBlur={() => {
                  submit();
                  setAdding(false);
                }}
                className={cx(
                  "w-28 rounded-full border border-accent-500 bg-surface text-fg outline-none ring-3 ring-accent-500/15 placeholder:text-fg-subtle",
                  size === "sm" ? "h-6 px-2 text-caption" : "h-7 px-2.5 text-body-sm",
                )}
              />
            ) : (
              <AriaButton
                onPress={() => setAdding(true)}
                className={cx(
                  "inline-flex cursor-default items-center rounded-full border border-dashed border-line-strong font-medium text-fg-subtle",
                  "transition-colors duration-150 data-[hovered]:border-line-hover data-[hovered]:text-fg data-[pressed]:bg-surface-hover",
                  focusRing,
                  TAG_SIZE[size],
                )}
              >
                <RiAddLine className={size === "sm" ? "size-3" : "size-3.5"} />
                {t.add}
              </AriaButton>
            )
          ) : null}
        </div>
        {description ? (
          <Text slot="description" className="text-caption text-fg-subtle">
            {description}
          </Text>
        ) : null}
      </AriaTagGroup>
    </SizeContext.Provider>
  );
}
