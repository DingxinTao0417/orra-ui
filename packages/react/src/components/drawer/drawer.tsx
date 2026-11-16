"use client";

import { useId } from "react";
import type { ReactElement, ReactNode, Ref } from "react";
import { Dialog, DialogTrigger, Heading, Modal as AriaModal, ModalOverlay, useLocale } from "react-aria-components";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { overlayBackdrop } from "../../lib/recipes";
import { CloseButton } from "../close-button/close-button";

const COPY = {
  en: { close: "Close" },
  zh: { close: "关闭" },
};
export type DrawerLabels = (typeof COPY)["en"];

export type DrawerPlacement = "end" | "start" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "full";

const SIDE_SIZES: Record<DrawerSize, string> = {
  sm: "w-[360px]",
  md: "w-[440px]",
  lg: "w-[640px]",
  full: "w-full",
};
const BOTTOM_SIZES: Record<DrawerSize, string> = {
  sm: "max-h-[45dvh]",
  md: "max-h-[70dvh]",
  lg: "max-h-[88dvh]",
  full: "h-full",
};

export interface DrawerRenderApi {
  close: () => void;
}
type Slot = ReactNode | ((api: DrawerRenderApi) => ReactNode);
const renderSlot = (slot: Slot, api: DrawerRenderApi) => (typeof slot === "function" ? slot(api) : slot);

export interface DrawerProps {
  /** A pressable element (e.g. `<Button>`) that opens the drawer. Omit it to control `isOpen` yourself. */
  trigger?: ReactElement;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Edge the sheet slides from. `start` / `end` follow the text direction. */
  placement?: DrawerPlacement;
  /** Width for side sheets, max height for bottom sheets. */
  size?: DrawerSize;
  title?: ReactNode;
  description?: ReactNode;
  /** Extra content on the end side of the header, before the close button. */
  headerActions?: ReactNode;
  /** Scrollable body. A function receives `{ close }`. */
  children?: Slot;
  /** Sticky footer actions. A function receives `{ close }`. */
  footer?: Slot;
  /** Close when the backdrop is clicked (default true). */
  isDismissable?: boolean;
  hideCloseButton?: boolean;
  "aria-label"?: string;
  /** Classes for the sheet panel. */
  className?: string;
  bodyClassName?: string;
  labels?: Partial<DrawerLabels>;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A side sheet (start / end edge) or bottom sheet with a header, a scrolling
 * body and a sticky footer. Built on React Aria's Modal, so focus is trapped
 * and Escape closes it.
 *
 *   <Drawer trigger={<Button>Filters</Button>} title="Filters" footer={…}>…</Drawer>
 */
export function Drawer({
  trigger,
  isOpen,
  defaultOpen,
  onOpenChange,
  placement = "end",
  size = "md",
  title,
  description,
  headerActions,
  children,
  footer,
  isDismissable = true,
  hideCloseButton,
  "aria-label": ariaLabel,
  className,
  bodyClassName,
  labels,
  ref,
}: DrawerProps) {
  const t = useCopy(COPY, labels);
  const { direction } = useLocale();
  const descriptionId = useId();
  const physical = placement === "bottom" ? "bottom" : (placement === "end") === (direction === "ltr") ? "right" : "left";

  const motion = {
    right: "data-[entering]:animate-sheet-in-right data-[exiting]:animate-sheet-out-right",
    left: "data-[entering]:animate-sheet-in-left data-[exiting]:animate-sheet-out-left",
    bottom: "data-[entering]:animate-sheet-in-bottom data-[exiting]:animate-sheet-out-bottom",
  }[physical];

  const position =
    placement === "bottom"
      ? cx("inset-x-2 bottom-2 mx-auto max-w-3xl", BOTTOM_SIZES[size])
      : cx("inset-y-2 max-w-[calc(100vw-1rem)]", placement === "end" ? "end-2" : "start-2", SIDE_SIZES[size]);

  const overlayState = trigger ? {} : Object.fromEntries(Object.entries({ isOpen, defaultOpen, onOpenChange }).filter(([, v]) => v !== undefined));

  const overlay = (
    <ModalOverlay {...overlayState} isDismissable={isDismissable} className={overlayBackdrop}>
      <AriaModal
        ref={ref}
        className={cx(
          "fixed flex flex-col overflow-hidden rounded-card bg-surface-raised text-fg shadow-raised outline-none",
          position,
          motion,
          className,
        )}
      >
        <Dialog
          aria-label={title ? undefined : ariaLabel}
          aria-describedby={description ? descriptionId : undefined}
          className="flex min-h-0 flex-1 flex-col outline-none"
        >
          {({ close }) => (
            <>
              {placement === "bottom" ? <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line-strong" /> : null}
              <div className={cx("flex shrink-0 items-start gap-3 border-b border-line px-5", placement === "bottom" ? "pt-3 pb-4" : "py-4")}>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  {title ? (
                    <Heading slot="title" className="text-title-sm font-semibold text-fg">
                      {title}
                    </Heading>
                  ) : null}
                  {description ? (
                    <p id={descriptionId} className="text-body-sm text-fg-muted">
                      {description}
                    </p>
                  ) : null}
                </div>
                {headerActions ? <div className="flex items-center gap-1">{headerActions}</div> : null}
                {!hideCloseButton ? <CloseButton slot="close" aria-label={t.close} className="-me-1" /> : null}
              </div>
              <div className={cx("min-h-0 flex-1 overflow-y-auto px-5 py-5 text-body text-fg-muted", bodyClassName)}>
                {renderSlot(children, { close })}
              </div>
              {footer != null ? (
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-raised px-5 py-4">
                  {renderSlot(footer, { close })}
                </div>
              ) : null}
            </>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );

  if (!trigger) return overlay;
  return (
    <DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger}
      {overlay}
    </DialogTrigger>
  );
}
