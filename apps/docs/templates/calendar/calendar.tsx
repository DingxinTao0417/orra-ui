"use client";

import { useEffect, useMemo, useState } from "react";
import type { Key } from "react-aria-components";
import { CalendarDate, Time, getLocalTimeZone, today as todayIn, type DateValue } from "@internationalized/date";
import { RiAddLine, RiDeleteBin6Line, RiLinkM, RiMapPin2Line, RiSettings3Line, RiTimeLine } from "@remixicon/react";
import {
  Button,
  ChartCard,
  Checkbox,
  DateCalendar,
  DatePicker,
  EventCalendar,
  IconButton,
  Input,
  Modal,
  Select,
  SelectItem,
  Switch,
  Textarea,
  TimeField,
  useHydrated,
  type CalendarEvent,
} from "@orra-ui/react";
import { cx } from "@orra-ui/react/lib/cx";
import { DashboardShell } from "@/templates/shared/dashboard-shell";
import { FALLBACK_TODAY, SOURCES, buildEvents } from "./calendar-data";

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function dayLabel(d: CalendarDate, today: CalendarDate) {
  const diff = d.compare(today);
  if (diff === 0) return "今天";
  if (diff === 1) return "明天";
  const wd = WEEKDAYS[new Date(d.year, d.month - 1, d.day).getDay()];
  return `${d.month}月${d.day}日 ${wd}`;
}

function parseStart(e: CalendarEvent) {
  const s = String(e.start);
  const [date, time] = s.split("T");
  const [y, m, d] = date!.split("-").map(Number);
  return { day: new CalendarDate(y!, m!, d!), time: time ?? null, key: s.length === 10 ? `${s}T00:00` : s };
}

const sourceOf = (id?: string) => SOURCES.find((s) => s.id === id) ?? SOURCES[0]!;

/* --------------------------------------------------------- new-event form */

interface Draft {
  title: string;
  calendarId: Key | null;
  date: DateValue | null;
  allDay: boolean;
  start: Time | null;
  end: Time | null;
  location: string;
  notes: string;
}

const emptyDraft = (date: CalendarDate): Draft => ({
  title: "",
  calendarId: "team",
  date,
  allDay: false,
  start: new Time(10, 0),
  end: new Time(11, 0),
  location: "",
  notes: "",
});

