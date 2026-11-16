"use client";

import { useMemo, useState } from "react";
import type { Key, Selection } from "react-aria-components";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { RiAddLine, RiCloseLine, RiFilter3Line, RiMore2Line, RiShareLine, RiUserLine } from "@remixicon/react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Chip,
  ChipGroup,
  Dropdown,
  DropdownItem,
  IconButton,
  Input,
  Modal,
  Progress,
  SearchField,
  Select,
  SelectItem,
  StatusDot,
} from "@orra-ui/react";
import { cx } from "@orra-ui/react/lib/cx";
import { DashboardShell } from "@/templates/shared/dashboard-shell";
import { CardView, PRIORITY_ICON, SortableCard } from "./board-card";
import { COLUMNS, INITIAL_ORDER, LABELS, ME, MEMBERS, PRIORITIES, TASKS, type ColumnId, type Priority, type Task } from "./board-data";
import { TaskDrawer } from "./task-drawer";

type Order = Record<ColumnId, string[]>;

const isColumn = (id: string): id is ColumnId => COLUMNS.some((c) => c.id === id);

const ANNOUNCEMENTS = (titleOf: (id: string) => string, where: (id: string) => string): Announcements => ({
  onDragStart: ({ active }) => `已拿起「${titleOf(String(active.id))}」。`,
  onDragOver: ({ active, over }) => (over ? `「${titleOf(String(active.id))}」移动到${where(String(over.id))}。` : `「${titleOf(String(active.id))}」不在可放置区域。`),
  onDragEnd: ({ active, over }) => (over ? `「${titleOf(String(active.id))}」已放入${where(String(over.id))}。` : `已放下「${titleOf(String(active.id))}」。`),
  onDragCancel: ({ active }) => `已取消拖动「${titleOf(String(active.id))}」。`,
});

/* ------------------------------------------------------------------ column */

interface ColumnProps {
  column: (typeof COLUMNS)[number];
  ids: string[];
  totalCount: number;
  tasks: Record<string, Task>;
  onOpen: (id: string) => void;
  onQuickAdd: (title: string) => void;
}

