"use client";

import type { ReactNode, Ref } from "react";
import { Link as AriaLink } from "react-aria-components";
import type { LinkProps as AriaLinkProps } from "react-aria-components";
import { RiArrowRightLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { focusRing } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { CloseButton } from "../close-button/close-button";

const COPY = {
  en: { badge: "New", link: "Learn more", dismiss: "Dismiss announcement", region: "Announcement" },
  zh: { badge: "新", link: "了解详情", dismiss: "关闭公告", region: "公告" },
};
export type AnnouncementLabels = (typeof COPY)["en"];

export type AnnouncementTone = "accent" | "neutral" | "inverse";

const BANNER: Record<AnnouncementTone, { root: string; badge: string; link: string; close: "plain" | "inverse" }> = {
  accent: {
    root: "bg-accent-gradient text-fg-on-accent",
    badge: "bg-fg-on-accent/20 text-fg-on-accent",
    link: "text-fg-on-accent",
    close: "inverse",
  },
  neutral: {
    root: "border-b border-line bg-surface text-fg",
    badge: "bg-accent-50 text-fg-accent",
    link: "text-fg-accent",
    close: "plain",
  },
  inverse: {
    root: "bg-surface-inverse text-fg-inverse",
    badge: "bg-fg-inverse/15 text-fg-inverse",
    link: "text-fg-inverse",
    close: "inverse",
  },
};

export interface AnnouncementProps {
  /** The news itself, e.g. "智能报表已支持自然语言提问". */
  children: ReactNode;
  /** `banner`: full-width top bar. `pill`: compact inline pill, e.g. above a hero heading. */
  variant?: "banner" | "pill";
  tone?: AnnouncementTone;
  /** Badge text; defaults to "New" / "新". Pass `null` to hide it. */
  badge?: ReactNode | null;
  /** Leading icon element (shown instead of the badge in the pill when no badge). */
  icon?: ReactNode;
  /** Link target. In the pill, the whole pill becomes the link. */
  href?: string;
  /** Called when the link / pill is pressed (alternative to href, e.g. open a dialog). */
  onPress?: AriaLinkProps["onPress"];
  /** Link text; defaults to "Learn more" / "了解详情". Ignored by the pill. */
  linkLabel?: ReactNode;
  target?: AriaLinkProps["target"];
  /** Show a close button. */
  dismissible?: boolean;
  /** Controlled visibility. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  labels?: Partial<AnnouncementLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Product news: a dismissible full-width banner or a compact pill with a
 * "New" badge, message and link.
 *
 *   <Announcement href="/changelog" dismissible>团队空间现已支持访客权限</Announcement>
 *   <Announcement variant="pill" href="/blog/v3">3.0 正式发布</Announcement>
 */
export function Announcement({
  children,
  variant = "banner",
  tone = variant === "pill" ? "neutral" : "accent",
  badge,
  icon,
  href,
  onPress,
  linkLabel,
  target,
  dismissible = false,
  open,
  defaultOpen = true,
  onOpenChange,
  labels,
  className,
  ref,
}: AnnouncementProps) {
  const t = useCopy(COPY, labels);
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  if (!isOpen) return null;
  const badgeContent = badge === undefined ? t.badge : badge;
  const hasLink = href != null || onPress != null;

  if (variant === "pill") {
    const content = (
      <>
        {badgeContent != null ? (
          <span className="inline-flex h-6 items-center gap-1 rounded-full bg-accent-gradient px-2.5 text-caption font-semibold text-fg-on-accent shadow-none">
            {icon ? <span aria-hidden className="inline-flex size-3.5 [&>svg]:size-full">{icon}</span> : null}
            {badgeContent}
          </span>
        ) : icon ? (
          <span aria-hidden className="inline-flex size-4 text-fg-accent [&>svg]:size-full">{icon}</span>
        ) : null}
        <span className="truncate text-fg-muted">{children}</span>
        {hasLink ? <RiArrowRightLine aria-hidden className="size-4 shrink-0 text-fg-subtle transition-transform duration-150 group-data-[hovered]/ann:translate-x-0.5 rtl:-scale-x-100 rtl:group-data-[hovered]/ann:-translate-x-0.5" /> : null}
      </>
    );
    const pillClass = cx(
      "group/ann inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface py-1 ps-1 pe-3 text-body-sm shadow-xs",
      badgeContent == null && "ps-3",
    );
    return (
      <div ref={ref} className={cx("inline-flex max-w-full items-center gap-1", className)}>
        {hasLink ? (
          <AriaLink href={href} onPress={onPress} target={target} className={cx(pillClass, "cursor-pointer transition-[border-color,background-color] duration-150 data-[hovered]:border-line-strong data-[hovered]:bg-surface-hover", focusRing)}>
            {content}
          </AriaLink>
        ) : (
          <span className={pillClass}>{content}</span>
        )}
        {dismissible ? <CloseButton size="sm" round labels={{ close: t.dismiss }} onPress={() => setOpen(false)} /> : null}
      </div>
    );
  }

  const style = BANNER[tone];
  return (
    <div ref={ref} role="region" aria-label={t.region} className={cx("relative flex w-full items-center justify-center gap-3 px-12 py-2.5 text-body-sm", style.root, className)}>
      <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        {badgeContent != null ? (
          <span className={cx("inline-flex h-5 items-center gap-1 rounded-full px-2 text-micro font-semibold uppercase tracking-wide", style.badge)}>
            {icon ? <span aria-hidden className="inline-flex size-3 [&>svg]:size-full">{icon}</span> : null}
            {badgeContent}
          </span>
        ) : null}
        <span className="font-medium">{children}</span>
        {hasLink ? (
          <AriaLink
            href={href}
            onPress={onPress}
            target={target}
            className={cx(
              "group/ann inline-flex cursor-pointer items-center gap-1 rounded-[4px] font-semibold underline-offset-4 data-[hovered]:underline",
              focusRing,
              style.link,
            )}
          >
            {linkLabel ?? t.link}
            <RiArrowRightLine aria-hidden className="size-3.5 transition-transform duration-150 group-data-[hovered]/ann:translate-x-0.5 rtl:-scale-x-100 rtl:group-data-[hovered]/ann:-translate-x-0.5" />
          </AriaLink>
        ) : null}
      </div>
      {dismissible ? (
        <CloseButton
          size="sm"
          variant={style.close}
          labels={{ close: t.dismiss }}
          onPress={() => setOpen(false)}
          className="absolute end-3 top-1/2 -translate-y-1/2"
        />
      ) : null}
    </div>
  );
}
