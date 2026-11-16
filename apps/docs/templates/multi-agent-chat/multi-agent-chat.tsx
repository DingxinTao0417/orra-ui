"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  RiArrowRightLine,
  RiAtLine,
  RiDeleteBinLine,
  RiEditLine,
  RiFolder3Line,
  RiMailSendLine,
  RiMoreLine,
  RiPauseCircleLine,
  RiPlayCircleLine,
  RiReplay5Line,
  RiUserAddLine,
} from "@remixicon/react";
import {
  AgentAvatar,
  AgentLog,
  AgentThinking,
  Badge,
  Button,
  ComposerPanel,
  Dropdown,
  DropdownItem,
  DropdownSection,
  DropdownSeparator,
  IconButton,
  ModelProviderMark,
  Progress,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TaskList,
  WebCitation,
  WebSearch,
  toast,
  type AgentAvatarState,
  type TaskListItem,
  type WebSearchStatus,
} from "@orra-ui/react";
import { cx } from "@orra-ui/react/lib/cx";
import {
  ChatComposerDock,
  ChatMessage,
  ChatMessageActions,
  ChatNotice,
  ChatShell,
  ChatStreamText,
  ChatText,
  ChatThread,
  clockLabel,
  useChatShell,
  useScriptPlayer,
  type ScriptStep,
} from "../shared/chat-shell";
import { AddAgentDialog } from "./add-agent-dialog";
import {
  AGENT_MODELS,
  ANALYSIS_LOG,
  DEFAULT_PROMPT,
  FINAL_REPLY,
  INITIAL_AGENTS,
  INVITE_TEXT,
  LAUNCH_COPY,
  MEDIA_QUERIES,
  MEDIA_SOURCES,
  PRICE_SCENARIOS,
  PRICING_QUERIES,
  PRICING_SOURCES,
  RUN_TASKS,
  modelName,
  toolLabel,
  type TeamAgent,
} from "./agents-data";

/* ----------------------------------------------------------------- state */

interface Run {
  id: string;
  kind: "main" | "short";
  prompt: string;
  time: string;
  stage: number;
  stopped: boolean;
  navStart: number;
  navDuration?: number;
  tasks: Record<string, TaskListItem["status"]>;
  scout: { status: WebSearchStatus; q: number; s: number; reading: number };
  quill: "thinking" | "streaming" | "done";
  irisProgress: number;
}

type TimelineItem = { type: "run"; id: string } | { type: "join"; id: string; agentId: string; time: string };

const STATE_LABEL: Record<AgentAvatarState, string> = { idle: "空闲", thinking: "思考中", speaking: "回复中", working: "执行中", error: "需要处理" };

const HISTORY_TASKS: { agent: string; label: string }[] = [
  { agent: "scout", label: "调研同价位竞品的首发定价" },
  { agent: "abacus", label: "测算 S1 销量与价格弹性" },
  { agent: "quill", label: "撰写发布会主文案" },
];

/* -------------------------------------------------------------- template */

