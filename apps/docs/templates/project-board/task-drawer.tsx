"use client";

import { useState, type ReactNode } from "react";
import { RiAddLine, RiDeleteBin6Line, RiLinkM, RiMore2Line, RiPriceTag3Line, RiSendPlaneLine } from "@remixicon/react";
import {
  Avatar,
  Button,
  Checkbox,
  Drawer,
  Dropdown,
  DropdownItem,
  IconButton,
  Input,
  Progress,
  Select,
  SelectItem,
  Tag,
  TagGroup,
  Textarea,
} from "@orra-ui/react";
import { cx } from "@orra-ui/react/lib/cx";
import { PRIORITY_ICON, labelOf, memberOf } from "./board-card";
import { COLUMNS, LABELS, ME, MEMBERS, PRIORITIES, type ColumnId, type Priority, type Task } from "./board-data";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[88px_1fr] items-center gap-3">
      <span className="text-body-sm text-fg-subtle">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Section({ title, end, children }: { title: string; end?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-body font-medium text-fg">{title}</h3>
        {end}
      </div>
      {children}
    </section>
  );
}

export interface TaskDrawerProps {
  isOpen: boolean;
  task: Task | null;
  column: ColumnId | null;
  onClose: () => void;
  onChange: (task: Task) => void;
  onMove: (column: ColumnId) => void;
  onDelete: () => void;
}

