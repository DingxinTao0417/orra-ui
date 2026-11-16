"use client";

import { createContext, useContext } from "react";
import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Label as AriaLabel, Tag as AriaTag, TagGroup as AriaTagGroup, TagList as AriaTagList } from "react-aria-components";
import type { TagGroupProps as AriaTagGroupProps, TagListProps as AriaTagListProps, TagProps as AriaTagProps } from "react-aria-components";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { CheckGlyph, CloseGlyph } from "../../lib/glyphs";
import { focusRing, type Size } from "../../lib/recipes";

const COPY = {
  en: { remove: "Remove {name}", removeFallback: "Remove" },
  zh: { remove: "移除 {name}", removeFallback: "移除" },
};
export type ChipLabels = (typeof COPY)["en"];

export type ChipVariant = "outline" | "soft";

interface ChipContextValue {
  size: Size;
  variant: ChipVariant;
  labels?: Partial<ChipLabels>;
}
const ChipContext = createContext<ChipContextValue>({ size: "md", variant: "outline" });

const SIZES: Record<Size, string> = {
  sm: "h-6 gap-1 px-2 text-caption",
  md: "h-7 gap-1.5 px-2.5 text-body-sm",
  lg: "h-8 gap-1.5 px-3 text-body",
};
const ICON: Record<Size, string> = { sm: "size-3", md: "size-3.5", lg: "size-4" };
const AVATAR: Record<Size, string> = {
  sm: "-ms-1.5 [&>[role=img]]:size-4.5 [&>[role=img]]:text-[8px]",
  md: "-ms-2 [&>[role=img]]:size-5.5 [&>[role=img]]:text-[9px]",
  lg: "-ms-2 [&>[role=img]]:size-6.5 [&>[role=img]]:text-[10px]",
};
const REMOVE: Record<Size, string> = { sm: "size-4 -me-1", md: "size-5 -me-1.5", lg: "size-5.5 -me-1.5" };

const VARIANTS: Record<ChipVariant, string> = {
  outline: "border border-line-strong bg-surface text-fg-muted shadow-xs data-[hovered]:border-line-hover data-[hovered]:text-fg",
  soft: "border border-transparent bg-surface-muted text-fg-muted data-[hovered]:bg-surface-hover data-[hovered]:text-fg",
};

/* -------------------------------------------------------------- group */

export interface ChipGroupProps<T extends object> extends Omit<AriaTagGroupProps, "className" | "children"> {
  /** Visible label above the chips (otherwise pass `aria-label`). */
  label?: ReactNode;
  /** Dynamic items for `children` as a render function. */
  items?: Iterable<T>;
  children: ReactNode | ((item: T) => ReactNode);
  /** Shown when there are no chips (e.g. "暂无收件人"). */
  renderEmptyState?: AriaTagListProps<T>["renderEmptyState"];
  size?: Size;
  variant?: ChipVariant;
  labels?: Partial<ChipLabels>;
  className?: string;
  listClassName?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A keyboard-navigable set of chips (React Aria TagGroup). Use
 * `selectionMode` for filter chips, `onRemove` for recipients.
 *
 *   <ChipGroup aria-label="状态筛选" selectionMode="multiple" defaultSelectedKeys={["open"]}>
 *     <Chip id="open">进行中</Chip>
 *     <Chip id="done">已完成</Chip>
 *   </ChipGroup>
 */
export function ChipGroup<T extends object>({
  label,
  items,
  children,
  renderEmptyState,
  size = "md",
  variant = "outline",
  labels,
  className,
  listClassName,
  ref,
  ...props
}: ChipGroupProps<T>) {
  return (
    <ChipContext.Provider value={{ size, variant, labels }}>
      <AriaTagGroup {...props} ref={ref} className={cx("flex flex-col gap-2", className)}>
        {label ? <AriaLabel className="text-body-sm font-medium text-fg">{label}</AriaLabel> : null}
        <AriaTagList
          items={items}
          renderEmptyState={renderEmptyState}
          className={cx("flex flex-wrap items-center gap-2 outline-none", "data-[empty]:text-body-sm data-[empty]:text-fg-subtle", listClassName)}
        >
          {children}
        </AriaTagList>
      </AriaTagGroup>
    </ChipContext.Provider>
  );
}

/* --------------------------------------------------------------- chip */

export interface ChipProps extends Omit<AriaTagProps, "className" | "children"> {
  /** Leading icon element, e.g. `<RiFireLine />`. */
  icon?: ReactNode;
  /** Leading avatar, e.g. `<Avatar name="林晓雨" />` (resized to fit). */
  avatar?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** One chip inside a `ChipGroup`. Selected chips show a check; removable groups add a × button. */
export function Chip({ icon, avatar, children, className, textValue, ...props }: ChipProps) {
  const { size, variant, labels } = useContext(ChipContext);
  const t = useCopy(COPY, labels);
  const text = textValue ?? (typeof children === "string" ? children : undefined);

  return (
    <AriaTag
      {...props}
      textValue={text}
      className={cx(
        "group/chip inline-flex shrink-0 cursor-default select-none items-center whitespace-nowrap rounded-full font-medium",
        "transition-[background-color,border-color,color,box-shadow] duration-150",
        SIZES[size],
        VARIANTS[variant],
        "data-[selected]:border-accent-500/45 data-[selected]:bg-accent-50 data-[selected]:text-fg-accent data-[selected]:shadow-none",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        focusRing,
        className,
      )}
    >
      {({ isSelected, allowsRemoving, selectionMode }) => (
        <>
          {selectionMode !== "none" ? (
            <span
              aria-hidden
              className={cx(
                "inline-flex shrink-0 overflow-hidden transition-[width,opacity,margin] duration-150 ease-out-soft",
                isSelected ? cx(ICON[size], "opacity-100") : "-me-1 w-0 opacity-0",
                size === "sm" && !isSelected && "-me-0.5",
              )}
            >
              <CheckGlyph className={cx("shrink-0", ICON[size])} />
            </span>
          ) : null}
          {avatar ? <span className={cx("inline-flex shrink-0", AVATAR[size])}>{avatar}</span> : null}
          {icon ? <span aria-hidden className={cx("inline-flex shrink-0 [&>svg]:size-full", ICON[size])}>{icon}</span> : null}
          <span className="truncate">{children}</span>
          {allowsRemoving ? (
            <AriaButton
              slot="remove"
              aria-label={text ? fill(t.remove, { name: text }) : t.removeFallback}
              className={cx(
                "inline-flex shrink-0 items-center justify-center rounded-full text-fg-subtle outline-none transition-colors duration-150",
                "data-[hovered]:bg-surface-active data-[hovered]:text-fg data-[focus-visible]:focus-ring",
                REMOVE[size],
              )}
            >
              <CloseGlyph className="size-3" />
            </AriaButton>
          ) : null}
        </>
      )}
    </AriaTag>
  );
}