export function MultiAgentChatTemplate() {
  const [agents, setAgents] = useState<TeamAgent[]>(INITIAL_AGENTS);
  const [runs, setRuns] = useState<Run[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [text, setText] = useState(DEFAULT_PROMPT);
  const [addOpen, setAddOpen] = useState(false);
  const [cleared, setCleared] = useState(false);
  const player = useScriptPlayer();

  const byId = (id: string) => agents.find((a) => a.id === id) ?? INITIAL_AGENTS.find((a) => a.id === id)!;

  const setAgent = (id: string, state: AgentAvatarState, activity?: string) =>
    setAgents((list) => list.map((a) => (a.id === id ? { ...a, state, activity: activity ?? a.activity } : a)));

  const patch = (id: string, fn: (r: Run) => Run) => setRuns((list) => list.map((r) => (r.id === id ? fn(r) : r)));

  const live = runs.find((r) => !r.stopped && (r.kind === "main" ? r.stage < 6 : r.stage < 2));
  const irisDrawing = !!live && live.kind === "main" && live.stage === 5 && live.irisProgress < 100;

  // Illustration progress for the designer, on the client only.
  useEffect(() => {
    if (!irisDrawing || !live) return;
    const id = window.setInterval(() => patch(live.id, (r) => (r.irisProgress >= 96 ? r : { ...r, irisProgress: Math.min(96, r.irisProgress + 4 + Math.random() * 6) })), 200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [irisDrawing, live?.id]);

  const send = (prompt: string, fresh = false) => {
    const id = `run-${Date.now()}`;
    const main = fresh || !runs.some((r) => r.kind === "main");
    const run: Run = {
      id,
      kind: main ? "main" : "short",
      prompt,
      time: clockLabel(),
      stage: 0,
      stopped: false,
      navStart: Date.now(),
      tasks: Object.fromEntries(RUN_TASKS.map((t) => [t.id, "pending" as const])),
      scout: { status: "searching", q: 0, s: 0, reading: -1 },
      quill: "thinking",
      irisProgress: 0,
    };
    setRuns((list) => (fresh ? [run] : [...list, run]));
    setTimeline((list) => (fresh ? [{ type: "run", id }] : [...list, { type: "run", id }]));
    setText("");
    setAgent("nav", "thinking", "正在拆解你的请求…");

    const stage = (n: number, extra: (r: Run) => Partial<Run> = () => ({})) => patch(id, (r) => ({ ...r, stage: n, ...extra(r) }));
    const navDone = (r: Run) => ({ navDuration: Math.max(1, Math.round((Date.now() - r.navStart) / 1000)) });

    if (!main) {
      player.play([
        { delay: 1600, run: () => (stage(1, navDone), setAgent("nav", "speaking", "正在回复")) },
        { delay: 900, run: () => (stage(2), setAgent("nav", "idle", "等待新的指令")) },
      ]);
      return;
    }

    const scout = (s: Partial<Run["scout"]>) => patch(id, (r) => ({ ...r, scout: { ...r.scout, ...s } }));
    const task = (tid: string, status: TaskListItem["status"]) => patch(id, (r) => ({ ...r, tasks: { ...r.tasks, [tid]: status } }));

    const steps: ScriptStep[] = [
      { delay: 1900, run: () => (stage(1, navDone), setAgent("nav", "speaking", "正在分派任务")) },
      {
        delay: 1100,
        run: () => {
          stage(2);
          task("r1", "working");
          setAgent("nav", "idle", "等待成员交付");
          setAgent("scout", "working", "正在核对媒体名单…");
        },
      },
      { delay: 900, run: () => scout({ q: 1 }) },
      { delay: 1000, run: () => scout({ q: 2 }) },
      { delay: 1000, run: () => scout({ status: "reading", s: 2, reading: 1 }) },
      { delay: 1000, run: () => scout({ s: 3, reading: 2 }) },
      { delay: 900, run: () => scout({ status: "summarizing", reading: -1 }) },
      {
        delay: 1000,
        run: () => {
          scout({ status: "done" });
          stage(3);
          task("r1", "done");
          setAgent("scout", "idle", "已核对 40 位媒体联系人");
        },
      },
      {
        delay: 1100,
        run: () => {
          stage(4);
          task("r2", "working");
          setAgent("quill", "thinking", "正在构思邀请函…");
        },
      },
      { delay: 1300, run: () => (patch(id, (r) => ({ ...r, quill: "streaming" })), setAgent("quill", "speaking", "正在撰写邀请函正文…")) },
      {
        delay: 3200,
        run: () => {
          patch(id, (r) => ({ ...r, quill: "done", stage: 5 }));
          task("r2", "done");
          task("r3", "working");
          setAgent("quill", "idle", "已交付邀请函正文");
          setAgent("iris", "working", "正在绘制邀请函头图…");
        },
      },
      {
        delay: 3600,
        run: () => {
          patch(id, (r) => ({ ...r, irisProgress: 100 }));
          task("r3", "done");
          setAgent("iris", "idle", "已交付邀请函头图");
          setAgent("nav", "speaking", "正在汇总");
        },
      },
      { delay: 1000, run: () => (stage(6), setAgent("nav", "idle", "等待你的确认")) },
    ];
    player.play(steps);
  };

  const stop = () => {
    player.stop();
    setRuns((list) => list.map((r) => (r.id === live?.id ? { ...r, stopped: true, quill: r.quill === "streaming" ? "done" : r.quill } : r)));
    setAgents((list) => list.map((a) => (a.state === "idle" ? a : { ...a, state: "idle", activity: "已暂停" })));
  };

  const replay = () => {
    player.stop();
    setAgents(INITIAL_AGENTS);
    setCleared(false);
    send(DEFAULT_PROMPT, true);
  };

  const loadingLabel = (() => {
    const busy = agents.find((a) => a.state !== "idle");
    return busy ? `${busy.name} · ${busy.activity}` : "团队协作中…";
  })();

  const activeCount = agents.filter((a) => a.state !== "idle").length;

  return (
    <ChatShell
      active="launch-team"
      title={cleared ? "新的协作" : "Q4 新品发布协作"}
      titleMeta={
        <Badge variant="outline" size="sm" icon={<RiFolder3Line />}>
          新品发布筹备
        </Badge>
      }
      model={<TeamStack agents={agents} />}
      onNewChat={() => {
        player.stop();
        setRuns([]);
        setTimeline([]);
        setCleared(true);
        setText("");
        setAgents(INITIAL_AGENTS.map((a) => ({ ...a, activity: "待命" })));
      }}
      panel={{
        title: "团队成员",
        description: activeCount ? `${agents.length} 位成员 · ${activeCount} 位工作中` : `${agents.length} 位成员 · 全部空闲`,
        toggleLabel: "团队成员",
        width: 380,
        minWidth: 320,
        content: (
          <RosterPanel
            agents={agents}
            runs={runs}
            onAdd={() => setAddOpen(true)}
            onPause={(id) =>
              setAgents((list) => list.map((a) => (a.id === id ? { ...a, paused: !a.paused, activity: a.paused ? "待命" : "已暂停，不会接收交接" } : a)))
            }
            onRemove={(id) => {
              const a = agents.find((x) => x.id === id);
              setAgents((list) => list.filter((x) => x.id !== id));
              toast(`已将${a?.name}移出团队`, { action: { label: "撤销", onPress: () => a && setAgents((list) => [...list, a]) } });
            }}
          />
        ),
      }}
    >
      <ChatThread>
        {!cleared ? <History byId={byId} /> : <ChatNotice>新的协作已开始，团队成员都已就位</ChatNotice>}
        {timeline.map((item) =>
          item.type === "join" ? (
            <ChatNotice key={item.id} icon={<RiUserAddLine />}>
              你邀请了 <b className="font-medium text-fg">{byId(item.agentId).name}</b>（{byId(item.agentId).role}）加入团队 · {item.time}
            </ChatNotice>
          ) : (
            <RunView key={item.id} run={runs.find((r) => r.id === item.id)} byId={byId} onReplay={replay} onStreamDone={(id) => patch(id, (r) => ({ ...r, quill: "done" }))} />
          ),
        )}
      </ChatThread>

      <ChatComposerDock hint="@ 可以直接把任务交给某位成员；不指定时由领航员分派。">
        <ComposerPanel
          value={text}
          onChange={setText}
          onSubmit={({ text: t }) => send(t)}
          modes={[
            { id: "auto", label: "自主协作", description: "成员之间自动交接任务" },
            { id: "confirm", label: "交接前确认", description: "每次交接都先等你同意" },
          ]}
          defaultMode="auto"
          modelPicker={<AssignMenu agents={agents} onPick={(a) => setText((t) => `@${a.name} ${t.replace(/^@\S+\s*/, "")}`)} />}
          loading={!!live}
          loadingLabel={loadingLabel}
          onStop={stop}
          placeholder="给团队布置任务，@ 指定成员…"
        />
      </ChatComposerDock>

      <AddAgentDialog
        isOpen={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(agent) => {
          setAgents((list) => [...list, agent]);
          setTimeline((list) => [...list, { type: "join", id: `join-${agent.id}`, agentId: agent.id, time: clockLabel() }]);
          toast.success(`${agent.name} 已加入团队`, { description: `${agent.role} · ${modelName(agent.model)}` });
        }}
      />
    </ChatShell>
  );
}

/* ------------------------------------------------------------- helpers */

function AgentMessage({
  agent,
  time,
  state = "idle",
  actions,
  children,
}: {
  agent: TeamAgent;
  time: string;
  state?: AgentAvatarState;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <ChatMessage
      role="assistant"
      name={agent.name}
      avatar={<AgentAvatar seed={agent.seed} name={agent.name} state={state} size="sm" />}
      badge={
        <Badge size="sm" tone={agent.lead ? "accent" : "neutral"}>
          {agent.role}
        </Badge>
      }
      time={time}
      actions={actions}
    >
      {children}
    </ChatMessage>
  );
}

function Handoff({ from, to, task }: { from: TeamAgent; to: TeamAgent; task: string }) {
  return (
    <ChatNotice>
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <AgentAvatar seed={from.seed} name={from.name} size="xs" halo={false} />
        <span className="text-fg">{from.name}</span>
        <RiArrowRightLine aria-label="交给" className="size-3.5 text-fg-subtle rtl:-scale-x-100" />
        <AgentAvatar seed={to.seed} name={to.name} size="xs" halo={false} />
        <span className="text-fg">{to.name}</span>
        <span className="text-fg-subtle">· {task}</span>
      </span>
    </ChatNotice>
  );
}

function Assignee({ agent }: { agent: TeamAgent }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted py-0.5 ps-0.5 pe-2 text-caption text-fg-muted">
      <AgentAvatar seed={agent.seed} name={agent.name} size="xs" halo={false} />
      {agent.name}
    </span>
  );
}

function taskLabel(label: string, agent: TeamAgent) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      {label}
      <Assignee agent={agent} />
    </span>
  );
}

