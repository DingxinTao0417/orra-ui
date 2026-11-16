"use client";

import type { HTMLAttributes, ReactNode, Ref } from "react";
import { RiCheckboxCircleFill, RiCloseCircleFill, RiErrorWarningFill, RiInformationFill } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { useControllableState } from "../../lib/use-controllable-state";
import { Avatar } from "../avatar/avatar";
import { CloseButton } from "../close-button/close-button";

const COPY = {
  en: { dismiss: "Dismiss", unread: "Unread" },
  zh: { dismiss: "关闭", unread: "未读" },
};
export type NotificationLabels = (typeof COPY)["en"];

export type NotificationTone = "neutral" | "info" | "success" | "warning" | "danger";
export type NotificationVariant = "soft" | "outline" | "accent";

const TONE: Record<NotificationTone, { icon: ReactNode; text: string; soft: string; bar: string }> = {
  neutral: { icon: <RiInformationFill />, text: "text-fg-subtle", soft: "bg-surface-muted border-line", bar: "before:bg-line-strong" },
  info: { icon: <RiInformationFill />, text: "text-info", soft: "bg-info-soft border-info/20", bar: "before:bg-info" },
  success: { icon: <RiCheckboxCircleFill />, text: "text-success", soft: "bg-success-soft border-success/20", bar: "before:bg-success" },
  warning: { icon: <RiErrorWarningFill />, text: "text-warning", soft: "bg-warning-soft border-warning/25", bar: "before:bg-warning" },
  danger: { icon: <RiCloseCircleFill />, text: "text-danger", soft: "bg-danger-soft border-danger/20", bar: "before:bg-danger" },
};

export interface NotificationProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: NotificationTone;
  /** `soft` tinted background (default), `outline` on a card surface, `accent` card with a coloured start bar. */
  variant?: NotificationVariant;
  title?: ReactNode;
  /** Body text; `children` works too. */
  description?: ReactNode;
  /** Custom icon element, or `false` to hide it. */
  icon?: ReactNode | false;
  /** Buttons / links under the text (or on the end side with `actionsPlacement="end"`). */
  actions?: ReactNode;
  actionsPlacement?: "bottom" | "end";
  /** Show a close button. The banner hides itself unless `isOpen` is controlled. */
  dismissible?: boolean;
  isOpen?: boolean;
  onDismiss?: () => void;
  labels?: Partial<NotificationLabels>;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Inline banner for page- or section-level messages: tone icon, title,
 * description, actions and an optional dismiss button. Danger and warning
 * banners are announced as alerts.
 *
 *   <Notification tone="warning" title="Billing issue" description="Update your card to keep your plan." />
 */
export function Notification({
  tone = "info",
  variant = "soft",
  title,
  description,
  icon,
  actions,
  actionsPlacement = "bottom",
  dismissible,
  isOpen,
  onDismiss,
  labels,
  className,
  children,
  ref,
  ...props
}: NotificationProps) {
  const t = useCopy(COPY, labels);
  const [open, setOpen] = useControllableState<boolean>(isOpen, true);
  if (!open) return null;
  const style = TONE[tone];
  const shownIcon = icon === false ? null : (icon ?? style.icon);
  const body = description ?? children;
  const urgent = tone === "danger" || tone === "warning";

  return (
    <div
      {...props}
      ref={ref}
      role={urgent ? "alert" : "status"}
      className={cx(
        "relative flex w-full items-start gap-3 rounded-menu border px-4 py-3.5 text-body",
        variant === "soft" && style.soft,
        variant === "outline" && "border-line bg-surface shadow-xs",
        variant === "accent" &&
          cx("overflow-hidden border-line bg-surface shadow-card ps-5 before:absolute before:inset-y-0 before:start-0 before:w-1", style.bar),
        className,
      )}
    >
      {shownIcon ? <span className={cx("mt-px inline-flex size-5 shrink-0 [&>svg]:size-full", style.text)}>{shownIcon}</span> : null}
      <div className={cx("flex min-w-0 flex-1 gap-3", actionsPlacement === "end" ? "flex-col sm:flex-row sm:items-center" : "flex-col")}>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-px">
          {title ? <p className="font-medium text-fg">{title}</p> : null}
          {body ? <div className="text-body-sm text-fg-muted">{body}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {dismissible ? (
        <CloseButton
          size="sm"
          aria-label={t.dismiss}
          className="-me-1.5 -mt-0.5"
          onPress={() => {
            setOpen(false);
            onDismiss?.();
          }}
        />
      ) : null}
    </div>
  );
}

export interface NotificationCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Who did it. Shown as an avatar (initials on a soft colour when there is no image). */
  actor?: { name: string; src?: string };
  /** Replaces the avatar, e.g. an icon tile for system events. */
  media?: ReactNode;
  /** The activity line, e.g. <><b>Lin</b> commented on <b>Q3 plan</b></>. */
  title: ReactNode;
  /** Quoted content or details under the title. */
  description?: ReactNode;
  /** Relative time or date label. */
  time?: ReactNode;
  /** Shows an accent dot and stronger text. */
  unread?: boolean;
  actions?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  labels?: Partial<NotificationLabels>;
  ref?: Ref<HTMLDivElement>;
}

/** An activity item for feeds and notification centres: avatar, who-did-what, time, unread dot and actions. */
export function NotificationCard({
  actor,
  media,
  title,
  description,
  time,
  unread,
  actions,
  dismissible,
  onDismiss,
  labels,
  className,
  ref,
  ...props
}: NotificationCardProps) {
  const t = useCopy(COPY, labels);
  return (
    <div
      {...props}
      ref={ref}
      className={cx(
        "group relative flex w-full items-start gap-3 rounded-menu px-3.5 py-3 text-body transition-colors duration-150",
        unread ? "bg-accent-50/50" : "bg-surface",
        className,
      )}
    >
      <div className="shrink-0">{media ?? (actor ? <Avatar name={actor.name} src={actor.src} size="md" /> : null)}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-2">
          <p className={cx("min-w-0 flex-1 text-body-sm [&_b]:font-medium [&_b]:text-fg", unread ? "text-fg" : "text-fg-muted")}>{title}</p>
          {time ? <span className="shrink-0 pt-px text-caption text-fg-subtle tabular-nums">{time}</span> : null}
          {unread ? (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent-500">
              <span className="sr-only">{t.unread}</span>
            </span>
          ) : null}
        </div>
        {description ? (
          <div className="rounded-control border border-line bg-surface px-3 py-2 text-body-sm text-fg-muted">{description}</div>
        ) : null}
        {actions ? <div className="mt-1 flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {dismissible ? (
        <CloseButton
          size="sm"
          aria-label={t.dismiss}
          onPress={onDismiss}
          className="-me-1 opacity-0 transition-opacity group-hover:opacity-100 data-[focus-visible]:opacity-100"
        />
      ) : null}
    </div>
  );
}
