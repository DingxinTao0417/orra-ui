"use client";

import { useEffect, useState } from "react";
import {
  RiArrowRightSLine,
  RiAtLine,
  RiBugLine,
  RiFileAddLine,
  RiFileEditLine,
  RiFolder3Line,
  RiGlobalLine,
  RiReplay5Line,
  RiRoadMapLine,
  RiSearchEyeLine,
  RiTerminalBoxLine,
  RiTestTubeLine,
} from "@remixicon/react";
import {
  AgentLog,
  AgentProgress,
  AgentThinking,
  Badge,
  Button,
  ComposerAttachments,
  ComposerPanel,
  ModelPicker,
  TaskList,
  toast,
  type AgentLogItem,
  type AgentProgressStep,
  type ComposerAttachmentItem,
  type TaskListItem,
} from "@orra-ui/react";
import {
  ChatCodeBlock,
  ChatComposerDock,
  ChatMessage,
  ChatMessageActions,
  ChatNotice,
  ChatShell,
  ChatStreamText,
  ChatText,
  ChatThread,
  ChatWelcome,
  clockLabel,
  useChatShell,
  useScriptPlayer,
  type ScriptStep,
} from "../shared/chat-shell";
import {
  CI_FILE,
  CODE_MODELS,
  DEFAULT_PROMPT,
  FOLLOW_UP_ANSWER,
  GUARD_SNIPPET,
  HISTORY_ANSWER,
  HISTORY_OUTRO,
  HISTORY_REASONING,
  INITIAL_FILES,
  RUN_ANSWER,
  RUN_REASONING,
  RUN_STEPS,
  TEST_OUTPUT,
  TEST_TASKS,
  WELCOME_SUGGESTIONS,
  testFile,
  type DiffFile,
} from "./ai-chat-data";
import { DiffCounts, DiffPanel, diffStats } from "./diff-panel";

/* ----------------------------------------------------------------- state */

type Phase = "thinking" | "working" | "answer" | "done" | "stopped";

interface Run {
  id: string;
  /** `main`: the scripted coding task. `short`: a quick canned reply. */
  kind: "main" | "short";
  prompt: string;
  attachments: ComposerAttachmentItem[];
  time: string;
  phase: Phase;
  thinkStart: number;
  thinkDuration?: number;
  reasoning: string[];
  steps: AgentProgressStep[];
  tasks: TaskListItem[];
  showOutput: boolean;
  answer: string;
  changed: string[];
}

const HISTORY_LOG: AgentLogItem[] = [
  { id: "l1", kind: "search", title: "搜索 createOrder 的调用", meta: "3 处" },
  { id: "l2", kind: "read", title: "读取 checkout-form.tsx", meta: "182 行" },
  { id: "l3", kind: "read", title: "读取 api.ts", meta: "64 行" },
  {
    id: "l4",
    kind: "command",
    title: "复现：模拟同一帧两次 submit",
    meta: "复现成功",
    detail: "createOrder 被调用 2 次，间隔 4ms；第二次调用时 isPending 仍为 false。",
  },
  { id: "l5", kind: "edit", title: "新建 use-submit-guard.ts", meta: "+34" },
  { id: "l6", kind: "edit", title: "修改 checkout-form.tsx", meta: "+9 −6" },
  { id: "l7", kind: "edit", title: "修改 api.ts", meta: "+10 −2" },
  { id: "l8", kind: "command", title: "pnpm test checkout", meta: "13 通过" },
];

const ATTACHMENTS_HISTORY: ComposerAttachmentItem[] = [
  { id: "a1", name: "sentry-事件-4821.png", size: 214_000, type: "image/png" },
  { id: "a2", name: "orders-1114.log", size: 38_400, type: "text/plain" },
];

const DEFAULT_ATTACHMENTS: ComposerAttachmentItem[] = [{ id: "cfg", name: "vitest.config.ts", size: 1_240, type: "text/typescript" }];

function setStep(steps: AgentProgressStep[], index: number, status: AgentProgressStep["status"], meta?: string): AgentProgressStep[] {
  return steps.map((s, i) => (i === index ? { ...s, status, ...(meta ? { meta } : {}) } : s));
}

