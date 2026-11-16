"use client";

import type { HTMLAttributes, ReactNode, Ref } from "react";
import { Separator as AriaSeparator } from "react-aria-components";
import { cx } from "../../lib/cx";

export interface DividerProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  orientation?: "horizontal" | "vertical";
  /** Dashed instead of solid line. */
  dashed?: boolean;
  /** Stronger line colour (control borders) instead of the hairline. */
  strong?: boolean;
  /** Optional label in the line, e.g. "或" (horizontal only). */
  children?: ReactNode;
  /** Where the label sits along the line. */
  labelPosition?: "start" | "center" | "end";
  ref?: Ref<HTMLElement>;
}

/**
 * A horizontal or vertical separator, optionally with a label ("或").
 * Vertical dividers stretch to the height of their flex row.
 *
 *   <Divider>或使用邮箱登录</Divider>
 *   <div className="flex h-5 items-center gap-3">文档<Divider orientation="vertical" />更新日志</div>
 */
export function Divider({ orientation = "horizontal", dashed, strong, children, labelPosition = "center", className, ref, ...props }: DividerProps) {
  const lineColour = strong ? "border-line-strong" : "border-line";
  const style = dashed ? "border-dashed" : "border-solid";

  if (children != null && orientation === "horizontal") {
    const line = cx("min-w-4 flex-1 border-t", lineColour, style);
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        {...props}
        ref={ref as Ref<HTMLDivElement>}
        className={cx("flex w-full items-center gap-3 text-caption text-fg-subtle", className)}
      >
        <span aria-hidden className={cx(line, labelPosition === "start" && "max-w-6")} />
        <span className="shrink-0 whitespace-nowrap">{children}</span>
        <span aria-hidden className={cx(line, labelPosition === "end" && "max-w-6")} />
      </div>
    );
  }

  return (
    <AriaSeparator
      {...props}
      ref={ref}
      orientation={orientation}
      elementType={orientation === "vertical" ? "div" : "hr"}
      className={cx(
        "m-0 shrink-0",
        lineColour,
        style,
        orientation === "vertical" ? "min-h-4 w-0 self-stretch border-s" : "h-0 w-full border-t",
        className,
      )}
    />
  );
}
