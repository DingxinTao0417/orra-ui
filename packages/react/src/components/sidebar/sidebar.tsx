"use client";

import { Fragment, useId, useState } from "react";
import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Dialog, Link as AriaLink, Modal as AriaModal, ModalOverlay, useLocale } from "react-aria-components";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiExpandUpDownLine,
  RiLogoutBoxRLine,
  RiMenuLine,
  RiQuestionLine,
  RiSearchLine,
  RiSettings3Line,
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
  RiUserLine,
} from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { focusRing, overlayBackdrop } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { Avatar } from "../avatar/avatar";
import { CloseButton } from "../close-button/close-button";
import { Dropdown, DropdownItem, DropdownSection, DropdownSeparator } from "../dropdown/dropdown";
import { IconButton } from "../icon-button/icon-button";
import { Kbd } from "../kbd/kbd";
import { Tooltip } from "../tooltip/tooltip";
import { useSidebarSample } from "./sidebar-sample";
import type { SidebarNavItem, SidebarNavSection, SidebarUser, SidebarUserMenuItem, SidebarWorkspace } from "./sidebar-types";

const COPY = {
  en: {
    navigation: "Main navigation",
    search: "Search…",
    searchLabel: "Search",
    collapse: "Collapse sidebar",
    expand: "Expand sidebar",
    openMenu: "Open navigation",
    closeMenu: "Close navigation",
    workspaces: "Workspaces",
    switchWorkspace: "Switch workspace",
    createWorkspace: "Create workspace",
    account: "Account menu",
    profile: "Profile",
    settings: "Settings",
    help: "Help & feedback",
    signOut: "Sign out",
  },
  zh: {
    navigation: "主导航",
    search: "搜索…",
    searchLabel: "搜索",
    collapse: "收起侧边栏",
    expand: "展开侧边栏",
    openMenu: "打开导航",
    closeMenu: "关闭导航",
    workspaces: "工作区",
    switchWorkspace: "切换工作区",
    createWorkspace: "新建工作区",
    account: "账号菜单",
    profile: "个人资料",
    settings: "设置",
    help: "帮助与反馈",
    signOut: "退出登录",
  },
};
export type SidebarLabels = (typeof COPY)["en"];

const BADGE_TONE = {
  neutral: "bg-surface-muted text-fg-muted",
  accent: "bg-accent-50 text-fg-accent",
  danger: "bg-danger-soft text-danger",
} as const;

export interface SidebarProps {
  /** Navigation sections; defaults to sample navigation. */
  sections?: SidebarNavSection[];
  /** Id of the current item (controlled). */
  activeKey?: string;
  defaultActiveKey?: string;
  onActiveChange?: (key: string, item: SidebarNavItem) => void;
  /** Workspaces for the switcher at the top; defaults to samples. Pass `[]` to hide the switcher. */
  workspaces?: SidebarWorkspace[];
  workspaceKey?: string;
  defaultWorkspaceKey?: string;
  onWorkspaceChange?: (key: string) => void;
  /** Adds a "Create workspace" item to the switcher. */
  onCreateWorkspace?: () => void;
  /** Replaces the workspace switcher (e.g. a plain logo). */
  header?: ReactNode;
  /** Show the search button (default true). */
  showSearch?: boolean;
  /** Called when the search button is pressed (open your command palette here). */
  onSearch?: () => void;
  /** Shortcut hint shown on the search button (default "mod+k"); `false` hides it. */
  searchShortcut?: string | false;
  /** Content above the user row, e.g. an upgrade card or usage meter (hidden in the collapsed rail). */
  footer?: ReactNode;
  /** The signed-in user; defaults to a sample. Pass `null` to hide the user row. */
  user?: SidebarUser | null;
  /** Items in the user menu (default: profile, settings, help, sign out). */
  userMenuItems?: SidebarUserMenuItem[];
  onUserAction?: (id: string) => void;
  /** Rail collapsed to icons (controlled). */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Show the collapse button (default true). */
  collapsible?: boolean;
  /**
   * `responsive` (default): a rail from the `lg` breakpoint, a drawer below it.
   * `rail`: always the rail. `drawer`: only the drawer (open it with `mobileOpen`).
   */
  mode?: "responsive" | "rail" | "drawer";
  /** Drawer open state (controlled); pair with `SidebarTrigger`. */
  mobileOpen?: boolean;
  defaultMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  /** `bordered` (default): surface with an end hairline. `inset`: sits on the canvas, active row is a raised chip. */
  variant?: "bordered" | "inset";
  labels?: Partial<SidebarLabels>;
  className?: string;
  ref?: Ref<HTMLElement>;
}

