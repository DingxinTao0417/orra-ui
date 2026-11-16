"use client";

import { useMemo, useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { RiAddLine, RiDownload2Line, RiMegaphoneLine, RiMoreLine } from "@remixicon/react";
import {
  Avatar,
  BarList,
  Button,
  ChartCard,
  ComboChart,
  DateRangePicker,
  Dropdown,
  DropdownItem,
  FunnelChart,
  HeatmapChart,
  IconButton,
  OrraProvider,
  Progress,
  SearchField,
  SegmentedControl,
  StatCards,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableEmptyState,
  TableHeader,
  TableRow,
  TableStatus,
  useHydrated,
  type DateRangeValue,
} from "@orra-ui/react";
import { cx } from "@orra-ui/react/lib/cx";
import { DashboardShell } from "@/templates/shared/dashboard-shell";
import { CAMPAIGNS, CAMPAIGN_STATUS, FUNNELS, HEATMAP, HEAT_COLUMNS, HEAT_ROWS, KPIS, SOURCES, SPEND_ROAS, type CampaignStatus } from "./data";

const yuan = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 });
const int = new Intl.NumberFormat("zh-CN");
const pct = new Intl.NumberFormat("zh-CN", { style: "percent", maximumFractionDigits: 1 });

const FUNNEL_SUMMARY: Record<string, { value: string; delta: number }> = {
  all: { value: "7.4%", delta: 0.118 },
  paid: { value: "5.7%", delta: 0.064 },
  organic: { value: "10.2%", delta: 0.212 },
};

/** Date range + export + primary action: the same header actions on every dashboard-family page. */
function PageActions() {
  const hydrated = useHydrated();
  const [range, setRange] = useState<DateRangeValue | null>(null);
  // "Today" only exists in the browser: pick the default range after hydration.
  const value = range ?? (hydrated ? { start: today(getLocalTimeZone()).subtract({ days: 27 }), end: today(getLocalTimeZone()) } : null);
  return (
    <>
      <DateRangePicker aria-label="统计周期" value={value} onChange={setRange} className="w-full sm:w-auto" />
      <Button variant="outline" tone="neutral" startIcon={<RiDownload2Line />}>
        导出报表
      </Button>
      <Button startIcon={<RiAddLine />}>新建活动</Button>
    </>
  );
}

function CardMenu({ label }: { label: string }) {
  return (
    <Dropdown aria-label={label} placement="bottom end" trigger={<IconButton aria-label={label} icon={<RiMoreLine />} size="sm" />}>
      <DropdownItem id="detail">查看明细</DropdownItem>
      <DropdownItem id="export">导出 CSV</DropdownItem>
      <DropdownItem id="alert">设置异常提醒</DropdownItem>
    </Dropdown>
  );
}

const STATUS_FILTERS = [
  { id: "all", label: "全部" },
  { id: "live", label: "投放中" },
  { id: "paused", label: "已暂停" },
  { id: "scheduled", label: "待开始" },
  { id: "ended", label: "已结束" },
];

