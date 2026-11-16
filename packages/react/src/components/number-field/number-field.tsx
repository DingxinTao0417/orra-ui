"use client";

import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Group, Input as AriaInput, NumberField as AriaNumberField } from "react-aria-components";
import type { FieldErrorProps, NumberFieldProps as AriaNumberFieldProps } from "react-aria-components";
import { RiAddLine, RiSubtractLine } from "@remixicon/react";
import { cx } from "../../lib/cx";
import { FieldDescription, FieldErrorText, FieldLabel } from "../../lib/field";
import { ChevronGlyph } from "../../lib/glyphs";
import { controlSize, fieldBox, fieldInput, iconSize, type Size } from "../../lib/recipes";

const STEP_SQUARE: Record<Size, string> = { sm: "w-8", md: "w-9", lg: "w-11" };

const stepButton = [
  "inline-flex shrink-0 cursor-default items-center justify-center text-fg-muted outline-none transition-colors duration-150",
  "data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active",
  "data-[focus-visible]:bg-accent-50 data-[focus-visible]:text-fg-accent",
  "data-[disabled]:text-fg-disabled data-[disabled]:bg-transparent",
].join(" ");

export interface NumberFieldProps extends Omit<AriaNumberFieldProps, "className" | "children"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps["children"];
  placeholder?: string;
  size?: Size;
  /**
   * Where the steppers go: `stacked` (default) puts ▲▼ on the end side,
   * `split` puts − at the start and + at the end, `none` hides them.
   */
  stepper?: "stacked" | "split" | "none";
  /** Icon element at the start (stacked / none layouts). */
  startIcon?: ReactNode;
  className?: string;
  inputClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

/**
 * Numeric input with steppers, min / max / step, wheel + arrow-key support and
 * locale formatting through `formatOptions` (currency, percent, units).
 *
 *   <NumberField label="单价" formatOptions={{ style: "currency", currency: "CNY" }} />
 */
export function NumberField({
  label,
  description,
  errorMessage,
  placeholder,
  size = "md",
  stepper = "stacked",
  startIcon,
  className,
  inputClassName,
  ref,
  ...props
}: NumberFieldProps) {
  const split = stepper === "split";
  return (
    <AriaNumberField {...props} className={cx("flex w-full flex-col gap-1.5", className)}>
      {label ? <FieldLabel required={props.isRequired}>{label}</FieldLabel> : null}
      <Group className={cx(fieldBox, controlSize[size], "overflow-hidden", stepper !== "none" && "pe-0", split && "ps-0")}>
        {split ? (
          <AriaButton slot="decrement" className={cx(stepButton, "self-stretch border-e border-line", STEP_SQUARE[size])}>
            <RiSubtractLine className={iconSize[size]} />
          </AriaButton>
        ) : startIcon ? (
          <span className={cx("inline-flex shrink-0 text-fg-subtle [&>svg]:size-full", iconSize[size])}>{startIcon}</span>
        ) : null}
        <AriaInput ref={ref} placeholder={placeholder} className={cx(fieldInput, "h-full tabular-nums", split && "text-center", inputClassName)} />
        {split ? (
          <AriaButton slot="increment" className={cx(stepButton, "self-stretch border-s border-line", STEP_SQUARE[size])}>
            <RiAddLine className={iconSize[size]} />
          </AriaButton>
        ) : stepper === "stacked" ? (
          <div className="flex h-full w-7 shrink-0 flex-col border-s border-line">
            <AriaButton slot="increment" className={cx(stepButton, "flex-1 border-b border-line")}>
              <ChevronGlyph direction="up" className="size-3.5" />
            </AriaButton>
            <AriaButton slot="decrement" className={cx(stepButton, "flex-1")}>
              <ChevronGlyph className="size-3.5" />
            </AriaButton>
          </div>
        ) : null}
      </Group>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldErrorText>{errorMessage}</FieldErrorText>
    </AriaNumberField>
  );
}