const hm = (t: Time) => `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;

function NewEventModal({ isOpen, onOpenChange, initialDate, onSubmit }: { isOpen: boolean; onOpenChange: (open: boolean) => void; initialDate: CalendarDate; onSubmit: (e: CalendarEvent) => void }) {
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(initialDate));
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setDraft(emptyDraft(initialDate));
      setTouched(false);
    }
  }, [isOpen, initialDate]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const timeInvalid = !draft.allDay && draft.start && draft.end ? draft.end.compare(draft.start) <= 0 : false;
  const titleInvalid = touched && !draft.title.trim();

  const submit = (close: () => void) => {
    setTouched(true);
    if (!draft.title.trim() || !draft.date || timeInvalid) return;
    const day = draft.date.toString().slice(0, 10);
    onSubmit({
      id: `new-${Date.now()}`,
      title: draft.title.trim(),
      calendarId: String(draft.calendarId ?? "team"),
      location: draft.location || undefined,
      description: draft.notes || undefined,
      ...(draft.allDay || !draft.start
        ? { start: day, allDay: true }
        : { start: `${day}T${hm(draft.start)}`, end: `${day}T${hm(draft.end ?? draft.start.add({ hours: 1 }))}` }),
    });
    close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="新建日程"
      description="日程会同步给所选日历的成员。"
      size="md"
      footer={({ close }) => (
        <>
          <Button variant="outline" tone="neutral" onPress={close}>
            取消
          </Button>
          <Button onPress={() => submit(close)}>创建日程</Button>
        </>
      )}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit(() => onOpenChange(false));
        }}
      >
        <Input
          label="标题"
          placeholder="例如：迭代评审"
          value={draft.title}
          onChange={(v) => set("title", v)}
          isRequired
          isInvalid={titleInvalid}
          errorMessage="请填写日程标题"
          autoFocus
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="日历" items={SOURCES} selectedKey={draft.calendarId} onSelectionChange={(k) => set("calendarId", k)}>
            {(s) => (
              <SelectItem id={s.id} icon={
                  <span className="flex size-4 items-center justify-center">
                    <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                  </span>
                } meta={s.owner}>
                {s.label}
              </SelectItem>
            )}
          </Select>
          <DatePicker label="日期" value={draft.date} onChange={(v) => set("date", v)} isRequired />
        </div>
        <Switch isSelected={draft.allDay} onChange={(v) => set("allDay", v)} size="sm">
          全天
        </Switch>
        {!draft.allDay ? (
          <div className="grid grid-cols-2 gap-4">
            <TimeField label="开始" value={draft.start} onChange={(v) => set("start", v as Time | null)} hourCycle={24} />
            <TimeField
              label="结束"
              value={draft.end}
              onChange={(v) => set("end", v as Time | null)}
              hourCycle={24}
              isInvalid={timeInvalid}
              errorMessage="结束时间需晚于开始时间"
            />
          </div>
        ) : null}
        <Input label="地点" placeholder="会议室或链接" value={draft.location} onChange={(v) => set("location", v)} startIcon={<RiMapPin2Line />} />
        <Textarea label="备注" placeholder="议程、准备材料…" value={draft.notes} onChange={(v) => set("notes", v)} minRows={2} limit={200} showCount />
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

/* -------------------------------------------------------------- side panel */

function MiniMonth({ date, onChange, todayCount }: { date: CalendarDate; onChange: (d: CalendarDate) => void; todayCount: number }) {
  return (
    <ChartCard dense className="hidden sm:flex" title="月历" description={`今天有 ${todayCount} 项日程`}>
      <div className="flex justify-center">
        <DateCalendar aria-label="选择日期" value={date} onChange={(v) => onChange(new CalendarDate(v.year, v.month, v.day))} />
      </div>
    </ChartCard>
  );
}

function SourcesCard({ hidden, onToggle, counts }: { hidden: Set<string>; onToggle: (id: string, on: boolean) => void; counts: Record<string, number> }) {
  return (
    <ChartCard dense title="我的日历" description={`显示 ${SOURCES.length - hidden.size} / ${SOURCES.length}`} actions={<IconButton size="sm" icon={<RiSettings3Line />} aria-label="日历设置" />}>
      <ul className="-mx-1.5 flex flex-col">
        {SOURCES.map((s) => (
          <li key={s.id} className="flex items-center gap-2 rounded-control px-1.5 py-1 transition-colors duration-150 hover:bg-surface-hover">
            <Checkbox size="sm" isSelected={!hidden.has(s.id)} onChange={(on) => onToggle(s.id, on)} className="min-w-0 flex-1">
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                <span className="truncate">{s.label}</span>
              </span>
            </Checkbox>
            <span className="text-caption tabular-nums text-fg-subtle">{counts[s.id] ?? 0}</span>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}

function UpcomingCard({ events, today, nowKey, onPick }: { events: CalendarEvent[]; today: CalendarDate; nowKey: string; onPick: (d: CalendarDate) => void }) {
  const upcoming = useMemo(
    () =>
      events
        .map((e) => ({ e, ...parseStart(e) }))
        .filter((x) => (x.time ? x.key >= nowKey : x.day.compare(today) >= 0))
        .sort((a, b) => a.key.localeCompare(b.key))
        .slice(0, 5),
    [events, today, nowKey],
  );
  return (
    <ChartCard dense title="接下来" description="按时间排序的 5 项日程">
      {upcoming.length ? (
        <ul className="-mx-1.5 flex flex-col">
          {upcoming.map(({ e, day, time }) => {
            const src = sourceOf(e.calendarId);
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onPick(day)}
                  className="flex w-full items-stretch gap-3 rounded-control px-1.5 py-2 text-start transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-accent-500"
                >
                  <span className="w-1 shrink-0 rounded-full" style={{ background: src.color }} aria-hidden />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-body-sm font-medium text-fg">{e.title}</span>
                    <span className="flex items-center gap-1 text-caption text-fg-subtle">
                      <RiTimeLine className="size-3.5 shrink-0" aria-hidden />
                      {dayLabel(day, today)} · {time ?? "全天"}
                    </span>
                    {e.location ? <span className="truncate text-caption text-fg-subtle">{e.location}</span> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="py-6 text-center text-body-sm text-fg-subtle">没有即将开始的日程</p>
      )}
    </ChartCard>
  );
}

/* ------------------------------------------------------------------- page */

export function CalendarTemplate() {
  const hydrated = useHydrated();
  const today = useMemo(() => (hydrated ? todayIn(getLocalTimeZone()) : FALLBACK_TODAY), [hydrated]);
  const nowKey = useMemo(() => {
    if (!hydrated) return `${FALLBACK_TODAY.toString()}T09:00`;
    const n = new Date();
    return `${today.toString()}T${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
  }, [hydrated, today]);

  const seeded = useMemo(() => buildEvents(today), [today]);
  const [added, setAdded] = useState<CalendarEvent[]>([]);
  const [removed, setRemoved] = useState<Set<string>>(() => new Set());
  const all = useMemo(() => [...seeded.filter((e) => !removed.has(e.id)), ...added], [seeded, added, removed]);

  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const visible = useMemo(() => all.filter((e) => !hidden.has(e.calendarId ?? "")), [all, hidden]);
  const counts = useMemo(() => all.reduce<Record<string, number>>((m, e) => ({ ...m, [e.calendarId ?? ""]: (m[e.calendarId ?? ""] ?? 0) + 1 }), {}), [all]);
  const todayCount = visible.filter((e) => parseStart(e).day.compare(today) === 0).length;

  const [date, setDate] = useState<CalendarDate>(FALLBACK_TODAY);
  useEffect(() => {
    if (hydrated) setDate(todayIn(getLocalTimeZone()));
  }, [hydrated]);

  const [creating, setCreating] = useState(false);

  return (
    <DashboardShell
      active="calendar"
      crumbs={["协作", "日程"]}
      title="日程"
      description="团队会议、发布节点与个人安排都在这里"
      actions={
        <>
          <Button variant="outline" tone="neutral" startIcon={<RiLinkM />}>
            订阅链接
          </Button>
          <Button startIcon={<RiAddLine />} onPress={() => setCreating(true)}>
            新建日程
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <aside className="order-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:order-1 lg:flex lg:w-72 lg:shrink-0 lg:flex-col">
          <MiniMonth date={date} onChange={setDate} todayCount={todayCount} />
          <div className="flex flex-col gap-4">
            <SourcesCard
              hidden={hidden}
              counts={counts}
              onToggle={(id, on) =>
                setHidden((prev) => {
                  const next = new Set(prev);
                  if (on) next.delete(id);
                  else next.add(id);
                  return next;
                })
              }
            />
            <UpcomingCard events={visible} today={today} nowKey={nowKey} onPick={setDate} />
          </div>
        </aside>
        <div className={cx("order-1 h-[640px] min-w-0 flex-1 lg:order-2 lg:sticky lg:top-2 lg:h-[calc(100dvh-10.5rem)] lg:min-h-[600px]")}>
          <EventCalendar
            events={visible}
            calendars={SOURCES}
            date={date}
            onDateChange={setDate}
            showCalendarFilter={false}
            showCreateButton={false}
            onCreate={(day) => {
              setDate(day);
              setCreating(true);
            }}
            hourCycle={24}
            dayStartHour={8}
            dayEndHour={21}
            eventActions={(event, close) => (
              <Button
                size="sm"
                variant="outline"
                tone="danger"
                startIcon={<RiDeleteBin6Line />}
                onPress={() => {
                  if (event.id.startsWith("new-")) setAdded((list) => list.filter((e) => e.id !== event.id));
                  else setRemoved((prev) => new Set(prev).add(event.id));
                  close();
                }}
              >
                删除
              </Button>
            )}
          />
        </div>
      </div>
      <NewEventModal isOpen={creating} onOpenChange={setCreating} initialDate={date} onSubmit={(e) => setAdded((list) => [...list, e])} />
    </DashboardShell>
  );
}
