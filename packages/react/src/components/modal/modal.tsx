"use client";

import { useId, useState } from "react";
import type { ReactElement, ReactNode, Ref } from "react";
import { Dialog, DialogTrigger, Heading, Modal as AriaModal, ModalOverlay } from "react-aria-components";
import { RiErrorWarningLine, RiQuestionLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { overlayBackdrop } from "../../lib/recipes";
import { Button } from "../button/button";
import { CloseButton } from "../close-button/close-button";

const COPY = {
  en: { close: "Close", cancel: "Cancel", confirm: "Confirm" },
  zh: { close: "关闭", cancel: "取消", confirm: "确定" },
};
export type ModalLabels = (typeof COPY)["en"];

export type ModalSize = "sm" | "md" | "lg" | "full";
export type ModalTone = "accent" | "neutral" | "success" | "warning" | "danger";

const SIZES: Record<ModalSize, string> = {
  sm: "max-w-[400px]",
  md: "max-w-[520px]",
  lg: "max-w-[720px]",
  full: "h-full max-w-none",
};

const ICON_TONES: Record<ModalTone, string> = {
  accent: "bg-accent-50 text-fg-accent",
  neutral: "bg-surface-muted text-fg-muted",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

/** Render helpers passed to function children / footers. */
export interface ModalRenderApi {
  close: () => void;
}

type Slot = ReactNode | ((api: ModalRenderApi) => ReactNode);
const renderSlot = (slot: Slot, api: ModalRenderApi) => (typeof slot === "function" ? slot(api) : slot);

/** Drops undefined keys so an outer DialogTrigger's state isn't overridden. */
function definedOnly<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export interface ModalProps {
  /** A pressable element (e.g. `<Button>`) that opens the modal. Omit it to control `isOpen` yourself. */
  trigger?: ReactElement;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Icon element shown in a tinted circle before the title. */
  icon?: ReactNode;
  /** Colour of the icon circle. */
  tone?: ModalTone;
  /** Body content. A function receives `{ close }`. */
  children?: Slot;
  /** Footer actions, aligned to the end. A function receives `{ close }`. */
  footer?: Slot;
  size?: ModalSize;
  /** Close when the backdrop is clicked. */
  isDismissable?: boolean;
  /** Ignore the Escape key. */
  isKeyboardDismissDisabled?: boolean;
  hideCloseButton?: boolean;
  /** `alertdialog` for confirmations that need an explicit answer. */
  role?: "dialog" | "alertdialog";
  /** Accessible name when there is no visible title. */
  "aria-label"?: string;
  /** Classes for the panel. */
  className?: string;
  bodyClassName?: string;
  labels?: Partial<ModalLabels>;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A dialog over a dimmed backdrop, with title, description, scrollable body
 * and footer actions. Focus is trapped and restored by React Aria.
 *
 *   <Modal trigger={<Button>Invite</Button>} title="Invite people" footer={({ close }) => …}>…</Modal>
 */
export function Modal({
  trigger,
  isOpen,
  defaultOpen,
  onOpenChange,
  title,
  description,
  icon,
  tone = "accent",
  children,
  footer,
  size = "md",
  isDismissable = true,
  isKeyboardDismissDisabled,
  hideCloseButton,
  role = "dialog",
  "aria-label": ariaLabel,
  className,
  bodyClassName,
  labels,
  ref,
}: ModalProps) {
  const t = useCopy(COPY, labels);
  const descriptionId = useId();
  const full = size === "full";

  const overlay = (
    <ModalOverlay
      {...(trigger ? {} : definedOnly({ isOpen, defaultOpen, onOpenChange }))}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      className={cx(overlayBackdrop, "flex items-center justify-center", full ? "p-2 sm:p-4" : "p-4 sm:p-6")}
    >
      <AriaModal
        ref={ref}
        className={cx(
          "relative flex max-h-full w-full flex-col overflow-hidden rounded-card bg-surface-raised text-fg shadow-raised outline-none",
          "data-[entering]:animate-dialog-in data-[exiting]:animate-dialog-out",
          SIZES[size],
          className,
        )}
      >
        <Dialog
          role={role}
          aria-label={title ? undefined : ariaLabel}
          aria-describedby={description ? descriptionId : undefined}
          className="flex min-h-0 flex-1 flex-col outline-none"
        >
          {({ close }) => (
            <>
              {title || description || icon ? (
                <div className={cx("flex items-start gap-3.5 px-6 pt-6", !hideCloseButton && "pe-14")}>
                  {icon ? (
                    <span className={cx("grid size-10 shrink-0 place-items-center rounded-full [&>svg]:size-5", ICON_TONES[tone])}>{icon}</span>
                  ) : null}
                  <div className={cx("flex min-w-0 flex-1 flex-col gap-1", icon ? "pt-0.5" : null)}>
                    {title ? (
                      <Heading slot="title" className="text-title-sm font-semibold text-fg">
                        {title}
                      </Heading>
                    ) : null}
                    {description ? (
                      <p id={descriptionId} className="text-body text-fg-muted">
                        {description}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {children != null ? (
                <div className={cx("min-h-0 flex-1 overflow-y-auto px-6 pt-4 text-body text-fg-muted", !footer && "pb-6", bodyClassName)}>
                  {renderSlot(children, { close })}
                </div>
              ) : null}
              {footer != null ? (
                <div className="flex flex-wrap items-center justify-end gap-2 px-6 pt-5 pb-6">{renderSlot(footer, { close })}</div>
              ) : null}
              {!hideCloseButton ? <CloseButton slot="close" aria-label={t.close} className="absolute end-4 top-4" /> : null}
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

export interface ConfirmDialogProps
  extends Pick<ModalProps, "trigger" | "isOpen" | "defaultOpen" | "onOpenChange" | "title" | "description" | "children" | "className"> {
  /** `danger` styles the confirm button (and icon) as destructive. */
  tone?: "accent" | "danger";
  /** Icon in the header circle; `false` hides it. Defaults to a question / warning mark. */
  icon?: ReactNode | false;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Return a promise to keep the dialog open with a pending button until it settles. A rejected promise keeps it open. */
  onConfirm?: () => unknown;
  onCancel?: () => void;
  labels?: Partial<ModalLabels>;
}

/**
 * Alert / confirm variant of Modal: `alertdialog` role, no backdrop dismiss,
 * cancel + confirm buttons, and an async pending state for `onConfirm`.
 *
 *   <ConfirmDialog tone="danger" title="Delete project?" onConfirm={() => api.delete(id)} trigger={…} />
 */
export function ConfirmDialog({
  tone = "accent",
  icon,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  labels,
  children,
  ...props
}: ConfirmDialogProps) {
  const t = useCopy(COPY, labels);
  const [pending, setPending] = useState(false);
  const defaultIcon = tone === "danger" ? <RiErrorWarningLine /> : <RiQuestionLine />;

  const confirm = async (close: () => void) => {
    const result = onConfirm?.();
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setPending(true);
      try {
        await result;
        close();
      } catch {
        /* keep the dialog open so the user can retry */
      } finally {
        setPending(false);
      }
    } else {
      close();
    }
  };

  return (
    <Modal
      {...props}
      role="alertdialog"
      size="sm"
      tone={tone}
      icon={icon === false ? undefined : (icon ?? defaultIcon)}
      isDismissable={false}
      isKeyboardDismissDisabled={pending}
      hideCloseButton
      labels={labels}
      footer={({ close }) => (
        <>
          <Button
            variant="outline"
            tone="neutral"
            isDisabled={pending}
            onPress={() => {
              onCancel?.();
              close();
            }}
          >
            {cancelLabel ?? t.cancel}
          </Button>
          <Button tone={tone} loading={pending} autoFocus={tone !== "danger"} onPress={() => confirm(close)}>
            {confirmLabel ?? t.confirm}
          </Button>
        </>
      )}
    >
      {children}
    </Modal>
  );
}

/** Re-export of React Aria's DialogTrigger for wiring your own trigger + `<Modal>` / `<Drawer>` pairs. */
export { DialogTrigger as ModalTrigger };