function TeamStack({ agents }: { agents: TeamAgent[] }) {
  const { openPanel } = useChatShell();
  return (
    <button
      type="button"
      onClick={openPanel}
      aria-label={`查看 ${agents.length} 位团队成员`}
      className="flex h-8 items-center gap-2 rounded-full border border-line ps-1 pe-2.5 outline-none transition-colors duration-150 hover:bg-surface-hover focus-visible:focus-ring"
    >
      <span className="flex -space-x-1.5 rtl:space-x-reverse">
        {agents.slice(0, 4).map((a) => (
          <span key={a.id} className="rounded-full ring-2 ring-surface">
            <AgentAvatar seed={a.seed} name={a.name} state={a.state} size="xs" halo={false} />
          </span>
        ))}
      </span>
      <span className="text-caption font-medium text-fg-muted tabular-nums">{agents.length} 位成员</span>
    </button>
  );
}

function AssignMenu({ agents, onPick }: { agents: TeamAgent[]; onPick: (a: TeamAgent) => void }) {
  return (
    <Dropdown
      placement="top start"
      className="min-w-56"
      onAction={(k) => {
        const a = agents.find((x) => x.id === k);
        if (a) onPick(a);
      }}
      trigger={
        <Button variant="plain" tone="neutral" size="sm" startIcon={<RiAtLine />} className="px-2">
          指派
        </Button>
      }
    >
      <DropdownSection title="交给">
        {agents.map((a) => (
          <DropdownItem key={a.id} id={a.id} icon={<AgentAvatar seed={a.seed} name={a.name} size="xs" halo={false} />} description={a.role} isDisabled={a.paused}>
            {a.name}
          </DropdownItem>
        ))}
      </DropdownSection>
    </Dropdown>
  );
}

