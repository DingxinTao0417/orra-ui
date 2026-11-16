"use client";

import { Fragment, useId, useRef } from "react";
import type { ClipboardEvent, KeyboardEvent, ReactNode } from "react";
import { useLocale } from "react-aria-components";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import type { Size } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";

const COPY = {
  en: { group: "Verification code", digit: "Character {n} of {total}" },
  zh: { group: "验证码", digit: "第 {n} 位，共 {total} 位" },
};
export type InputOTPLabels = typeof COPY.en;

const BOX: Record<Size, string> = {
  sm: "h-9 w-8 text-body rounded-lg",
  md: "h-11 w-10 text-title-sm rounded-control",
  lg: "h-13 w-12 text-title rounded-xl",
};

const PATTERN = {
  numeric: /[0-9]/,
  alphanumeric: /[0-9a-zA-Z]/,
} as const;

export interface InputOTPProps {
  /** Number of characters (default 6). */
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fires once every box is filled. */
  onComplete?: (value: string) => void;
  /** `numeric` (default) accepts 0–9; `alphanumeric` accepts letters too (upper-cased). */
  mode?: "numeric" | "alphanumeric";
  /** Insert a separator after every K boxes, e.g. 3 → "123 – 456". */
  groupSize?: number;
  /** Custom separator element (default: a short dash). */
  separator?: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  isInvalid?: boolean;
  isDisabled?: boolean;
  autoFocus?: boolean;
  /** Hide the characters like a password. */
  mask?: boolean;
  /** Submits the joined code in forms. */
  name?: string;
  size?: Size;
  labels?: Partial<InputOTPLabels>;
  className?: string;
}

/**
 * One-time-code input: N single-character boxes. Typing advances, Backspace
 * goes back, arrows / Home / End move, and paste or SMS autofill spreads the
 * code across the boxes.
 *
 *   <InputOTP length={6} groupSize={3} onComplete={verify} />
 */
export function InputOTP({
  length = 6,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  mode = "numeric",
  groupSize,
  separator,
  label,
  description,
  errorMessage,
  isInvalid,
  isDisabled,
  autoFocus,
  mask,
  name,
  size = "md",
  labels,
  className,
}: InputOTPProps) {
  const t = useCopy(COPY, labels);
  const { direction } = useLocale();
  const id = useId();
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [code, setCode] = useControllableState(value, defaultValue, onChange);
  const chars = Array.from({ length }, (_, i) => code[i] ?? "");

  const clean = (raw: string) =>
    Array.from(raw)
      .filter((c) => PATTERN[mode].test(c))
      .map((c) => c.toUpperCase());

  const focusBox = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  };

  // The code never has gaps: clearing a middle box closes the gap, like text.
  const commit = (next: string[]) => {
    const joined = next.join("").slice(0, length);
    setCode(joined);
    if (joined.length === length) onComplete?.(joined);
  };

  const spread = (from: number, incoming: string[]) => {
    const next = [...chars];
    let i = from;
    for (const c of incoming) {
      if (i >= length) break;
      next[i++] = c;
    }
    commit(next);
    focusBox(Math.min(i, length - 1));
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    const back = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    const fwd = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...chars];
      if (next[i]) {
        next[i] = "";
        commit(next);
      } else if (i > 0) {
        next[i - 1] = "";
        commit(next);
        focusBox(i - 1);
      }
    } else if (e.key === "Delete") {
      e.preventDefault();
      const next = [...chars];
      next[i] = "";
      commit(next);
    } else if (e.key === back) {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === fwd) {
      e.preventDefault();
      focusBox(Math.min(i + 1, code.length));
    } else if (e.key === "Home") {
      e.preventDefault();
      focusBox(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusBox(Math.min(code.length, length - 1));
    } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      const c = clean(e.key);
      if (c.length) spread(Math.min(i, code.length), c);
    }
  };

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const c = clean(e.clipboardData.getData("text"));
    if (c.length) spread(c.length >= length ? 0 : Math.min(i, code.length), c);
  };

  const labelId = `${id}-label`;
  const descId = `${id}-desc`;
  const errId = `${id}-err`;
  const describedBy = [description ? descId : null, isInvalid && errorMessage ? errId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cx("flex flex-col gap-1.5", className)} data-invalid={isInvalid || undefined} data-disabled={isDisabled || undefined}>
      {label ? (
        <span id={labelId} className="text-body-sm font-medium text-fg">
          {label}
        </span>
      ) : null}
      <div
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : t.group}
        aria-describedby={describedBy}
        className="flex items-center gap-2"
      >
        {chars.map((c, i) => (
          <Fragment key={i}>
            {groupSize && i > 0 && i % groupSize === 0 ? (
              separator ?? <span aria-hidden className="h-0.5 w-3 shrink-0 rounded-full bg-line-strong" />
            ) : null}
            <input
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={mask && c ? "•" : c}
              onChange={(e) => {
                // Fallback for autofill / IME, which bypass keydown.
                // A single char typed next to the box's existing one: keep only the new char.
                const shown = mask && c ? "•" : c;
                const raw = shown && e.target.value.length === 2 ? e.target.value.replace(shown, "") : e.target.value;
                const incoming = clean(raw);
                if (incoming.length) spread(incoming.length >= length ? 0 : Math.min(i, code.length), incoming);
              }}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={(e) => onPaste(i, e)}
              onFocus={(e) => e.target.select()}
              onMouseDown={(e) => {
                // Clicking an empty box past the end jumps to the next box to fill.
                if (i > code.length) {
                  e.preventDefault();
                  focusBox(code.length);
                }
              }}
              disabled={isDisabled}
              autoFocus={autoFocus && i === 0}
              autoComplete={i === 0 ? "one-time-code" : "off"}
              inputMode={mode === "numeric" ? "numeric" : "text"}
              autoCapitalize="characters"
              spellCheck={false}
              aria-label={fill(t.digit, { n: i + 1, total: length })}
              aria-invalid={isInvalid || undefined}
              className={cx(
                "shrink-0 border border-line-strong bg-surface text-center font-semibold tabular-nums text-fg caret-accent-500 shadow-xs outline-none",
                "transition-[border-color,box-shadow,transform] duration-150",
                "hover:border-line-hover focus:border-accent-500 focus:ring-3 focus:ring-accent-500/15",
                "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-disabled disabled:shadow-none",
                c && "border-line-hover",
                isInvalid && "border-danger focus:border-danger focus:ring-danger/15",
                BOX[size],
              )}
            />
          </Fragment>
        ))}
      </div>
      {name ? <input type="hidden" name={name} value={code} /> : null}
      {description ? (
        <span id={descId} className="text-caption text-fg-subtle">
          {description}
        </span>
      ) : null}
      {isInvalid && errorMessage ? (
        <span id={errId} className="text-caption text-danger">
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}