function BoardColumn({ column, ids, totalCount, tasks, onOpen, onQuickAdd }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const submit = () => {
    if (draft.trim()) onQuickAdd(draft.trim());
    setDraft("");
    setComposing(false);
  };
  return (
    <section aria-label={column.title} className="flex min-w-0 snap-start flex-col rounded-card border border-line bg-surface-muted/70">
      <header className="flex items-center gap-2 px-3.5 pt-3.5 pb-1">
        <StatusDot tone={column.tone} />
        <h2 className="text-body-sm font-medium text-fg">{column.title}</h2>
        <span className="rounded-full bg-surface px-1.5 text-caption tabular-nums text-fg-muted shadow-xs">
          {ids.length === totalCount ? totalCount : `${ids.length}/${totalCount}`}
        </span>
        <span className="ms-auto flex items-center">
          <IconButton size="sm" icon={<RiAddLine />} aria-label={`在「${column.title}」中添加任务`} onPress={() => setComposing(true)} />
          <Dropdown trigger={<IconButton size="sm" icon={<RiMore2Line />} aria-label={`「${column.title}」列操作`} />} placement="bottom end">
            <DropdownItem id="sort">按优先级排序</DropdownItem>
            <DropdownItem id="limit">设置在制品上限</DropdownItem>
            <DropdownItem id="collapse">折叠此列</DropdownItem>
          </Dropdown>
        </span>
      </header>
      <p className="px-3.5 pb-2 text-caption text-fg-subtle">{column.hint}</p>
      <SortableContext id={column.id} items={ids} strategy={verticalListSortingStrategy}>
        <ul
          ref={setNodeRef}
          className={cx(
            "mx-2 flex min-h-28 flex-1 flex-col gap-2.5 rounded-menu pb-2 transition-colors duration-150",
            isOver && "bg-accent-50/60",
          )}
        >
          {ids.map((id) => (
            <SortableCard key={id} task={tasks[id]!} onOpen={() => onOpen(id)} />
          ))}
          {ids.length === 0 ? (
            <li className="flex flex-1 items-center justify-center rounded-menu border border-dashed border-line-strong px-4 py-8 text-center text-caption text-fg-subtle">
              {totalCount ? "没有符合筛选的任务" : "把任务拖到这里"}
            </li>
          ) : null}
        </ul>
      </SortableContext>
      <div className="p-2 pt-0">
        {composing ? (
          <form
            className="flex flex-col gap-2 rounded-menu border border-line bg-surface p-2 shadow-xs"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <Input
              aria-label="任务标题"
              size="sm"
              placeholder="输入标题，回车添加"
              value={draft}
              onChange={setDraft}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDraft("");
                  setComposing(false);
                }
              }}
            />
            <div className="flex justify-end gap-1.5">
              <Button size="sm" variant="plain" tone="neutral" onPress={() => setComposing(false)}>
                取消
              </Button>
              <Button size="sm" type="submit" isDisabled={!draft.trim()}>
                添加
              </Button>
            </div>
          </form>
        ) : (
          <Button size="sm" variant="plain" tone="neutral" fullWidth startIcon={<RiAddLine />} onPress={() => setComposing(true)} className="justify-start">
            添加任务
          </Button>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- new-task modal */

function NewTaskModal({ isOpen, onOpenChange, onCreate }: { isOpen: boolean; onOpenChange: (v: boolean) => void; onCreate: (t: Omit<Task, "id" | "code">, column: ColumnId) => void }) {
  const [title, setTitle] = useState("");
  const [column, setColumn] = useState<Key | null>("todo");
  const [priority, setPriority] = useState<Key | null>("medium");
  const [assignee, setAssignee] = useState<Key | null>(ME);
  const [labels, setLabels] = useState<Selection>(new Set());
  const [touched, setTouched] = useState(false);
  const reset = () => {
    setTitle("");
    setColumn("todo");
    setPriority("medium");
    setAssignee(ME);
    setLabels(new Set());
    setTouched(false);
  };
  const create = (close: () => void) => {
    setTouched(true);
    if (!title.trim()) return;
    onCreate(
      {
        title: title.trim(),
        description: "",
        labels: labels === "all" ? LABELS.map((l) => l.id) : [...labels].map(String),
        assignees: assignee ? [String(assignee)] : [],
        priority: (priority ?? "medium") as Priority,
        checklist: [],
        comments: [],
        attachments: 0,
      },
      (column ?? "todo") as ColumnId,
    );
    reset();
    close();
  };
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
      title="新建任务"
      description="任务会出现在所选列的底部。"
      footer={({ close }) => (
        <>
          <Button variant="outline" tone="neutral" onPress={close}>
            取消
          </Button>
          <Button onPress={() => create(close)}>创建任务</Button>
        </>
      )}
    >
      <div className="flex flex-col gap-4">
        <Input label="标题" placeholder="一句话描述要做的事" value={title} onChange={setTitle} isRequired isInvalid={touched && !title.trim()} errorMessage="请填写任务标题" autoFocus />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select label="状态" items={COLUMNS} selectedKey={column} onSelectionChange={setColumn}>
            {(c) => <SelectItem id={c.id}>{c.title}</SelectItem>}
          </Select>
          <Select label="优先级" items={PRIORITIES} selectedKey={priority} onSelectionChange={setPriority}>
            {(p) => (
              <SelectItem id={p.id} textValue={p.label} icon={<span className={cx("flex [&>svg]:size-4", PRIORITY_ICON[p.id].className)}>{PRIORITY_ICON[p.id].icon}</span>}>
                {p.label}
              </SelectItem>
            )}
          </Select>
          <Select label="负责人" items={MEMBERS} selectedKey={assignee} onSelectionChange={setAssignee}>
            {(m) => (
              <SelectItem id={m.id} textValue={m.name} icon={<Avatar name={m.name} size="xs" />}>
                {m.name}
              </SelectItem>
            )}
          </Select>
        </div>
        <ChipGroup label="标签" selectionMode="multiple" selectedKeys={labels} onSelectionChange={setLabels} size="sm">
          {LABELS.map((l) => (
            <Chip key={l.id} id={l.id}>
              {l.label}
            </Chip>
          ))}
        </ChipGroup>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------- page */

export function ProjectBoardTemplate() {
  const [tasks, setTasks] = useState<Record<string, Task>>(() => Object.fromEntries(TASKS.map((t) => [t.id, t])));
  const [order, setOrder] = useState<Order>(INITIAL_ORDER);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Order | null>(null);

  const [query, setQuery] = useState("");
  const [assignee, setAssignee] = useState<Key | null>("all");
  const [labelFilter, setLabelFilter] = useState<Selection>(new Set());

  const [openId, setOpenId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const columnOf = (id: string, o: Order = order): ColumnId | undefined => (isColumn(id) ? id : COLUMNS.find((c) => o[c.id].includes(id))?.id);

  const labelKeys = labelFilter === "all" ? LABELS.map((l) => l.id) : [...labelFilter].map(String);
  const filtering = query.trim() !== "" || assignee !== "all" || labelKeys.length > 0;
  const matches = (t: Task) => {
    const q = query.trim().toLowerCase();
    if (q && !`${t.code} ${t.title} ${t.description}`.toLowerCase().includes(q)) return false;
    if (assignee !== "all" && !t.assignees.includes(String(assignee))) return false;
    if (labelKeys.length && !labelKeys.some((l) => t.labels.includes(l))) return false;
    return true;
  };
  const visible = useMemo(() => {
    const out = {} as Order;
    for (const c of COLUMNS) out[c.id] = order[c.id].filter((id) => id === activeId || matches(tasks[id]!));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, tasks, query, assignee, labelFilter, activeId]);

  const allCount = Object.keys(tasks).length;
  const doneCount = order.done.length;

  /* drag handlers */
  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    setSnapshot(order);
  };
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const a = String(active.id);
    const o = String(over.id);
    setOrder((prev) => {
      const from = columnOf(a, prev);
      const to = columnOf(o, prev);
      if (!from || !to || from === to) return prev;
      const target = prev[to].filter((id) => id !== a);
      const overIndex = isColumn(o) ? target.length : target.indexOf(o);
      const below = over.rect && active.rect.current.translated ? active.rect.current.translated.top > over.rect.top + over.rect.height / 2 : false;
      const index = overIndex < 0 ? target.length : overIndex + (below && !isColumn(o) ? 1 : 0);
      target.splice(index, 0, a);
      return { ...prev, [from]: prev[from].filter((id) => id !== a), [to]: target };
    });
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    setSnapshot(null);
    if (!over) return;
    const a = String(active.id);
    const o = String(over.id);
    setOrder((prev) => {
      const col = columnOf(a, prev);
      if (!col || col !== columnOf(o, prev) || isColumn(o)) return prev;
      const from = prev[col].indexOf(a);
      const to = prev[col].indexOf(o);
      if (from === to || to < 0) return prev;
      return { ...prev, [col]: arrayMove(prev[col], from, to) };
    });
  };
  const onDragCancel = () => {
    if (snapshot) setOrder(snapshot);
    setActiveId(null);
    setSnapshot(null);
  };

  /* mutations */
  const moveTo = (id: string, to: ColumnId) =>
    setOrder((prev) => {
      const from = columnOf(id, prev);
      if (!from || from === to) return prev;
      return { ...prev, [from]: prev[from].filter((x) => x !== id), [to]: [...prev[to], id] };
    });
  const addTask = (t: Omit<Task, "id" | "code">, column: ColumnId) => {
    const n = 241 + Object.keys(tasks).length - TASKS.length;
    const id = `n${Date.now()}`;
    setTasks((prev) => ({ ...prev, [id]: { ...t, id, code: `ORR-${n}` } }));
    setOrder((prev) => ({ ...prev, [column]: [...prev[column], id] }));
  };
  const removeTask = (id: string) => {
    setDrawerOpen(false);
    setOrder((prev) => {
      const col = columnOf(id, prev);
      return col ? { ...prev, [col]: prev[col].filter((x) => x !== id) } : prev;
    });
  };

  const openTask = openId ? tasks[openId] ?? null : null;
  const titleOf = (id: string) => tasks[id]?.title ?? "";
  const where = (id: string) => {
    const col = columnOf(id);
    const c = COLUMNS.find((x) => x.id === col);
    if (!c) return "未知位置";
    if (isColumn(id)) return `「${c.title}」列`;
    return `「${c.title}」列第 ${order[c.id].indexOf(id) + 1} 项`;
  };

  return (
    <DashboardShell
      active="project-board"
      crumbs={["协作", "项目看板"]}
      title="官网改版 · 迭代 14"
      description="11月10日 – 11月21日 · 拖动卡片更新状态，点击查看详情"
      bleed
      actions={
        <>
          <AvatarGroup size="sm" max={4} className="me-1 hidden sm:flex">
            {MEMBERS.map((m) => (
              <Avatar key={m.id} name={m.name} />
            ))}
          </AvatarGroup>
          <Button variant="outline" tone="neutral" startIcon={<RiShareLine />}>
            分享
          </Button>
          <Button startIcon={<RiAddLine />} onPress={() => setCreating(true)}>
            新建任务
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-3 shadow-card lg:flex-row lg:items-center">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchField aria-label="搜索任务" placeholder="搜索标题、编号…" size="sm" value={query} onChange={setQuery} className="sm:w-60" />
          <Select aria-label="按负责人筛选" size="sm" selectedKey={assignee} onSelectionChange={setAssignee} startIcon={<RiUserLine />} triggerClassName="sm:w-40">
            <SelectItem id="all">全部成员</SelectItem>
            {MEMBERS.map((m) => (
              <SelectItem key={m.id} id={m.id} textValue={m.name} icon={<Avatar name={m.name} size="xs" />} meta={m.id === ME ? "我" : undefined}>
                {m.name}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          <RiFilter3Line className="size-4 shrink-0 text-fg-subtle" aria-hidden />
          <ChipGroup aria-label="按标签筛选" selectionMode="multiple" selectedKeys={labelFilter} onSelectionChange={setLabelFilter} size="sm" className="min-w-max">
            {LABELS.map((l) => (
              <Chip key={l.id} id={l.id}>
                {l.label}
              </Chip>
            ))}
          </ChipGroup>
          {filtering ? (
            <Button
              size="sm"
              variant="plain"
              tone="neutral"
              startIcon={<RiCloseLine />}
              className="shrink-0"
              onPress={() => {
                setQuery("");
                setAssignee("all");
                setLabelFilter(new Set());
              }}
            >
              清除
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-3 lg:w-56">
          <span className="shrink-0 text-caption text-fg-subtle">迭代进度</span>
          <Progress aria-label="迭代完成度" value={(doneCount / Math.max(allCount, 1)) * 100} size="sm" tone="success" className="flex-1" />
          <Badge size="sm" tone="success">
            {doneCount}/{allCount}
          </Badge>
        </div>
      </div>

      <DndContext
        id="project-board"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{
          announcements: ANNOUNCEMENTS(titleOf, where),
          screenReaderInstructions: { draggable: "按空格键拿起卡片，用方向键移动，再按空格键放下，按 Esc 取消。" },
        }}
      >
        <div className="-mx-4 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-2 lg:-mx-6 lg:snap-none lg:px-6">
          <div className="grid auto-cols-[min(300px,82vw)] grid-flow-col items-start gap-4 xl:auto-cols-[minmax(264px,1fr)]">
            {COLUMNS.map((c) => (
              <BoardColumn
                key={c.id}
                column={c}
                ids={visible[c.id]}
                totalCount={order[c.id].length}
                tasks={tasks}
                onOpen={(id) => {
                  setOpenId(id);
                  setDrawerOpen(true);
                }}
                onQuickAdd={(title) =>
                  addTask({ title, description: "", labels: [], assignees: [ME], priority: "medium", checklist: [], comments: [], attachments: 0 }, c.id)
                }
              />
            ))}
          </div>
        </div>
        <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
          {activeId && tasks[activeId] ? <CardView task={tasks[activeId]!} overlay /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDrawer
        isOpen={drawerOpen}
        task={openTask}
        column={openId ? columnOf(openId) ?? null : null}
        onClose={() => setDrawerOpen(false)}
        onChange={(t) => setTasks((prev) => ({ ...prev, [t.id]: t }))}
        onMove={(col) => openId && moveTo(openId, col)}
        onDelete={() => openId && removeTask(openId)}
      />
      <NewTaskModal isOpen={creating} onOpenChange={setCreating} onCreate={addTask} />
    </DashboardShell>
  );
}
