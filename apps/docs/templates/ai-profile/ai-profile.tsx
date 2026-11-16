"use client";

import { useMemo, useState } from "react";
import {
  RiCalendarLine,
  RiChat3Line,
  RiCodeSSlashLine,
  RiCpuLine,
  RiFireLine,
  RiGitMergeLine,
  RiMapPinLine,
  RiMore2Line,
  RiPencilLine,
  RiShareForwardLine,
  RiTimerLine,
  RiTrophyLine,
} from "@remixicon/react";
import {
  AgentLimits,
  AreaChart,
  Avatar,
  Badge,
  BarList,
  Button,
  ChartCard,
  DonutChart,
  Dropdown,
  DropdownItem,
  HeatmapChart,
  IconButton,
  StatCards,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  TableStatus,
  useHydrated,
  type StatCardItem,
} from "@orra-ui/react";
import { DashboardShell } from "@/templates/shared/dashboard-shell";
import {
  ACHIEVEMENTS,
  LANGS,
  MODELS,
  PROJECTS,
  SESSIONS,
  buildHeatmap,
  buildTokens,
  type SessionResult,
  type TokenRange,
} from "./ai-profile-data";

/** Fixed anchor for server render / hydration; swapped for the real "today" after mount. */
const ANCHOR = new Date(2026, 10, 15);

