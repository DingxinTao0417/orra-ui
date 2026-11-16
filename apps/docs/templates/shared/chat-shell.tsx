"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  RiArrowDownLine,
  RiChat3Line,
  RiCheckLine,
  RiCodeSSlashLine,
  RiDeleteBinLine,
  RiDownload2Line,
  RiEditLine,
  RiFileCopyLine,
  RiFolder3Line,
  RiFolderTransferLine,
  RiImageCircleAiLine,
  RiLayoutRightLine,
  RiLinkM,
  RiMoreLine,
  RiPushpinLine,
  RiRefreshLine,
  RiShareForwardLine,
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
  RiTeamLine,
  RiThumbDownLine,
  RiThumbUpLine,
} from "@remixicon/react";
import {
  AgentAvatar,
  Badge,
  Button,
  CommandPalette,
  CommandPaletteGroup,
  CommandPaletteItem,
  Drawer,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownSubmenu,
  IconButton,
  Input,
  Kbd,
  Meter,
  OrraProvider,
  Popover,
  SettingsModal,
  Sidebar,
  Switch,
  ThemeToggle,
  Toaster,
  Tooltip,
  toast,
  type SidebarNavItem,
  type SidebarNavSection,
} from "@orra-ui/react";
import { cx } from "@orra-ui/react/lib/cx";

/* ================================================================== data */

export interface ChatConversation {
  id: string;
  title: string;
  /** Conversations that live in another template link there. */
  href?: string;
}

export interface ChatProject {
  id: string;
  name: string;
  conversations: ChatConversation[];
}

/** The three AI templates, so the sidebar doubles as a template switcher. */
const SPACES: SidebarNavItem[] = [
  { id: "space-code", label: "编程助手", icon: <RiCodeSSlashLine />, href: "/templates/ai-chat" },
  { id: "space-image", label: "图像工作室", icon: <RiImageCircleAiLine />, href: "/templates/ai-image-generation" },
  { id: "space-team", label: "智能体团队", icon: <RiTeamLine />, href: "/templates/multi-agent-chat", badge: 2, badgeTone: "accent" },
];

const PROJECTS: ChatProject[] = [
  {
    id: "proj-web",
    name: "官网改版",
    conversations: [
      { id: "c-pricing-copy", title: "定价页 A/B 文案" },
      { id: "c-nav-a11y", title: "导航栏无障碍修复" },
      { id: "c-lighthouse", title: "首屏性能优化到 90 分" },
    ],
  },
  {
    id: "proj-brand",
    name: "秋季品牌视觉",
    conversations: [
      { id: "c-poster", title: "主视觉海报三个方向" },
      { id: "c-grid", title: "社媒九宫格排版" },
    ],
  },
  {
    id: "proj-launch",
    name: "新品发布筹备",
    conversations: [
      { id: "c-agenda", title: "发布会议程草案" },
      { id: "c-media", title: "媒体名单去重" },
    ],
  },
];

const DAYS: { id: string; title: string; items: ChatConversation[] }[] = [
  {
    id: "today",
    title: "今天",
    items: [
      { id: "checkout-guard", title: "结账页重复提交排查", href: "/templates/ai-chat" },
      { id: "hanok-night", title: "雨夜韩屋书店概念图", href: "/templates/ai-image-generation" },
      { id: "launch-team", title: "Q4 新品发布协作", href: "/templates/multi-agent-chat" },
      { id: "c-weekly", title: "把周报整理成表格" },
    ],
  },
  {
    id: "yesterday",
    title: "昨天",
    items: [
      { id: "c-sql", title: "订单表慢查询优化" },
      { id: "c-rust", title: "Rust 借用检查报错" },
      { id: "c-cat", title: "举杯小猫贴纸" },
    ],
  },
  {
    id: "week",
    title: "最近 7 天",
    items: [
      { id: "c-token", title: "设计 Token 命名规范" },
      { id: "c-lru", title: "手写 LRU 缓存" },
      { id: "c-kyoto", title: "京都五日行程" },
      { id: "c-okr", title: "季度 OKR 打磨" },
    ],
  },
];