function containsKey(item: SidebarNavItem, key: string | undefined): boolean {
  return !!key && (item.id === key || !!item.items?.some((c) => containsKey(c, key)));
}

/**
 * App navigation: workspace switcher, search button, nav sections with icons,
 * badges and nested items, and a user menu at the bottom. Collapses to an
 * icon rail on desktop and becomes a drawer on small screens.
 *
 *   const [open, setOpen] = useState(false);
 *   <div className="flex h-dvh">
 *     <Sidebar sections={nav} activeKey={path} mobileOpen={open} onMobileOpenChange={setOpen} />
 *     <main><SidebarTrigger onPress={() => setOpen(true)} />…</main>
 *   </div>
 */
export function Sidebar(props: SidebarProps) {
  const sample = useSidebarSample();
  const t = useCopy(COPY, props.labels);
  const { direction } = useLocale();
  const { mode = "responsive", variant = "bordered", className, ref } = props;
  const [collapsed, setCollapsed] = useControllableState(props.collapsed, props.defaultCollapsed ?? false, props.onCollapsedChange);
  const [mobileOpen, setMobileOpen] = useControllableState(props.mobileOpen, props.defaultMobileOpen ?? false, props.onMobileOpenChange);
  const sections = props.sections ?? sample.sections;
  const [active, setActive] = useControllableState(props.activeKey, props.defaultActiveKey ?? sections[0]?.items[0]?.id ?? "", (k: string) => {
    const item = findItem(sections, k);
    if (item) props.onActiveChange?.(k, item);
  });
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const open = new Set<string>();
    for (const s of sections) for (const i of s.items) if (i.items && containsKey(i, props.activeKey ?? props.defaultActiveKey)) open.add(i.id);
    return open;
  });
  const resolved = {
    ...props,
    nav: { active, setActive, expanded, setExpanded },
    sections,
    workspaces: props.workspaces ?? sample.workspaces,
    user: props.user === undefined ? sample.user : props.user,
  };

  const surface = variant === "bordered" ? "bg-surface border-e border-line" : "bg-canvas";
  const sheetIn =
    direction === "rtl"
      ? "data-[entering]:animate-sheet-in-right data-[exiting]:animate-sheet-out-right"
      : "data-[entering]:animate-sheet-in-left data-[exiting]:animate-sheet-out-left";

  return (
    <>
      {mode !== "drawer" ? (
        <aside
          ref={ref}
          data-collapsed={collapsed || undefined}
          className={cx(
            "h-full shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-out-soft motion-reduce:transition-none",
            mode === "responsive" ? "hidden lg:flex" : "flex",
            collapsed ? "w-[68px]" : "w-64",
            surface,
            className,
          )}
        >
          <SidebarBody {...resolved} t={t} variant={variant} collapsed={collapsed} onToggleCollapsed={() => setCollapsed(!collapsed)} />
        </aside>
      ) : null}
      {mode !== "rail" ? (
        <ModalOverlay isOpen={mobileOpen} onOpenChange={setMobileOpen} isDismissable className={cx(overlayBackdrop, mode === "responsive" && "lg:hidden")}>
          <AriaModal
            className={cx("fixed inset-y-0 start-0 flex w-[min(288px,calc(100vw-3rem))] flex-col bg-surface-raised shadow-raised outline-none", sheetIn)}
          >
            <Dialog aria-label={t.navigation} className="flex min-h-0 flex-1 flex-col outline-none">
              {({ close }) => (
                <>
                  <SidebarBody {...resolved} t={t} variant="bordered" collapsed={false} inDrawer onNavigate={close} />
                  <CloseButton aria-label={t.closeMenu} onPress={close} className="absolute -end-11 top-3 bg-surface-raised shadow-xs" round />
                </>
              )}
            </Dialog>
          </AriaModal>
        </ModalOverlay>
      ) : null}
    </>
  );
}

