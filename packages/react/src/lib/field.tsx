"use client";

import type { ReactNode } from "react";
import { FieldError as AriaFieldError, Label as AriaLabel, Text as AriaText } from "react-aria-components";
import type { FieldErrorProps, LabelProps, TextProps } from "react-aria-components";
import { cx } from "./cx";

/**
 * Field parts shared by every form control. Place them inside a React Aria
 * field (TextField, Select, ComboBox, NumberField…) and they wire up
 * label / description / error IDs automatically.
 */

export function FieldLabel({ className, children, required, ...props }: LabelProps & { required?: boolean; children?: ReactNode }) {
  return (
    <AriaLabel {...props} className={cx("inline-flex items-center gap-1 text-body-sm font-medium text-fg", className)}>
      {children}
      {required ? <span aria-hidden className="text-danger">*</span> : null}
    </AriaLabel>
  );
}

export function FieldDescription({ className, ...props }: TextProps) {
  return <AriaText {...props} slot="description" className={cx("text-caption text-fg-subtle", className)} />;
}

export function FieldErrorText({ className, ...props }: FieldErrorProps) {
  return (
    <AriaFieldError
      {...props}
      className={(state) => cx("text-caption text-danger", typeof className === "function" ? className(state) : className)}
    />
  );
}
