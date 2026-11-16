import type { BadgeTone, BarListDimension, FunnelStage, HeatmapCell, StatCardItem } from "@orra-ui/react";

/* Sample data for the marketing dashboard. Replace with your own API calls. */

export const KPIS: StatCardItem[] = [
  { id: "spend", label: "广告花费", value: 862400, format: "currency", currency: "CNY", delta: 0.068, deltaLabel: "较上期", trend: [58, 61, 63, 60, 66, 69, 71, 68, 74, 78, 81, 86] },
  { id: "leads", label: "新增线索", value: 12486, delta: 0.153, deltaLabel: "较上期", trend: [820, 860, 845, 902, 948, 991, 973, 1035, 1062, 1110, 1148, 1206] },
  { id: "cac", label: "获客成本 CAC", value: 69.1, format: { style: "currency", currency: "CNY", maximumFractionDigits: 1 }, delta: -0.073, invertDelta: true, deltaLabel: "较上期", trend: [78, 77, 76, 77, 75, 74, 74, 73, 72, 71, 70, 69] },
  { id: "roas", label: "广告回报 ROAS", value: "4.21x", delta: 0.092, deltaLabel: "较上期", description: "目标 4.0x", trend: [3.6, 3.7, 3.65, 3.8, 3.85, 3.9, 3.95, 4.0, 4.05, 4.1, 4.16, 4.21] },
];

export const FUNNELS: Record<string, FunnelStage[]> = {
  all: [
    { label: "新增线索", value: 12486 },
    { label: "市场合格线索", value: 7924 },
    { label: "销售跟进", value: 5214 },
    { label: "试用开通", value: 2386 },
    { label: "付费转化", value: 918 },
  ],
  paid: [
    { label: "新增线索", value: 7842 },
    { label: "市场合格线索", value: 4618 },
    { label: "销售跟进", value: 2905 },
    { label: "试用开通", value: 1268 },
    { label: "付费转化", value: 446 },
  ],
  organic: [
    { label: "新增线索", value: 4644 },
    { label: "市场合格线索", value: 3306 },
    { label: "销售跟进", value: 2309 },
    { label: "试用开通", value: 1118 },
    { label: "付费转化", value: 472 },
  ],
};

export const SPEND_ROAS = ["W37", "W38", "W39", "W40", "W41", "W42", "W43", "W44", "W45", "W46"].map((week, i) => ({
  week,
  search: [42, 44, 41, 46, 48, 45, 51, 53, 56, 58][i]! * 1000,
  social: [58, 61, 66, 63, 70, 74, 78, 92, 88, 95][i]! * 1000,
  kol: [18, 22, 20, 26, 24, 31, 34, 46, 38, 41][i]! * 1000,
  roas: [3.62, 3.71, 3.58, 3.84, 3.93, 3.88, 4.02, 4.36, 4.18, 4.21][i]!,
}));

export const SOURCES: BarListDimension[] = [
  {
    id: "channel",
    label: "渠道",
    data: [
      { label: "抖音信息流", value: 52860 },
      { label: "小红书笔记", value: 38420 },
      { label: "百度搜索", value: 31270 },
      { label: "微信公众号", value: 24180 },
      { label: "B 站 UP 主合作", value: 18650 },
      { label: "知乎问答", value: 9840 },
      { label: "自然搜索", value: 11180 },
    ],
  },
  {
    id: "region",
    label: "地域",
    data: [
      { label: "广东", value: 34120 },
      { label: "浙江", value: 27860 },
      { label: "上海", value: 25430 },
      { label: "北京", value: 22190 },
      { label: "江苏", value: 19870 },
      { label: "四川", value: 12460 },
      { label: "湖北", value: 9310 },
    ],
  },
  {
    id: "device",
    label: "设备",
    data: [
      { label: "iOS", value: 78420 },
      { label: "Android", value: 69310 },
      { label: "桌面浏览器", value: 32160 },
      { label: "微信小程序", value: 6510 },
    ],
  },
];

export const HEAT_ROWS = ["抖音", "小红书", "百度", "微信", "B 站", "知乎"];
export const HEAT_COLUMNS = ["0点", "2点", "4点", "6点", "8点", "10点", "12点", "14点", "16点", "18点", "20点", "22点"];
const PEAKS: Record<string, number[]> = {
  抖音: [5.1, 2.2, 0.8, 1.1, 2.6, 3.4, 4.8, 3.9, 3.6, 5.2, 7.8, 8.4],
  小红书: [3.2, 1.4, 0.5, 0.9, 2.4, 3.1, 4.6, 3.8, 3.4, 4.9, 6.9, 6.2],
  百度: [1.2, 0.6, 0.3, 0.8, 4.1, 6.4, 5.2, 6.1, 5.8, 4.2, 3.1, 2.0],
  微信: [2.1, 0.9, 0.4, 1.6, 4.8, 4.2, 5.6, 3.9, 3.7, 4.4, 5.2, 3.8],
  "B 站": [4.2, 2.6, 0.9, 0.6, 1.2, 1.9, 2.8, 2.6, 2.9, 4.1, 6.2, 7.1],
  知乎: [2.4, 1.1, 0.4, 0.5, 2.2, 3.6, 3.2, 3.4, 3.1, 3.0, 3.8, 4.1],
};
export const HEATMAP: HeatmapCell[] = HEAT_ROWS.flatMap((row) => HEAT_COLUMNS.map((column, i) => ({ row, column, value: PEAKS[row]![i]! })));

export type CampaignStatus = "live" | "paused" | "scheduled" | "ended";
export const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; tone: BadgeTone }> = {
  live: { label: "投放中", tone: "success" },
  paused: { label: "已暂停", tone: "warning" },
  scheduled: { label: "待开始", tone: "info" },
  ended: { label: "已结束", tone: "neutral" },
};

export interface Campaign {
  id: string;
  name: string;
  owner: string;
  channel: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  clicks: number;
  ctr: number;
  leads: number;
  roas: number;
}

export const CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "双 12 年终大促 · 预热", owner: "周以安", channel: "抖音信息流", status: "live", budget: 320000, spent: 214800, clicks: 68420, ctr: 0.031, leads: 3862, roas: 4.86 },
  { id: "c2", name: "冬季新品种草计划", owner: "唐语桐", channel: "小红书笔记", status: "live", budget: 180000, spent: 142300, clicks: 41260, ctr: 0.047, leads: 2914, roas: 5.12 },
  { id: "c3", name: "品牌词搜索保护", owner: "韩知远", channel: "百度搜索", status: "live", budget: 90000, spent: 61480, clicks: 23710, ctr: 0.082, leads: 1806, roas: 6.34 },
  { id: "c4", name: "UP 主测评合作 · 第三期", owner: "宋嘉言", channel: "B 站", status: "paused", budget: 120000, spent: 86200, clicks: 18630, ctr: 0.024, leads: 942, roas: 2.71 },
  { id: "c5", name: "公众号会员日推文", owner: "陈默", channel: "微信公众号", status: "ended", budget: 40000, spent: 39650, clicks: 12480, ctr: 0.056, leads: 1124, roas: 3.92 },
  { id: "c6", name: "行业白皮书获客", owner: "林依然", channel: "知乎问答", status: "live", budget: 60000, spent: 22940, clicks: 6870, ctr: 0.038, leads: 688, roas: 3.18 },
  { id: "c7", name: "元旦跨年直播专场", owner: "周以安", channel: "抖音直播", status: "scheduled", budget: 260000, spent: 0, clicks: 0, ctr: 0, leads: 0, roas: 0 },
];