const ALL_CONVERSATIONS: ChatConversation[] = [...DAYS.flatMap((d) => d.items), ...PROJECTS.flatMap((p) => p.conversations)];

function buildSections(): SidebarNavSection[] {
  return [
    { id: "spaces", items: SPACES },
    {
      id: "projects",
      title: "项目",
      items: PROJECTS.map((p) => ({
        id: p.id,
        label: p.name,
        icon: <RiFolder3Line />,
        items: p.conversations.map((c) => ({ id: c.id, label: c.title, href: c.href })),
      })),
    },
    ...DAYS.map((d) => ({ id: d.id, title: d.title, items: d.items.map((c) => ({ id: c.id, label: c.title, href: c.href })) })),
  ];
}

/* ================================================================= hooks */

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** The current time, or null on the server and during hydration. */
export function useClientNow(intervalMs?: number): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    if (!intervalMs) return;
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** "14:32" for a timestamp created on the client (e.g. a message just sent). */
export function clockLabel(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

export interface ScriptStep {
  /** Wait this long (ms) after the previous step. */
  delay: number;
  run: () => void;
}

/**
 * Plays a list of timed steps, one timeout at a time, from an effect. Used by
 * the templates to simulate an agent working; `stop()` cancels the rest and a
 * new `play()` replaces the running script.
 */
export function useScriptPlayer() {
  const [script, setScript] = useState<{ steps: ScriptStep[]; index: number } | null>(null);
  useEffect(() => {
    if (!script || script.index >= script.steps.length) return;
    const current = script;
    const step = current.steps[current.index]!;
    const id = window.setTimeout(() => {
      step.run();
      setScript((s) => (s === current ? { ...s, index: s.index + 1 } : s));
    }, step.delay);
    return () => window.clearTimeout(id);
  }, [script]);
  const playing = !!script && script.index < script.steps.length;
  const play = useCallback((steps: ScriptStep[]) => setScript({ steps, index: 0 }), []);
  const stop = useCallback(() => setScript(null), []);
  return { playing, play, stop };
}

/* ============================================================ shell api */

interface ChatShellApi {
  /** Show the side panel (inline on wide screens, a sheet on narrow ones). */
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  panelVisible: boolean;
}

const ChatShellContext = createContext<ChatShellApi>({ openPanel() {}, closePanel() {}, togglePanel() {}, panelVisible: false });

export function useChatShell() {
  return useContext(ChatShellContext);
}

export interface ChatShellPanel {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons in the panel header (before the close button). */
  actions?: ReactNode;
  content: ReactNode;
  /** Label of the header button that toggles the panel. */
  toggleLabel?: string;
  /** Initial / min / max width in px of the inline panel. */
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  /** Start hidden on wide screens. */
  defaultHidden?: boolean;
}

export interface ChatShellProps {
  /** Sidebar id of the current conversation. */
  active: string;
  title: ReactNode;
  /** Small context after the title, e.g. a project badge. */
  titleMeta?: ReactNode;
  /** Model picker (or any compact control) in the header. */
  model?: ReactNode;
  /** Extra header buttons before share / more. */
  actions?: ReactNode;
  /** Optional side panel. */
  panel?: ChatShellPanel;
  /** "New chat" in the sidebar; defaults to reloading the template. */
  onNewChat?: () => void;
  children: ReactNode | ((api: ChatShellApi) => ReactNode);
}

/* ================================================================ shell */

/**
 * The shared frame of the AI family: a conversation sidebar (new chat,
 * search, projects, day groups, plan usage and user), a main column with a
 * header (title, model, share, more) and an optional side panel that can be
 * resized on wide screens and becomes a sheet on small ones.
 */
export function ChatShell(props: ChatShellProps) {
  return (
    <OrraProvider locale="zh-CN">
      <ChatShellFrame {...props} />
      <Toaster placement="top-center" />
    </OrraProvider>
  );
}

function ChatShellFrame({ active, title, titleMeta, model, actions, panel, onNewChat, children }: ChatShellProps) {
  const sections = useState(buildSections)[0];
  const [activeKey, setActiveKey] = useState(active);
  const [mobileNav, setMobileNav] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const wideNav = useMediaQuery("(min-width: 1024px)");
  const widePanel = useMediaQuery("(min-width: 1280px)");
  const [panelInline, setPanelInline] = useState(!panel?.defaultHidden);
  const [panelSheet, setPanelSheet] = useState(false);
  const [panelWidth, setPanelWidth] = useState(panel?.width ?? 420);

  const panelVisible = widePanel ? panelInline : panelSheet;
  const api: ChatShellApi = {
    panelVisible,
    openPanel: () => (widePanel ? setPanelInline(true) : setPanelSheet(true)),
    closePanel: () => (widePanel ? setPanelInline(false) : setPanelSheet(false)),
    togglePanel: () => (widePanel ? setPanelInline((v) => !v) : setPanelSheet((v) => !v)),
  };

  const newChat = () => {
    setMobileNav(false);
    if (onNewChat) onNewChat();
    else window.location.reload();
  };

  const openNav = () => (wideNav ? setNavHidden(false) : setMobileNav(true));

  const header = (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div className="flex h-9 items-center gap-2 ps-1">
        <AgentAvatar seed="orra-assistant" name="Orra 助手" size="sm" />
        <span className="min-w-0 flex-1 truncate text-body font-semibold text-fg">Orra 助手</span>
        <Tooltip content="收起侧栏">
          <IconButton
            size="sm"
            icon={<RiSidebarFoldLine className="rtl:-scale-x-100" />}
            aria-label="收起侧栏"
            onPress={() => {
              if (!wideNav || navHidden) setMobileNav(false);
              else setNavHidden(true);
            }}
            className="max-lg:hidden"
          />
        </Tooltip>
      </div>
      <Button variant="outline" tone="neutral" fullWidth startIcon={<RiEditLine />} onPress={newChat} className="justify-start">
        <span className="flex-1 text-start">新对话</span>
        <Kbd keys={["mod", "shift", "o"]} size="sm" variant="ghost" />
      </Button>
    </div>
  );

  const footer = (
    <div className="flex flex-col gap-2.5 rounded-control border border-line bg-surface p-3 shadow-xs">
      <div className="flex items-center gap-2">
        <Badge tone="accent" size="sm">
          专业版
        </Badge>
        <span className="text-caption text-fg-subtle">本月用量</span>
        <a href="#upgrade" onClick={(e) => e.preventDefault()} className="ms-auto text-caption font-medium text-fg-accent hover:underline">
          升级
        </a>
      </div>
      <Meter aria-label="本月额度" value={68} valueLabel="68%" size="sm" accentWhenOk description="对话 1,360 / 2,000 次 · 11 月 30 日重置" />
    </div>
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        if (onNewChat) onNewChat();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNewChat]);

  return (
    <ChatShellContext.Provider value={api}>
      <div className="flex h-dvh overflow-clip bg-canvas">
        <Sidebar
          sections={sections}
          activeKey={activeKey}
          onActiveChange={(key) => setActiveKey(key)}
          workspaces={[]}
          header={header}
          collapsible={false}
          onSearch={() => {
            setMobileNav(false);
            setSearchOpen(true);
          }}
          footer={footer}
          user={{ name: "沈知远", email: "zhiyuan@orra.studio", status: "online" }}
          onUserAction={(id) => {
            if (id === "settings") setSettingsOpen(true);
            else if (id === "signOut") toast("这是演示模板，不会真的退出");
          }}
          variant="inset"
          mode={navHidden ? "drawer" : "responsive"}
          mobileOpen={mobileNav}
          onMobileOpenChange={setMobileNav}
        />

        <div
          className={cx(
            "flex min-w-0 flex-1 overflow-clip bg-surface",
            "lg:my-2 lg:me-2 lg:rounded-card lg:border lg:border-line lg:shadow-card",
            navHidden && "lg:ms-2",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-14 shrink-0 items-center gap-1.5 border-b border-line px-2 sm:gap-2 sm:px-4">
              <Tooltip content="展开侧栏">
                <IconButton
                  icon={<RiSidebarUnfoldLine className="rtl:-scale-x-100" />}
                  aria-label="展开侧栏"
                  onPress={openNav}
                  className={cx(!navHidden && "lg:hidden")}
                />
              </Tooltip>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <h1 className="min-w-0 truncate text-body font-semibold text-fg">{title}</h1>
                {titleMeta ? <span className="hidden shrink-0 md:inline-flex">{titleMeta}</span> : null}
              </div>
              {model ? <div className="hidden shrink-0 sm:flex">{model}</div> : null}
              {actions}
              <SharePopover />
              <MoreMenu />
              <ThemeToggle variant="icon" className="max-sm:hidden" />
              {panel ? (
                <Tooltip content={panelVisible ? "收起面板" : (panel.toggleLabel ?? "展开面板")}>
                  <IconButton
                    icon={<RiLayoutRightLine className="rtl:-scale-x-100" />}
                    aria-label={panel.toggleLabel ?? "面板"}
                    aria-pressed={panelVisible}
                    variant={panelVisible ? "soft" : "plain"}
                    onPress={api.togglePanel}
                  />
                </Tooltip>
              ) : null}
            </header>
            <div className="flex min-h-0 flex-1 flex-col">{typeof children === "function" ? children(api) : children}</div>
          </div>

          {panel && panelInline ? (
            <aside
              aria-label={typeof panel.title === "string" ? panel.title : "面板"}
              style={{ width: panelWidth }}
              className="relative hidden shrink-0 flex-col border-s border-line bg-surface xl:flex"
            >
              <PanelResizer
                width={panelWidth}
                min={panel.minWidth ?? 340}
                max={panel.maxWidth ?? 640}
                onChange={setPanelWidth}
              />
              <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line ps-4 pe-2">
                <div className="flex min-w-0 flex-1 flex-col">
                  <h2 className="truncate text-body font-semibold text-fg">{panel.title}</h2>
                  {panel.description ? <p className="truncate text-caption text-fg-subtle">{panel.description}</p> : null}
                </div>
                {panel.actions}
                <Tooltip content="收起面板">
                  <IconButton size="sm" icon={<RiSidebarUnfoldLine className="rtl:-scale-x-100" />} aria-label="收起面板" onPress={() => setPanelInline(false)} />
                </Tooltip>
              </div>
              <div className="flex min-h-0 flex-1 flex-col">{panel.content}</div>
            </aside>
          ) : null}
        </div>
      </div>

      {panel ? (
        <Drawer
          isOpen={panelSheet && !widePanel}
          onOpenChange={setPanelSheet}
          title={panel.title}
          description={panel.description}
          headerActions={panel.actions}
          size="md"
          className="w-[min(480px,calc(100vw-1rem))]"
          bodyClassName="flex flex-col p-0"
        >
          {panel.content}
        </Drawer>
      ) : null}

      <ConversationSearch
        isOpen={searchOpen}
        onOpenChange={setSearchOpen}
        onPick={(c) => {
          setActiveKey(c.id);
          if (c.href) window.location.assign(c.href);
        }}
        onNewChat={newChat}
      />
      <SettingsModal isOpen={settingsOpen} onOpenChange={setSettingsOpen} />
    </ChatShellContext.Provider>
  );
}

/* ------------------------------------------------------------- resizer */

function PanelResizer({ width, min, max, onChange }: { width: number; min: number; max: number; onChange: (w: number) => void }) {
  const drag = useRef<{ x: number; w: number; dir: number } | null>(null);
  const clamp = (w: number) => Math.round(Math.min(max, Math.max(min, w)));

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    drag.current = { x: e.clientX, w: width, dir: rtl ? 1 : -1 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    onChange(clamp(d.w + (e.clientX - d.x) * d.dir));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
      const grow = (e.key === "ArrowLeft") !== rtl;
      onChange(clamp(width + (grow ? 24 : -24)));
    } else if (e.key === "Home") onChange(min);
    else if (e.key === "End") onChange(max);
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="调整面板宽度"
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cx(
        "group/resize absolute inset-y-0 -start-1.5 z-10 w-3 cursor-col-resize touch-none outline-none",
        "focus-visible:focus-ring",
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 start-1/2 w-0.5 -translate-x-1/2 bg-transparent transition-colors duration-150 group-hover/resize:bg-accent-500 group-focus-visible/resize:bg-accent-500 group-active/resize:bg-accent-500"
      />
    </div>
  );
}

/* ------------------------------------------------------- header actions */

function SharePopover() {
  const [isPublic, setPublic] = useState(true);
  const link = "https://orra.chat/s/7f3k2q";
  return (
    <Popover
      placement="bottom end"
      width="md"
      title="分享这段对话"
      trigger={
        <Button variant="outline" tone="neutral" size="sm" startIcon={<RiShareForwardLine />} aria-label="分享" className="max-sm:px-2">
          <span className="max-sm:hidden">分享</span>
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-body-sm text-fg-muted">生成只读链接，对方能看到截至目前的全部消息，但看不到你之后发送的内容。</p>
        <Switch isSelected={isPublic} onChange={setPublic} description="关闭后链接立即失效">
          任何拥有链接的人可查看
        </Switch>
        <div className="flex items-center gap-2">
          <Input aria-label="分享链接" value={isPublic ? link : "链接已停用"} isReadOnly size="sm" startIcon={<RiLinkM />} className="flex-1" />
          <Button
            size="sm"
            isDisabled={!isPublic}
            startIcon={<RiFileCopyLine />}
            onPress={() => {
              void navigator.clipboard?.writeText(link).catch(() => {});
              toast.success("链接已复制");
            }}
          >
            复制
          </Button>
        </div>
      </div>
    </Popover>
  );
}

function MoreMenu() {
  return (
    <Dropdown
      placement="bottom end"
      className="min-w-52"
      onAction={(key) => {
        const msg: Record<string, string> = {
          rename: "已进入重命名（演示）",
          pin: "已置顶到侧栏",
          export: "已导出为 Markdown",
          delete: "演示模板中不会删除对话",
        };
        const k = String(key);
        if (k.startsWith("move:")) toast.success(`已移动到「${PROJECTS.find((p) => `move:${p.id}` === k)?.name}」`);
        else if (msg[k]) toast(msg[k]);
      }}
      trigger={<IconButton icon={<RiMoreLine />} aria-label="更多操作" />}
    >
      <DropdownItem id="rename" icon={<RiEditLine />}>
        重命名
      </DropdownItem>
      <DropdownItem id="pin" icon={<RiPushpinLine />}>
        置顶对话
      </DropdownItem>
      <DropdownSubmenu label="移到项目" icon={<RiFolderTransferLine />}>
        {PROJECTS.map((p) => (
          <DropdownItem key={p.id} id={`move:${p.id}`} icon={<RiFolder3Line />}>
            {p.name}
          </DropdownItem>
        ))}
      </DropdownSubmenu>
      <DropdownItem id="export" icon={<RiDownload2Line />}>
        导出为 Markdown
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem id="delete" icon={<RiDeleteBinLine />} tone="danger">
        删除对话
      </DropdownItem>
    </Dropdown>
  );
}

function ConversationSearch({
  isOpen,
  onOpenChange,
  onPick,
  onNewChat,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (c: ChatConversation) => void;
  onNewChat: () => void;
}) {
  return (
    <CommandPalette
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placeholder="搜索对话、项目…"
      onAction={(key) => {
        const k = String(key);
        if (k === "__new") return onNewChat();
        const c = ALL_CONVERSATIONS.find((x) => x.id === k);
        if (c) onPick(c);
      }}
    >
      <CommandPaletteGroup title="操作">
        <CommandPaletteItem id="__new" icon={<RiEditLine />} shortcut="mod+shift+o">
          新对话
        </CommandPaletteItem>
      </CommandPaletteGroup>
      {DAYS.map((d) => (
        <CommandPaletteGroup key={d.id} title={d.title}>
          {d.items.map((c) => (
            <CommandPaletteItem key={c.id} id={c.id} icon={<RiChat3Line />}>
              {c.title}
            </CommandPaletteItem>
          ))}
        </CommandPaletteGroup>
      ))}
      <CommandPaletteGroup title="项目">
        {PROJECTS.flatMap((p) =>
          p.conversations.map((c) => (
            <CommandPaletteItem key={c.id} id={c.id} icon={<RiFolder3Line />} description={p.name} keywords={[p.name]}>
              {c.title}
            </CommandPaletteItem>
          )),
        )}
      </CommandPaletteGroup>
    </CommandPalette>
  );
}

/* ============================================================== thread */

/**
 * The scrolling message column. Sticks to the bottom while content grows
 * (streaming), unless the reader scrolled up; then a "latest" button appears.
 */
export function ChatThread({ children, className }: { children: ReactNode; className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const [showJump, setShowJump] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    el.scrollTop = el.scrollHeight;
    const ro = new ResizeObserver(() => {
      if (pinned.current) el.scrollTop = el.scrollHeight;
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    pinned.current = near;
    setShowJump(!near);
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto [scrollbar-gutter:stable]">
        <div ref={innerRef} className={cx("mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 pt-6 pb-8 sm:px-6", className)}>
          {children}
        </div>
      </div>
      {showJump ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <Button
            size="sm"
            variant="outline"
            tone="neutral"
            startIcon={<RiArrowDownLine />}
            className="pointer-events-auto rounded-full bg-surface-raised shadow-popover motion-safe:animate-rise"
            onPress={() => {
              const el = scrollRef.current;
              if (!el) return;
              pinned.current = true;
              el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
            }}
          >
            回到最新
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export interface ChatMessageProps {
  role: "user" | "assistant";
  /** Assistant: name next to the avatar. User: optional (group chats). */
  name?: ReactNode;
  /** Avatar element; assistants default to the Orra orb. */
  avatar?: ReactNode;
  /** Badge after the name (role, model…). */
  badge?: ReactNode;
  time?: ReactNode;
  /** User: attachment chips above the bubble. */
  attachments?: ReactNode;
  /** Row under an assistant message (copy, retry…). */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** One turn in the conversation: a soft bubble for the user, an open column with avatar for assistants. */
export function ChatMessage({ role, name, avatar, badge, time, attachments, actions, children, className }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className={cx("flex flex-col items-end gap-1.5 motion-safe:animate-rise", className)}>
        {name || time ? (
          <div className="flex items-center gap-2 pe-1 text-caption text-fg-subtle">
            {name ? <span className="font-medium text-fg-muted">{name}</span> : null}
            {time ? <span className="tabular-nums">{time}</span> : null}
          </div>
        ) : null}
        {attachments ? <div className="flex max-w-[85%] flex-wrap justify-end gap-2">{attachments}</div> : null}
        {children ? (
          <div className="max-w-[85%] rounded-card rounded-se-md bg-surface-muted px-4 py-2.5 text-body leading-relaxed whitespace-pre-wrap text-fg">
            {children}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div className={cx("flex gap-3 motion-safe:animate-rise", className)}>
      <div className="shrink-0 pt-0.5">{avatar ?? <AgentAvatar seed="orra-assistant" name="Orra 助手" size="sm" />}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex min-h-7 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-body-sm font-semibold text-fg">{name ?? "Orra 助手"}</span>
          {badge}
          {time ? <span className="text-caption text-fg-subtle tabular-nums">{time}</span> : null}
        </div>
        {children}
        {actions}
      </div>
    </div>
  );
}

/** A centred line between messages: hand-offs, joins, dividers. */
export function ChatNotice({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 motion-safe:animate-fade-in" role="note">
      <span aria-hidden className="h-px flex-1 bg-line" />
      <span className="inline-flex max-w-[85%] items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-caption text-fg-muted shadow-xs [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-fg-subtle">
        {icon}
        <span className="min-w-0">{children}</span>
      </span>
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Copy / like / dislike / retry under an assistant message. */
export function ChatMessageActions({ copyText, onRetry, extra }: { copyText?: string; onRetry?: () => void; extra?: ReactNode }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);
  return (
    <div className="-ms-1.5 flex flex-wrap items-center gap-0.5 text-fg-subtle">
      <Tooltip content={copied ? "已复制" : "复制"}>
        <IconButton
          size="sm"
          icon={copied ? <RiCheckLine /> : <RiFileCopyLine />}
          aria-label="复制"
          onPress={() => {
            if (copyText) void navigator.clipboard?.writeText(copyText).catch(() => {});
            setCopied(true);
          }}
        />
      </Tooltip>
      <Tooltip content="有帮助">
        <IconButton size="sm" icon={<RiThumbUpLine />} aria-label="有帮助" aria-pressed={vote === "up"} variant={vote === "up" ? "soft" : "plain"} onPress={() => setVote(vote === "up" ? null : "up")} />
      </Tooltip>
      <Tooltip content="没帮助">
        <IconButton
          size="sm"
          icon={<RiThumbDownLine />}
          aria-label="没帮助"
          aria-pressed={vote === "down"}
          variant={vote === "down" ? "soft" : "plain"}
          onPress={() => {
            setVote(vote === "down" ? null : "down");
            if (vote !== "down") toast("感谢反馈，我们会用它改进回答");
          }}
        />
      </Tooltip>
      {onRetry ? (
        <Tooltip content="重新生成">
          <IconButton size="sm" icon={<RiRefreshLine />} aria-label="重新生成" onPress={onRetry} />
        </Tooltip>
      ) : null}
      {extra}
    </div>
  );
}

/* --------------------------------------------------------------- prose */

function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`"))
      out.push(
        <code key={`${keyBase}-${i++}`} className="rounded-[6px] border border-line bg-surface-muted px-1.5 py-px font-mono text-[0.86em] text-fg">
          {tok.slice(1, -1)}
        </code>,
      );
    else
      out.push(
        <strong key={`${keyBase}-${i++}`} className="font-semibold text-fg">
          {tok.slice(2, -2)}
        </strong>,
      );
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Plain text with a little markdown: paragraphs, `- ` / `1. ` lists, `code`
 * and **bold**. Safe to feed a partially streamed string.
 */
export function ChatText({ text, className }: { text: string; className?: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className={cx("flex flex-col gap-3 text-body leading-relaxed text-fg", className)}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.length);
        if (lines.length && lines.every((l) => /^(- |\d+\. )/.test(l))) {
          const ordered = /^\d+\. /.test(lines[0]!);
          const List = ordered ? "ol" : "ul";
          return (
            <List key={bi} className={cx("flex flex-col gap-1.5 ps-5", ordered ? "list-decimal" : "list-disc", "marker:text-fg-subtle")}>
              {lines.map((l, li) => (
                <li key={li} className="ps-1">
                  {renderInline(l.replace(/^(- |\d+\. )/, ""), `${bi}-${li}`)}
                </li>
              ))}
            </List>
          );
        }
        return (
          <p key={bi} className="whitespace-pre-line">
            {renderInline(block, String(bi))}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Types `text` out on the client while `streaming` is true, then calls
 * `onDone`. When not streaming it renders the full text (so SSR is stable).
 */
export function ChatStreamText({ text, streaming, onDone, speed = 18 }: { text: string; streaming: boolean; onDone?: () => void; speed?: number }) {
  const [count, setCount] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    if (!streaming) return;
    setCount(0);
    let n = 0;
    const id = window.setInterval(() => {
      n = Math.min(text.length, n + 2 + Math.floor(Math.random() * 3));
      setCount(n);
      if (n >= text.length) {
        window.clearInterval(id);
        done.current?.();
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [streaming, text, speed]);
  const shown = streaming ? text.slice(0, count) : text;
  return (
    <div className="relative">
      <ChatText text={shown} />
      {streaming ? <span aria-hidden className="ms-0.5 inline-block h-4 w-1.5 translate-y-0.5 rounded-sm bg-accent-500 motion-safe:animate-pulse" /> : null}
    </div>
  );
}

/* ---------------------------------------------------------- code block */

const KEYWORDS = new Set(
  "import export from const let var function return if else for while await async type interface extends new try catch finally throw class default as of in true false null undefined void typeof describe it expect test vi beforeEach afterEach run uses with name on steps jobs".split(
    " ",
  ),
);

function highlightLine(line: string, lang: string): ReactNode[] {
  if (lang === "text") return [line];
  const out: ReactNode[] = [];
  const comment = lang === "yaml" || lang === "bash" ? /#.*$/ : /\/\/.*$/;
  const re = new RegExp(`(${comment.source})|("(?:\\\\.|[^"])*"|'(?:\\\\.|[^'])*'|\`(?:\\\\.|[^\`])*\`)|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b[A-Za-z_$][\\w$]*\\b)`, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const [tok, cmt, str, num, word] = m;
    if (cmt)
      out.push(
        <span key={k++} className="text-fg-subtle italic">
          {tok}
        </span>,
      );
    else if (str)
      out.push(
        <span key={k++} className="text-success">
          {tok}
        </span>,
      );
    else if (num)
      out.push(
        <span key={k++} className="text-warning">
          {tok}
        </span>,
      );
    else if (word && KEYWORDS.has(word))
      out.push(
        <span key={k++} className="text-fg-accent">
          {tok}
        </span>,
      );
    else if (word && /^[A-Z]/.test(word))
      out.push(
        <span key={k++} className="text-info">
          {tok}
        </span>,
      );
    else out.push(tok);
    last = m.index + tok.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export function ChatCode({ line, lang = "ts" }: { line: string; lang?: string }) {
  return <>{highlightLine(line, lang)}</>;
}

/** A code block with filename, language, line numbers and a copy button. */
export function ChatCodeBlock({ code, lang = "ts", filename, className }: { code: string; lang?: string; filename?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <figure className={cx("overflow-hidden rounded-menu border border-line bg-surface-muted", className)}>
      <figcaption className="flex h-10 items-center gap-2 border-b border-line ps-3.5 pe-1.5">
        <RiCodeSSlashLine aria-hidden className="size-4 shrink-0 text-fg-subtle" />
        <span className="min-w-0 flex-1 truncate font-mono text-caption text-fg-muted">{filename ?? lang}</span>
        {filename ? <span className="text-micro font-medium tracking-wide text-fg-subtle uppercase">{lang}</span> : null}
        <Tooltip content={copied ? "已复制" : "复制代码"}>
          <IconButton
            size="sm"
            icon={copied ? <RiCheckLine /> : <RiFileCopyLine />}
            aria-label="复制代码"
            onPress={() => {
              void navigator.clipboard?.writeText(code).catch(() => {});
              setCopied(true);
            }}
          />
        </Tooltip>
      </figcaption>
      <pre className="overflow-x-auto py-3 font-mono text-[12.5px] leading-6 text-fg">
        <code className="grid min-w-max">
          {lines.map((l, i) => (
            <span key={i} className="flex">
              <span aria-hidden className="w-10 shrink-0 pe-3 text-end text-fg-disabled tabular-nums select-none">
                {i + 1}
              </span>
              <span className="pe-4">{l ? highlightLine(l, lang) : " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

/* ------------------------------------------------------------ composer */

/** Bottom dock that holds the composer, centred to the thread width. */
export function ChatComposerDock({ children, hint = "AI 可能会出错，重要信息请自行核实。", above }: { children: ReactNode; hint?: ReactNode; above?: ReactNode }) {
  return (
    <div className="shrink-0 px-3 pb-3 sm:px-6 sm:pb-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
        {above}
        {children}
        {hint ? <p className="text-center text-caption text-fg-subtle max-sm:hidden">{hint}</p> : null}
      </div>
    </div>
  );
}

export interface ChatSuggestion {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

/** Empty state of a new chat: greeting plus a few starter prompts. */
export function ChatWelcome({
  title,
  description,
  avatar,
  suggestions,
  onPick,
}: {
  title: ReactNode;
  description?: ReactNode;
  avatar?: ReactNode;
  suggestions: ChatSuggestion[];
  onPick: (s: ChatSuggestion) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center motion-safe:animate-rise">
      {avatar ?? <AgentAvatar seed="orra-assistant" name="Orra 助手" size="xl" />}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-title-lg font-semibold text-fg">{title}</h2>
        {description ? <p className="text-body text-fg-muted">{description}</p> : null}
      </div>
      <div className="grid w-full gap-2.5 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(s)}
            className="group flex items-start gap-3 rounded-card border border-line bg-surface p-4 text-start shadow-xs transition-[border-color,box-shadow,transform] duration-150 outline-none hover:border-line-strong hover:shadow-card focus-visible:focus-ring active:scale-[0.99]"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-control bg-accent-50 text-fg-accent [&>svg]:size-4">{s.icon}</span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-body font-medium text-fg">{s.title}</span>
              <span className="text-body-sm text-fg-subtle">{s.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
