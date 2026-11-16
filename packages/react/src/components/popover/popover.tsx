"use client";

import type { ReactElement, ReactNode, Ref } from "react";
import { Dialog, DialogTrigger, Heading, OverlayArrow, Popover as AriaPopover } from "react-aria-components";
import type { PopoverProps as AriaPopoverProps } from "react-aria-components";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { floatingPanel } from "../../lib/recipes";
import { CloseButton } from "../close-button/close-button";

const COPY = {
  en: { close: "Close" },
  zh: { close: "关闭" },
};
export type PopoverLabels = (typeof COPY)["en"];

export type PopoverWidth = "sm" | "md" | "lg" | "auto";
const WIDTHS: Record<PopoverWidth, string> = {
  sm: "w-64",
  md: "w-80",
  lg: "w-[400px]",
  auto: "",
};

export interface PopoverRenderApi {
  close: () => void;
}
type Slot = ReactNode | ((api: PopoverRenderApi) => ReactNode);
const renderSlot = (slot: Slot, api: PopoverRenderApi) => (typeof slot === "function" ? slot(api) : slot);

/** The small caret pointing at the trigger. Use it inside any React Aria Popover / Tooltip. */
export function PopoverArrow({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <OverlayArrow className="group">
      <svg
        width={14}
        height={7}
        viewBox="0 0 14 7"
        aria-hidden
        className={cx(
          "block group-data-[placement=bottom]:rotate-180 group-data-[placement=left]:-rotate-90 group-data-[placement=right]:rotate-90",
          className,
        )}
      >
        <path d="M0 0 L7 7 L14 0 Z" className={inverse ? "fill-surface-inverse" : "fill-surface-raised"} />
        {inverse ? null : <path d="M0 0 L7 7 L14 0" fill="none" className="stroke-line-strong" strokeWidth={1} />}
      </svg>
    </OverlayArrow>
  );
}

export interface PopoverProps extends Pick<AriaPopoverProps, "placement" | "offset" | "crossOffset" | "shouldFlip" | "isNonModal"> {
  /** A pressable element (e.g. `<Button>`) that toggles the popover. */
  trigger: ReactElement;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  title?: ReactNode;
  /** Body content. A function receives `{ close }`. */
  children?: Slot;
  /** Action row under the body, aligned to the end. A function receives `{ close }`. */
  footer?: Slot;
  /** Show the caret pointing at the trigger (default true). */
  showArrow?: boolean;
  /** Show a × in the header. */
  showCloseButton?: boolean;
  width?: PopoverWidth;
  "aria-label"?: string;
  /** Classes for the floating panel. */
  className?: string;
  labels?: Partial<PopoverLabels>;
  ref?: Ref<HTMLElement>;
}

/**
 * Anchored rich content: title, body and actions in a floating panel. Pass
 * `isNonModal` to keep the rest of the page interactive while it's open.
 *
 *   <Popover trigger={<Button>Share</Button>} title="Share link">…</Popover>
 */
export function Popover({
  trigger,
  isOpen,
  defaultOpen,
  onOpenChange,
  title,
  children,
  footer,
  showArrow = true,
  showCloseButton,
  width = "md",
  placement = "bottom",
  offset,
  crossOffset,
  shouldFlip,
  isNonModal,
  "aria-label": ariaLabel,
  className,
  labels,
  ref,
}: PopoverProps) {
  const t = useCopy(COPY, labels);
  return (
    <DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger}
      <AriaPopover
        ref={ref}
        placement={placement}
        offset={offset ?? (showArrow ? 10 : 6)}
        crossOffset={crossOffset}
        shouldFlip={shouldFlip}
        isNonModal={isNonModal}
        className={cx(floatingPanel, "max-w-[calc(100vw-1.5rem)] p-0", WIDTHS[width], className)}
      >
        {showArrow ? <PopoverArrow /> : null}
        <Dialog aria-label={title ? undefined : ariaLabel} className="max-h-[inherit] overflow-auto outline-none">
          {({ close }) => (
            <>
              {title || showCloseButton ? (
                <div className="flex items-start gap-2 px-4 pt-3.5">
                  {title ? (
                    <Heading slot="title" className="min-w-0 flex-1 pt-0.5 text-body font-semibold text-fg">
                      {title}
                    </Heading>
                  ) : (
                    <span className="flex-1" />
                  )}
                  {showCloseButton ? <CloseButton size="sm" slot="close" aria-label={t.close} className="-me-1.5" /> : null}
                </div>
              ) : null}
              {children != null ? (
                <div className={cx("px-4 text-body-sm text-fg-muted", title || showCloseButton ? "pt-1.5" : "pt-3.5", footer != null ? "pb-1" : "pb-4")}>
                  {renderSlot(children, { close })}
                </div>
              ) : null}
              {footer != null ? <div className="flex items-center justify-end gap-2 px-4 pt-3 pb-3.5">{renderSlot(footer, { close })}</div> : null}
            </>
          )}
        </Dialog>
      </AriaPopover>
    </DialogTrigger>
  );
}
