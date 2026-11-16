"use client";

import { useState, type ReactNode } from "react";
import type { Key } from "react-aria-components";
import {
  RiAlarmWarningLine,
  RiCalendarCheckLine,
  RiCapsuleLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiDownload2Line,
  RiDropLine,
  RiErrorWarningLine,
  RiFileList3Line,
  RiHeartPulseLine,
  RiInformationLine,
  RiMapPin2Line,
  RiMore2Line,
  RiMoonClearLine,
  RiPhoneLine,
  RiPrinterLine,
  RiShareLine,
  RiStethoscopeLine,
  RiTimeLine,
  RiVideoChatLine,
} from "@remixicon/react";
import {
  Avatar,
  Badge,
  BarChart,
  Button,
  ChartCard,
  Checkbox,
  Dropdown,
  DropdownItem,
  GaugeChart,
  IconButton,
  RingsChart,
  SegmentedControl,
  Select,
  SelectItem,
  Sparkline,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  TableStatus,
} from "@orra-ui/react";
import { cx } from "@orra-ui/react/lib/cx";
import { DashboardShell } from "@/templates/shared/dashboard-shell";
import {
  ALERTS,
  APPOINTMENTS,
  LAB_PANELS,
  MEDICATIONS,
  PATIENT,
  RINGS,
  SLEEP,
  STEPS,
  VITALS,
  type HealthAlert,
  type LabResult,
  type VitalTone,
} from "./medical-data";

const TONE_TEXT: Record<VitalTone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

const TONE_SOFT: Record<VitalTone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

const TONE_COLOR: Record<VitalTone, string> = {
  success: "var(--color-chart-1)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-chart-2)",
};

/* ------------------------------------------------------------ patient card */

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-caption text-fg-subtle">{label}</dt>
      <dd className="truncate text-body-sm font-medium text-fg">{children}</dd>
    </div>
  );
}