export function TaskDrawer({ isOpen, task, column, onClose, onChange, onMove, onDelete }: TaskDrawerProps) {
  const [newItem, setNewItem] = useState("");
  const [comment, setComment] = useState("");
  const done = task ? task.checklist.filter((c) => c.done).length : 0;
  const total = task?.checklist.length ?? 0;
  const me = memberOf(ME)!;
  const missingLabels = task ? LABELS.filter((l) => !task.labels.includes(l.id)) : [];

  const addItem = () => {
    if (!task || !newItem.trim()) return;
    onChange({ ...task, checklist: [...task.checklist, { id: `c${Date.now()}`, text: newItem.trim(), done: false }] });
    setNewItem("");
  };
  const sendComment = () => {
    if (!task || !comment.trim()) return;
    onChange({ ...task, comments: [...task.comments, { id: `m${Date.now()}`, author: me.name, text: comment.trim(), time: "刚刚" }] });
    setComment("");
  };

  return (
    <Drawer
      isOpen={isOpen && task != null}
      onOpenChange={(open) => !open && onClose()}
      size="md"
      title={task?.title ?? ""}
      description={task ? `${task.code} · ${COLUMNS.find((c) => c.id === column)?.title ?? ""}` : undefined}
      headerActions={
        <Dropdown trigger={<IconButton size="sm" icon={<RiMore2Line />} aria-label="更多操作" />} placement="bottom end">
          <DropdownItem id="link" icon={<RiLinkM />}>
            复制链接
          </DropdownItem>
          <DropdownItem id="delete" icon={<RiDeleteBin6Line />} tone="danger" onAction={onDelete}>
            删除任务
          </DropdownItem>
        </Dropdown>
      }
      footer={
        <>
          <Button variant="outline" tone="neutral" onPress={onClose}>
            关闭
          </Button>
          {column !== "done" ? (
            <Button
              onPress={() => {
                onMove("done");
                onClose();
              }}
            >
              标记为已完成
            </Button>
          ) : null}
        </>
      }
    >
      {task ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <Field label="状态">
              <Select aria-label="状态" size="sm" items={COLUMNS} selectedKey={column} onSelectionChange={(k) => k && onMove(k as ColumnId)}>
                {(c) => <SelectItem id={c.id}>{c.title}</SelectItem>}
              </Select>
            </Field>
            <Field label="优先级">
              <Select aria-label="优先级" size="sm" items={PRIORITIES} selectedKey={task.priority} onSelectionChange={(k) => k && onChange({ ...task, priority: k as Priority })}>
                {(p) => (
                  <SelectItem id={p.id} textValue={p.label} icon={<span className={cx("flex [&>svg]:size-4", PRIORITY_ICON[p.id].className)}>{PRIORITY_ICON[p.id].icon}</span>}>
                    {p.label}
                  </SelectItem>
                )}
              </Select>
            </Field>
            <Field label="截止日期">
              <span className="text-body-sm text-fg">{task.due ?? "未设置"}</span>
            </Field>
            <Field label="负责人">
              <div className="flex flex-wrap gap-1.5">
                {task.assignees.map((id) => {
                  const m = memberOf(id);
                  return (
                    <span key={id} className="flex items-center gap-1.5 rounded-full border border-line py-0.5 ps-0.5 pe-2.5 text-body-sm text-fg">
                      <Avatar name={m?.name ?? id} size="xs" />
                      {m?.name}
                    </span>
                  );
                })}
                <Dropdown
                  trigger={<IconButton size="sm" variant="outline" round icon={<RiAddLine />} aria-label="添加负责人" />}
                  onAction={(key) => onChange({ ...task, assignees: task.assignees.includes(String(key)) ? task.assignees.filter((a) => a !== key) : [...task.assignees, String(key)] })}
                >
                  {MEMBERS.map((m) => (
                    <DropdownItem key={m.id} id={m.id} textValue={m.name} icon={<Avatar name={m.name} size="xs" />} end={task.assignees.includes(m.id) ? "已分配" : m.role}>
                      {m.name}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
            </Field>
            <Field label="标签">
              <div className="flex flex-wrap items-center gap-1.5">
                <TagGroup
                  aria-label="标签"
                  size="sm"
                  items={task.labels.map((id) => ({ id, label: labelOf(id)?.label ?? id }))}
                  onRemove={(keys) => onChange({ ...task, labels: task.labels.filter((l) => !keys.has(l)) })}
                  emptyState={<span className="text-body-sm text-fg-subtle">无</span>}
                >
                  {(l) => <Tag id={l.id}>{l.label}</Tag>}
                </TagGroup>
                {missingLabels.length ? (
                  <Dropdown
                    trigger={<IconButton size="sm" variant="plain" icon={<RiPriceTag3Line />} aria-label="添加标签" />}
                    onAction={(key) => onChange({ ...task, labels: [...task.labels, String(key)] })}
                  >
                    {missingLabels.map((l) => (
                      <DropdownItem key={l.id} id={l.id}>
                        {l.label}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                ) : null}
              </div>
            </Field>
          </div>

          <Section title="描述">
            <Textarea aria-label="任务描述" value={task.description} onChange={(v) => onChange({ ...task, description: v })} minRows={3} maxRows={10} />
          </Section>

          <Section title="检查清单" end={total ? <span className="text-caption tabular-nums text-fg-subtle">{done} / {total}</span> : null}>
            {total ? <Progress aria-label="检查清单完成度" value={(done / total) * 100} size="sm" tone={done === total ? "success" : "accent"} /> : null}
            <ul className="-mx-1.5 flex flex-col">
              {task.checklist.map((item) => (
                <li key={item.id} className="group/item flex items-center gap-2 rounded-control px-1.5 py-1 hover:bg-surface-hover">
                  <Checkbox
                    size="sm"
                    isSelected={item.done}
                    onChange={(on) => onChange({ ...task, checklist: task.checklist.map((c) => (c.id === item.id ? { ...c, done: on } : c)) })}
                    className="min-w-0 flex-1"
                  >
                    <span className={cx(item.done && "text-fg-subtle line-through")}>{item.text}</span>
                  </Checkbox>
                  <IconButton
                    size="sm"
                    icon={<RiDeleteBin6Line />}
                    aria-label={`删除「${item.text}」`}
                    className="opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100"
                    onPress={() => onChange({ ...task, checklist: task.checklist.filter((c) => c.id !== item.id) })}
                  />
                </li>
              ))}
            </ul>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addItem();
              }}
            >
              <Input aria-label="新的检查项" size="sm" placeholder="添加检查项，回车确认" value={newItem} onChange={setNewItem} className="flex-1" />
              <Button size="sm" variant="soft" type="submit" isDisabled={!newItem.trim()}>
                添加
              </Button>
            </form>
          </Section>

          <Section title={`评论 · ${task.comments.length}`}>
            {task.comments.length ? (
              <ul className="flex flex-col gap-4">
                {task.comments.map((c) => (
                  <li key={c.id} className="flex gap-3">
                    <Avatar name={c.author} size="sm" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="flex items-baseline gap-2">
                        <span className="text-body-sm font-medium text-fg">{c.author}</span>
                        <span className="text-caption text-fg-subtle">{c.time}</span>
                      </p>
                      <p className="rounded-control bg-surface-muted px-3 py-2 text-body-sm text-fg">{c.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-fg-subtle">还没有评论。</p>
            )}
            <div className="flex gap-3">
              <Avatar name={me.name} size="sm" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Textarea aria-label="写评论" placeholder="写下你的想法，@ 提及同事…" value={comment} onChange={setComment} minRows={2} />
                <div className="flex justify-end">
                  <Button size="sm" startIcon={<RiSendPlaneLine />} isDisabled={!comment.trim()} onPress={sendComment}>
                    发送
                  </Button>
                </div>
              </div>
            </div>
          </Section>
        </div>
      ) : null}
    </Drawer>
  );
}
