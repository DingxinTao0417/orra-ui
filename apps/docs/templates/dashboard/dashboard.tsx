"use client";

import { useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { RiAddLine, RiArrowRightUpLine, RiDownload2Line, RiMoreLine } from "@remixicon/react";
import {
  AreaChart,
  Avatar,
  BarChart,
  BarList,
  Button,
  ChartCard,
  DateRangePicker,
  DonutChart,
  Dropdown,
  DropdownItem,
  IconButton,
  OrraProvider,
  Progress,
  StatCards,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  TableStatus,
  TableUser,
  useHydrated,
  type DateRangeValue,
} from "@orra-ui/react";
import { DashboardShell } from "@/templates/shared/dashboard-shell";
import { ACTIVITY, CHANNELS, GOALS, KPIS, ORDERS, ORDER_STATUS, REGIONS, REVENUE_MONTH, REVENUE_QUARTER, REVENUE_SUMMARY, REVENUE_YEAR, TOP_PRODUCTS } from "./data";

const yuan = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 });

const REVENUE_RANGES = [
  { id: "month", label: "近 30 天" },
  { id: "quarter", label: "本季度" },
  { id: "year", label: "全年" },
];
const REVENUE_DATA = { month: REVENUE_MONTH, quarter: REVENUE_QUARTER, year: REVENUE_YEAR } as const;

/** Date range + export + primary action: the same header actions on every dashboard-family page. */
function PageActions() {
  const hydrated = useHydrated();
  const [range, setRange] = useState<DateRangeValue | null>(null);
  // "Today" only exists in the browser: pick the default range after hydration.
  const value = range ?? (hydrated ? { start: today(getLocalTimeZone()).subtract({ days: 29 }), end: today(getLocalTimeZone()) } : null);
  return (
    <>
      <DateRangePicker aria-label="统计周期" value={value} onChange={setRange} className="w-full sm:w-auto" />
      <Button variant="outline" tone="neutral" startIcon={<RiDownload2Line />}>
        导出报表
      </Button>
      <Button startIcon={<RiAddLine />}>新建订单</Button>
    </>
  );
}

function CardMenu({ label }: { label: string }) {
  return (
    <Dropdown aria-label={label} placement="bottom end" trigger={<IconButton aria-label={label} icon={<RiMoreLine />} size="sm" />}>
      <DropdownItem id="detail">查看明细</DropdownItem>
      <DropdownItem id="export">导出 CSV</DropdownItem>
      <DropdownItem id="pin">固定到首页</DropdownItem>
    </Dropdown>
  );
}

function greeting(hydrated: boolean) {
  // The visitor's clock is only known in the browser: render a neutral greeting on the server.
  if (!hydrated) return "你好";
  const h = new Date().getHours();
  return h < 6 ? "夜深了" : h < 11 ? "早上好" : h < 14 ? "中午好" : h < 18 ? "下午好" : "晚上好";
}

