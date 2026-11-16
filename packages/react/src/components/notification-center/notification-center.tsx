"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Dialog, DialogTrigger, Heading, Popover as AriaPopover, useLocale } from "react-aria-components";
import type { PopoverProps as AriaPopoverProps } from "react-aria-components";
import { RiAtLine, RiCheckDoubleLine, RiInboxLine, RiNotification3Line, RiSettings3Line, RiShieldCheckLine, RiUploadCloud2Line } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { card, floatingPanel, focusRing, type Size } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { buttonClass, Button } from "../button/button";
import { IconButton } from "../icon-button/icon-button";
import { NotificationCard } from "../notification/notification";
import { Tab, TabList, TabPanel, Tabs } from "../tabs/tabs";
import { Tooltip } from "../tooltip/tooltip";

const COPY = {
  en: {
    title: "Notifications",
    all: "All",
    unread: "Unread",
    mentions: "Mentions",
    markAllRead: "Mark all as read",
    settings: "Notification settings",
    today: "Today",
    yesterday: "Yesterday",
    now: "just now",
    emptyAll: "No notifications yet",
    emptyAllHint: "Activity from your team will show up here.",
    emptyUnread: "You're all caught up",
    emptyUnreadHint: "New notifications will appear here.",
    emptyMentions: "No mentions",
    emptyMentionsHint: "When someone @mentions you, you'll see it here.",
    open: "Open notifications",
    openCount: "Open notifications, {count} unread",
    archive: "Archive",
    accept: "Accept",
    decline: "Decline",
    sampleMention: "<0>Maya Chen</0> mentioned you in <1>Q4 launch plan</1>",
    sampleMentionBody: "Can you confirm the pricing page copy before Friday?",
    sampleInvite: "<0>Leo Park</0> invited you to <1>Design Review</1>",
    sampleUpload: "Export <1>customers-november.csv</1> is ready to download",
    sampleComment: "<0>Ana Ruiz</0> replied to your comment on <1>Onboarding v3</1>",
    sampleCommentBody: "Agreed — let's drop the second step entirely.",
    sampleSecurity: "New sign-in from <1>Chrome on macOS</1>",
    sampleAssign: "<0>Sam Wilson</0> assigned <1>ENG-482</1> to you",
  },
  zh: {
    title: "通知",
    all: "全部",
    unread: "未读",
    mentions: "提及",
    markAllRead: "全部标为已读",
    settings: "通知设置",
    today: "今天",
    yesterday: "昨天",
    now: "刚刚",
    emptyAll: "还没有通知",
    emptyAllHint: "团队的动态会显示在这里。",
    emptyUnread: "全部看完了",
    emptyUnreadHint: "有新通知时会出现在这里。",
    emptyMentions: "暂无提及",
    emptyMentionsHint: "有人 @ 你时会显示在这里。",
    open: "打开通知",
    openCount: "打开通知，{count} 条未读",
    archive: "归档",
    accept: "接受",
    decline: "拒绝",
    sampleMention: "<0>陈思敏</0> 在 <1>Q4 发布计划</1> 中提到了你",
    sampleMentionBody: "周五前能帮忙确认一下定价页的文案吗？",
    sampleInvite: "<0>朴立恒</0> 邀请你加入 <1>设计评审</1>",
    sampleUpload: "导出文件 <1>客户名单-11月.csv</1> 已就绪，可以下载",
    sampleComment: "<0>阮安娜</0> 回复了你在 <1>新手引导 v3</1> 中的评论",
    sampleCommentBody: "同意，第二步可以直接去掉。",
    sampleSecurity: "检测到新的登录：<1>macOS 上的 Chrome</1>",
    sampleAssign: "<0>王思远</0> 将 <1>ENG-482</1> 指派给了你",
  },
};
export type NotificationCenterLabels = (typeof COPY)["en"];

export type NotificationCenterTab = "all" | "unread" | "mentions";
export type NotificationCenterTone = "accent" | "success" | "warning" | "danger" | "info" | "neutral";

export interface NotificationCenterAction {
  id: string;
  label: ReactNode;
  /** `accent` = primary, `neutral` = secondary (default), `danger` = destructive. */
  tone?: "accent" | "neutral" | "danger";
}

export interface NotificationCenterItem {
  id: string;
  /** The activity line. Wrap names in <b> for emphasis. */
  title: ReactNode;
  /** Quoted text or details. */
  description?: ReactNode;
  /** When it happened: Date, ISO string or epoch ms. */
  time: Date | string | number;
  /** Who did it (shown as an avatar). */
  actor?: { name: string; src?: string };
  /** Icon element for system events (used when there is no actor). */
  icon?: ReactNode;
  /** Tint of the icon tile. */
  tone?: NotificationCenterTone;
  read?: boolean;
  /** Counts as a mention (shown under the Mentions tab). */
  mention?: boolean;
  /** Inline action buttons, e.g. accept / decline. */
  actions?: NotificationCenterAction[];
  /** Outcome text shown after an action was taken (e.g. "Accepted"). */
  resolution?: ReactNode;
}

