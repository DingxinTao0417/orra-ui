"use client";

import { useMemo } from "react";
import { RiArrowGoBackLine, RiCheckDoubleLine, RiFileAddLine, RiFileCopyLine, RiFileEditLine, RiGitBranchLine } from "@remixicon/react";
import { Badge, Button, IconButton, Spinner, Tooltip, toast } from "@orra-ui/react";
import { cx } from "@orra-ui/react/lib/cx";
import { ChatCode } from "../shared/chat-shell";
import type { DiffFile } from "./ai-chat-data";

/* ---------------------------------------------------------------- parse */

export interface DiffLine {
  kind: "hunk" | "add" | "del" | "ctx";
  text: string;
  old?: number;
  new?: number;
}

export function parseDiff(diff: string): DiffLine[] {
  const out: DiffLine[] = [];
  let o = 0;
  let n = 0;
  for (const raw of diff.split("\n")) {
    if (raw.startsWith("@@")) {
      const m = /-(\d+)(?:,\d+)? \+(\d+)/.exec(raw);
      o = m ? Number(m[1]) : 0;
      n = m ? Number(m[2]) : 0;
      out.push({ kind: "hunk", text: raw });
      continue;
    }
    const sign = raw[0];
    const text = raw.slice(1);
    if (sign === "+") out.push({ kind: "add", text, new: n++ });
    else if (sign === "-") out.push({ kind: "del", text, old: o++ });
    else out.push({ kind: "ctx", text, old: o++, new: n++ });
  }
  return out;
}

export function diffStats(diff: string) {
  let add = 0;
  let del = 0;
  for (const l of diff.split("\n")) {
    if (l.startsWith("@@")) continue;
    if (l[0] === "+") add++;
    else if (l[0] === "-") del++;
  }
  return { add, del };
}

function splitPath(path: string) {
  const i = path.lastIndexOf("/");
  return { dir: i >= 0 ? path.slice(0, i + 1) : "", name: path.slice(i + 1) };
}

function langOf(path: string) {
  if (path.endsWith(".yml") || path.endsWith(".yaml")) return "yaml";
  return "ts";
}

export function DiffCounts({ add, del, className }: { add: number; del: number; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 font-mono text-caption tabular-nums", className)}>
      <span className="text-success">+{add}</span>
      <span className="text-danger">−{del}</span>
    </span>
  );
}

/* ---------------------------------------------------------------- panel */

export interface DiffPanelProps {
  files: DiffFile[];
  selected: string | null;
  onSelect: (id: string) => void;
  /** File currently being written by the agent. */
  writing?: string | null;
  accepted: boolean;
  onAccept: () => void;
  onRevert: () => void;
}