/* ---------------------------------------------------------------- trigger */

export interface SidebarTriggerProps {
  onPress?: () => void;
  /** Hide from the `lg` breakpoint up, matching `mode="responsive"` (default true). */
  responsive?: boolean;
  labels?: Partial<SidebarLabels>;
  className?: string;
}

/** The ☰ button that opens the sidebar drawer on small screens. */
export function SidebarTrigger({ onPress, responsive = true, labels, className }: SidebarTriggerProps) {
  const t = useCopy(COPY, labels);
  return <IconButton icon={<RiMenuLine />} aria-label={t.openMenu} onPress={onPress} className={cx(responsive && "lg:hidden", className)} />;
}

/* ------------------------------------------------------------------- body */

interface BodyProps extends SidebarProps {
  sections: SidebarNavSection[];
  workspaces: SidebarWorkspace[];
  user: SidebarUser | null;
  t: SidebarLabels;
  collapsed: boolean;
  inDrawer?: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
  nav: {
    active: string;
    setActive: (key: string) => void;
    expanded: Set<string>;
    setExpanded: (fn: (prev: Set<string>) => Set<string>) => void;
  };
}

function SidebarBody(p: BodyProps) {
  const { t, collapsed, inDrawer, sections, variant = "bordered" } = p;
  const { active, setActive, expanded, setExpanded } = p.nav;
  const showCollapse = p.collapsible !== false && !inDrawer && p.onToggleCollapsed;

  const select = (item: SidebarNavItem) => {
    setActive(item.id);
    p.onNavigate?.();
  };

  const collapseButton = showCollapse ? (
    <Tooltip content={collapsed ? t.expand : t.collapse} placement={collapsed ? "end" : "bottom"}>
      <IconButton
        size="sm"
        icon={collapsed ? <RiSidebarUnfoldLine className="rtl:-scale-x-100" /> : <RiSidebarFoldLine className="rtl:-scale-x-100" />}
        aria-label={collapsed ? t.expand : t.collapse}
        aria-expanded={!collapsed}
        onPress={p.onToggleCollapsed}
      />
    </Tooltip>
  ) : null;

  return (
    <div className={cx("flex min-h-0 flex-1 flex-col gap-3 py-3", collapsed ? "items-stretch px-3" : "px-3")}>
      {/* header */}
      <div className={cx("flex shrink-0 gap-1", collapsed ? "flex-col items-center gap-2" : "items-center", inDrawer && "pe-1")}>
        {p.header ?? (p.workspaces.length ? <WorkspaceSwitcher {...p} /> : <span className="flex-1" />)}
        {collapseButton}
      </div>

      {/* search */}
      {p.showSearch !== false ? (
        collapsed ? (
          <Tooltip content={t.searchLabel} placement="end" shortcut={p.searchShortcut || undefined}>
            <IconButton icon={<RiSearchLine />} aria-label={t.searchLabel} onPress={p.onSearch} className="mx-auto" />
          </Tooltip>
        ) : (
          <AriaButton
            onPress={p.onSearch}
            aria-label={t.searchLabel}
            className={cx(
              "flex h-9 w-full shrink-0 cursor-pointer items-center gap-2 rounded-control border border-line bg-surface px-2.5 text-body text-fg-subtle shadow-xs",
              "transition-colors duration-150 data-[hovered]:border-line-strong data-[hovered]:text-fg-muted",
              focusRing,
            )}
          >
            <RiSearchLine aria-hidden className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-start">{t.search}</span>
            {p.searchShortcut !== false ? <Kbd keys={p.searchShortcut ?? "mod+k"} size="sm" joined /> : null}
          </AriaButton>
        )
      ) : null}

      {/* nav */}
      <nav aria-label={t.navigation} className={cx("-mx-3 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 [scrollbar-width:thin]")}>
        {sections.map((section, si) => (
          <div key={section.id} role="group" aria-label={section.title} className={cx(si > 0 && (collapsed ? "mt-2 border-t border-line pt-2" : "mt-4"))}>
            {section.title && !collapsed ? <div className="px-2.5 pb-1.5 text-caption font-medium text-fg-subtle">{section.title}</div> : null}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <li key={item.id}>
                  <NavRow
                    item={item}
                    active={active}
                    collapsed={collapsed}
                    variant={variant}
                    open={expanded.has(item.id)}
                    onToggle={() =>
                      setExpanded((prev) => {
                        const next = new Set(prev);
                        if (next.has(item.id)) next.delete(item.id);
                        else next.add(item.id);
                        return next;
                      })
                    }
                    onSelect={select}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* footer */}
      {p.footer && !collapsed ? <div className="shrink-0">{p.footer}</div> : null}
      {p.user ? <UserMenu {...p} user={p.user} /> : null}
    </div>
  );
}

function findItem(sections: SidebarNavSection[], key: string): SidebarNavItem | undefined {
  const walk = (items: SidebarNavItem[]): SidebarNavItem | undefined => {
    for (const i of items) {
      if (i.id === key) return i;
      const hit = i.items && walk(i.items);
      if (hit) return hit;
    }
  };
  for (const s of sections) {
    const hit = walk(s.items);
    if (hit) return hit;
  }
}

/* -------------------------------------------------------------------- row */

function rowClass(current: boolean, collapsed: boolean, variant: "bordered" | "inset", nested = false) {
  return cx(
    "group/item relative flex w-full cursor-pointer select-none items-center gap-2.5 rounded-control text-body font-medium outline-none",
    "transition-[background-color,color,box-shadow] duration-150",
    "data-[disabled]:cursor-default data-[disabled]:text-fg-disabled",
    focusRing,
    nested ? "h-8 ps-3 pe-2.5" : "h-9 px-2.5",
    collapsed && "mx-auto size-10 justify-center px-0",
    current
      ? variant === "inset"
        ? "bg-surface text-fg shadow-xs ring-1 ring-line"
        : "bg-surface-active text-fg"
      : "text-fg-muted data-[hovered]:bg-surface-hover data-[hovered]:text-fg data-[pressed]:bg-surface-active",
  );
}

function ItemIcon({ icon, current }: { icon: ReactNode; current: boolean }) {
  if (!icon) return null;
  return (
    <span
      aria-hidden
      className={cx(
        "inline-flex size-[18px] shrink-0 [&>svg]:size-full",
        current ? "text-fg-accent" : "text-fg-subtle group-data-[hovered]/item:text-fg-muted",
      )}
    >
      {icon}
    </span>
  );
}

function ItemBadge({ item, collapsed }: { item: SidebarNavItem; collapsed: boolean }) {
  if (item.badge == null || item.badge === false) return null;
  if (collapsed) return <span aria-hidden className="absolute end-1.5 top-1.5 size-2 rounded-full bg-accent-500 ring-2 ring-surface" />;
  if (typeof item.badge === "number" || typeof item.badge === "string") {
    return (
      <span
        className={cx(
          "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-micro font-semibold tabular-nums",
          BADGE_TONE[item.badgeTone ?? "neutral"],
        )}
      >
        {item.badge}
      </span>
    );
  }
  return <span className="shrink-0">{item.badge}</span>;
}

interface NavRowProps {
  item: SidebarNavItem;
  active: string;
  collapsed: boolean;
  variant: "bordered" | "inset";
  open: boolean;
  onToggle: () => void;
  onSelect: (item: SidebarNavItem) => void;
}

function NavRow({ item, active, collapsed, variant, open, onToggle, onSelect }: NavRowProps) {
  const groupId = useId();
  const current = item.id === active;
  const childActive = !!item.items?.some((c) => containsKey(c, active));

  if (item.items?.length) {
    if (collapsed) {
      return (
        <Dropdown
          placement="end top"
          offset={10}
          aria-label={item.label}
          onAction={(key) => {
            const child = item.items!.find((c) => c.id === key);
            if (child) onSelect(child);
          }}
          trigger={
            <AriaButton aria-label={item.label} isDisabled={item.isDisabled} className={rowClass(childActive, true, variant)}>
              <ItemIcon icon={item.icon} current={childActive} />
              <ItemBadge item={item.items.some((c) => c.badge != null) ? { ...item, badge: true } : item} collapsed />
            </AriaButton>
          }
        >
          <DropdownSection title={item.label}>
            {item.items.map((c) => (
              <DropdownItem
                key={c.id}
                id={c.id}
                href={c.href}
                icon={c.icon}
                isDisabled={c.isDisabled}
                end={<ItemBadge item={c} collapsed={false} />}
                className={c.id === active ? "bg-surface-active" : undefined}
              >
                {c.label}
              </DropdownItem>
            ))}
          </DropdownSection>
        </Dropdown>
      );
    }
    return (
      <>
        <AriaButton aria-expanded={open} aria-controls={groupId} isDisabled={item.isDisabled} onPress={onToggle} className={rowClass(false, false, variant)}>
          <ItemIcon icon={item.icon} current={childActive && !open} />
          <span className={cx("min-w-0 flex-1 truncate text-start", childActive && "text-fg")}>{item.label}</span>
          {!open ? <ItemBadge item={item} collapsed={false} /> : null}
          <RiArrowDownSLine
            aria-hidden
            className={cx("size-4 shrink-0 text-fg-subtle transition-transform duration-200 ease-out-soft", !open && "-rotate-90 rtl:rotate-90")}
          />
        </AriaButton>
        <div
          id={groupId}
          inert={!open}
          className={cx(
            "grid transition-[grid-template-rows,opacity] duration-250 ease-out-soft motion-reduce:transition-none",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <ul className="ms-[19px] flex min-h-0 flex-col gap-0.5 overflow-hidden border-s border-line ps-2 pt-0.5">
            {item.items.map((c) => (
              <li key={c.id}>
                <LeafLink item={c} current={c.id === active} collapsed={false} variant={variant} nested onSelect={onSelect} />
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }

  const link = <LeafLink item={item} current={current} collapsed={collapsed} variant={variant} onSelect={onSelect} />;
  return collapsed ? (
    <Tooltip content={item.label} placement="end">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

function LeafLink({
  item,
  current,
  collapsed,
  variant,
  nested,
  onSelect,
}: {
  item: SidebarNavItem;
  current: boolean;
  collapsed: boolean;
  variant: "bordered" | "inset";
  nested?: boolean;
  onSelect: (item: SidebarNavItem) => void;
}) {
  const content = (
    <>
      {current && !collapsed && variant === "bordered" && !nested ? (
        <span aria-hidden className="absolute inset-y-2 -start-3 w-[3px] rounded-e-full bg-accent-500" />
      ) : null}
      <ItemIcon icon={item.icon} current={current} />
      {collapsed ? null : <span className={cx("min-w-0 flex-1 truncate text-start", nested && "font-normal", current && "font-medium")}>{item.label}</span>}
      <ItemBadge item={item} collapsed={collapsed} />
    </>
  );
  const className = rowClass(current, collapsed, variant, nested);
  if (item.href) {
    return (
      <AriaLink
        href={item.href}
        aria-current={current ? "page" : undefined}
        aria-label={collapsed ? item.label : undefined}
        isDisabled={item.isDisabled}
        onPress={() => onSelect(item)}
        className={className}
      >
        {content}
      </AriaLink>
    );
  }
  return (
    <AriaButton
      aria-current={current ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      isDisabled={item.isDisabled}
      onPress={() => onSelect(item)}
      className={className}
    >
      {content}
    </AriaButton>
  );
}

/* -------------------------------------------------------------- workspace */

function WorkspaceLogo({ ws, size = "sm" }: { ws: SidebarWorkspace; size?: "xs" | "sm" }) {
  if (ws.logo)
    return (
      <span className={cx("grid shrink-0 place-items-center overflow-hidden rounded-[8px] [&>svg]:size-full", size === "sm" ? "size-8" : "size-6")}>
        {ws.logo}
      </span>
    );
  // Workspaces read better with their first letter(s) than a person-style monogram.
  const words = ws.name.trim().split(/\s+/);
  const initials = /[\u3000-\u9fff\uac00-\ud7af]/.test(ws.name)
    ? Array.from(ws.name.trim())[0]
    : words
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
  return <Avatar name={ws.name} initials={initials} size={size} square />;
}

function WorkspaceSwitcher(p: BodyProps) {
  const { t, collapsed, workspaces } = p;
  const [key, setKey] = useControllableState(p.workspaceKey, p.defaultWorkspaceKey ?? workspaces[0]?.id ?? "", p.onWorkspaceChange);
  const current = workspaces.find((w) => w.id === key) ?? workspaces[0]!;

  return (
    <Dropdown
      aria-label={t.workspaces}
      placement={collapsed ? "end top" : "bottom start"}
      offset={collapsed ? 10 : 6}
      className="min-w-60"
      onAction={(k) => {
        if (k === "__create") p.onCreateWorkspace?.();
      }}
      trigger={
        <AriaButton
          aria-label={`${t.switchWorkspace}: ${current.name}`}
          className={cx(
            "flex min-w-0 cursor-pointer items-center gap-2.5 rounded-control text-start outline-none transition-colors duration-150 data-[hovered]:bg-surface-hover data-[pressed]:bg-surface-active",
            focusRing,
            collapsed ? "size-10 justify-center" : "h-12 flex-1 px-1.5",
          )}
        >
          <WorkspaceLogo ws={current} />
          {collapsed ? null : (
            <>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body font-semibold text-fg">{current.name}</span>
                {current.description ? <span className="truncate text-caption text-fg-subtle">{current.description}</span> : null}
              </span>
              <RiExpandUpDownLine aria-hidden className="size-4 shrink-0 text-fg-subtle" />
            </>
          )}
        </AriaButton>
      }
    >
      <DropdownSection
        title={t.workspaces}
        selectionMode="single"
        selectedKeys={[current.id]}
        disallowEmptySelection
        onSelectionChange={(keys) => {
          const next = keys === "all" ? undefined : [...keys][0];
          if (next != null) setKey(String(next));
        }}
      >
        {workspaces.map((w) => (
          <DropdownItem key={w.id} id={w.id} textValue={w.name} description={w.description} end={<WorkspaceLogo ws={w} size="xs" />}>
            {w.name}
          </DropdownItem>
        ))}
      </DropdownSection>
      {p.onCreateWorkspace ? (
        <>
          <DropdownSeparator />
          <DropdownItem id="__create" icon={<RiAddLine />}>
            {t.createWorkspace}
          </DropdownItem>
        </>
      ) : null}
    </Dropdown>
  );
}

/* ------------------------------------------------------------------- user */

function UserMenu(p: BodyProps & { user: SidebarUser }) {
  const { t, collapsed, user } = p;
  const items: SidebarUserMenuItem[] = p.userMenuItems ?? [
    { id: "profile", label: t.profile, icon: <RiUserLine /> },
    { id: "settings", label: t.settings, icon: <RiSettings3Line /> },
    { id: "help", label: t.help, icon: <RiQuestionLine /> },
    { id: "signOut", label: t.signOut, icon: <RiLogoutBoxRLine className="rtl:-scale-x-100" />, tone: "danger", separatorBefore: true },
  ];
  return (
    <div className={cx("shrink-0 border-t border-line pt-3", collapsed && "flex justify-center")}>
      <Dropdown
        aria-label={t.account}
        placement={collapsed ? "end bottom" : "top start"}
        offset={collapsed ? 10 : 6}
        className="min-w-56"
        onAction={(k) => p.onUserAction?.(String(k))}
        trigger={
          <AriaButton
            aria-label={`${t.account}: ${user.name}`}
            className={cx(
              "flex min-w-0 cursor-pointer items-center gap-2.5 rounded-control text-start outline-none transition-colors duration-150 data-[hovered]:bg-surface-hover data-[pressed]:bg-surface-active",
              focusRing,
              collapsed ? "size-10 justify-center" : "h-12 w-full px-1.5",
            )}
          >
            <Avatar name={user.name} src={user.src} status={user.status} size="sm" />
            {collapsed ? null : (
              <>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body font-medium text-fg">{user.name}</span>
                  {user.email ? <span className="truncate text-caption text-fg-subtle">{user.email}</span> : null}
                </span>
                <RiExpandUpDownLine aria-hidden className="size-4 shrink-0 text-fg-subtle" />
              </>
            )}
          </AriaButton>
        }
      >
        {items.map((it) => (
          <Fragment key={it.id}>
            {it.separatorBefore ? <DropdownSeparator /> : null}
            <DropdownItem id={it.id} href={it.href} icon={it.icon} shortcut={it.shortcut} tone={it.tone}>
              {it.label}
            </DropdownItem>
          </Fragment>
        ))}
      </Dropdown>
    </div>
  );
}