const ICON_TONE: Record<NotificationCenterTone, string> = {
  accent: "bg-accent-50 text-fg-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-surface-muted text-fg-muted",
};

/** Turns "<0>Name</0> did <1>thing</1>" into bold runs. */
function rich(template: string): ReactNode {
  const parts = template.split(/<(\d)>(.*?)<\/\1>/g);
  const out: ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) out.push(parts[i]);
    if (parts[i + 2] !== undefined) out.push(<b key={i}>{parts[i + 2]}</b>);
  }
  return out;
}

/** Sample inbox (clearly sample data: pass `items` / `defaultItems` to replace it). */
function sampleItems(t: NotificationCenterLabels, now: number): NotificationCenterItem[] {
  const min = 60_000;
  const hour = 60 * min;
  return [
    {
      id: "n1",
      actor: { name: t.sampleMention.match(/<0>(.*?)<\/0>/)?.[1] ?? "" },
      title: rich(t.sampleMention),
      description: t.sampleMentionBody,
      time: now - 4 * min,
      mention: true,
    },
    {
      id: "n2",
      actor: { name: t.sampleInvite.match(/<0>(.*?)<\/0>/)?.[1] ?? "" },
      title: rich(t.sampleInvite),
      time: now - 52 * min,
      actions: [
        { id: "accept", label: t.accept, tone: "accent" },
        { id: "decline", label: t.decline },
      ],
    },
    { id: "n3", icon: <RiUploadCloud2Line />, tone: "success", title: rich(t.sampleUpload), time: now - 3 * hour },
    {
      id: "n4",
      actor: { name: t.sampleComment.match(/<0>(.*?)<\/0>/)?.[1] ?? "" },
      title: rich(t.sampleComment),
      description: t.sampleCommentBody,
      time: now - 26 * hour,
      read: true,
      mention: true,
    },
    { id: "n5", icon: <RiShieldCheckLine />, tone: "info", title: rich(t.sampleSecurity), time: now - 29 * hour, read: true },
    { id: "n6", actor: { name: t.sampleAssign.match(/<0>(.*?)<\/0>/)?.[1] ?? "" }, title: rich(t.sampleAssign), time: now - 3 * 24 * hour, read: true },
  ];
}

const toMs = (time: NotificationCenterItem["time"]) => (time instanceof Date ? time.getTime() : typeof time === "number" ? time : new Date(time).getTime());

/** Wall-clock "now" that is null during SSR / hydration and ticks every minute after mount. */
function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function relativeTime(ms: number, now: number, locale: string, justNow: string) {
  const diff = Math.round((ms - now) / 1000);
  const abs = Math.abs(diff);
  if (abs < 45) return justNow;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 7 * 86_400) return rtf.format(Math.round(diff / 86_400), "day");
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(ms);
}

const dayKey = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

/* ------------------------------------------------------------------ hook */

/** Shared state for the panel and the bell badge. */
function useInbox(props: Pick<NotificationCenterProps, "items" | "defaultItems" | "onItemsChange">, t: NotificationCenterLabels) {
  const [fallback] = useState(() => (props.items || props.defaultItems ? null : sampleItems(t, Date.now())));
  return useControllableState(props.items, props.defaultItems ?? fallback ?? [], props.onItemsChange);
}

/* ------------------------------------------------------------------ panel */

