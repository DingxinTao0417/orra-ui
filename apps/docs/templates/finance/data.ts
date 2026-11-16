import type { BadgeTone, ChartSlice, SankeyChartData, StatCardItem } from "@orra-ui/react";

/* Sample data for the finance dashboard. Amounts are in CNY. Replace with your own API calls. */

export const KPIS: StatCardItem[] = [
  { id: "balance", label: "账户总余额", value: 12846200, format: "currency", currency: "CNY", delta: 0.058, deltaLabel: "较上月末", trend: [1062, 1088, 1074, 1119, 1146, 1132, 1168, 1201, 1197, 1226, 1251, 1285] },
  { id: "income", label: "本月收入", value: 3920400, format: "currency", currency: "CNY", delta: 0.112, deltaLabel: "较上月", trend: [301, 318, 296, 334, 342, 329, 351, 348, 366, 371, 379, 392] },
  { id: "expense", label: "本月支出", value: 2684900, format: "currency", currency: "CNY", delta: 0.047, invertDelta: true, deltaLabel: "较上月", trend: [238, 241, 246, 244, 251, 249, 255, 258, 254, 261, 263, 268] },
  { id: "runway", label: "现金跑道", value: "18.6 个月", delta: 0.074, deltaLabel: "较上季度", description: "按近 3 个月平均净支出测算", trend: [15.2, 15.6, 15.9, 16.1, 16.4, 16.8, 17.0, 17.3, 17.7, 18.0, 18.2, 18.6] },
];

export const ACCOUNTS = [
  { id: "cmb", bank: "招商银行", name: "基本户 0821", balance: 5642200, trend: [598, 604, 611, 607, 615, 622, 619, 628] },
  { id: "icbc", bank: "工商银行", name: "一般户 4417", balance: 3120800, trend: [286, 292, 288, 301, 297, 305, 309, 312] },
  { id: "alipay", bank: "支付宝", name: "企业账户", balance: 1846300, trend: [214, 198, 206, 189, 193, 178, 181, 185] },
  { id: "wx", bank: "微信支付", name: "商户号 1608", balance: 642300, trend: [52, 58, 61, 57, 63, 66, 62, 64] },
  { id: "usd", bank: "中国银行", name: "美元户 $221,860", balance: 1594600, trend: [148, 151, 149, 153, 155, 154, 158, 159] },
];

const MONTHS = ["12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月"];
const INCOME = [312, 298, 264, 331, 342, 356, 348, 361, 352, 368, 351, 392];
const EXPENSE = [246, 271, 238, 249, 252, 261, 257, 266, 259, 264, 256, 268];
export const CASH_MONTHLY = MONTHS.map((month, i) => ({ month, income: INCOME[i]! * 10000, expense: EXPENSE[i]! * 10000 }));
export const CASH_QUARTERLY = [
  { month: "25 Q4", income: 9020000, expense: 7280000 },
  { month: "26 Q1", income: 8930000, expense: 7580000 },
  { month: "26 Q2", income: 10460000, expense: 7700000 },
  { month: "26 Q3", income: 10810000, expense: 7890000 },
  { month: "26 Q4", income: 7430000, expense: 5240000 },
];

export const CASH_FLOW: SankeyChartData = {
  nodes: [
    { name: "订阅收入" },
    { name: "项目交付" },
    { name: "渠道分成" },
    { name: "利息收益" },
    { name: "经营现金", color: "var(--color-chart-7)" },
    { name: "人力成本" },
    { name: "云服务与软件" },
    { name: "市场投放" },
    { name: "租赁与行政" },
    { name: "税费" },
    { name: "净现金流入", color: "var(--color-success)" },
  ],
  links: [
    { source: "订阅收入", target: "经营现金", value: 218 },
    { source: "项目交付", target: "经营现金", value: 106 },
    { source: "渠道分成", target: "经营现金", value: 52 },
    { source: "利息收益", target: "经营现金", value: 16 },
    { source: "经营现金", target: "人力成本", value: 142 },
    { source: "经营现金", target: "云服务与软件", value: 38 },
    { source: "经营现金", target: "市场投放", value: 46 },
    { source: "经营现金", target: "租赁与行政", value: 24 },
    { source: "经营现金", target: "税费", value: 19 },
    { source: "经营现金", target: "净现金流入", value: 123 },
  ],
};

