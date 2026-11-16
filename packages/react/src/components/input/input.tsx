"use client";

import { useRef, useState } from "react";
import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Group, Input as AriaInput, TextField } from "react-aria-components";
import type { FieldErrorProps, GroupProps, InputProps as AriaInputProps, TextFieldProps } from "react-aria-components";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { FieldDescription, FieldErrorText, FieldLabel } from "../../lib/field";
import { CloseGlyph } from "../../lib/glyphs";
import { controlSize, fieldBox, fieldInput, focusRing, iconSize, type Size } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";

const COPY = {
  en: { clear: "Clear", showPassword: "Show password", hidePassword: "Hide password" },
  zh: { clear: "清空", showPassword: "显示密码", hidePassword: "隐藏密码" },
};
export type InputLabels = typeof COPY.en;

/* ------------------------------------------------------------------ parts */

export interface InputGroupProps extends Omit<GroupProps, "className"> {
  size?: Size;
  className?: string;
}

/**
 * The bordered field box on its own (React Aria Group). Put an `<InputControl />`
 * and any icons / addons / buttons inside it to compose a custom field.
 */
export function InputGroup({ size = "md", className, ...props }: InputGroupProps) {
  return <Group {...props} className={cx(fieldBox, controlSize[size], "relative", className)} />;
}

export interface InputControlProps extends Omit<AriaInputProps, "className" | "size"> {
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

/** The bare <input> styled to sit inside an `InputGroup`. */
export function InputControl({ className, ref, ...props }: InputControlProps) {
  return <AriaInput {...props} ref={ref} className={cx(fieldInput, "h-full", className)} />;
}

/** A muted text segment glued to the start or end edge of an `InputGroup`, e.g. "https://" or ".com". */
export function InputAddon({ side = "start", className, children }: { side?: "start" | "end"; className?: string; children: ReactNode }) {
  return (
    <span
      className={cx(
        "flex shrink-0 select-none items-center self-stretch whitespace-nowrap bg-surface-muted px-3 text-fg-subtle",
        side === "start" ? "-ms-px rounded-s-[calc(var(--radius-control)-1px)] border-e border-line" : "-me-px rounded-e-[calc(var(--radius-control)-1px)] border-s border-line",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Slot({ size, className, children }: { size: Size; className?: string; children: ReactNode }) {
  return <span className={cx("inline-flex shrink-0 text-fg-subtle [&>svg]:size-full", iconSize[size], className)}>{children}</span>;
}

/** Small square button used inside a field box (clear, reveal…). */
export function InputAction({ className, ...props }: React.ComponentProps<typeof AriaButton>) {
  return (
    <AriaButton
      {...props}
      className={cx(
        "-me-1 inline-flex size-6 shrink-0 cursor-default items-center justify-center rounded-md text-fg-subtle transition-colors duration-150",
        "data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active data-[disabled]:hidden",
        focusRing,
        typeof className === "string" ? className : undefined,
      )}
    />
  );
}

/* ------------------------------------------------------------------ Input */

export interface InputProps extends Omit<TextFieldProps, "className" | "children" | "value" | "defaultValue" | "onChange"> {
  label?: ReactNode;
  description?: ReactNode;
  /** Shown when invalid (isInvalid or failed validation). A function receives the validation result. */
  errorMessage?: FieldErrorProps["children"];
  placeholder?: string;
  size?: Size;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Icon element at the start, e.g. `<RiMailLine />`. */
  startIcon?: ReactNode;
  /** Icon element at the end. */
  endIcon?: ReactNode;
  /** Text glued to the start edge, e.g. "https://". */
  startAddon?: ReactNode;
  /** Text glued to the end edge, e.g. ".com" or "元". */
  endAddon?: ReactNode;
  /** Shows a × button while the field has a value. */
  isClearable?: boolean;
  /** For `type="password"`: show the eye toggle (default true). */
  revealable?: boolean;
  labels?: Partial<InputLabels>;
  className?: string;
  inputClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

/**
 * Text field with label, description and error, optional icons / addons,
 * a clear button and a password reveal toggle.
 *
 *   <Input label="邮箱" type="email" startIcon={<RiMailLine />} isClearable />
 */
export function Input({
  label,
  description,
  errorMessage,
  placeholder,
  size = "md",
  value,
  defaultValue = "",
  onChange,
  startIcon,
  endIcon,
  startAddon,
  endAddon,
  isClearable,
  revealable = true,
  type = "text",
  labels,
  className,
  inputClassName,
  ref,
  ...props
}: InputProps) {
  const t = useCopy(COPY, labels);
  const [text, setText] = useControllableState(value, defaultValue, onChange);
  const [revealed, setRevealed] = useState(false);
  const innerRef = useRef<HTMLInputElement | null>(null);
  const isPassword = type === "password";
  const setRefs = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
  };

  return (
    <TextField
      {...props}
      type={isPassword && revealed ? "text" : type}
      value={text}
      onChange={setText}
      className={cx("flex w-full flex-col gap-1.5", className)}
    >
      {({ isDisabled, isInvalid, isReadOnly }) => (
        <>
          {label ? <FieldLabel required={props.isRequired}>{label}</FieldLabel> : null}
          <InputGroup size={size} isDisabled={isDisabled} isInvalid={isInvalid} className={cx(startAddon != null && "ps-0", endAddon != null && "pe-0")}>
            {startAddon != null ? <InputAddon side="start">{startAddon}</InputAddon> : null}
            {startIcon ? <Slot size={size}>{startIcon}</Slot> : null}
            <InputControl ref={setRefs} placeholder={placeholder} className={inputClassName} />
            {isClearable && text && !isDisabled && !isReadOnly ? (
              <InputAction
                aria-label={t.clear}
                excludeFromTabOrder
                onPress={() => {
                  setText("");
                  innerRef.current?.focus();
                }}
              >
                <CloseGlyph className="size-4" />
              </InputAction>
            ) : null}
            {isPassword && revealable ? (
              <InputAction aria-label={revealed ? t.hidePassword : t.showPassword} isDisabled={isDisabled} onPress={() => setRevealed((r) => !r)}>
                {revealed ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
              </InputAction>
            ) : null}
            {endIcon ? <Slot size={size}>{endIcon}</Slot> : null}
            {endAddon != null ? <InputAddon side="end">{endAddon}</InputAddon> : null}
          </InputGroup>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldErrorText>{errorMessage}</FieldErrorText>
        </>
      )}
    </TextField>
  );
}
