"use client";

import type { ReactNode, Ref } from "react";
import {
  Button as AriaButton,
  Collection,
  Header,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover,
  Select as AriaSelect,
  SelectValue,
} from "react-aria-components";
import type { FieldErrorProps, ListBoxItemProps, ListBoxSectionProps, PopoverProps, SelectProps as AriaSelectProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import { FieldDescription, FieldErrorText, FieldLabel } from "../../lib/field";
import { CheckGlyph, ChevronGlyph } from "../../lib/glyphs";
import { controlSize, fieldBox, floatingPanel, iconSize, menuHeading, menuItem, type Size } from "../../lib/recipes";

/* ------------------------------------------------------------- list parts */

export interface SelectItemProps<T extends object = object> extends Omit<ListBoxItemProps<T>, "className" | "children"> {
  /** Icon element (or avatar / swatch) before the label. */
  icon?: ReactNode;
  /** Secondary line under the label. Hidden in the trigger. */
  description?: ReactNode;
  /** Trailing content on the end side, e.g. a count or shortcut. */
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * An option row for `Select` and `Combobox`. Plain-string children double as
 * the text value used for typeahead and filtering; pass `textValue` otherwise.
 */
export function SelectItem<T extends object = object>({ icon, description, meta, children, textValue, className, ...props }: SelectItemProps<T>) {
  return (
    <ListBoxItem
      {...props}
      textValue={textValue ?? (typeof children === "string" ? children : undefined)}
      className={cx(menuItem, "pe-8 data-[selected]:font-medium", description != null && "items-start", className)}
    >
      {({ isSelected }) => (
        <>
          {icon ? (
            <span data-slot="icon" className={cx("inline-flex size-4 shrink-0 text-fg-muted [&>svg]:size-full", description != null && "mt-0.5")}>
              {icon}
            </span>
          ) : null}
          <span data-slot="text" className="flex min-w-0 flex-1 flex-col">
            <span data-slot="label" className="truncate">
              {children}
            </span>
            {description != null ? (
              <span data-slot="description" className="text-caption font-normal text-fg-subtle">
                {description}
              </span>
            ) : null}
          </span>
          {meta != null ? (
            <span data-slot="meta" className="shrink-0 text-caption font-normal text-fg-subtle tabular-nums">
              {meta}
            </span>
          ) : null}
          {isSelected ? (
            <span data-slot="check" className={cx("absolute end-2.5 inline-flex text-fg-accent", description != null ? "top-2.5" : "top-1/2 -translate-y-1/2")}>
              <CheckGlyph className="size-4" />
            </span>
          ) : null}
        </>
      )}
    </ListBoxItem>
  );
}

export interface SelectSectionProps<T extends object = object> extends Omit<ListBoxSectionProps<T>, "className" | "children"> {
  /** Heading shown above the group. */
  title?: ReactNode;
  /** Static items, or a render function used with `items`. */
  children: ReactNode | ((item: T) => ReactNode);
  className?: string;
}

/** A labelled group of options. */
export function SelectSection<T extends object = object>({ title, children, items, className, ...props }: SelectSectionProps<T>) {
  return (
    <ListBoxSection {...props} className={cx("[&+&]:mt-1 [&+&]:border-t [&+&]:border-line [&+&]:pt-1", className)}>
      {title != null ? <Header className={menuHeading}>{title}</Header> : null}
      <Collection items={items}>{children}</Collection>
    </ListBoxSection>
  );
}

/** The popover + listbox shell shared by Select and Combobox. */
export function SelectPopover({ className, children, ...props }: Omit<PopoverProps, "className"> & { className?: string }) {
  return (
    <Popover {...props} offset={props.offset ?? 6} className={cx(floatingPanel, "min-w-(--trigger-width) overflow-auto", className)}>
      {children}
    </Popover>
  );
}

export const selectListBoxClass = "max-h-72 outline-none";

/* ------------------------------------------------------------------ Select */

export interface SelectProps<T extends object = object> extends Omit<AriaSelectProps<T>, "className" | "children"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps["children"];
  size?: Size;
  /** Icon element shown at the start of the trigger (before the value). */
  startIcon?: ReactNode;
  /** Static `<SelectItem>`s / `<SelectSection>`s, or a render function used with `items`. */
  children: ReactNode | ((item: T) => ReactNode);
  /** Data for dynamic collections (each needs an `id`). */
  items?: Iterable<T>;
  /** Popover placement (default "bottom start"). */
  placement?: PopoverProps["placement"];
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Single choice from a list in a popover. Supports icons, descriptions,
 * sections and disabled items; typeahead and keyboard navigation come from
 * React Aria.
 *
 *   <Select label="角色" placeholder="选择角色">
 *     <SelectItem id="admin">管理员</SelectItem>
 *     <SelectItem id="member">成员</SelectItem>
 *   </Select>
 */
export function Select<T extends object = object>({
  label,
  description,
  errorMessage,
  size = "md",
  startIcon,
  children,
  items,
  placement = "bottom start",
  className,
  triggerClassName,
  popoverClassName,
  ref,
  ...props
}: SelectProps<T>) {
  return (
    <AriaSelect {...props} ref={ref} className={cx("group flex w-full flex-col gap-1.5", className)}>
      {({ isInvalid, isDisabled, isOpen }) => (
        <>
          {label ? <FieldLabel required={props.isRequired}>{label}</FieldLabel> : null}
          <AriaButton
            data-invalid={isInvalid || undefined}
            data-disabled={isDisabled || undefined}
            className={cx(
              fieldBox,
              controlSize[size],
              "cursor-default text-start outline-none",
              "data-[focus-visible]:border-accent-500 data-[focus-visible]:ring-3 data-[focus-visible]:ring-accent-500/15",
              isOpen && "border-accent-500 ring-3 ring-accent-500/15",
              triggerClassName,
            )}
          >
            {startIcon ? <span className={cx("inline-flex shrink-0 text-fg-subtle [&>svg]:size-full", iconSize[size])}>{startIcon}</span> : null}
            <SelectValue
              className={cx(
                "flex min-w-0 flex-1 items-center gap-2 truncate data-[placeholder]:text-fg-subtle",
                "[&_[data-slot=description]]:hidden [&_[data-slot=meta]]:hidden [&_[data-slot=icon]]:mt-0",
              )}
            />
            <ChevronGlyph className={cx("shrink-0 text-fg-subtle transition-transform duration-200 ease-out-soft", iconSize[size], isOpen && "rotate-180")} />
          </AriaButton>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldErrorText>{errorMessage}</FieldErrorText>
          <SelectPopover placement={placement} className={popoverClassName}>
            <ListBox<T> items={items} className={selectListBoxClass}>
              {children}
            </ListBox>
          </SelectPopover>
        </>
      )}
    </AriaSelect>
  );
}
