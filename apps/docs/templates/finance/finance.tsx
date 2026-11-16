"use client";

import { useMemo, useState } from "react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { RiAddLine, RiArrowLeftDownLine, RiArrowRightUpLine, RiDownload2Line, RiFileList3Line, RiMoreLine } from "@remixicon/react";
import {
  Avatar,
  BarChart,
  Button,
  ChartCard,
  DateRangePicker,
  DonutChart,
  Dropdown,
  DropdownItem,
  IconButton,
  Meter,
  OrraProvider,
  Pagination,
  SankeyChart,
  SearchField,
  SegmentedControl,
  Select,
  SelectItem,
  Sparkline,
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
import { ACCOUNTS, BUDGETS, CASH_FLOW, CASH_MONTHLY, CASH_QUARTERLY, CATEGORIES, KPIS, SPENDING, TRANSACTIONS, TXN_STATUS } from "./data";

const yuan = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 });
const signed = (v: number) => `${v > 0 ? "+" : "−"}${yuan.format(Math.abs(v))}`;

const PAGE_SIZE = 6;

/** Date range + export + primary action: the same header actions on every dashboard-family page. */
function PageActions() {
  const hydrated = useHydrated();
  const [range, setRange] = useState<DateRangeValue | null>(null);
  // "Today" only exists in the browser: pick the default range after hydration.
  const value = range ?? (hydrated ? { start: today(getLocalTimeZone()).set({ day: 1 }), end: today(getLocalTimeZone()) } : null);
  return (
    <>
      <DateRangePicker aria-label="统计周期" value={value} onChange={setRange} className="w-full sm:w-auto" />
      <Button variant="outline" tone="neutral" startIcon={<RiDownload2Line />}>
        导出报表
      </Button>
      <Button startIcon={<RiAddLine />}>记一笔</Button>
    </>
  );
}

function CardMenu({ label }: { label: string }) {
  return (
    <Dropdown aria-label={label} placement="bottom end" trigger={<IconButton aria-label={label} icon={<RiMoreLine />} size="sm" />}>
      <DropdownItem id="detail">查看明细</DropdownItem>
      <DropdownItem id="export">导出 CSV</DropdownItem>
      <DropdownItem id="share">分享给财务团队</DropdownItem>
    </Dropdown>
  );
}

