"use client";

import { createContext, useContext } from "react";
import type { ReactNode, Ref } from "react";
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import type { FieldErrorProps, RadioGroupProps as AriaRadioGroupProps, RadioProps as AriaRadioProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import { FieldDescription, FieldErrorText, FieldLabel } from "../../lib/field";

type RadioVariant = "default" | "card";
const VariantContext = createContext<RadioVariant>("default");

/** The round indicator: a ring that fills with a scaled-in dot. */
export function RadioIndicator({ isSelected, isInvalid, isFocusVisible, className }: { isSelected?: boolean; isInvalid?: boolean; isFocusVisible?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        "relative inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color] duration-150 ease-out-soft",
        isSelected ? "border-transparent bg-accent-gradient" : "border-line-strong bg-surface shadow-xs group-data-[hovered]:border-line-hover",
        isInvalid && (isSelected ? "bg-danger bg-none" : "border-danger"),
        isFocusVisible && "focus-ring",
        className,
      )}
    >
      <span className={cx("size-1.5 rounded-full bg-fg-on-accent transition-transform duration-200 ease-out-soft", isSelected ? "scale-100" : "scale-0")} />
    </span>
  );
}

export interface RadioProps extends Omit<AriaRadioProps, "className" | "children"> {
  /** Label text. */
  children?: ReactNode;
  description?: ReactNode;
  /** Card tiles: icon element at the start. */
  icon?: ReactNode;
  /** Card tiles: content on the end side, e.g. a price. */
  aside?: ReactNode;
  className?: string;
  ref?: Ref<HTMLLabelElement>;
}

/** One option of a `RadioGroup`. Its look follows the group's `variant`. */
export function Radio({ children, description, icon, aside, className, ref, ...props }: RadioProps) {
  const variant = useContext(VariantContext);
  const card = variant === "card";
  return (
    <AriaRadio
      {...props}
      ref={ref}
      className={cx(
        "group relative flex cursor-default select-none outline-none",
        card
          ? [
              "items-start gap-3 rounded-control border border-line-strong bg-surface p-3.5 shadow-xs transition-[border-color,background-color,box-shadow] duration-150",
              "data-[hovered]:border-line-hover data-[selected]:border-accent-500 data-[selected]:bg-accent-50/40 data-[selected]:ring-1 data-[selected]:ring-accent-500",
              "data-[invalid]:border-danger data-[focus-visible]:focus-ring",
            ]
          : "items-start gap-2.5",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60",
        className,
      )}
    >
      {({ isSelected, isInvalid, isFocusVisible }) => (
        <>
          {card && icon ? (
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-control bg-surface-muted text-fg-muted transition-colors group-data-[selected]:bg-accent-100 group-data-[selected]:text-fg-accent [&>svg]:size-[18px]">
              {icon}
            </span>
          ) : null}
          {!card ? <RadioIndicator isSelected={isSelected} isInvalid={isInvalid} isFocusVisible={isFocusVisible} className="mt-px" /> : null}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            {children != null ? <span className={cx("text-body text-fg", card && "font-medium")}>{children}</span> : null}
            {description != null ? <span className="text-body-sm text-fg-subtle">{description}</span> : null}
          </span>
          {card && aside != null ? <span className="shrink-0 text-body font-medium text-fg tabular-nums">{aside}</span> : null}
          {card ? <RadioIndicator isSelected={isSelected} isInvalid={isInvalid} className="mt-px" /> : null}
        </>
      )}
    </AriaRadio>
  );
}

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, "className" | "children"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps["children"];
  /** `default` (dot + label) or `card` (selectable tiles, e.g. a plan picker). */
  variant?: RadioVariant;
  /** Lay options out in N equal columns (handy for card tiles). */
  columns?: number;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Single choice from a short list. Arrow keys move the selection (React Aria);
 * `orientation="horizontal"` puts options in a row.
 *
 *   <RadioGroup label="通知方式" defaultValue="email">
 *     <Radio value="email">邮件</Radio>
 *     <Radio value="sms">短信</Radio>
 *   </RadioGroup>
 */
export function RadioGroup({ label, description, errorMessage, variant = "default", columns, orientation = "vertical", children, className, ref, ...props }: RadioGroupProps) {
  return (
    <AriaRadioGroup {...props} orientation={orientation} ref={ref} className={cx("flex flex-col gap-2", className)}>
      {label ? <FieldLabel required={props.isRequired}>{label}</FieldLabel> : null}
      {description ? <FieldDescription className="-mt-1">{description}</FieldDescription> : null}
      <VariantContext.Provider value={variant}>
        <div
          className={cx(
            columns ? "grid gap-3" : orientation === "horizontal" ? "flex flex-wrap gap-x-5 gap-y-2" : cx("flex flex-col", variant === "card" ? "gap-3" : "gap-2.5"),
            orientation === "horizontal" && variant === "card" && !columns && "gap-3 [&>*]:flex-1",
          )}
          style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
        >
          {children}
        </div>
      </VariantContext.Provider>
      <FieldErrorText>{errorMessage}</FieldErrorText>
    </AriaRadioGroup>
  );
}