function setTask(tasks: TaskListItem[], index: number, status: TaskListItem["status"]): TaskListItem[] {
  return tasks.map((t, i) => (i === index ? { ...t, status } : t));
}

/* ------------------------------------------------------------- template */

export function AiChatTemplate() {
  const [view, setView] = useState<"history" | "welcome">("history");
  const [runs, setRuns] = useState<Run[]>([]);
  const [files, setFiles] = useState<DiffFile[]>(INITIAL_FILES);
  const [selectedFile, setSelectedFile] = useState<string | null>("form");
  const [writing, setWriting] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [text, setText] = useState(DEFAULT_PROMPT);
  const [attachments, setAttachments] = useState<ComposerAttachmentItem[]>(DEFAULT_ATTACHMENTS);
  const [model, setModel] = useState("cobalt-r2");
  const player = useScriptPlayer();

  const modelName = CODE_MODELS.find((m) => m.id === model)?.name ?? "";
  const live = runs.find((r) => r.phase === "thinking" || r.phase === "working" || r.phase === "answer");

  // Simulated uploads for files picked in the composer.
  const uploading = attachments.some((a) => a.status === "uploading");
  useEffect(() => {
    if (!uploading) return;
    const id = window.setInterval(() => {
      setAttachments((list) =>
        list.map((a) => {
          if (a.status !== "uploading") return a;
          const progress = Math.min(100, (a.progress ?? 0) + 9 + Math.random() * 14);
          return progress >= 100 ? { ...a, status: "done", progress: 100 } : { ...a, progress };
        }),
      );
    }, 160);
    return () => window.clearInterval(id);
  }, [uploading]);

  const patch = (id: string, fn: (r: Run) => Run) => setRuns((list) => list.map((r) => (r.id === id ? fn(r) : r)));

  const send = (prompt: string, atts: ComposerAttachmentItem[], opts: { canned?: string; fresh?: boolean } = {}) => {
    const id = `run-${Date.now()}`;
    const main = !opts.canned && (opts.fresh || (view === "history" && !runs.some((r) => r.kind === "main")));
    const run: Run = {
      id,
      kind: main ? "main" : "short",
      prompt,
      attachments: atts,
      time: clockLabel(),
      phase: "thinking",
      thinkStart: Date.now(),
      reasoning: [],
      steps: main ? RUN_STEPS.map((s) => ({ ...s, status: "pending" as const })) : [],
      tasks: [],
      showOutput: false,
      answer: main ? RUN_ANSWER : (opts.canned ?? FOLLOW_UP_ANSWER),
      changed: [],
    };
    setRuns((list) => (opts.fresh ? [run] : [...list, run]));
    setText("");
    setAttachments([]);

    const finishThinking = (r: Run): Run => ({ ...r, thinkDuration: Math.max(1, Math.round((Date.now() - r.thinkStart) / 1000)) });

    if (!main) {
      player.play([
        { delay: 500, run: () => patch(id, (r) => ({ ...r, reasoning: ["先确认用户的意图，再给出简洁、可执行的回答。"] })) },
        { delay: 1300, run: () => patch(id, (r) => ({ ...finishThinking(r), phase: "answer" })) },
      ]);
      return;
    }

    const steps: ScriptStep[] = [
      ...RUN_REASONING.map((line, i) => ({ delay: i === 0 ? 500 : 1000, run: () => patch(id, (r) => ({ ...r, reasoning: [...r.reasoning, line] })) })),
      { delay: 900, run: () => patch(id, (r) => ({ ...finishThinking(r), phase: "working", steps: setStep(r.steps, 0, "active") })) },
      {
        delay: 1400,
        run: () => {
          patch(id, (r) => ({
            ...r,
            steps: setStep(setStep(r.steps, 0, "done", "2 个文件"), 1, "active"),
            tasks: TEST_TASKS.map((t, i) => ({ ...t, status: i === 0 ? "working" : "pending" })),
            changed: ["test"],
          }));
          setFiles((f) => [...f.filter((x) => x.id !== "test"), testFile(0)]);
          setSelectedFile("test");
          setWriting("test");
          setAccepted(false);
        },
      },
      ...TEST_TASKS.map((_, i) => ({
        delay: 1150,
        run: () => {
          patch(id, (r) => ({ ...r, tasks: setTask(setTask(r.tasks, i, "done"), i + 1, "working") }));
          setFiles((f) => f.map((x) => (x.id === "test" ? testFile(i + 1) : x)));
        },
      })),
      {
        delay: 500,
        run: () => {
          setWriting(null);
          patch(id, (r) => ({ ...r, steps: setStep(setStep(r.steps, 1, "done", "4 个用例"), 2, "active") }));
        },
      },
      { delay: 1700, run: () => patch(id, (r) => ({ ...r, showOutput: true, steps: setStep(setStep(r.steps, 2, "done", "4 通过 · 412ms"), 3, "active") })) },
      {
        delay: 1300,
        run: () => {
          setFiles((f) => [...f.filter((x) => x.id !== "ci"), CI_FILE]);
          setSelectedFile("ci");
          patch(id, (r) => ({ ...r, changed: [...r.changed, "ci"], steps: setStep(setStep(r.steps, 3, "done", "+4 −1"), 4, "active") }));
        },
      },
      { delay: 900, run: () => patch(id, (r) => ({ ...r, steps: setStep(r.steps, 4, "done"), phase: "answer" })) },
    ];
    player.play(steps);
  };

  const stop = () => {
    player.stop();
    setWriting(null);
    setRuns((list) =>
      list.map((r) => {
        if (r.phase === "answer") return { ...r, phase: "done" };
        if (r.phase !== "thinking" && r.phase !== "working") return r;
        return {
          ...r,
          phase: "stopped",
          thinkDuration: r.thinkDuration ?? Math.max(1, Math.round((Date.now() - r.thinkStart) / 1000)),
          steps: r.steps.map((s) => (s.status === "active" ? { ...s, status: "failed" } : s)),
          tasks: r.tasks.map((t) => (t.status === "working" ? { ...t, status: "failed" } : t)),
        };
      }),
    );
  };

  const replay = () => {
    player.stop();
    setView("history");
    setFiles(INITIAL_FILES);
    setSelectedFile("form");
    setWriting(null);
    setAccepted(false);
    send(DEFAULT_PROMPT, DEFAULT_ATTACHMENTS, { fresh: true });
  };

  const newChat = () => {
    player.stop();
    setView("welcome");
    setRuns([]);
    setFiles([]);
    setSelectedFile(null);
    setWriting(null);
    setAccepted(false);
    setText("");
    setAttachments([]);
  };

  const loadingLabel = (() => {
    if (!live) return undefined;
    if (live.phase === "thinking") return "正在思考…";
    if (live.phase === "answer") return "正在整理回复…";
    const active = live.steps.find((s) => s.status === "active");
    return active ? `${active.title}…` : "正在处理…";
  })();

  const panelFiles = files;
  const totals = panelFiles.reduce(
    (acc, f) => {
      const s = diffStats(f.diff);
      return { add: acc.add + s.add, del: acc.del + s.del };
    },
    { add: 0, del: 0 },
  );

  return (
    <ChatShell
      active="checkout-guard"
      title={view === "welcome" ? "新对话" : "结账页重复提交排查"}
      titleMeta={
        view === "history" ? (
          <Badge variant="outline" size="sm" icon={<RiFolder3Line />}>
            官网改版
          </Badge>
        ) : null
      }
      model={<ModelPicker models={CODE_MODELS} value={model} onChange={setModel} size="sm" placement="bottom end" />}
      onNewChat={newChat}
      panel={{
        title: "代码改动",
        description: panelFiles.length ? `orra-web · ${panelFiles.length} 个文件 · +${totals.add} −${totals.del}` : "orra-web",
        toggleLabel: "代码改动",
        width: 460,
        content: (
          <DiffPanel
            files={panelFiles}
            selected={selectedFile}
            onSelect={setSelectedFile}
            writing={writing}
            accepted={accepted}
            onAccept={() => {
              setAccepted(true);
              toast.success("已接受全部改动", { description: `提交到 fix/checkout-double-submit（${panelFiles.length} 个文件）` });
            }}
            onRevert={() => {
              setAccepted(false);
              toast("改动已撤销（演示）", {
                description: "真实环境中会恢复到修改前的文件。",
                action: { label: "知道了", onPress: () => {} },
              });
            }}
          />
        ),
      }}
    >
      <ChatThread>
        {view === "welcome" && runs.length === 0 ? (
          <ChatWelcome
            title="今天想改点什么？"
            description="我可以读你的仓库、改代码、跑测试，并把改动整理成可审阅的提交。"
            suggestions={WELCOME_SUGGESTIONS.map((s, i) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              icon: [<RiBugLine key="a" />, <RiSearchEyeLine key="b" />, <RiTestTubeLine key="c" />, <RiRoadMapLine key="d" />][i]!,
            }))}
            onPick={(s) => {
              const sug = WELCOME_SUGGESTIONS.find((x) => x.id === s.id)!;
              send(sug.prompt, [], { canned: sug.answer });
            }}
          />
        ) : null}

        {view === "history" ? (
          <>
            <ChatMessage role="user" time="10:24" attachments={<ComposerAttachments items={ATTACHMENTS_HISTORY} />}>
              结账页在 Safari 上偶尔会重复下单，日志里同一个购物车 300ms 内出现了两次 POST /orders。帮我查一下原因并修掉。
            </ChatMessage>
            <ChatMessage
              role="assistant"
              time="10:25"
              badge={<Badge size="sm" variant="outline">Cobalt R2</Badge>}
              actions={<ChatMessageActions copyText={`${HISTORY_ANSWER}\n\n${HISTORY_OUTRO}`} />}
            >
              <AgentThinking active={false} duration={18}>
                {HISTORY_REASONING}
              </AgentThinking>
              <AgentLog items={HISTORY_LOG} dense />
              <ChatText text={HISTORY_ANSWER} />
              <ChatCodeBlock code={GUARD_SNIPPET} filename="src/hooks/use-submit-guard.ts" />
              <ChangeCard files={INITIAL_FILES} onOpen={setSelectedFile} />
              <ChatText text={HISTORY_OUTRO} />
            </ChatMessage>
          </>
        ) : null}

        {runs.map((run) => (
          <RunView
            key={run.id}
            run={run}
            modelName={modelName}
            files={files}
            onOpenFile={setSelectedFile}
            onStreamDone={() => patch(run.id, (r) => ({ ...r, phase: "done" }))}
            onReplay={replay}
          />
        ))}
      </ChatThread>

      <ChatComposerDock>
        <ComposerPanel
          value={text}
          onChange={setText}
          onSubmit={({ text: t, attachments: a }) => send(t, a)}
          attachments={attachments}
          onRemoveAttachment={(id) => setAttachments((list) => list.filter((a) => a.id !== id))}
          onFilesSelected={(picked) =>
            setAttachments((list) => [
              ...list,
              ...picked.map((f, i) => ({
                id: `f-${Date.now()}-${i}`,
                name: f.name,
                size: f.size,
                type: f.type,
                previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
                status: "uploading" as const,
                progress: 0,
              })),
            ])
          }
          addActions={[
            { id: "mention", label: "引用文件或符号", icon: <RiAtLine />, description: "把相关代码放进上下文" },
            { id: "web", label: "联网搜索", icon: <RiGlobalLine />, description: "查阅最新的文档与 issue" },
            { id: "terminal", label: "附上终端输出", icon: <RiTerminalBoxLine />, description: "最近一次命令的结果" },
          ]}
          onAddAction={(id) => {
            if (id === "mention") setText((t) => `${t}${t && !t.endsWith(" ") ? " " : ""}@src/hooks/use-submit-guard.ts `);
            else if (id === "terminal")
              setAttachments((list) => [...list, { id: `term-${Date.now()}`, name: "终端输出.txt", size: 2_816, type: "text/plain" }]);
            else toast("已为下一条消息开启联网搜索");
          }}
          modelPicker={<ModelPicker models={CODE_MODELS} value={model} onChange={setModel} variant="ghost" size="sm" placement="top start" />}
          defaultMode="auto"
          loading={!!live}
          loadingLabel={loadingLabel}
          onStop={stop}
          placeholder="描述你要做的改动，@ 引用文件…"
        />
      </ChatComposerDock>
    </ChatShell>
  );
}