/** Changed files list and a unified diff of the selected file. */
export function DiffPanel({ files, selected, onSelect, writing, accepted, onAccept, onRevert }: DiffPanelProps) {
  const current = files.find((f) => f.id === selected) ?? files[0];
  const totals = useMemo(
    () =>
      files.reduce(
        (acc, f) => {
          const s = diffStats(f.diff);
          return { add: acc.add + s.add, del: acc.del + s.del };
        },
        { add: 0, del: 0 },
      ),
    [files],
  );

  if (!files.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-surface-muted text-fg-subtle">
          <RiGitBranchLine className="size-5" />
        </span>
        <p className="text-body font-medium text-fg">还没有改动</p>
        <p className="text-body-sm text-fg-subtle">助手修改的文件会出现在这里，你可以逐个审阅后再接受。</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <RiGitBranchLine aria-hidden className="size-4 shrink-0 text-fg-subtle" />
          <span className="truncate font-mono text-caption text-fg-muted">fix/checkout-double-submit</span>
        </div>
        <span className="text-caption text-fg-subtle">{files.length} 个文件</span>
        <DiffCounts {...totals} />
      </div>

      <ul aria-label="改动的文件" className="flex max-h-[38%] shrink-0 flex-col gap-0.5 overflow-y-auto border-b border-line p-2">
        {files.map((f) => {
          const { dir, name } = splitPath(f.path);
          const s = diffStats(f.diff);
          const isCurrent = f.id === current?.id;
          return (
            <li key={f.id} className="motion-safe:animate-rise">
              <button
                type="button"
                aria-current={isCurrent || undefined}
                onClick={() => onSelect(f.id)}
                className={cx(
                  "flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-start outline-none transition-colors duration-150 focus-visible:focus-ring",
                  isCurrent ? "bg-surface-active" : "hover:bg-surface-hover",
                )}
              >
                <span aria-hidden className={cx("shrink-0 [&>svg]:size-4", f.status === "added" ? "text-success" : "text-warning")}>
                  {f.status === "added" ? <RiFileAddLine /> : <RiFileEditLine />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body-sm font-medium text-fg">{name}</span>
                  <span className="truncate font-mono text-micro text-fg-subtle">{dir}</span>
                </span>
                {writing === f.id ? (
                  <span className="flex shrink-0 items-center gap-1.5 text-caption text-fg-accent">
                    <Spinner size="xs" variant="ring" />
                    写入中
                  </span>
                ) : (
                  <Badge size="sm" tone={f.status === "added" ? "success" : "warning"} className="shrink-0">
                    {f.status === "added" ? "新增" : "修改"}
                  </Badge>
                )}
                <DiffCounts {...s} className="w-16 shrink-0 justify-end" />
              </button>
            </li>
          );
        })}
      </ul>

      {current ? <DiffView file={current} writing={writing === current.id} /> : null}

      <div className="flex shrink-0 items-center gap-2 border-t border-line px-4 py-3">
        {accepted ? (
          <span className="flex flex-1 items-center gap-1.5 text-body-sm text-success">
            <RiCheckDoubleLine className="size-4" />
            已接受全部改动
          </span>
        ) : (
          <span className="flex-1 text-caption text-fg-subtle">审阅后接受，改动会提交到当前分支</span>
        )}
        <Button size="sm" variant="plain" tone="neutral" startIcon={<RiArrowGoBackLine />} onPress={onRevert} isDisabled={!!writing}>
          撤销
        </Button>
        <Button size="sm" startIcon={<RiCheckDoubleLine />} onPress={onAccept} isDisabled={accepted || !!writing}>
          接受全部
        </Button>
      </div>
    </div>
  );
}

function DiffView({ file, writing }: { file: DiffFile; writing: boolean }) {
  const lines = useMemo(() => parseDiff(file.diff), [file.diff]);
  const lang = langOf(file.path);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line ps-4 pe-2">
        <span className="min-w-0 flex-1 truncate font-mono text-caption text-fg-muted" title={file.path}>
          {file.path}
        </span>
        <Tooltip content="复制路径">
          <IconButton
            size="sm"
            icon={<RiFileCopyLine />}
            aria-label="复制路径"
            onPress={() => {
              void navigator.clipboard?.writeText(file.path).catch(() => {});
              toast.success("路径已复制");
            }}
          />
        </Tooltip>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-surface-muted/50" aria-label={`${file.path} 的改动`} role="region">
        <pre className="min-w-max py-1 font-mono text-[12px] leading-[22px] text-fg">
          {lines.map((l, i) =>
            l.kind === "hunk" ? (
              <div key={i} className="my-1 bg-info-soft px-4 text-info">
                {l.text}
              </div>
            ) : (
              <div
                key={i}
                className={cx(
                  "flex",
                  l.kind === "add" && "bg-success-soft",
                  l.kind === "del" && "bg-danger-soft",
                  writing && i === lines.length - 1 && "motion-safe:animate-fade-in",
                )}
              >
                <span aria-hidden className="w-9 shrink-0 pe-2 text-end text-fg-disabled tabular-nums select-none">
                  {l.old ?? ""}
                </span>
                <span aria-hidden className="w-9 shrink-0 pe-2 text-end text-fg-disabled tabular-nums select-none">
                  {l.new ?? ""}
                </span>
                <span
                  aria-hidden
                  className={cx(
                    "w-5 shrink-0 text-center select-none",
                    l.kind === "add" ? "text-success" : l.kind === "del" ? "text-danger" : "text-fg-disabled",
                  )}
                >
                  {l.kind === "add" ? "+" : l.kind === "del" ? "−" : ""}
                </span>
                <span className="sr-only">{l.kind === "add" ? "新增：" : l.kind === "del" ? "删除：" : ""}</span>
                <span className="pe-4">{l.text ? <ChatCode line={l.text} lang={lang} /> : " "}</span>
              </div>
            ),
          )}
          {writing ? (
            <div className="flex">
              <span className="w-[92px] shrink-0" />
              <span aria-hidden className="mt-1 inline-block h-4 w-1.5 rounded-sm bg-accent-500 motion-safe:animate-pulse" />
            </div>
          ) : null}
        </pre>
      </div>
    </div>
  );
}