export interface NotificationCenterProps {
  /** Notifications (controlled). Defaults to a sample inbox. */
  items?: NotificationCenterItem[];
  defaultItems?: NotificationCenterItem[];
  /** Called with the updated list when items are read, archived or acted on. */
  onItemsChange?: (items: NotificationCenterItem[]) => void;
  tab?: NotificationCenterTab;
  defaultTab?: NotificationCenterTab;
  onTabChange?: (tab: NotificationCenterTab) => void;
  /** Called when an inline action is pressed. By default the item is then marked read and shows the action label as its outcome. */
  onAction?: (item: NotificationCenterItem, actionId: string) => void;
  /** Called when an item is opened (click / Enter). It's marked read first. */
  onItemPress?: (item: NotificationCenterItem) => void;
  /** Shows a settings button in the header. */
  onSettings?: () => void;
  /** Allow archiving items with a hover × (default true). */
  archivable?: boolean;
  /** Group by day with headings (default true). */
  groupByDay?: boolean;
  title?: ReactNode;
  /** Content under the list, e.g. a "View all" link. */
  footer?: ReactNode;
  /** Max height of the scrolling list (default 420px). */
  maxHeight?: number | string;
  /** `card` (default) draws a surface; `plain` has no border (used inside popovers). */
  variant?: "card" | "plain";
  labels?: Partial<NotificationCenterLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Inbox panel: All / Unread / Mentions tabs, items grouped by day, inline
 * actions (accept / decline), mark-all-read and empty states.
 *
 *   <NotificationCenter items={items} onItemsChange={setItems} onAction={respond} />
 */
export function NotificationCenter(props: NotificationCenterProps) {
  const t = useCopy(COPY, props.labels);
  const [items, setItems] = useInbox(props, t);
  return <InboxPanel {...props} items={items} onItemsChange={setItems} />;
}

function InboxPanel({
  items = [],
  onItemsChange,
  tab,
  defaultTab = "all",
  onTabChange,
  onAction,
  onItemPress,
  onSettings,
  archivable = true,
  groupByDay = true,
  title,
  footer,
  maxHeight = 420,
  variant = "card",
  labels,
  className,
  ref,
}: NotificationCenterProps) {
  const t = useCopy(COPY, labels);
  const { locale } = useLocale();
  const now = useNow();
  const [currentTab, setTab] = useControllableState<NotificationCenterTab>(tab, defaultTab, onTabChange);

  const update = (fn: (list: NotificationCenterItem[]) => NotificationCenterItem[]) => onItemsChange?.(fn(items));
  const markRead = (id: string) => update((list) => list.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n)));

  const sorted = useMemo(() => [...items].sort((a, b) => toMs(b.time) - toMs(a.time)), [items]);
  const unreadCount = items.filter((n) => !n.read).length;
  const mentionCount = items.filter((n) => n.mention && !n.read).length;
  const visible = sorted.filter((n) => (currentTab === "unread" ? !n.read : currentTab === "mentions" ? n.mention : true));

  // Day groups need the client clock, so they appear after hydration.
  const groups = useMemo(() => {
    if (!groupByDay || now == null) return [{ key: "all", label: null as string | null, items: visible }];
    const today = dayKey(now);
    const yesterday = dayKey(now - 86_400_000);
    const map = new Map<string, { key: string; label: string | null; items: NotificationCenterItem[] }>();
    for (const n of visible) {
      const ms = toMs(n.time);
      const key = dayKey(ms);
      if (!map.has(key)) {
        const label =
          key === today
            ? t.today
            : key === yesterday
              ? t.yesterday
              : new Intl.DateTimeFormat(locale, { weekday: "long", month: "short", day: "numeric" }).format(ms);
        map.set(key, { key, label, items: [] });
      }
      map.get(key)!.items.push(n);
    }
    return [...map.values()];
  }, [visible, groupByDay, now, locale, t]);

  const empty = {
    all: [t.emptyAll, t.emptyAllHint],
    unread: [t.emptyUnread, t.emptyUnreadHint],
    mentions: [t.emptyMentions, t.emptyMentionsHint],
  }[currentTab];

  const act = (item: NotificationCenterItem, action: NotificationCenterAction) => {
    onAction?.(item, action.id);
    update((list) => list.map((n) => (n.id === item.id ? { ...n, read: true, actions: undefined, resolution: n.resolution ?? action.label } : n)));
  };

  const press = (item: NotificationCenterItem) => {
    if (!item.read) markRead(item.id);
    onItemPress?.(item);
  };

  const list = (
    <>
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <span aria-hidden className="mb-1 grid size-11 place-items-center rounded-full bg-surface-muted text-fg-subtle [&>svg]:size-5">
            {currentTab === "mentions" ? <RiAtLine /> : <RiInboxLine />}
          </span>
          <p className="text-body font-medium text-fg">{empty[0]}</p>
          <p className="text-body-sm text-fg-subtle">{empty[1]}</p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.key} role="group" aria-label={group.label ?? undefined} className="flex flex-col gap-0.5">
            {group.label ? <h3 className="px-2.5 pt-2.5 pb-1 text-caption font-medium text-fg-subtle">{group.label}</h3> : null}
            {group.items.map((n) => (
              <NotificationCard
                key={n.id}
                tabIndex={0}
                actor={n.actor}
                media={
                  n.actor ? undefined : (
                    <span aria-hidden className={cx("grid size-10 place-items-center rounded-full [&>svg]:size-[18px]", ICON_TONE[n.tone ?? "neutral"])}>
                      {n.icon ?? <RiNotification3Line />}
                    </span>
                  )
                }
                title={n.title}
                description={n.description}
                time={now == null ? null : relativeTime(toMs(n.time), now, locale, t.now)}
                unread={!n.read}
                dismissible={archivable}
                onDismiss={() => update((list) => list.filter((x) => x.id !== n.id))}
                labels={{ dismiss: t.archive }}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("button,a")) return;
                  press(n);
                }}
                onKeyDown={(e) => {
                  if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    press(n);
                  }
                }}
                className={cx("cursor-default transition-colors data-[hovered]:bg-surface-hover hover:bg-surface-hover", focusRing)}
                actions={
                  n.actions?.length ? (
                    n.actions.map((a) => (
                      <Button
                        key={a.id}
                        size="sm"
                        variant={a.tone === "accent" ? "solid" : "outline"}
                        tone={a.tone === "danger" ? "danger" : a.tone === "accent" ? "accent" : "neutral"}
                        onPress={() => act(n, a)}
                      >
                        {a.label}
                      </Button>
                    ))
                  ) : n.resolution ? (
                    <span className="text-caption font-medium text-fg-subtle">{n.resolution}</span>
                  ) : undefined
                }
              />
            ))}
          </div>
        ))
      )}
    </>
  );

  return (
    <section
      ref={ref}
      aria-label={typeof title === "string" ? title : t.title}
      className={cx("flex w-full flex-col", variant === "card" && cx(card, "overflow-hidden"), className)}
    >
      <header className="flex items-center gap-2 px-4 pt-3.5">
        <Heading level={2} className="min-w-0 flex-1 truncate text-body font-semibold text-fg">
          {title ?? t.title}
        </Heading>
        <Tooltip content={t.markAllRead}>
          <IconButton
            size="sm"
            icon={<RiCheckDoubleLine />}
            aria-label={t.markAllRead}
            isDisabled={unreadCount === 0}
            onPress={() => update((list) => list.map((n) => (n.read ? n : { ...n, read: true })))}
          />
        </Tooltip>
        {onSettings ? (
          <Tooltip content={t.settings}>
            <IconButton size="sm" icon={<RiSettings3Line />} aria-label={t.settings} onPress={onSettings} className="-me-1.5" />
          </Tooltip>
        ) : null}
      </header>

      <Tabs selectedKey={currentTab} onSelectionChange={(k) => setTab(k as NotificationCenterTab)} size="sm" className="gap-0">
        <TabList aria-label={t.title} className="px-2.5">
          <Tab id="all">{t.all}</Tab>
          <Tab id="unread" count={unreadCount || undefined}>
            {t.unread}
          </Tab>
          <Tab id="mentions" count={mentionCount || undefined}>
            {t.mentions}
          </Tab>
        </TabList>
        {(["all", "unread", "mentions"] as const).map((id) => (
          <TabPanel key={id} id={id} className="min-h-0 overflow-y-auto overscroll-contain rounded-none p-1.5" style={{ maxHeight }}>
            {list}
          </TabPanel>
        ))}
      </Tabs>
      {footer ? <div className="flex items-center justify-center border-t border-line px-4 py-2.5">{footer}</div> : null}
    </section>
  );
}

