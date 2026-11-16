"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import type { ReactNode, Ref } from "react";
import { TextArea as AriaTextArea, TextField, useLocale } from "react-aria-components";
import type { FieldErrorProps, TextFieldProps } from "react-aria-components";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { FieldDescription, FieldErrorText, FieldLabel } from "../../lib/field";
import { fieldBox, fieldInput, type Size } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";

const COPY = {
  en: { remaining: "{n} characters left", over: "{n} characters over the limit" },
  zh: { remaining: "还可输入 {n} 个字符", over: "已超出 {n} 个字符" },
};
export type TextareaLabels = typeof COPY.en;

const PAD: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-body-sm",
  md: "px-3 py-2 text-body",
  lg: "px-4 py-2.5 text-body-lg",
};

const useIsoLayoutEffect = typeof window === "undefined" ? () => {} : useLayoutEffect;

export interface TextareaProps extends Omit<TextFieldProps, "className" | "children" | "value" | "defaultValue" | "onChange"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps["children"];
  placeholder?: string;
  size?: Size;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Visible rows when empty (default 3). */
  minRows?: number;
  /** Grows with content up to this many rows, then scrolls (default 8). Set equal to `minRows` to disable auto-grow. */
  maxRows?: number;
  /** Character limit. With `showCount`, renders "n / limit" under the field. */
  limit?: number;
  /** Hard-stop typing at `limit` (native maxLength). Otherwise going over marks the field invalid. Default true. */
  enforceLimit?: boolean;
  /** Show the character counter. */
  showCount?: boolean;
  labels?: Partial<TextareaLabels>;
  className?: string;
  textareaClassName?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

/**
 * Multi-line text field that grows with its content between `minRows` and
 * `maxRows`, with an optional character counter.
 *
 *   <Textarea label="项目简介" limit={200} showCount />
 */
export function Textarea({
  label,
  description,
  errorMessage,
  placeholder,
  size = "md",
  value,
  defaultValue = "",
  onChange,
  minRows = 3,
  maxRows = 8,
  limit,
  enforceLimit = true,
  showCount,
  labels,
  className,
  textareaClassName,
  ref,
  isInvalid,
  ...props
}: TextareaProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const [text, setText] = useControllableState(value, defaultValue, onChange);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  const resize = useCallback(() => {
    const el = areaRef.current;
    if (!el) return;
    const style = window.getComputedStyle(el);
    const line = parseFloat(style.lineHeight) || 20;
    const chrome = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    el.style.height = "auto";
    const min = line * minRows + chrome;
    const max = line * Math.max(minRows, maxRows) + chrome;
    const next = Math.min(Math.max(el.scrollHeight, min), max);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [minRows, maxRows]);

  useIsoLayoutEffect(resize, [text, resize]);

  const count = text.length;
  const over = limit != null && count > limit;
  const fmt = (n: number) => new Intl.NumberFormat(locale).format(n);
  const setRefs = (node: HTMLTextAreaElement | null) => {
    areaRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLTextAreaElement | null }).current = node;
  };

  return (
    <TextField
      {...props}
      value={text}
      onChange={setText}
      isInvalid={isInvalid || over}
      className={cx("flex w-full flex-col gap-1.5", className)}
    >
      {({ isDisabled, isInvalid: invalid }) => (
        <>
          {label ? <FieldLabel required={props.isRequired}>{label}</FieldLabel> : null}
          <div data-invalid={invalid || undefined} data-disabled={isDisabled || undefined} className={cx(fieldBox, "items-stretch")}>
            <AriaTextArea
              ref={setRefs}
              rows={minRows}
              placeholder={placeholder}
              maxLength={limit != null && enforceLimit ? limit : undefined}
              className={cx(fieldInput, "block w-full resize-none leading-relaxed", PAD[size], textareaClassName)}
            />
          </div>
          {description || (showCount && limit != null) ? (
            <div className="flex items-start gap-3">
              {description ? <FieldDescription className="flex-1">{description}</FieldDescription> : <span className="flex-1" />}
              {showCount && limit != null ? (
                <span className={cx("shrink-0 text-caption tabular-nums", over ? "text-danger" : count >= limit * 0.9 ? "text-warning" : "text-fg-subtle")}>
                  {fmt(count)} / {fmt(limit)}
                  <span className="sr-only" aria-live="polite">
                    {count >= limit * 0.9 ? fill(over ? t.over : t.remaining, { n: fmt(Math.abs(limit - count)) }) : ""}
                  </span>
                </span>
              ) : null}
            </div>
          ) : null}
          <FieldErrorText>{errorMessage}</FieldErrorText>
        </>
      )}
    </TextField>
  );
}
