"use client";

import type { ReactNode, Ref } from "react";
import { Button as AriaButton, ComboBox as AriaComboBox, Group, Input as AriaInput, ListBox } from "react-aria-components";
import type { ComboBoxProps as AriaComboBoxProps, FieldErrorProps, PopoverProps } from "react-aria-components";
import { RiSearchLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { FieldDescription, FieldErrorText, FieldLabel } from "../../lib/field";
import { ChevronGlyph } from "../../lib/glyphs";
import { controlSize, fieldBox, fieldInput, iconSize, type Size } from "../../lib/recipes";
import { SelectItem, SelectPopover, SelectSection, selectListBoxClass } from "../select/select";
import type { SelectItemProps, SelectSectionProps } from "../select/select";

const COPY = {
  en: { empty: "No matches", toggle: "Show suggestions" },
  zh: { empty: "没有匹配的结果", toggle: "显示选项" },
};
export type ComboboxLabels = typeof COPY.en;

/** Option row (same as `SelectItem`): icon, description, meta; string children are the text value. */
export const ComboboxItem = SelectItem;
export type ComboboxItemProps<T extends object = object> = SelectItemProps<T>;
/** Labelled group of options (same as `SelectSection`). */
export const ComboboxSection = SelectSection;
export type ComboboxSectionProps<T extends object = object> = SelectSectionProps<T>;

export interface ComboboxProps<T extends object = object> extends Omit<AriaComboBoxProps<T>, "className" | "children"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps["children"];
  placeholder?: string;
  size?: Size;
  /** Icon at the start of the input; defaults to none. Pass `true` for a search icon. */
  startIcon?: ReactNode | true;
  /** Static `<ComboboxItem>`s / sections, or a render function used with `items`. */
  children: ReactNode | ((item: T) => ReactNode);
  /** What to show when nothing matches (default: "No matches"). */
  emptyState?: ReactNode;
  placement?: PopoverProps["placement"];
  labels?: Partial<ComboboxLabels>;
  className?: string;
  inputClassName?: string;
  popoverClassName?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Type-to-filter select. Filters by the items' text value (contains match,
 * locale-aware); controlled via `selectedKey` / `inputValue`, or pass `items`
 * that you filter yourself for async search.
 *
 *   <Combobox label="城市" placeholder="输入城市名">
 *     <ComboboxItem id="sh">上海</ComboboxItem>
 *     <ComboboxItem id="hz">杭州</ComboboxItem>
 *   </Combobox>
 */
export function Combobox<T extends object = object>({
  label,
  description,
  errorMessage,
  placeholder,
  size = "md",
  startIcon,
  children,
  emptyState,
  placement = "bottom start",
  labels,
  className,
  inputClassName,
  popoverClassName,
  ref,
  menuTrigger = "focus",
  allowsEmptyCollection = true,
  ...props
}: ComboboxProps<T>) {
  const t = useCopy(COPY, labels);
  return (
    <AriaComboBox {...props} ref={ref} menuTrigger={menuTrigger} allowsEmptyCollection={allowsEmptyCollection} className={cx("group flex w-full flex-col gap-1.5", className)}>
      {({ isInvalid, isDisabled, isOpen }) => (
        <>
          {label ? <FieldLabel required={props.isRequired}>{label}</FieldLabel> : null}
          <Group isInvalid={isInvalid} isDisabled={isDisabled} className={cx(fieldBox, controlSize[size], "pe-1.5", isOpen && "border-accent-500 ring-3 ring-accent-500/15")}>
            {startIcon ? (
              <span className={cx("inline-flex shrink-0 text-fg-subtle [&>svg]:size-full", iconSize[size])}>{startIcon === true ? <RiSearchLine /> : startIcon}</span>
            ) : null}
            <AriaInput placeholder={placeholder} className={cx(fieldInput, "h-full", inputClassName)} />
            <AriaButton
              aria-label={t.toggle}
              className="inline-flex size-6 shrink-0 cursor-default items-center justify-center rounded-md text-fg-subtle outline-none transition-colors duration-150 data-[hovered]:bg-surface-hover data-[hovered]:text-fg"
            >
              <ChevronGlyph className={cx("transition-transform duration-200 ease-out-soft", iconSize[size], isOpen && "rotate-180")} />
            </AriaButton>
          </Group>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldErrorText>{errorMessage}</FieldErrorText>
          <SelectPopover placement={placement} className={popoverClassName}>
            <ListBox<T>
              className={selectListBoxClass}
              renderEmptyState={() => <div className="px-3 py-6 text-center text-body-sm text-fg-subtle">{emptyState ?? t.empty}</div>}
            >
              {children}
            </ListBox>
          </SelectPopover>
        </>
      )}
    </AriaComboBox>
  );
}