function useAnchor() {
  const hydrated = useHydrated();
  return useMemo(() => {
    if (!hydrated) return ANCHOR;
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, [hydrated]);
}

const compact = new Intl.NumberFormat("zh-CN", { notation: "compact", maximumFractionDigits: 1 });

const RESULT: Record<SessionResult, { label: string; tone: "success" | "accent" | "warning" | "neutral" }> = {
  merged: { label: "已合并", tone: "success" },
  running: { label: "进行中", tone: "accent" },
  review: { label: "待评审", tone: "warning" },
  dropped: { label: "已放弃", tone: "neutral" },
};

/* ----------------------------------------------------------------- header */

function ProfileHeader() {
  return (
    <section className="flex flex-col gap-5 rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start gap-4">
        <Avatar name="林依然" src="/avatars/kianna-vaccaro.svg" size="xl" status="online" />
        <div className="order-3 flex min-w-0 basis-full flex-col gap-1.5 sm:order-2 sm:basis-0 sm:flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-title font-semibold text-fg">林依然</h2>
            <span className="text-body-sm text-fg-subtle">@yiran</span>
            <Badge size="sm" tone="accent" icon={<RiTrophyLine />}>
              Pro 方案
            </Badge>
          </div>
          <p className="text-body-sm text-fg-muted">全栈工程师 · 负责组件库与计费服务，习惯先让 AI 写测试再写实现。</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-fg-subtle">
            <span className="flex items-center gap-1">
              <RiMapPinLine className="size-3.5" aria-hidden />
              上海 · UTC+8
            </span>
            <span className="flex items-center gap-1">
              <RiCalendarLine className="size-3.5" aria-hidden />
              2024 年 3 月开始使用
            </span>
            <span className="flex items-center gap-1">
              <RiFireLine className="size-3.5 text-warning" aria-hidden />
              当前连续 19 天
            </span>
          </div>
        </div>
        <div className="order-2 ms-auto flex items-center gap-2 sm:order-3">
          <Button size="sm" variant="outline" tone="neutral" startIcon={<RiPencilLine />}>
            编辑资料
          </Button>
          <Dropdown trigger={<IconButton size="sm" variant="outline" icon={<RiMore2Line />} aria-label="更多" />} placement="bottom end">
            <DropdownItem id="public">公开档案</DropdownItem>
            <DropdownItem id="export">导出 CSV</DropdownItem>
            <DropdownItem id="reset" tone="danger">
              清空使用记录
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 border-t border-line pt-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-caption text-fg-subtle">常用语言</p>
          <div className="flex h-2 overflow-hidden rounded-full bg-surface-muted" role="img" aria-label={LANGS.map((l) => `${l.label} ${Math.round(l.share * 100)}%`).join("，")}>
            {LANGS.map((l, i) => (
              <span key={l.label} style={{ width: `${l.share * 100}%`, background: `var(--color-chart-${i + 1})` }} />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {LANGS.map((l, i) => (
              <li key={l.label} className="flex items-center gap-1.5 text-caption text-fg-muted">
                <span className="size-2 rounded-full" style={{ background: `var(--color-chart-${i + 1})` }} aria-hidden />
                {l.label}
                <span className="tabular-nums text-fg-subtle">{Math.round(l.share * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-caption text-fg-subtle">成就</p>
          <ul className="flex flex-wrap gap-2">
            {ACHIEVEMENTS.map((a) => (
              <li key={a.id} className="flex items-center gap-2 rounded-control border border-line px-2.5 py-1.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-accent-50 text-accent-600" aria-hidden>
                  <RiTrophyLine className="size-3.5" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-caption font-medium text-fg">{a.label}</span>
                  <span className="text-micro text-fg-subtle">{a.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const STATS: StatCardItem[] = [
  { id: "sessions", label: "本月会话", value: 312, previous: 268, icon: <RiChat3Line />, trend: [18, 22, 15, 26, 24, 29, 31, 27, 33, 30, 36, 41] },
  { id: "tokens", label: "本月 Token", value: 38_600_000, format: "compact", previous: 31_200_000, icon: <RiCpuLine />, trend: [2.1, 2.4, 2.2, 2.9, 3.1, 2.8, 3.4, 3.6, 3.3, 3.9, 4.1, 4.4] },
  { id: "lines", label: "采纳代码行", value: 18_420, previous: 15_910, icon: <RiCodeSSlashLine />, trend: [980, 1120, 1040, 1310, 1290, 1420, 1510, 1480, 1630, 1590, 1720, 1810] },
  {
    id: "saved",
    label: "预计节省时长",
    value: "46 小时",
    delta: 0.18,
    icon: <RiTimerLine />,
    trend: [2.4, 2.9, 2.6, 3.4, 3.2, 3.8, 4.1, 3.9, 4.4, 4.2, 4.8, 5.1],
  },
];

/* --------------------------------------------------------------- sections */

function ActivityHeatmap({ anchor }: { anchor: Date }) {
  const data = useMemo(() => buildHeatmap(anchor), [anchor]);
  const total = data.reduce((s, d) => s + d.value, 0);
  const active = data.filter((d) => d.value > 0).length;
  return (
    <ChartCard title="使用热力图" description="过去一年每天的 AI 会话数" value={`${total.toLocaleString("zh-CN")} 次会话`} deltaLabel={`${active} 个活跃日`}>
      <HeatmapChart variant="calendar" data={data} valueLabel="会话" aria-label="过去一年每日 AI 会话热力图" legendStart="最长连续使用 46 天" />
    </ChartCard>
  );
}

function TokensCard({ anchor }: { anchor: Date }) {
  const [range, setRange] = useState<TokenRange>("30d");
  const data = useMemo(() => buildTokens(anchor, range), [anchor, range]);
  const sum = data.reduce((s, r) => s + r.输入 + r.输出 + r.缓存命中, 0);
  return (
    <ChartCard
      className="lg:col-span-8"
      title="Token 用量"
      description="输入、输出与缓存命中"
      value={compact.format(sum)}
      delta={range === "30d" ? 0.237 : range === "12w" ? 0.312 : 0.584}
      deltaLabel="较上一周期"
      ranges={[
        { id: "30d", label: "30 天" },
        { id: "12w", label: "12 周" },
        { id: "12m", label: "12 个月" },
      ]}
      range={range}
      onRangeChange={(r) => setRange(r as TokenRange)}
    >
      <AreaChart
        data={data}
        height={248}
        type="stacked"
        valueFormat="compact"
        series={[
          { key: "输入", label: "输入" },
          { key: "输出", label: "输出" },
          { key: "缓存命中", label: "缓存命中" },
        ]}
      />
    </ChartCard>
  );
}

function ModelsCard() {
  const total = MODELS.reduce((s, m) => s + m.value, 0);
  return (
    <ChartCard className="lg:col-span-4" title="模型分布" description="按 Token 计，本年度">
      <div className="flex flex-1 items-center justify-center">
        <DonutChart data={MODELS} size={168} legend="bottom" valueFormat="compact" centerLabel="总计" centerValue={compact.format(total)} />
      </div>
    </ChartCard>
  );
}

function ProjectsCard() {
  return (
    <ChartCard className="lg:col-span-7" title="常用项目" description="按本年度 Token 用量排序">
      <BarList
        data={PROJECTS.map((p) => ({
          key: p.key,
          label: (
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{p.label}</span>
              <Badge size="sm" variant="outline">
                {p.lang}
              </Badge>
            </span>
          ),
          value: p.value,
          icon: <RiGitMergeLine />,
        }))}
        valueFormat="compact"
        labelHeading="项目"
        valueHeading="Token"
        limit={5}
        aria-label="常用项目"
      />
    </ChartCard>
  );
}

function LimitsCard() {
  return (
    <AgentLimits
      className="lg:col-span-5"
      title="本月额度"
      plan="Pro"
      quotas={[
        { id: "premium", label: "高级模型请求", used: 1_820, limit: 2_500, unit: "次", description: "12 月 1 日重置" },
        { id: "tokens", label: "Token 总量", used: 3_860, limit: 5_000, unit: "万", description: "超出后自动切换到 Lite 模型" },
        { id: "agents", label: "后台代理运行时长", used: 41, limit: 60, unit: "小时", description: "并行代理最多 3 个" },
      ]}
      onUpgrade={() => {}}
      upgradeLabel="升级到团队版"
      upgradeHint="额度提升 4 倍，含共享知识库"
    />
  );
}

function SessionsCard() {
  return (
    <ChartCard
      title="最近会话"
      description="最近 7 天内的编程会话"
      actions={
        <Button size="sm" variant="outline" tone="neutral" startIcon={<RiShareForwardLine />}>
          查看全部
        </Button>
      }
    >
      <Table aria-label="最近会话" variant="plain" tableClassName="min-w-[760px]">
        <TableHeader>
          <TableColumn isRowHeader>会话</TableColumn>
          <TableColumn>项目</TableColumn>
          <TableColumn>模型</TableColumn>
          <TableColumn align="end">Token</TableColumn>
          <TableColumn align="end">时长</TableColumn>
          <TableColumn>结果</TableColumn>
          <TableColumn align="end">时间</TableColumn>
        </TableHeader>
        <TableBody items={SESSIONS}>
          {(s) => (
            <TableRow id={s.id}>
              <TableCell>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium text-fg">{s.title}</span>
                  <span className="text-caption text-fg-subtle">
                    #{s.id} · 改动 {s.files} 个文件
                  </span>
                </span>
              </TableCell>
              <TableCell muted>{s.project}</TableCell>
              <TableCell>
                <Badge size="sm" variant="outline">
                  {s.model}
                </Badge>
              </TableCell>
              <TableCell align="end" numeric>
                {compact.format(s.tokens)}
              </TableCell>
              <TableCell align="end" muted>
                {s.duration}
              </TableCell>
              <TableCell>
                <TableStatus tone={RESULT[s.result].tone}>{RESULT[s.result].label}</TableStatus>
              </TableCell>
              <TableCell align="end" muted>
                {s.when}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ChartCard>
  );
}

/* ------------------------------------------------------------------- page */

export function AiProfileTemplate() {
  const anchor = useAnchor();
  return (
    <DashboardShell
      active="ai-profile"
      crumbs={["协作", "AI 使用档案"]}
      title="AI 使用档案"
      description="你和 AI 编程助手的协作记录：会话、Token、模型与项目"
      actions={
        <>
          <Button variant="outline" tone="neutral" startIcon={<RiShareForwardLine />}>
            分享档案
          </Button>
          <Button startIcon={<RiChat3Line />}>新建会话</Button>
        </>
      }
    >
      <ProfileHeader />
      <StatCards stats={STATS} columns={4} />
      <ActivityHeatmap anchor={anchor} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <TokensCard anchor={anchor} />
        <ModelsCard />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <ProjectsCard />
        <LimitsCard />
      </div>
      <SessionsCard />
    </DashboardShell>
  );
}