/* ---------------------------------------------------------------- popover */

export interface NotificationCenterPopoverProps extends NotificationCenterProps, Pick<AriaPopoverProps, "placement" | "offset"> {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Trigger button size. */
  size?: Size;
  /** Panel width in px (default 400). */
  width?: number;
  triggerClassName?: string;
}

/**
 * A bell button with an unread badge that opens the NotificationCenter in a
 * popover. Shares one inbox state between the badge and the panel.
 *
 *   <NotificationCenterPopover items={items} onItemsChange={setItems} />
 */
export function NotificationCenterPopover({
  isOpen,
  defaultOpen,
  onOpenChange,
  placement = "bottom end",
  offset = 8,
  size = "md",
  width = 400,
  triggerClassName,
  className,
  ...props
}: NotificationCenterPopoverProps) {
  const t = useCopy(COPY, props.labels);
  const [items, setItems] = useInbox(props, t);
  const unread = items.filter((n) => !n.read).length;
  const square = { sm: "size-8 px-0", md: "size-9 px-0", lg: "size-11 px-0" }[size];
  return (
    <DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <AriaButton
        aria-label={unread ? fill(t.openCount, { count: unread }) : t.open}
        className={cx(buttonClass({ variant: "plain", tone: "neutral", size }), square, "relative", triggerClassName)}
      >
        <RiNotification3Line aria-hidden className={size === "sm" ? "size-4" : size === "lg" ? "size-5" : "size-[18px]"} />
        {unread ? (
          <span
            aria-hidden
            className="absolute end-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-fg-inverse tabular-nums ring-2 ring-surface"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </AriaButton>
      <AriaPopover placement={placement} offset={offset} className={cx(floatingPanel, "max-w-[calc(100vw-1.5rem)] overflow-hidden p-0")} style={{ width }}>
        <Dialog aria-label={t.title} className="outline-none">
          <InboxPanel {...props} items={items} onItemsChange={setItems} variant="plain" className={className} />
        </Dialog>
      </AriaPopover>
    </DialogTrigger>
  );
}