/* --------------------------------------------------------------- pieces */

function ChangeCard({ files, onOpen }: { files: DiffFile[]; onOpen: (id: string) => void }) {
  const { openPanel } = useChatShell();
  const totals = files.reduce(
    (acc, f) => {
      const s = diffStats(f.diff);
      return { add: acc.add + s.add, del: acc.del + s.del };
    },
    { add: 0, del: 0 },
  );
  return (
    <div className="overflow-hidden rounded-menu border border-line bg-surface shadow-xs">
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
        <span className="flex-1 text-body-sm font-medium text-fg">改动了 {files.length} 个文件</span>
        <DiffCounts {...totals} />
      </div>
      <ul>
        {files.map((f) => {
          const s = diffStats(f.diff);
          return (
            <li key={f.id} className="border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => {
                  onOpen(f.id);
                  openPanel();
                }}
                className="group flex w-full items-center gap-2.5 px-3.5 py-2 text-start outline-none transition-colors duration-150 hover:bg-surface-hover focus-visible:bg-surface-hover"
              >
                <span aria-hidden className={f.status === "added" ? "text-success" : "text-warning"}>
                  {f.status === "added" ? <RiFileAddLine className="size-4" /> : <RiFileEditLine className="size-4" />}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-caption text-fg-muted group-hover:text-fg">{f.path}</span>
                <DiffCounts {...s} />
                <RiArrowRightSLine aria-hidden className="size-4 shrink-0 text-fg-subtle rtl:-scale-x-100" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RunView({
  run,
  modelName,
  files,
  onOpenFile,
  onStreamDone,
  onReplay,
}: {
  run: Run;
  modelName: string;
  files: DiffFile[];
  onOpenFile: (id: string) => void;
  onStreamDone: () => void;
  onReplay: () => void;
}) {
  const thinking = run.phase === "thinking";
  const showAnswer = run.phase === "answer" || run.phase === "done";
  const changedFiles = files.filter((f) => run.changed.includes(f.id));
  return (
    <>
      <ChatMessage role="user" time={run.time} attachments={run.attachments.length ? <ComposerAttachments items={run.attachments} /> : null}>
        {run.prompt}
      </ChatMessage>
      <ChatMessage
        role="assistant"
        time={run.time}
        badge={
          <Badge size="sm" variant="outline">
            {modelName}
          </Badge>
        }
        actions={
          run.phase === "done" || run.phase === "stopped" ? (
            <ChatMessageActions
              copyText={run.answer}
              onRetry={run.kind === "main" ? onReplay : undefined}
              extra={
                run.kind === "main" ? (
                  <Button size="sm" variant="plain" tone="neutral" startIcon={<RiReplay5Line />} onPress={onReplay} className="ms-1">
                    重新演示
                  </Button>
                ) : null
              }
            />
          ) : null
        }
      >
        <AgentThinking active={thinking} startedAt={run.thinkStart} duration={thinking ? undefined : run.thinkDuration}>
          {run.reasoning.join("\n")}
        </AgentThinking>
        {run.kind === "main" && !thinking ? (
          <AgentProgress
            steps={run.steps}
            title="执行计划"
            labels={run.phase === "stopped" ? { failed: "已在第 {n} 步停止", stepFailed: "已停止" } : undefined}
          />
        ) : null}
        {run.tasks.length ? <TaskList title="编写测试用例" items={run.tasks} collapseOnComplete /> : null}
        {run.showOutput ? <ChatCodeBlock code={TEST_OUTPUT} lang="text" filename="终端 · pnpm vitest" /> : null}
        {showAnswer ? <ChatStreamText text={run.answer} streaming={run.phase === "answer"} onDone={onStreamDone} /> : null}
        {run.phase === "done" && changedFiles.length ? <ChangeCard files={changedFiles} onOpen={onOpenFile} /> : null}
        {run.phase === "stopped" ? <ChatNotice>已停止生成，已完成的改动保留在右侧面板</ChatNotice> : null}
      </ChatMessage>
    </>
  );
}
