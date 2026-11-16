"use client";

import type { ReactNode, Ref } from "react";
import { Switch as AriaSwitch } from "react-aria-components";
import type { SwitchProps as AriaSwitchProps } from "react-aria-components";
import { cx } from "../../lib/cx";

type SwitchSize = "sm" | "md";

const TRACK: Record<SwitchSize, string> = { sm: "h-4 w-7", md: "h-5 w-9" };
const THUMB: Record<SwitchSize, string> = {
  sm: "size-3 group-data-[selected]:translate-x-3 rtl:group-data-[selected]:-translate-x-3",
  md: "size-4 group-data-[selected]:translate-x-4 rtl:group-data-[selected]:-translate-x-4",
};

/** The track + thumb on their own, for custom layouts. Reads state from a parent `.group` (React Aria Switch). */
export function SwitchIndicator({ size = "md", className }: { size?: SwitchSize; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        "relative inline-flex shrink-0 items-center rounded-full bg-line-strong p-0.5 transition-[background-color,box-shadow] duration-200 ease-out-soft",
        "group-data-[hovered]:bg-line-hover group-data-[selected]:bg-accent-500 group-data-[selected]:group-data-[hovered]:bg-accent-600",
        "group-data-[focus-visible]:focus-ring",
        TRACK[size],
        className,
      )}
    >
      <span className={cx("block rounded-full bg-fg-on-accent shadow-xs transition-[translate] duration-200 ease-out-soft", THUMB[size])} />
    </span>
  );
}

export interface SwitchProps extends Omit<AriaSwitchProps, "className" | "children"> {
  /** Label text. */
  children?: ReactNode;
  description?: ReactNode;
  size?: SwitchSize;
  /**
   * `inline` (default): switch then label. `row`: label on the start, switch on
   * the end, full width — for settings lists. `card`: a bordered row tile.
   */
  variant?: "inline" | "row" | "card";
  /** Row / card: icon element at the start. */
  icon?: ReactNode;
  className?: string;
  ref?: Ref<HTMLLabelElement>;
}

/**
 * On/off toggle that takes effect immediately.
 *
 *   <Switch defaultSelected>自动保存</Switch>
 *   <Switch variant="row" description="有人提到你时推送">提及通知</Switch>
 */
export function Switch({ children, description, size = "md", variant = "inline", icon, className, ref, ...props }: SwitchProps) {
  const row = variant !== "inline";
  return (
    <AriaSwitch
      {...props}
      ref={ref}
      className={cx(
        "group relative flex cursor-default select-none outline-none",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-55",
        row ? "w-full items-center gap-3" : description != null ? "items-start gap-2.5" : "items-center gap-2.5",
        variant === "row" && "py-3",
        variant === "card" && "rounded-control border border-line bg-surface p-4 shadow-xs transition-[border-color] duration-150 data-[hovered]:border-line-strong",
        className,
      )}
    >
      {row && icon ? (
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-control bg-surface-muted text-fg-muted [&>svg]:size-[18px]">{icon}</span>
      ) : null}
      {!row ? <SwitchIndicator size={size} className={description != null ? "mt-0.5" : undefined} /> : null}
      {children != null || description != null ? (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          {children != null ? <span className={cx("text-fg", size === "sm" ? "text-body-sm" : "text-body", row && "font-medium")}>{children}</span> : null}
          {description != null ? <span className="text-body-sm text-fg-subtle">{description}</span> : null}
        </span>
      ) : null}
      {row ? <SwitchIndicator size={size} /> : null}
    </AriaSwitch>
  );
}
