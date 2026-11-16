"use client";

import type { ReactElement, ReactNode, Ref } from "react";
import { Focusable, Tooltip as AriaTooltip, TooltipTrigger } from "react-aria-components";
import type { TooltipProps as AriaTooltipProps } from "react-aria-components";
import { cx } from "../../lib/cx";
import { focusRing } from "../../lib/recipes";
import { Kbd } from "../kbd/kbd";
import { PopoverArrow } from "../popover/popover";

export interface TooltipProps extends Pick<AriaTooltipProps, "placement" | "offset" | "crossOffset" | "shouldFlip"> {
  /** The hint. Keep it short; for rich content use Popover. */
  content: ReactNode;
  /**
   * The trigger: a React Aria based element such as `Button` / `IconButton`.
   * Wrap anything else (text, icons, avatars) in `<TooltipTarget>`.
   */
  children: ReactElement;
  /** Shortcut chip after the text, e.g. "mod+k" or ["shift", "e"]. */
  shortcut?: string | string[];
  /** Hover delay before opening, in ms (focus opens immediately). */
  delay?: number;
  closeDelay?: number;
  showArrow?: boolean;
  /** Only open on keyboard focus, not hover. */
  focusOnly?: boolean;
  isDisabled?: boolean;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A short hint shown on hover and keyboard focus. Works directly on the
 * library's buttons; wrap other elements in `TooltipTarget`.
 *
 *   <Tooltip content="Search" shortcut="mod+k"><IconButton icon={<RiSearchLine />} aria-label="Search" /></Tooltip>
 */
export function Tooltip({
  content,
  children,
  shortcut,
  delay = 500,
  closeDelay = 150,
  showArrow = false,
  focusOnly,
  isDisabled,
  isOpen,
  defaultOpen,
  onOpenChange,
  placement = "top",
  offset,
  crossOffset,
  shouldFlip,
  className,
  ref,
}: TooltipProps) {
  return (
    <TooltipTrigger
      delay={delay}
      closeDelay={closeDelay}
      trigger={focusOnly ? "focus" : undefined}
      isDisabled={isDisabled}
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
      <AriaTooltip
        ref={ref}
        placement={placement}
        offset={offset ?? (showArrow ? 8 : 6)}
        crossOffset={crossOffset}
        shouldFlip={shouldFlip}
        className={cx(
          "z-50 flex max-w-64 items-center gap-2 rounded-[8px] bg-surface-inverse px-2 py-1 text-caption font-medium text-fg-inverse shadow-raised",
          "data-[entering]:animate-in data-[exiting]:animate-out",
          className,
        )}
      >
        {showArrow ? <PopoverArrow inverse className="size-auto" /> : null}
        <span className="min-w-0">{content}</span>
        {shortcut ? (
          <Kbd keys={shortcut} joined size="sm" variant="ghost" className="h-auto min-w-0 px-0 text-caption text-fg-inverse opacity-60" />
        ) : null}
      </AriaTooltip>
    </TooltipTrigger>
  );
}

export interface TooltipTargetProps {
  children: ReactNode;
  className?: string;
}

/**
 * Makes any content (text, an icon, an avatar) focusable so it can trigger a
 * Tooltip, which keyboard users can then reach too.
 *
 *   <Tooltip content="Synced 2 min ago"><TooltipTarget><RiCloudLine /></TooltipTarget></Tooltip>
 */
export function TooltipTarget({ children, className }: TooltipTargetProps) {
  return (
    <Focusable>
      <span tabIndex={0} className={cx("inline-flex cursor-default items-center rounded-[6px]", focusRing, className)}>
        {children}
      </span>
    </Focusable>
  );
}