export function DashboardTemplate() {
  const hydrated = useHydrated();
  const [range, setRange] = useState("month");
  const summary = REVENUE_SUMMARY[range]!;

  return (
    <OrraProvider locale="zh-CN">
      <DashboardShell
        active="dashboard"
        crumbs={["总览"]}
        title="经营总览"
        description={`${greeting(hydrated)}，依然。以下是 Orra 家居本月的经营情况，数据每 15 分钟更新一次。`}
        actions={<PageActions />}
      >
        <StatCards stats={KPIS} />

        <div className="grid grid-cols-12 gap-4 lg:gap-5">
          <ChartCard
            className="col-span-12 xl:col-span-8"
            title="营收趋势"
            description="已支付订单的含税金额，虚线为上一周期"
            value={summary.value}
            delta={summary.delta}
            deltaLabel={summary.label}
            ranges={REVENUE_RANGES}
            range={range}
            onRangeChange={setRange}
          >
            <AreaChart
              data={REVENUE_DATA[range as keyof typeof REVENUE_DATA]}
              index="month"
              valueFormat="currency"
              currency="CNY"
              gradient
              height={292}
              series={[
                { key: "current", label: "本期" },
                { key: "previous", label: "上一周期", comparison: true },
              ]}
              aria-label="营收趋势面积图"
            />
          </ChartCard>

          <ChartCard className="col-span-12 xl:col-span-4" title="渠道销售占比" description="本月各销售渠道的成交额" actions={<CardMenu label="渠道销售操作" />}>
            <div className="flex h-full items-center justify-center">
              <DonutChart data={CHANNELS} valueFormat="currency" currency="CNY" centerLabel="本月成交" centerValue="¥482.6 万" legend="bottom" showShare size={188} aria-label="渠道销售环形图" />
            </div>
          </ChartCard>

          <ChartCard
            className="col-span-12 xl:col-span-8"
            title="最近订单"
            description="全渠道实时订单，今日已成交 642 笔"
            actions={
              <Button size="sm" variant="plain" tone="neutral" endIcon={<RiArrowRightUpLine />}>
                查看全部
              </Button>
            }
          >
            <Table aria-label="最近订单" variant="plain" tableClassName="min-w-[680px]">
              <TableHeader>
                <TableColumn isRowHeader>客户</TableColumn>
                <TableColumn>商品</TableColumn>
                <TableColumn>渠道</TableColumn>
                <TableColumn align="end">金额</TableColumn>
                <TableColumn>状态</TableColumn>
                <TableColumn align="end">下单时间</TableColumn>
              </TableHeader>
              <TableBody items={ORDERS}>
                {(o) => (
                  <TableRow id={o.id}>
                    <TableCell>
                      <TableUser name={o.customer} description={`${o.id} · ${o.city}`} />
                    </TableCell>
                    <TableCell className="max-w-48 truncate">{o.product}</TableCell>
                    <TableCell muted>{o.channel}</TableCell>
                    <TableCell align="end" numeric className="font-medium">
                      {yuan.format(o.amount)}
                    </TableCell>
                    <TableCell>
                      <TableStatus tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</TableStatus>
                    </TableCell>
                    <TableCell align="end" muted>
                      {o.time}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ChartCard>

          <ChartCard className="col-span-12 md:col-span-6 xl:col-span-4" title="团队动态" description="各部门的最新进展" actions={<CardMenu label="团队动态操作" />}>
            <ol className="flex flex-col">
              {ACTIVITY.map((a, i) => (
                <li key={a.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < ACTIVITY.length - 1 ? <span aria-hidden className="absolute start-4 top-9 bottom-1 w-px bg-line" /> : null}
                  <Avatar name={a.name} size="sm" />
                  <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                    <p className="text-body-sm text-fg">
                      <span className="font-medium">{a.name}</span> <span className="text-fg-muted">{a.action}</span>
                    </p>
                    <p className="text-caption text-fg-subtle">
                      {a.target} · {a.time}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </ChartCard>

          <ChartCard className="col-span-12 md:col-span-6 xl:col-span-4" title="季度目标" description="Q4 关键结果的完成进度" footer="目标由管理层于 10 月 8 日设定，每周一复盘。">
            <div className="flex flex-col gap-5">
              {GOALS.map((g) => {
                const ratio = g.value / g.max;
                return (
                  <Progress
                    key={g.id}
                    label={g.label}
                    value={g.value}
                    maxValue={g.max}
                    tone={ratio >= 0.85 ? "success" : "accent"}
                    formatOptions={{ maximumFractionDigits: 1 }}
                    valueLabel={`${g.value} / ${g.max} ${g.unit}`}
                    description={g.note}
                  />
                );
              })}
            </div>
          </ChartCard>

          <ChartCard className="col-span-12 md:col-span-6 xl:col-span-4" title="热销商品" description="本月成交额 Top 7">
            <BarList data={TOP_PRODUCTS} valueFormat="currency" currency="CNY" aria-label="热销商品" />
          </ChartCard>

          <ChartCard className="col-span-12 md:col-span-6 xl:col-span-4" title="区域订单" description="本月各大区订单数，单位：笔">
            <BarChart
              data={REGIONS}
              index="region"
              type="stacked"
              orientation="horizontal"
              height={236}
              series={[
                { key: "online", label: "线上" },
                { key: "offline", label: "门店" },
              ]}
              aria-label="区域订单条形图"
            />
          </ChartCard>
        </div>
      </DashboardShell>
    </OrraProvider>
  );
}
