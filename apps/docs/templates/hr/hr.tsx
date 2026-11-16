"use client";

import { useMemo, useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { RiAddLine, RiDownload2Line, RiMailLine, RiMoreLine, RiUserSearchLine } from "@remixicon/react";
import {
  Avatar,
  Badge,
  BarChart,
  Button,
  ChartCard,
  DateRangePicker,
  DonutChart,
  Dropdown,
  DropdownItem,
  FunnelChart,
  IconButton,
  OrraProvider,
  Pagination,
  Progress,
  RadarChart,
  SearchField,
  Select,
  SelectItem,
  StatCards,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableEmptyState,
  TableHeader,
  TableRow,
  TableStatus,
  TableUser,
  useHydrated,
  type BadgeTone,
  type DateRangeValue,
} from "@orra-ui/react";
import { DashboardShell } from "@/templates/shared/dashboard-shell";
import { DEPARTMENTS, EMPLOYEES, EMPLOYEE_STATUS, ENGAGEMENT, FLOW_TREND, KPIS, NEW_HIRES, PIPELINES, PIPELINE_SUMMARY, TEAMS, type Employee } from "./data";

const PAGE_SIZE = 8;
const RATING_TONE: Record<Employee["rating"], BadgeTone> = { S: "accent", A: "success", B: "neutral", C: "warning", "—": "neutral" };

/** Date range + export + primary action: the same header actions on every dashboard-family page. */
function PageActions() {
  const hydrated = useHydrated();
  const [range, setRange] = useState<DateRangeValue | null>(null);
  // "Today" only exists in the browser: pick the default range after hydration.
  const value = range ?? (hydrated ? { start: today(getLocalTimeZone()).subtract({ months: 3 }), end: today(getLocalTimeZone()) } : null);
  return (
    <>
      <DateRangePicker aria-label="统计周期" value={value} onChange={setRange} className="w-full sm:w-auto" />
      <Button variant="outline" tone="neutral" startIcon={<RiDownload2Line />}>
        导出花名册
      </Button>
      <Button startIcon={<RiAddLine />}>发布职位</Button>
    </>
  );
}

function CardMenu({ label }: { label: string }) {
  return (
    <Dropdown aria-label={label} placement="bottom end" trigger={<IconButton aria-label={label} icon={<RiMoreLine />} size="sm" />}>
      <DropdownItem id="detail">查看明细</DropdownItem>
      <DropdownItem id="export">导出 CSV</DropdownItem>
      <DropdownItem id="share">分享给部门负责人</DropdownItem>
    </Dropdown>
  );
}

function Employees() {
  const [department, setDepartment] = useState<string | number | null>(DEPARTMENTS[0]!);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EMPLOYEES.filter(
      (e) =>
        (department === DEPARTMENTS[0] || e.department === department) &&
        (!q || e.name.includes(q) || e.title.toLowerCase().includes(q) || e.email.includes(q) || e.id.toLowerCase().includes(q)),
    );
  }, [department, query]);
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <ChartCard
      className="col-span-12"
      title="员工名册"
      description="全体员工的岗位、汇报关系与最近一次绩效"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label="部门"
            size="sm"
            selectedKey={department}
            onSelectionChange={(k) => {
              setDepartment(k);
              setPage(1);
            }}
            className="w-32"
          >
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} id={d}>
                {d}
              </SelectItem>
            ))}
          </Select>
          <SearchField
            aria-label="搜索员工"
            placeholder="姓名、职位或工号"
            size="sm"
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            className="w-full sm:w-56"
          />
        </div>
      }
      footer={<Pagination total={rows.length} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} showSummary size="sm" />}
    >
      <Table aria-label="员工名册" variant="plain" tableClassName="min-w-[920px]">
        <TableHeader>
          <TableColumn isRowHeader>员工</TableColumn>
          <TableColumn>部门 / 职位</TableColumn>
          <TableColumn>职级</TableColumn>
          <TableColumn>直属上级</TableColumn>
          <TableColumn>入职日期</TableColumn>
          <TableColumn>状态</TableColumn>
          <TableColumn align="center">绩效</TableColumn>
          <TableColumn align="end">
            <span className="sr-only">操作</span>
          </TableColumn>
        </TableHeader>
        <TableBody items={pageRows} renderEmptyState={() => <TableEmptyState icon={<RiUserSearchLine />} title="没有找到员工" description="换个关键词，或选择「全部部门」。" />}>
          {(e) => (
            <TableRow id={e.id}>
              <TableCell>
                <TableUser name={e.name} description={e.email} />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-fg">{e.title}</span>
                  <span className="text-caption text-fg-subtle">{e.department}</span>
                </div>
              </TableCell>
              <TableCell muted numeric>
                {e.level}
              </TableCell>
              <TableCell muted>{e.manager}</TableCell>
              <TableCell muted numeric>
                {e.joined}
              </TableCell>
              <TableCell>
                <TableStatus tone={EMPLOYEE_STATUS[e.status].tone}>{EMPLOYEE_STATUS[e.status].label}</TableStatus>
              </TableCell>
              <TableCell align="center">
                {e.rating === "—" ? <span className="text-fg-subtle">—</span> : <Badge tone={RATING_TONE[e.rating]} square size="sm">{e.rating}</Badge>}
              </TableCell>
              <TableCell align="end">
                <div className="flex justify-end gap-1">
                  <IconButton aria-label={`给${e.name}发邮件`} icon={<RiMailLine />} size="sm" />
                  <CardMenu label={`${e.name}的更多操作`} />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ChartCard>
  );
}