export const SPENDING: ChartSlice[] = [
  { label: "人力成本", value: 1420600 },
  { label: "市场投放", value: 462800 },
  { label: "云服务与软件", value: 381500 },
  { label: "租赁与行政", value: 238400 },
  { label: "差旅招待", value: 96200 },
  { label: "其他", value: 85400 },
];

export const BUDGETS = [
  { id: "rd", label: "研发中心", used: 186.4, total: 240, note: "GPU 算力续费已计入" },
  { id: "mkt", label: "市场部", used: 92.8, total: 100, note: "双 12 投放追加 ¥8 万待审批" },
  { id: "sales", label: "销售部", used: 61.2, total: 90, note: "华南大客户差旅集中在下旬" },
  { id: "ops", label: "行政与采购", used: 38.5, total: 36, note: "办公室扩租导致超支" },
  { id: "legal", label: "财务与法务", used: 14.2, total: 18, note: "年审费用已于 11 月 6 日支付" },
  { id: "cs", label: "客户成功", used: 21.6, total: 40, note: "进度正常" },
];

export type TxnStatus = "settled" | "pending" | "review" | "failed";
export const TXN_STATUS: Record<TxnStatus, { label: string; tone: BadgeTone }> = {
  settled: { label: "已入账", tone: "success" },
  pending: { label: "处理中", tone: "info" },
  review: { label: "待审批", tone: "warning" },
  failed: { label: "已退回", tone: "danger" },
};

export interface Txn {
  id: string;
  date: string;
  counterparty: string;
  memo: string;
  category: string;
  account: string;
  amount: number;
  status: TxnStatus;
}

export const CATEGORIES = ["全部分类", "订阅收入", "项目交付", "人力成本", "市场投放", "云服务与软件", "租赁与行政", "税费"];

export const TRANSACTIONS: Txn[] = [
  { id: "T-261115-07", date: "11-15", counterparty: "杭州云帆科技有限公司", memo: "年度订阅 · 企业版 120 席", category: "订阅收入", account: "招商银行 0821", amount: 286000, status: "settled" },
  { id: "T-261115-03", date: "11-15", counterparty: "巨量引擎", memo: "抖音信息流预充值", category: "市场投放", account: "支付宝企业账户", amount: -120000, status: "pending" },
  { id: "T-261114-12", date: "11-14", counterparty: "阿里云计算有限公司", memo: "11 月 ECS 与 OSS 账单", category: "云服务与软件", account: "招商银行 0821", amount: -64380, status: "settled" },
  { id: "T-261114-08", date: "11-14", counterparty: "深圳拓维智造集团", memo: "数据中台二期 · 第 2 期款", category: "项目交付", account: "工商银行 4417", amount: 420000, status: "settled" },
  { id: "T-261113-15", date: "11-13", counterparty: "上海静安写字楼管理处", memo: "12 月租金及物业费", category: "租赁与行政", account: "工商银行 4417", amount: -98600, status: "review" },
  { id: "T-261112-02", date: "11-12", counterparty: "国家税务总局", memo: "10 月增值税及附加", category: "税费", account: "招商银行 0821", amount: -186240, status: "settled" },
  { id: "T-261112-01", date: "11-12", counterparty: "北京知行教育科技", memo: "团队版续费 · 35 席", category: "订阅收入", account: "支付宝企业账户", amount: 41580, status: "settled" },
  { id: "T-261111-09", date: "11-11", counterparty: "Figma, Inc.", memo: "设计工具年费 · USD 4,320", category: "云服务与软件", account: "中国银行 美元户", amount: -31110, status: "failed" },
  { id: "T-261110-04", date: "11-10", counterparty: "11 月工资发放", memo: "全员 486 人 · 含社保公积金", category: "人力成本", account: "招商银行 0821", amount: -1386200, status: "settled" },
  { id: "T-261109-06", date: "11-09", counterparty: "小红书广告平台", memo: "冬季新品种草合作", category: "市场投放", account: "支付宝企业账户", amount: -56000, status: "settled" },
];