function PatientCard() {
  const bmi = PATIENT.weight / (PATIENT.height / 100) ** 2;
  return (
    <ChartCard
      className="lg:col-span-4"
      title="患者信息"
      description={`档案号 ${PATIENT.id}`}
      actions={
        <Dropdown trigger={<IconButton size="sm" icon={<RiMore2Line />} aria-label="更多操作" />} placement="bottom end">
          <DropdownItem id="print" icon={<RiPrinterLine />}>
            打印档案
          </DropdownItem>
          <DropdownItem id="share" icon={<RiShareLine />}>
            授权给医生
          </DropdownItem>
          <DropdownItem id="call" icon={<RiPhoneLine />}>
            联系紧急联系人
          </DropdownItem>
        </Dropdown>
      }
    >
      <div className="flex items-center gap-4">
        <Avatar name={PATIENT.name} src="/avatars/livia-saris.svg" size="xl" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-title font-semibold text-fg">{PATIENT.name}</p>
          <p className="text-body-sm text-fg-muted">
            {PATIENT.gender} · {PATIENT.age} 岁 · {PATIENT.blood}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge size="sm" tone="accent">
              VIP 家庭医生
            </Badge>
            <Badge size="sm" tone="success" dot>
              设备已同步
            </Badge>
          </div>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        <InfoRow label="身高">{PATIENT.height} cm</InfoRow>
        <InfoRow label="体重">{PATIENT.weight} kg</InfoRow>
        <InfoRow label="BMI">{bmi.toFixed(1)}</InfoRow>
        <InfoRow label="出生日期">{PATIENT.birthday}</InfoRow>
        <InfoRow label="主治医生">{PATIENT.doctor}</InfoRow>
        <InfoRow label="科室">{PATIENT.department}</InfoRow>
        <InfoRow label="医保类型">{PATIENT.insurance}</InfoRow>
        <InfoRow label="紧急联系人">{PATIENT.contact}</InfoRow>
      </dl>
      <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="me-1 text-caption text-fg-subtle">过敏史</span>
          {PATIENT.allergies.map((a) => (
            <Badge key={a} size="sm" tone="danger" icon={<RiErrorWarningLine />}>
              {a}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="me-1 text-caption text-fg-subtle">慢病管理</span>
          {PATIENT.conditions.map((c) => (
            <Badge key={c} size="sm" tone="warning">
              {c}
            </Badge>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------ vitals */

function VitalsCard() {
  const [range, setRange] = useState("week");
  return (
    <ChartCard
      className="lg:col-span-8"
      title="生命体征"
      description="来自智能手表与家用血压计，每日早晨自动同步"
      actions={
        <SegmentedControl
          size="sm"
          aria-label="时间范围"
          value={range}
          onChange={setRange}
          options={[
            { id: "week", label: "7 天" },
            { id: "month", label: "30 天" },
          ]}
        />
      }
    >
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {VITALS.map((v) => {
          const data = range === "week" ? v.week : v.month;
          return (
            <li key={v.id} className="flex flex-col gap-3 rounded-menu border border-line bg-surface-muted/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-body-sm text-fg-muted">{v.label}</span>
                <Badge size="sm" tone={v.tone} dot>
                  {v.status}
                </Badge>
              </div>
              <div className="flex items-end justify-between gap-3">
                <p className="flex items-baseline gap-1">
                  <span className="text-title-lg font-semibold tabular-nums text-fg">{v.value}</span>
                  <span className="text-caption text-fg-subtle">{v.unit}</span>
                </p>
                <Sparkline
                  data={data}
                  width={104}
                  height={34}
                  variant="area"
                  color={TONE_COLOR[v.tone]}
                  aria-label={`${v.label}${range === "week" ? "近 7 天" : "近 30 天"}趋势`}
                />
              </div>
              <p className="text-caption text-fg-subtle">参考范围 {v.range}</p>
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}

/* --------------------------------------------------------------- activity */

function ActivityCard() {
  const done = RINGS.filter((r) => r.value >= r.goal).length;
  return (
    <ChartCard title="今日活动" description="三环目标，按小时累计" footer={<p className="text-body-sm text-fg-muted">已完成 {done} / 3 个目标，再快走 15 分钟即可合拢活动环。</p>}>
      <div className="flex justify-center">
        <RingsChart data={RINGS} size={156} thickness={13} legend="bottom">
          <span className="text-caption text-fg-subtle">步数</span>
          <span className="text-title font-semibold tabular-nums text-fg">7,264</span>
        </RingsChart>
      </div>
    </ChartCard>
  );
}

function SleepCard() {
  const total = SLEEP.stages.reduce((s, x) => s + x.minutes, 0);
  return (
    <ChartCard title="昨晚睡眠" description={`${SLEEP.bedtime} 入睡 · ${SLEEP.wake} 起床`} actions={<Badge tone="success">良好</Badge>}>
      <div className="flex flex-col gap-4">
        <GaugeChart
          value={SLEEP.score}
          variant="three-quarter"
          size={220}
          label={<span className="flex items-center gap-1"><RiMoonClearLine className="size-3.5" aria-hidden />睡眠评分</span>}
          thresholds={[
            { value: 0, tone: "danger" },
            { value: 60, tone: "warning" },
            { value: 75, tone: "success" },
          ]}
          target={85}
          showRange={false}
        />
        <div className="flex flex-col gap-2">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-muted" role="img" aria-label="睡眠分期占比">
            {SLEEP.stages.map((s) => (
              <span key={s.label} className="h-full first:rounded-s-full last:rounded-e-full" style={{ width: `${(s.minutes / total) * 100}%`, background: s.color }} />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {SLEEP.stages.map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-caption">
                <span className="size-2 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                <span className="text-fg-muted">{s.label}</span>
                <span className="ms-auto tabular-nums text-fg">
                  {Math.floor(s.minutes / 60) ? `${Math.floor(s.minutes / 60)}h ` : ""}
                  {s.minutes % 60}m
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ChartCard>
  );
}

function StepsCard({ className }: { className?: string }) {
  const total = STEPS.reduce((s, d) => s + d.本周, 0);
  const last = STEPS.reduce((s, d) => s + d.上周, 0);
  return (
    <ChartCard
      className={className}
      title="每周步数"
      description="目标每天 8,000 步"
      value={total.toLocaleString("zh-CN")}
      delta={(total - last) / last}
      deltaLabel="较上周"
    >
      <BarChart
        data={STEPS}
        height={204}
        series={[
          { key: "本周", label: "本周" },
          { key: "上周", label: "上周", comparison: true, color: "var(--color-chart-1)" },
        ]}
        valueFormat="compact"
        barSize={14}
      />
    </ChartCard>
  );
}

/* ------------------------------------------------------------ medications */

function MedicationsCard() {
  const [taken, setTaken] = useState<Set<string>>(() => new Set(["m1"]));
  return (
    <ChartCard
      title="今日用药"
      description={`已服 ${taken.size} / ${MEDICATIONS.length} 项`}
      actions={<Button size="sm" variant="plain" tone="neutral" startIcon={<RiCapsuleLine />}>处方</Button>}
    >
      <ul className="-mx-2 flex flex-col">
        {MEDICATIONS.map((m) => {
          const isTaken = taken.has(m.id);
          return (
            <li key={m.id} className="flex items-start gap-3 rounded-control px-2 py-2.5 transition-colors duration-150 hover:bg-surface-hover">
              <Checkbox
                aria-label={`${m.name}已服用`}
                isSelected={isTaken}
                onChange={(on) =>
                  setTaken((prev) => {
                    const next = new Set(prev);
                    if (on) next.add(m.id);
                    else next.delete(m.id);
                    return next;
                  })
                }
                className="mt-0.5"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className={cx("truncate text-body-sm font-medium", isTaken ? "text-fg-subtle line-through" : "text-fg")}>{m.name}</p>
                  <span className="shrink-0 text-caption tabular-nums text-fg-subtle">{m.time}</span>
                </div>
                <p className="text-caption text-fg-muted">
                  {m.dose} · {m.schedule}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <span
                      className={cx("block h-full rounded-full", m.remaining / m.total < 0.25 ? "bg-warning" : "bg-accent-500")}
                      style={{ width: `${(m.remaining / m.total) * 100}%` }}
                    />
                  </span>
                  <span className={cx("text-micro tabular-nums", m.note ? "text-warning" : "text-fg-subtle")}>
                    {m.note ?? `余 ${m.remaining} / ${m.total}`}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}

/* ----------------------------------------------------------- appointments */

const KIND_ICON = { 复诊: <RiStethoscopeLine />, 检查: <RiFileList3Line />, 线上: <RiVideoChatLine /> };

function AppointmentsCard() {
  return (
    <ChartCard
      title="近期预约"
      description="已为你同步到日程"
      actions={
        <Button size="sm" variant="plain" tone="neutral" startIcon={<RiCalendarCheckLine />}>
          全部
        </Button>
      }
    >
      <ul className="flex flex-col gap-2.5">
        {APPOINTMENTS.map((a, i) => (
          <li key={a.id} className={cx("flex gap-3 rounded-menu border p-3", i === 0 ? "border-accent-200 bg-accent-50/60" : "border-line")}>
            <div className={cx("flex w-12 shrink-0 flex-col items-center justify-center rounded-control py-1.5", i === 0 ? "bg-accent-500 text-fg-on-accent" : "bg-surface-muted text-fg")}>
              <span className="text-micro opacity-80">{a.month}</span>
              <span className="text-title-sm font-semibold tabular-nums">{a.day}</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-body-sm font-medium text-fg">{a.title}</p>
                <Badge size="sm" tone={a.kind === "线上" ? "info" : a.kind === "检查" ? "neutral" : "accent"} icon={KIND_ICON[a.kind]}>
                  {a.kind}
                </Badge>
              </div>
              <p className="flex items-center gap-1 text-caption text-fg-muted">
                <RiTimeLine className="size-3.5 shrink-0" aria-hidden />
                {a.weekday} {a.time} · {a.doctor}
              </p>
              <p className="flex items-center gap-1 truncate text-caption text-fg-subtle">
                <RiMapPin2Line className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{a.place}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}

/* ----------------------------------------------------------------- alerts */

const ALERT_ICON: Record<HealthAlert["tone"], ReactNode> = {
  danger: <RiAlarmWarningLine />,
  warning: <RiErrorWarningLine />,
  info: <RiInformationLine />,
  success: <RiCheckboxCircleLine />,
};

function AlertsCard({ className }: { className?: string }) {
  const [alerts, setAlerts] = useState(ALERTS);
  return (
    <ChartCard
      className={className}
      title="健康提醒"
      description={alerts.length ? `${alerts.length} 条待查看` : "暂无新提醒"}
      actions={
        alerts.length ? (
          <Button size="sm" variant="plain" tone="neutral" onPress={() => setAlerts([])}>
            全部已读
          </Button>
        ) : null
      }
    >
      {alerts.length ? (
        <ul className="flex flex-col gap-2.5">
          {alerts.map((a) => (
            <li key={a.id} className="flex gap-3 rounded-menu border border-line p-3">
              <span className={cx("flex size-8 shrink-0 items-center justify-center rounded-full [&>svg]:size-4", TONE_SOFT[a.tone])} aria-hidden>
                {ALERT_ICON[a.tone]}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-body-sm font-medium text-fg">{a.title}</p>
                  <IconButton
                    size="sm"
                    icon={<RiCloseLine />}
                    aria-label={`忽略「${a.title}」`}
                    className="-me-1.5 -mt-1.5"
                    onPress={() => setAlerts((list) => list.filter((x) => x.id !== a.id))}
                  />
                </div>
                <p className="text-caption text-fg-muted">{a.detail}</p>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="text-micro text-fg-subtle">{a.time}</span>
                  {a.action ? (
                    <Button size="sm" variant="soft" tone={a.tone === "danger" ? "danger" : "neutral"} className="-mb-0.5">
                      {a.action}
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-success-soft text-success">
            <RiCheckboxCircleLine className="size-5" aria-hidden />
          </span>
          <p className="text-body-sm text-fg-muted">一切正常，继续保持。</p>
        </div>
      )}
    </ChartCard>
  );
}

/* ------------------------------------------------------------ lab results */

function labStatus(r: LabResult): { label: string; tone: "success" | "warning" | "danger" } {
  if (r.value < r.low) return { label: "偏低", tone: r.value < r.low * 0.7 ? "danger" : "warning" };
  if (r.value > r.high) return { label: "偏高", tone: r.value > r.high * 1.3 ? "danger" : "warning" };
  return { label: "正常", tone: "success" };
}

function LabResultsCard() {
  const [panelId, setPanelId] = useState<Key | null>(LAB_PANELS[0]!.id);
  const panel = LAB_PANELS.find((p) => p.id === panelId) ?? LAB_PANELS[0]!;
  const abnormal = panel.results.filter((r) => labStatus(r).tone !== "success").length;
  return (
    <ChartCard
      title="检验结果"
      description={`${panel.label} · ${panel.date} · ${abnormal} 项异常`}
      actions={
        <>
          <Select aria-label="选择检验报告" size="sm" items={LAB_PANELS} selectedKey={panelId} onSelectionChange={setPanelId} triggerClassName="w-44">
            {(p) => (
              <SelectItem id={p.id} meta={p.date.slice(5)}>
                {p.label}
              </SelectItem>
            )}
          </Select>
          <IconButton size="sm" variant="outline" icon={<RiDownload2Line />} aria-label="下载报告 PDF" />
        </>
      }
    >
      <Table aria-label={`${panel.label}检验结果`} variant="plain" density="compact" tableClassName="min-w-[600px]">
        <TableHeader>
          <TableColumn isRowHeader>项目</TableColumn>
          <TableColumn align="end">结果</TableColumn>
          <TableColumn>参考范围</TableColumn>
          <TableColumn>状态</TableColumn>
          <TableColumn align="end">近 5 次</TableColumn>
        </TableHeader>
        <TableBody items={panel.results}>
          {(r) => {
            const s = labStatus(r);
            return (
              <TableRow id={r.id}>
                <TableCell>
                  <span className="flex flex-col">
                    <span className="font-medium text-fg">{r.name}</span>
                    <span className="text-caption text-fg-subtle">{r.code}</span>
                  </span>
                </TableCell>
                <TableCell align="end" numeric>
                  <span className={cx("font-medium", s.tone === "success" ? "text-fg" : TONE_TEXT[s.tone])}>{r.value}</span>
                  <span className="ms-1 text-caption text-fg-subtle">{r.unit}</span>
                </TableCell>
                <TableCell muted numeric>
                  {r.low > 0 ? `${r.low} – ${r.high}` : `< ${r.high}`}
                </TableCell>
                <TableCell>
                  <TableStatus tone={s.tone}>{s.label}</TableStatus>
                </TableCell>
                <TableCell align="end">
                  <Sparkline data={r.history} width={80} height={24} color={s.tone === "success" ? "var(--color-chart-1)" : TONE_COLOR[s.tone]} showMinMax={false} />
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------- page */

export function MedicalProfileTemplate() {
  return (
    <DashboardShell
      active="medical-profile"
      crumbs={["健康档案"]}
      title="健康档案"
      description="个人健康数据、用药与检查记录 · 数据仅你与授权医生可见"
      actions={
        <>
          <Button variant="outline" tone="neutral" startIcon={<RiDownload2Line />}>
            导出报告
          </Button>
          <Button startIcon={<RiHeartPulseLine />}>记录体征</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <PatientCard />
        <VitalsCard />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ActivityCard />
        <SleepCard />
        <StepsCard className="md:col-span-2 xl:col-span-1" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MedicationsCard />
        <AppointmentsCard />
        <AlertsCard className="md:col-span-2 xl:col-span-1" />
      </div>
      <LabResultsCard />
      <p className="flex items-center gap-1.5 text-caption text-fg-subtle">
        <RiDropLine className="size-3.5" aria-hidden />
        本页数据为示例，仅用于演示，不构成医疗建议。
      </p>
    </DashboardShell>
  );
}