function Campaigns() {
  const [status, setStatus] = useState<"all" | CampaignStatus>("all");
  const [query, setQuery] = useState("");
  const rows = useMemo(
    () => CAMPAIGNS.filter((c) => (status === "all" || c.status === status) && (!query.trim() || c.name.includes(query.trim()) || c.channel.includes(query.trim()) || c.owner.includes(query.trim()))),
    [status, query],
  );
  const live = CAMPAIGNS.filter((c) => c.status === "live").length;

  return (
    <ChartCard
      className="col-span-12"
      title="投放活动"
      description={`共 ${CAMPAIGNS.length} 个活动，${live} 个正在投放`}
      actions={<SearchField aria-label="搜索活动" placeholder="搜索活动、渠道或负责人" size="sm" value={query} onChange={setQuery} className="w-full sm:w-64" />}
    >
      <div className="flex flex-col gap-4">
        <div className="-mx-1 overflow-x-auto px-1">
          <SegmentedControl aria-label="按状态筛选" size="sm" value={status} onChange={(v) => setStatus(v as typeof status)} options={STATUS_FILTERS} />
        </div>
        <Table aria-label="投放活动" variant="plain" tableClassName="min-w-[960px]">
          <TableHeader>
            <TableColumn isRowHeader>活动</TableColumn>
            <TableColumn>负责人</TableColumn>
            <TableColumn>状态</TableColumn>
            <TableColumn>预算消耗</TableColumn>
            <TableColumn align="end">点击</TableColumn>
            <TableColumn align="end">点击率</TableColumn>
            <TableColumn align="end">线索</TableColumn>
            <TableColumn align="end">ROAS</TableColumn>
            <TableColumn align="end">
              <span className="sr-only">操作</span>
            </TableColumn>
          </TableHeader>
          <TableBody items={rows} renderEmptyState={() => <TableEmptyState icon={<RiMegaphoneLine />} title="没有匹配的活动" description="换个关键词，或切换到「全部」状态。" />}>
            {(c) => {
              const ratio = c.budget ? c.spent / c.budget : 0;
              const empty = c.status === "scheduled";
              return (
                <TableRow id={c.id}>
                  <TableCell>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-fg">{c.name}</span>
                      <span className="truncate text-caption text-fg-subtle">{c.channel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar name={c.owner} size="xs" />
                      <span className="text-fg-muted">{c.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TableStatus tone={CAMPAIGN_STATUS[c.status].tone}>{CAMPAIGN_STATUS[c.status].label}</TableStatus>
                  </TableCell>
                  <TableCell>
                    <div className="flex w-44 flex-col gap-1.5">
                      <div className="flex justify-between text-caption tabular-nums">
                        <span className="text-fg">{yuan.format(c.spent)}</span>
                        <span className="text-fg-subtle">/ {yuan.format(c.budget)}</span>
                      </div>
                      <Progress aria-label={`${c.name}预算消耗`} value={ratio * 100} size="sm" tone={ratio > 0.95 ? "warning" : "accent"} showValue={false} />
                    </div>
                  </TableCell>
                  <TableCell align="end" numeric muted={empty}>
                    {empty ? "—" : int.format(c.clicks)}
                  </TableCell>
                  <TableCell align="end" numeric muted={empty}>
                    {empty ? "—" : pct.format(c.ctr)}
                  </TableCell>
                  <TableCell align="end" numeric muted={empty}>
                    {empty ? "—" : int.format(c.leads)}
                  </TableCell>
                  <TableCell align="end" numeric className={cx("font-medium", !empty && c.roas >= 4 ? "text-success" : !empty && c.roas < 3 ? "text-danger" : "")}>
                    {empty ? "—" : `${c.roas.toFixed(2)}x`}
                  </TableCell>
                  <TableCell align="end">
                    <CardMenu label={`${c.name}操作`} />
                  </TableCell>
                </TableRow>
              );
            }}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  );
}

export function MarketingTemplate() {
  const [segment, setSegment] = useState("all");
  const funnel = FUNNEL_SUMMARY[segment]!;

  return (
    <OrraProvider locale="zh-CN">
      <DashboardShell
        active="marketing"
        crumbs={["营销"]}
        title="营销增长"
        description="投放花费、渠道质量与转化效率，近 4 周数据。"
        actions={<PageActions />}
      >
        <StatCards stats={KPIS} />

        <div className="grid grid-cols-12 gap-4 lg:gap-5">
          <ChartCard
            className="col-span-12 xl:col-span-8"
            title="获客漏斗"
            description="从新增线索到付费客户的逐级转化，百分比为相对上一阶段"
            value={funnel.value}
            delta={funnel.delta}
            deltaLabel="线索到付费 · 较上期"
            ranges={[
              { id: "all", label: "全部" },
              { id: "paid", label: "付费投放" },
              { id: "organic", label: "自然流量" },
            ]}
            range={segment}
            onRangeChange={setSegment}
          >
            <div className="overflow-x-auto">
              <FunnelChart data={FUNNELS[segment]} height={232} className="min-w-[560px]" aria-label="获客漏斗" />
            </div>
          </ChartCard>

          <ChartCard className="col-span-12 xl:col-span-4" title="流量来源" description="近 4 周访问量，按维度切换" actions={<CardMenu label="流量来源操作" />}>
            <BarList dimensions={SOURCES} limit={6} showShare sort aria-label="流量来源" />
          </ChartCard>

          <ChartCard
            className="col-span-12 xl:col-span-7"
            title="花费与 ROAS"
            description="每周各类型投放花费（柱）与广告回报（线）"
            value="¥86.2 万"
            delta={0.068}
            deltaLabel="近 4 周花费 · 较上期"
            actions={<CardMenu label="花费与 ROAS 操作" />}
          >
            <ComboChart
              data={SPEND_ROAS}
              index="week"
              stacked
              height={280}
              barFormat="currency"
              currency="CNY"
              lineFormat={(v) => `${v.toFixed(1)}x`}
              lineDomain={[3, 4.6]}
              barSeries={[
                { key: "search", label: "搜索" },
                { key: "social", label: "社交信息流" },
                { key: "kol", label: "达人合作" },
              ]}
              lineSeries={[{ key: "roas", label: "ROAS", color: "var(--color-chart-5)" }]}
              aria-label="花费与 ROAS 组合图"
            />
          </ChartCard>

          <ChartCard className="col-span-12 xl:col-span-5" title="渠道分时转化" description="各渠道在一天中不同时段的线索转化率（%）" actions={<CardMenu label="渠道分时转化操作" />}>
            <div className="overflow-x-auto">
              <HeatmapChart
                data={HEATMAP}
                rows={HEAT_ROWS}
                columns={HEAT_COLUMNS}
                columnLabelEvery={2}
                cellHeight={36}
                valueLabel="转化率"
                valueFormat={(v) => `${v.toFixed(1)}%`}
                legendStart="晚间 20–24 点是社交渠道的黄金时段"
                className="min-w-[420px]"
                aria-label="渠道分时转化热力图"
              />
            </div>
          </ChartCard>

          <Campaigns />
        </div>
      </DashboardShell>
    </OrraProvider>
  );
}
