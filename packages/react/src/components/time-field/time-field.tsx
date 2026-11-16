"use client";

import { useSyncExternalStore } from "react";
import type { ReactNode, Ref } from "react";
import { DateInput, DateSegment, TimeField as AriaTimeField } from "react-aria-components";
import type { FieldErrorProps, TimeFieldProps as AriaTimeFieldProps, TimeValue } from "react-aria-components";
import { RiTimeLine } from "@remixicon/react";
import { cx } from "../../lib/cx";
import { FieldDescription, FieldErrorText, FieldLabel } from "../../lib/field";
import { controlSize, fieldBox, iconSize, type Size } from "../../lib/recipes";

const noop = () => () => {};
/** False on the server and during hydration, true afterwards. */
function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export interface TimeFieldProps<T extends TimeValue = TimeValue> extends Omit<AriaTimeFieldProps<T>, "className" | "children" | "hourCycle" | "granularity"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps["children"];
  size?: Size;
  /** 12- or 24-hour clock. Defaults to the locale's preference. */
  hourCycle?: 12 | 24;
  /** Show a seconds segment. */
  showSeconds?: boolean;
  /** Icon at the start (default clock; `null` hides it). */
  icon?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Segmented time entry: type or use ↑ ↓ in each hour / minute / second /
 * AM-PM segment. Values are `Time` objects from `@internationalized/date`.
 *
 *   <TimeField label="提醒时间" defaultValue={new Time(9, 30)} hourCycle={24} />
 *
 * Segments depend on the browser locale, so the field renders an empty box on
 * the server and fills in after hydration (no SSR mismatch).
 */
export function TimeField<T extends TimeValue = TimeValue>({
  label,
  description,
  errorMessage,
  size = "md",
  hourCycle,
  showSeconds,
  icon,
  className,
  ref,
  ...props
}: TimeFieldProps<T>) {
  const hydrated = useHydrated();
  const iconNode =
    icon === null ? null : <span className={cx("inline-flex shrink-0 text-fg-subtle [&>svg]:size-full", iconSize[size])}>{icon ?? <RiTimeLine />}</span>;

  if (!hydrated) {
    return (
      <div className={cx("flex w-full flex-col gap-1.5", className)}>
        {label ? <span className="text-body-sm font-medium text-fg">{label}</span> : null}
        <div className={cx(fieldBox, controlSize[size])}>{iconNode}</div>
        {description ? <span className="text-caption text-fg-subtle">{description}</span> : null}
      </div>
    );
  }

  return (
    <AriaTimeField
      {...props}
      ref={ref}
      hourCycle={hourCycle}
      granularity={showSeconds ? "second" : "minute"}
      className={cx("flex w-full flex-col gap-1.5", className)}
    >
      {({ isInvalid, isDisabled }) => (
        <>
          {label ? <FieldLabel required={props.isRequired}>{label}</FieldLabel> : null}
          <div data-invalid={isInvalid || undefined} data-disabled={isDisabled || undefined} className={cx(fieldBox, controlSize[size])}>
            {iconNode}
            <DateInput className="flex min-w-0 flex-1 items-center tabular-nums outline-none">
              {(segment) => (
                <DateSegment
                  segment={segment}
                  className={cx(
                    "rounded-[5px] px-0.5 py-px outline-none caret-transparent",
                    "data-[type=literal]:px-0 data-[type=literal]:text-fg-subtle",
                    "data-[placeholder]:text-fg-subtle",
                    "data-[focused]:bg-accent-500 data-[focused]:text-fg-on-accent",
                    "data-[disabled]:text-fg-disabled",
                    "data-[invalid]:text-danger data-[invalid]:data-[focused]:bg-danger data-[invalid]:data-[focused]:text-fg-on-accent",
                  )}
                />
              )}
            </DateInput>
          </div>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          <FieldErrorText>{errorMessage}</FieldErrorText>
        </>
      )}
    </AriaTimeField>
  );
}