function Transactions() {
  const [kind, setKind] = useState("all");
  const [category, setCategory] = useState<string | number | null>(CATEGORIES[0]!);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = query.trim();
    return TRANSACTIONS.filter(
      (t) =>
        (kind === "all" || (kind === "in" ? t.amount > 0 : t.amount < 0)) &&
        (category === CATEGORIES[0] || t.category === category) &&
        (!q || t.counterparty.includes(q) || t.memo.includes(q) || t.id.includes(q)),
    );
  }, [kind, category, query]);
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  return (
    <ChartCard
      className="col-span-12 xl:col-span-8"
      title="交易明细"
      description="所有银行与第三方账户的流水，按入账时间倒序"
      actions={
        <Button size="sm" variant="outline" tone="neutral" startIcon={<RiDownload2Line />}>
          导出流水
        </Button>
      }
      footer={<Pagination total={rows.length} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} showSummary size="sm" />}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            aria-label="收支类型"
            size="sm"
            value={kind}
            onChange={resetPage(setKind)}
            options={[
              { id: "all", label: "全部" },
              { id: "in", label: "收入" },
              { id: "out", label: "支出" },
            ]}
          />
          <Select aria-label="分类" size="sm" selectedKey={category} onSelectionChange={resetPage(setCategory)} className="w-36">
            {CATEGORIES.map((c) => (
              <SelectItem key={c} id={c}>
                {c}
              </SelectItem>
            ))}
          </Select>
          <SearchField aria-label="搜索交易" placeholder="搜索对方户名、摘要或单号" size="sm" value={query} onChange={resetPage(setQuery)} className="w-full sm:ms-auto sm:w-64" />
        </div>
        <Table aria-label="交易明细" variant="plain" tableClassName="min-w-[720px]">
          <TableHeader>
            <TableColumn isRowHeader>对方 / 摘要</TableColumn>
            <TableColumn>分类</TableColumn>
            <TableColumn>账户</TableColumn>
            <TableColumn>状态</TableColumn>
            <TableColumn align="end">日期</TableColumn>
            <TableColumn align="end">金额</TableColumn>
          </TableHeader>
          <TableBody
            items={pageRows}
            renderEmptyState={() => <TableEmptyState icon={<RiFileList3Line />} title="没有符合条件的交易" description="试试切换收支类型或清空搜索关键词。" />}
          >
            {(t) => (
              <TableRow id={t.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span
                      className={cx(
                        "grid size-8 shrink-0 place-items-center rounded-full [&>svg]:size-4",
                        t.amount > 0 ? "bg-success-soft text-success" : "bg-surface-muted text-fg-muted",
                      )}
                    >
                      {t.amount > 0 ? <RiArrowLeftDownLine /> : <RiArrowRightUpLine />}
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-fg">{t.counterparty}</span>
                      <span className="truncate text-caption text-fg-subtle">{t.memo}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell muted>{t.category}</TableCell>
                <TableCell muted>{t.account}</TableCell>
                <TableCell>
                  <TableStatus tone={TXN_STATUS[t.status].tone}>{TXN_STATUS[t.status].label}</TableStatus>
                </TableCell>
                <TableCell align="end" muted numeric>
                  {t.date}
                </TableCell>
                <TableCell align="end" numeric className={cx("font-medium", t.amount > 0 ? "text-success" : "text-fg")}>
                  {signed(t.amount)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  );
}

export function FinanceTemplate() {
  const [period, setPeriod] = useState("month");
  const cash = period === "month" ? CASH_MONTHLY : CASH_QUARTERLY;

  return (
    <OrraProvider locale="zh-CN">
      <DashboardShell
        active="finance"
        crumbs={["财务"]}
        title="财务中心"
        description="现金、收支与预算的统一视图，银行流水每小时自动对账。"
        actions={<PageActions />}
      >
        <StatCards stats={KPIS} />

        <div className="grid grid-cols-12 gap-4 lg:gap-5">
          <ChartCard
            className="col-span-12 xl:col-span-8"
            title="收入与支出"
            description="按入账口径统计，含税"
            value={period === "month" ? "¥123.5 万" : "¥219.0 万"}
            delta={period === "month" ? 0.296 : 0.084}
            deltaLabel={period === "month" ? "本月净现金流 · 较上月" : "本季净现金流 · 较上季同期"}
            ranges={[
              { id: "month", label: "按月" },
              { id: "quarter", label: "按季度" },
            ]}
            range={period}
            onRangeChange={setPeriod}
          >
            <BarChart
              data={cash}
              index="month"
              valueFormat="currency"
              currency="CNY"
              height={276}
              series={[
                { key: "income", label: "收入", color: "var(--color-chart-1)" },
                { key: "expense", label: "支出", color: "var(--color-chart-5)" },
              ]}
              aria-label="收入与支出柱状图"
            />
          </ChartCard>

          <ChartCard
            className="col-span-12 xl:col-span-4"
            title="账户余额"
            description="5 个账户 · 近 8 周走势"
            actions={<CardMenu label="账户余额操作" />}
            footer={
              <div className="flex items-center justify-between">
                <span>合计</span>
                <span className="font-semibold tabular-nums text-fg">{yuan.format(ACCOUNTS.reduce((s, a) => s + a.balance, 0))}</span>
              </div>
            }
          >
            <ul className="flex flex-col divide-y divide-line">
              {ACCOUNTS.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar name={a.bank} initials={a.bank.slice(0, 1)} square size="md" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-body-sm font-medium text-fg">{a.bank}</span>
                    <span className="truncate text-caption text-fg-subtle">{a.name}</span>
                  </div>
                  <Sparkline data={a.trend} width={56} height={24} color="trend" aria-label={`${a.bank}近 8 周余额走势`} />
                  <span className="min-w-24 text-end text-body-sm font-medium tabular-nums text-fg">{yuan.format(a.balance)}</span>
                </li>
              ))}
            </ul>
          </ChartCard>

          <ChartCard
            className="col-span-12 xl:col-span-8"
            title="现金流向"
            description="本月经营现金的来源与去向，单位：万元"
            actions={<CardMenu label="现金流向操作" />}
          >
            <div className="overflow-x-auto">
              <SankeyChart data={CASH_FLOW} height={340} showValues valueFormat={(v) => `${v.toLocaleString("zh-CN")} 万`} className="min-w-[560px]" aria-label="现金流向桑基图" />
            </div>
          </ChartCard>

          <ChartCard className="col-span-12 md:col-span-6 xl:col-span-4" title="支出构成" description="本月支出按费用类别" actions={<CardMenu label="支出构成操作" />}>
            <div className="flex h-full items-center justify-center">
              <DonutChart data={SPENDING} valueFormat="currency" currency="CNY" centerLabel="本月支出" centerValue="¥268.5 万" legend="bottom" showShare size={176} aria-label="支出构成环形图" />
            </div>
          </ChartCard>

          <ChartCard
            className="col-span-12 md:col-span-6 xl:col-span-4"
            title="部门预算"
            description="11 月预算执行情况，单位：万元"
            footer="预算使用超过 85% 时会自动提醒部门负责人。"
          >
            <div className="flex flex-col gap-5">
              {BUDGETS.map((b) => (
                <Meter
                  key={b.id}
                  label={b.label}
                  value={b.used}
                  maxValue={b.total}
                  thresholds={{ warning: 0.85, critical: 1 }}
                  accentWhenOk
                  description={b.note}
                  labels={{ critical: b.used > b.total ? "已超支" : "已用完", warning: "接近上限" }}
                />
              ))}
            </div>
          </ChartCard>

          <Transactions />
        </div>
      </DashboardShell>
    </OrraProvider>
  );
}
