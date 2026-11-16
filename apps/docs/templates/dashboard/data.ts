import type { BadgeTone, ChartSlice, StatCardItem } from "@orra-ui/react";

/* Sample data for the company home dashboard. Replace with your own API calls. */

export const KPIS: StatCardItem[] = [
  { id: "revenue", label: "本月营收", value: 4826300, format: "currency", currency: "CNY", delta: 0.124, deltaLabel: "较上月", trend: [312, 338, 326, 351, 372, 365, 398, 412, 405, 438, 451, 482] },
  { id: "orders", label: "订单数", value: 18642, delta: 0.086, deltaLabel: "较上月", trend: [1320, 1402, 1388, 1451, 1497, 1530, 1512, 1588, 1621, 1655, 1702, 1764] },
  { id: "aov", label: "客单价", value: 258.9, format: { style: "currency", currency: "CNY", maximumFractionDigits: 1 }, delta: 0.035, deltaLabel: "较上月", trend: [242, 246, 244, 249, 251, 248, 253, 252, 255, 256, 257, 259] },
  { id: "customers", label: "新增客户", value: 3284, delta: -0.042, deltaLabel: "较上月", trend: [312, 298, 305, 288, 296, 281, 276, 284, 271, 268, 274, 262] },
];

const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const THIS_YEAR = [318, 296, 352, 371, 398, 426, 412, 437, 455, 471, 483, null];
const LAST_YEAR = [262, 241, 288, 301, 322, 338, 331, 352, 360, 389, 401, 446];

export const REVENUE_YEAR = MONTHS.map((m, i) => ({
  month: m,
  current: THIS_YEAR[i] == null ? null : THIS_YEAR[i]! * 10000,
  previous: LAST_YEAR[i]! * 10000,
}));

/** Last 30 days, daily revenue (¥). */
export const REVENUE_MONTH = Array.from({ length: 30 }, (_, i) => {
  // 10/17 → 11/15; 11/11 is the shopping festival peak.
  const day = new Date(2026, 9, 17 + i);
  const weekend = day.getDay() === 0 || day.getDay() === 6;
  const base = 148000 + i * 1300 + Math.round(Math.sin(i / 2.3) * 9000);
  return {
    month: `${day.getMonth() + 1}/${String(day.getDate()).padStart(2, "0")}`,
    current: base + (weekend ? 26000 : 0) + (i === 25 ? 64000 : i === 24 ? 22000 : 0),
    previous: Math.round(base * 0.9) + (weekend ? 19000 : 0),
  };
});

export const REVENUE_QUARTER = ["第 1 周", "第 2 周", "第 3 周", "第 4 周", "第 5 周", "第 6 周", "第 7 周", "第 8 周", "第 9 周", "第 10 周", "第 11 周", "第 12 周", "第 13 周"].map((w, i) => ({
  month: w,
  current: 960000 + i * 21000 + Math.round(Math.cos(i / 1.6) * 64000) + (i === 6 ? 380000 : 0),
  previous: 880000 + i * 16000 + Math.round(Math.sin(i / 1.9) * 52000),
}));

export const REVENUE_SUMMARY: Record<string, { value: string; delta: number; label: string }> = {
  month: { value: "¥482.6 万", delta: 0.124, label: "较上月同期" },
  quarter: { value: "¥1,402.8 万", delta: 0.097, label: "较上季度" },
  year: { value: "¥4,419.0 万", delta: 0.158, label: "较去年同期" },
};

export const CHANNELS: ChartSlice[] = [
  { label: "天猫旗舰店", value: 1642800 },
  { label: "抖音小店", value: 1205600 },
  { label: "微信小程序", value: 918400 },
  { label: "京东自营", value: 652300 },
  { label: "线下门店", value: 407200 },
];

export type OrderStatus = "paid" | "shipping" | "done" | "refund";
export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: "待发货", tone: "warning" },
  shipping: { label: "运输中", tone: "info" },
  done: { label: "已完成", tone: "success" },
  refund: { label: "退款中", tone: "danger" },
};

export const ORDERS: { id: string; customer: string; city: string; product: string; channel: string; amount: number; status: OrderStatus; time: string }[] = [
  { id: "SO-2611-8842", customer: "沈清禾", city: "杭州", product: "云感记忆枕 · 双只装", channel: "天猫旗舰店", amount: 598, status: "paid", time: "4 分钟前" },
  { id: "SO-2611-8839", customer: "高子墨", city: "成都", product: "竹纤维四件套 · 1.8m", channel: "抖音小店", amount: 1299, status: "shipping", time: "18 分钟前" },
  { id: "SO-2611-8835", customer: "陆星遥", city: "上海", product: "羽丝绒冬被 · 加厚款", channel: "微信小程序", amount: 869, status: "done", time: "42 分钟前" },
  { id: "SO-2611-8831", customer: "许安然", city: "北京", product: "乳胶床垫 · 15cm", channel: "京东自营", amount: 3480, status: "shipping", time: "1 小时前" },
  { id: "SO-2611-8826", customer: "程一诺", city: "深圳", product: "香氛蜡烛礼盒", channel: "天猫旗舰店", amount: 239, status: "refund", time: "2 小时前" },
  { id: "SO-2611-8820", customer: "苏念", city: "南京", product: "亚麻遮光窗帘 · 定制", channel: "线下门店", amount: 2160, status: "done", time: "3 小时前" },
];

export const TOP_PRODUCTS = [
  { label: "云感记忆枕", value: 486200 },
  { label: "竹纤维四件套", value: 412800 },
  { label: "羽丝绒冬被", value: 368500 },
  { label: "乳胶床垫", value: 295400 },
  { label: "亚麻遮光窗帘", value: 182600 },
  { label: "香氛蜡烛礼盒", value: 96300 },
  { label: "法兰绒毛毯", value: 81200 },
];

export const REGIONS = [
  { region: "华东", online: 1486, offline: 182 },
  { region: "华南", online: 962, offline: 96 },
  { region: "华北", online: 834, offline: 71 },
  { region: "西南", online: 512, offline: 38 },
  { region: "华中", online: 408, offline: 20 },
];

export const GOALS = [
  { id: "rev", label: "Q4 营收目标", value: 1402.8, max: 1800, unit: "万元", note: "距季度结束还有 46 天" },
  { id: "members", label: "会员复购率", value: 38.6, max: 45, unit: "%", note: "目标 45%，较上季 +4.1pt" },
  { id: "nps", label: "客户满意度 NPS", value: 62, max: 70, unit: "分", note: "售后响应时长降至 2.4 小时" },
  { id: "stores", label: "新开门店", value: 7, max: 8, unit: "家", note: "苏州、厦门门店筹备中" },
];

export const ACTIVITY = [
  { id: "a1", name: "周以安", action: "发布了「双 12 预热」活动方案", target: "营销部", time: "12 分钟前" },
  { id: "a2", name: "陈默", action: "审批通过了 3 笔采购申请，合计 ¥18.6 万", target: "财务部", time: "38 分钟前" },
  { id: "a3", name: "唐语桐", action: "上架了 12 款冬季新品", target: "商品部", time: "1 小时前" },
  { id: "a4", name: "韩知远", action: "完成了华东仓库存盘点，差异率 0.3%", target: "供应链", time: "2 小时前" },
  { id: "a5", name: "宋嘉言", action: "处理了 28 张售后工单，满意度 98%", target: "客服中心", time: "3 小时前" },
  { id: "a6", name: "林依然", action: "更新了 Q4 经营目标", target: "管理层", time: "昨天" },
];