/* ------------------------------------------------------------- history */

function History({ byId }: { byId: (id: string) => TeamAgent }) {
  const nav = byId("nav");
  const scout = byId("scout");
  const abacus = byId("abacus");
  const quill = byId("quill");
  return (
    <>
      <ChatMessage role="user" name="你" time="09:30">
        @领航员 下周三云雀 S2 发布，帮我们把定价建议和发布会主文案准备好。预算按上一代的 80% 来。
      </ChatMessage>

      <AgentMessage agent={nav} time="09:30">
        <AgentThinking active={false} duration={6}>
          {"需要三类信息：市场上的价格带、我们自己的价格弹性、以及对外的主文案。\n前两项有依赖关系：先有竞品价格，再做弹性测算，最后文案引用定价结论。"}
        </AgentThinking>
        <ChatText text="收到。我把任务拆成三块，按依赖顺序交给团队：" />
        <TaskList
          title="分工"
          reveal={false}
          items={HISTORY_TASKS.map((t, i) => ({ id: `h${i}`, label: taskLabel(t.label, byId(t.agent)), status: "done" }))}
        />
      </AgentMessage>

      <Handoff from={nav} to={scout} task="竞品定价调研" />
      <AgentMessage agent={scout} time="09:31">
        <WebSearch status="done" queries={PRICING_QUERIES} sources={PRICING_SOURCES} />
        <p className="text-body leading-relaxed text-fg">
          同价位的主流降噪耳机首发价集中在 <b className="font-semibold">899–1,099 元</b>
          <WebCitation index={1} source={PRICING_SOURCES[0]!} />
          <WebCitation index={2} source={PRICING_SOURCES[1]!} />
          ，其中两款在首发期提供 100 元左右的立减
          <WebCitation index={3} source={PRICING_SOURCES[2]!} />
          。上一代 S1 首发价 999 元，S2 新增了自适应降噪，有上探空间。
        </p>
      </AgentMessage>

      <Handoff from={scout} to={abacus} task="价格弹性测算" />
      <AgentMessage agent={abacus} time="09:33">
        <AgentLog items={ANALYSIS_LOG} dense />
        <div className="overflow-hidden rounded-menu border border-line">
          <table className="w-full text-start text-body-sm">
            <caption className="sr-only">三个首发价位的首月预测</caption>
            <thead className="bg-surface-muted text-caption text-fg-subtle">
              <tr>
                <th className="px-3 py-2 text-start font-medium">首发价</th>
                <th className="px-3 py-2 text-end font-medium">预计首月销量</th>
                <th className="px-3 py-2 text-end font-medium max-sm:hidden">预计营收</th>
                <th className="px-3 py-2 text-end font-medium">备注</th>
              </tr>
            </thead>
            <tbody>
              {PRICE_SCENARIOS.map((s) => (
                <tr key={s.price} className={cx("border-t border-line", s.recommended && "bg-accent-50")}>
                  <td className="px-3 py-2 font-medium text-fg tabular-nums">{s.price}</td>
                  <td className="px-3 py-2 text-end text-fg-muted tabular-nums">{s.units.toLocaleString("zh-CN")} 台</td>
                  <td className="px-3 py-2 text-end text-fg-muted tabular-nums max-sm:hidden">{s.revenue}</td>
                  <td className="px-3 py-2 text-end">
                    {s.recommended ? (
                      <Badge tone="accent" size="sm">
                        {s.note}
                      </Badge>
                    ) : (
                      <span className="text-caption text-fg-subtle">{s.note}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ChatText text="**建议首发价 1,049 元，首发期立减 100 元**：到手价与 S1 持平，营收只比 999 元方案少 3.4%，但给后续促销留出了空间。" />
      </AgentMessage>

      <Handoff from={abacus} to={quill} task="发布会主文案" />
      <AgentMessage agent={quill} time="09:36" actions={<ChatMessageActions copyText={`${LAUNCH_COPY.title}\n\n${LAUNCH_COPY.body}`} />}>
        <div className="flex flex-col gap-2 rounded-menu border border-line bg-surface-muted/60 p-4">
          <span className="text-caption font-medium text-fg-subtle">主文案 · 初稿</span>
          <p className="text-title-sm font-semibold text-fg">{LAUNCH_COPY.title}</p>
          <p className="text-body leading-relaxed text-fg-muted">{LAUNCH_COPY.body}</p>
        </div>
      </AgentMessage>

      <AgentMessage agent={nav} time="09:37">
        <ChatText text="三项任务都完成了：定价建议 **1,049 元 + 首发立减 100 元**，测算表和主文案已经放进项目文件夹。需要的话，我可以再安排青棠出一版主视觉。" />
      </AgentMessage>
    </>
  );
}

/* ------------------------------------------------------------- the run */

function RunView({ run, byId, onReplay, onStreamDone }: { run?: Run; byId: (id: string) => TeamAgent; onReplay: () => void; onStreamDone: (id: string) => void }) {
  if (!run) return null;
  const nav = byId("nav");
  const scout = byId("scout");
  const quill = byId("quill");
  const iris = byId("iris");
  const { stage, stopped } = run;

  if (run.kind === "short") {
    return (
      <>
        <ChatMessage role="user" name="你" time={run.time}>
          {run.prompt}
        </ChatMessage>
        <AgentMessage agent={nav} time={run.time} state={nav.state}>
          <AgentThinking active={stage === 0 && !stopped} startedAt={run.navStart} duration={stage === 0 ? undefined : (run.navDuration ?? 1)} variant="dots" />
          {stage >= 1 ? (
            <ChatText text="收到，我会把它加进待办，等邀请函发出后再分派。这个模板只编排了邀请函的协作流程，点击上一条回复下方的「重新演示」可以再看一遍完整的交接过程。" />
          ) : null}
        </AgentMessage>
      </>
    );
  }

  const scoutQueries = MEDIA_QUERIES.slice(0, run.scout.q).map((q, i) => ({ ...q, status: (run.scout.status === "searching" && i === run.scout.q - 1 ? "running" : "done") as "running" | "done" }));
  const scoutSources = MEDIA_SOURCES.slice(0, run.scout.s).map((s, i) => ({ ...s, status: (i === run.scout.reading ? "reading" : "read") as "reading" | "read" }));

  return (
    <>
      <ChatMessage role="user" name="你" time={run.time}>
        {run.prompt}
      </ChatMessage>

      <AgentMessage agent={nav} time={run.time} state={stage <= 1 ? nav.state : "idle"}>
        <AgentThinking active={stage === 0 && !stopped} startedAt={run.navStart} duration={stage === 0 ? undefined : (run.navDuration ?? 1)}>
          {"邀请函需要三样东西：准确的收件人、正文和一张头图。\n名单最容易出错，先核对；正文和头图可以并行，但头图要用正文里的时间地点。"}
        </AgentThinking>
        {stage >= 1 ? (
          <>
            <ChatText text="好的，邀请函分三步完成，我先让小探核对名单：" />
            <TaskList
              title="分工"
              items={RUN_TASKS.map((t) => ({ id: t.id, label: taskLabel(t.label, byId(t.agent)), status: stopped && run.tasks[t.id] === "working" ? "failed" : run.tasks[t.id] }))}
              labels={stopped ? { failed: "已暂停" } : undefined}
            />
          </>
        ) : null}
      </AgentMessage>

      {stage >= 2 ? (
        <>
          <Handoff from={nav} to={scout} task="核对媒体名单" />
          <AgentMessage agent={scout} time={run.time} state={stage === 2 ? scout.state : "idle"}>
            <WebSearch status={run.scout.status} queries={scoutQueries} sources={scoutSources} label={run.scout.status === "done" ? "已核对 2 个来源" : undefined} />
            {stage >= 3 ? (
              <p className="text-body leading-relaxed text-fg">
                名单核对完了：原表 46 条，去掉 6 条重复后剩 <b className="font-semibold">40 位有效联系人</b>。其中 2 位编辑本月换了岗位
                <WebCitation index={1} source={MEDIA_SOURCES[0]!} />
                ，已更新为新的对接人；另有 1 个邮箱格式有误，已在表里标黄。
              </p>
            ) : null}
          </AgentMessage>
        </>
      ) : null}

      {stage >= 4 ? (
        <>
          <Handoff from={scout} to={quill} task="撰写邀请函正文" />
          <AgentMessage agent={quill} time={run.time} state={stage === 4 ? quill.state : "idle"}>
            {run.quill === "thinking" ? (
              <AgentThinking active={!stopped} variant="dots" label="正在构思" showTimer={false} />
            ) : (
              <div className="flex flex-col gap-2 rounded-menu border border-line bg-surface-muted/60 p-4">
                <span className="text-caption font-medium text-fg-subtle">邀请函 · 正文</span>
                <ChatStreamText text={INVITE_TEXT} streaming={run.quill === "streaming"} onDone={() => onStreamDone(run.id)} speed={22} />
              </div>
            )}
          </AgentMessage>
        </>
      ) : null}

      {stage >= 5 ? (
        <>
          <Handoff from={quill} to={iris} task="设计邀请函头图" />
          <AgentMessage agent={iris} time={run.time} state={run.irisProgress < 100 ? iris.state : "idle"}>
            {run.irisProgress < 100 ? (
              <Progress label={stopped ? "已暂停" : "正在绘制头图…"} value={run.irisProgress} size="sm" className="max-w-sm" tone={stopped ? "neutral" : "accent"} />
            ) : (
              <ChatText text="头图完成：沿用了主视觉的蓝紫渐变，右下角留出了时间地点的位置。" />
            )}
            <div className="relative aspect-[16/9] max-w-md overflow-hidden rounded-menu border border-line bg-surface-muted">
              {run.irisProgress < 100 ? <div aria-hidden className="absolute inset-0 bg-skeleton" /> : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ai-chat/generated-image.svg"
                alt={run.irisProgress < 100 ? "" : "邀请函头图：柔和的渐变与流线"}
                className="absolute inset-0 size-full object-cover transition-[filter,opacity] duration-300"
                style={run.irisProgress < 100 ? { filter: `blur(${Math.round(24 * (1 - run.irisProgress / 100))}px)`, opacity: 0.2 + (0.8 * run.irisProgress) / 100 } : undefined}
              />
              {run.irisProgress >= 100 ? (
                <span className="absolute end-3 bottom-3 rounded-control bg-surface/85 px-3 py-2 text-end backdrop-blur">
                  <span className="block text-body-sm font-semibold text-fg">云雀 S2 新品发布会</span>
                  <span className="block text-caption text-fg-muted">11 月 26 日 · 上海西岸</span>
                </span>
              ) : null}
            </div>
          </AgentMessage>
        </>
      ) : null}

      {stage >= 6 ? (
        <AgentMessage
          agent={nav}
          time={run.time}
          actions={
            <ChatMessageActions
              copyText={FINAL_REPLY}
              onRetry={onReplay}
              extra={
                <Button size="sm" variant="plain" tone="neutral" startIcon={<RiReplay5Line />} onPress={onReplay} className="ms-1">
                  重新演示
                </Button>
              }
            />
          }
        >
          <ChatText text={FINAL_REPLY} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" tone="neutral" onPress={() => toast.success("预览邮件已发送到 zhiyuan@orra.studio")}>
              先发我预览
            </Button>
            <Button size="sm" startIcon={<RiMailSendLine />} onPress={() => toast("这是演示模板，不会真的发送邮件", { description: "真实环境中会向 40 位媒体发送邀请函。" })}>
              发送给 40 位媒体
            </Button>
          </div>
        </AgentMessage>
      ) : null}

      {stopped ? (
        <ChatNotice>
          你暂停了团队协作 ·{" "}
          <button type="button" onClick={onReplay} className="font-medium text-fg-accent hover:underline">
            重新开始
          </button>
        </ChatNotice>
      ) : null}
    </>
  );
}

/* --------------------------------------------------------------- roster */

function RosterPanel({
  agents,
  runs,
  onAdd,
  onPause,
  onRemove,
}: {
  agents: TeamAgent[];
  runs: Run[];
  onAdd: () => void;
  onPause: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const main = runs.find((r) => r.kind === "main");
  const liveTasks: TaskListItem[] = main
    ? RUN_TASKS.map((t) => {
        const a = agents.find((x) => x.id === t.agent);
        return { id: t.id, label: a ? taskLabel(t.label, a) : t.label, status: main.stopped && main.tasks[t.id] === "working" ? "failed" : main.tasks[t.id] };
      })
    : [];
  const doneTasks: TaskListItem[] = HISTORY_TASKS.map((t, i) => {
    const a = agents.find((x) => x.id === t.agent);
    return { id: `h${i}`, label: a ? taskLabel(t.label, a) : t.label, status: "done" };
  });

  return (
    <Tabs className="flex min-h-0 flex-1 flex-col" size="sm">
      <div className="shrink-0 border-b border-line px-4">
        <TabList aria-label="团队面板">
          <Tab id="members" count={agents.length}>
            成员
          </Tab>
          <Tab id="tasks" count={liveTasks.length + doneTasks.length}>
            任务
          </Tab>
        </TabList>
      </div>
      <TabPanel id="members" className="flex min-h-0 flex-1 flex-col outline-none">
        <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
          {agents.map((a) => (
            <li key={a.id} className="motion-safe:animate-rise">
              <MemberCard agent={a} onPause={() => onPause(a.id)} onRemove={() => onRemove(a.id)} />
            </li>
          ))}
        </ul>
        <div className="shrink-0 border-t border-line p-3">
          <Button fullWidth variant="outline" tone="neutral" startIcon={<RiUserAddLine />} onPress={onAdd}>
            添加智能体
          </Button>
        </div>
      </TabPanel>
      <TabPanel id="tasks" className="min-h-0 flex-1 overflow-y-auto p-4 outline-none">
        <div className="flex flex-col gap-4">
          {liveTasks.length ? <TaskList title="邀请函" items={liveTasks} reveal={false} /> : null}
          <TaskList title="定价与主文案" items={doneTasks} reveal={false} collapseOnComplete />
        </div>
      </TabPanel>
    </Tabs>
  );
}

function MemberCard({ agent, onPause, onRemove }: { agent: TeamAgent; onPause: () => void; onRemove: () => void }) {
  const busy = agent.state !== "idle";
  const provider = AGENT_MODELS.find((m) => m.id === agent.model)?.provider ?? "";
  return (
    <div className={cx("flex gap-3 rounded-menu border p-3 transition-colors duration-200", busy ? "border-accent-200 bg-accent-50/40" : "border-line bg-surface")}>
      <AgentAvatar seed={agent.seed} name={agent.name} state={agent.state} size="md" className={cx(agent.paused && "opacity-50")} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-body font-medium text-fg">{agent.name}</span>
          {agent.lead ? (
            <Badge tone="accent" size="sm">
              负责人
            </Badge>
          ) : null}
          <span className="truncate text-caption text-fg-subtle">{agent.role}</span>
          <Dropdown
            placement="bottom end"
            className="min-w-44"
            onAction={(k) => {
              if (k === "pause") onPause();
              else if (k === "remove") onRemove();
              else toast(`编辑${agent.name}的设定（演示）`);
            }}
            trigger={<IconButton size="sm" icon={<RiMoreLine />} aria-label={`${agent.name}的更多操作`} className="ms-auto -me-1 shrink-0" />}
          >
            <DropdownItem id="edit" icon={<RiEditLine />}>
              编辑设定
            </DropdownItem>
            <DropdownItem id="pause" icon={agent.paused ? <RiPlayCircleLine /> : <RiPauseCircleLine />}>
              {agent.paused ? "恢复接收任务" : "暂停接收任务"}
            </DropdownItem>
            {!agent.lead ? (
              <>
                <DropdownSeparator />
                <DropdownItem id="remove" icon={<RiDeleteBinLine />} tone="danger">
                  移出团队
                </DropdownItem>
              </>
            ) : null}
          </Dropdown>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <Badge size="sm" tone={agent.paused ? "warning" : busy ? "accent" : "neutral"} dot>
            {agent.paused ? "已暂停" : STATE_LABEL[agent.state]}
          </Badge>
          <span className={cx("min-w-0 truncate text-body-sm", busy ? "text-shimmer" : "text-fg-subtle")}>{agent.activity}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-caption text-fg-muted">
          <span className="inline-flex items-center gap-1">
            <ModelProviderMark name={provider} size="xs" />
            {modelName(agent.model)}
          </span>
          {agent.tools.map((t) => (
            <span key={t} className="rounded-full border border-line px-1.5 py-px text-micro text-fg-subtle">
              {toolLabel(t)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