export function HrTemplate() {
  const [team, setTeam] = useState("all");
  const summary = PIPELINE_SUMMARY[team]!;

  return (
    <OrraProvider locale="zh-CN">
      <DashboardShell
        active="hr"
        crumbs={["人力"]}
        title="人力概览"
        description="团队规模、招聘进度与员工敬业度，花名册每日凌晨同步。"
        actions={<PageActions />}
      >
        <StatCards stats={KPIS} />

        <div className="grid grid-cols-12 gap-4 lg:gap-5">
          <ChartCard
            className="col-span-12 xl:col-span-8"
            title="招聘管道"
            description="本季度各阶段候选人数，百分比为相对上一阶段的通过率"
            value={summary.value}
            delta={summary.delta}
            deltaInvert
            deltaLabel="平均招聘周期 · 较上季度"
            ranges={[
              { id: "all", label: "全部" },
              { id: "rd", label: "研发" },
              { id: "product", label: "产品" },
              { id: "sales", label: "销售" },
            ]}
            range={team}
            onRangeChange={setTeam}
          >
            <div className="overflow-x-auto">
              <FunnelChart data={PIPELINES[team]} variant="bars" height={220} className="min-w-[560px]" aria-label="招聘管道" />
            </div>
          </ChartCard>

          <ChartCard className="col-span-12 xl:col-span-4" title="团队分布" description="按部门统计的在职人数" actions={<CardMenu label="团队分布操作" />}>
            <div className="flex h-full items-center justify-center">
              <DonutChart data={TEAMS} centerLabel="在职员工" centerValue="486 人" legend="bottom" showShare size={176} aria-label="团队分布环形图" />
            </div>
          </ChartCard>

          <ChartCard className="col-span-12 md:col-span-6 xl:col-span-4" title="敬业度调研" description="11 月季度脉搏调研，回收率 92%" actions={<CardMenu label="敬业度调研操作" />}>
            <RadarChart
              data={ENGAGEMENT}
              index="topic"
              max={100}
              height={268}
              series={[
                { key: "current", label: "本季" },
                { key: "previous", label: "上季", comparison: true },
              ]}
              aria-label="敬业度雷达图"
            />
          </ChartCard>

          <ChartCard className="col-span-12 md:col-span-6 xl:col-span-4" title="人员流动" description="近 12 个月每月入职与离职人数" value="+55 人" delta={0.128} deltaLabel="净增 · 同比">
            <BarChart
              data={FLOW_TREND}
              index="month"
              height={224}
              barSize={10}
              series={[
                { key: "hires", label: "入职" },
                { key: "exits", label: "离职", color: "var(--color-chart-5)" },
              ]}
              aria-label="人员流动柱状图"
            />
          </ChartCard>

          <ChartCard
            className="col-span-12 xl:col-span-4"
            title="新入职"
            description="本月 5 位新同事 · 入职引导进度"
            actions={
              <Button size="sm" variant="plain" tone="neutral">
                全部
              </Button>
            }
          >
            <ul className="flex flex-col gap-4">
              {NEW_HIRES.map((h) => (
                <li key={h.id} className="flex items-center gap-3">
                  <Avatar name={h.name} size="md" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-body-sm font-medium text-fg">
                        {h.name} <span className="font-normal text-fg-subtle">· {h.role}</span>
                      </span>
                      <span className="shrink-0 text-caption text-fg-subtle tabular-nums">{h.start}</span>
                    </div>
                    {h.onboarding > 0 ? (
                      <Progress aria-label={`${h.name}入职引导进度`} value={h.onboarding} size="sm" showValue={false} tone={h.onboarding >= 70 ? "success" : "accent"} />
                    ) : (
                      <span className="text-caption text-fg-subtle">待入职 · 设备与账号已准备</span>
                    )}
                    <span className="text-caption text-fg-subtle">{h.team}</span>
                  </div>
                </li>
              ))}
            </ul>
          </ChartCard>

          <Employees />
        </div>
      </DashboardShell>
    </OrraProvider>
  );
}
