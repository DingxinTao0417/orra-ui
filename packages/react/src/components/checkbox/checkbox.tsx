"use client";

import type { ReactNode, Ref } from "react";
import { Checkbox as AriaCheckbox, CheckboxGroup as AriaCheckboxGroup } from "react-aria-components";
import type { CheckboxGroupProps as AriaCheckboxGroupProps, CheckboxProps as AriaCheckboxProps, FieldErrorProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import { FieldDescription, FieldErrorText, FieldLabel } from "../../lib/field";
import type { Size } from "../../lib/recipes";

const BOX_SIZE: Record<"sm" | "md", string> = { sm: "size-4 rounded-[5px]", md: "size-[18px] rounded-md" };

/**
 * The square itself, with an animated check (stroke draws in) and an
 * indeterminate dash. Useful on its own inside custom rows or table cells.
 */
export function CheckboxIndicator({
  isSelected,
  isIndeterminate,
  isInvalid,
  isDisabled,
  isFocusVisible,
  size = "md",
  className,
}: {
  isSelected?: boolean;
  isIndeterminate?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isFocusVisible?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const on = isSelected || isIndeterminate;
  return (
    <span
      aria-hidden
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center border transition-[background-color,border-color,box-shadow] duration-150 ease-out-soft",
        BOX_SIZE[size],
        on ? "border-transparent bg-accent-gradient text-fg-on-accent" : "border-line-strong bg-surface shadow-xs group-data-[hovered]:border-line-hover",
        isInvalid && (on ? "bg-danger bg-none" : "border-danger"),
        isDisabled && "opacity-50",
        isFocusVisible && "focus-ring",
        className,
      )}
    >
      <svg viewBox="0 0 16 16" fill="none" className="size-[78%]">
        {isIndeterminate ? (
          <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path
            d="M3.5 8.4 6.6 11.4 12.5 4.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={isSelected ? 0 : 1}
            className="transition-[stroke-dashoffset] duration-200 ease-out-soft"
          />
        )}
      </svg>
    </span>
  );
}

export interface CheckboxProps extends Omit<AriaCheckboxProps, "className" | "children"> {
  /** Label text. */
  children?: ReactNode;
  /** Secondary text under the label. */
  description?: ReactNode;
  /** `default` (box + label) or `card` (bordered selectable tile). */
  variant?: "default" | "card";
  /** Icon element at the start of a card tile. */
  icon?: ReactNode;
  size?: Extract<Size, "sm" | "md">;
  className?: string;
  ref?: Ref<HTMLLabelElement>;
}

/**
 * Checkbox with label, description and indeterminate state; `variant="card"`
 * turns it into a selectable tile.
 *
 *   <Checkbox description="每周一早上发送">订阅周报</Checkbox>
 */
export function Checkbox({ children, description, variant = "default", icon, size = "md", className, ref, ...props }: CheckboxProps) {
  const card = variant === "card";
  return (
    <AriaCheckbox
      {...props}
      ref={ref}
      className={cx(
        "group relative flex cursor-default select-none outline-none",
        card
          ? [
              "items-start gap-3 rounded-control border border-line-strong bg-surface p-3.5 shadow-xs transition-[border-color,background-color,box-shadow] duration-150",
              "data-[hovered]:border-line-hover data-[selected]:border-accent-500 data-[selected]:bg-accent-50/40 data-[selected]:ring-1 data-[selected]:ring-accent-500",
              "data-[indeterminate]:border-accent-500",
              "data-[invalid]:border-danger data-[focus-visible]:focus-ring",
            ]
          : "items-start gap-2.5",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60",
        className,
      )}
    >
      {({ isSelected, isIndeterminate, isInvalid, isFocusVisible }) => (
        <>
          {card && icon ? (
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-control bg-surface-muted text-fg-muted transition-colors group-data-[selected]:bg-accent-100 group-data-[selected]:text-fg-accent [&>svg]:size-[18px]">
              {icon}
            </span>
          ) : null}
          {!card ? (
            <CheckboxIndicator
              size={size}
              isSelected={isSelected}
              isIndeterminate={isIndeterminate}
              isInvalid={isInvalid}
              isFocusVisible={isFocusVisible}
              className={size === "sm" ? "mt-0.5" : "mt-px"}
            />
          ) : null}
          {children != null || description != null ? (
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              {children != null ? <span className={cx("text-fg", size === "sm" ? "text-body-sm" : "text-body", card && "font-medium")}>{children}</span> : null}
              {description != null ? <span className="text-body-sm text-fg-subtle">{description}</span> : null}
            </span>
          ) : null}
          {card ? <CheckboxIndicator size="sm" isSelected={isSelected} isIndeterminate={isIndeterminate} isInvalid={isInvalid} className="mt-0.5" /> : null}
        </>
      )}
    </AriaCheckbox>
  );
}

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, "className" | "children"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps["children"];
  /** Stack direction of the options (default vertical). Card groups use a responsive grid when `columns` is set. */
  orientation?: "vertical" | "horizontal";
  /** Lay options out in N equal columns (handy for card tiles). */
  columns?: number;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** A labelled set of checkboxes sharing one value array. */
export function CheckboxGroup({ label, description, errorMessage, orientation = "vertical", columns, children, className, ref, ...props }: CheckboxGroupProps) {
  return (
    <AriaCheckboxGroup {...props} ref={ref} className={cx("flex flex-col gap-2", className)}>
      {label ? <FieldLabel required={props.isRequired}>{label}</FieldLabel> : null}
      {description ? <FieldDescription className="-mt-1">{description}</FieldDescription> : null}
      <div
        className={cx(columns ? "grid gap-3" : orientation === "horizontal" ? "flex flex-wrap gap-x-5 gap-y-2" : "flex flex-col gap-2.5")}
        style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
      >
        {children}
      </div>
      <FieldErrorText>{errorMessage}</FieldErrorText>
    </AriaCheckboxGroup>
  );
}

