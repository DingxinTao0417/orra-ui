import type { BadgeTone, ChartSlice, FunnelStage, StatCardItem } from "@orra-ui/react";

/* Sample data for the people / HR dashboard. Replace with your own API calls. */

export const KPIS: StatCardItem[] = [
  { id: "headcount", label: "在职员工", value: 486, delta: 0.046, deltaLabel: "较上季度", trend: [431, 436, 440, 447, 452, 455, 461, 464, 470, 474, 481, 486] },
  { id: "hires", label: "本季入职", value: 42, delta: 0.167, deltaLabel: "较上季度", trend: [9, 12, 8, 14, 11, 13, 10, 16, 12, 15, 14, 13], trendVariant: "bar" },
  { id: "attrition", label: "主动离职率", value: 0.032, format: "percent", delta: -0.18, invertDelta: true, deltaLabel: "较上季度", trend: [4.6, 4.4, 4.5, 4.1, 3.9, 4.0, 3.7, 3.6, 3.5, 3.4, 3.3, 3.2] },
  { id: "openings", label: "开放职位", value: 27, delta: 0.08, deltaLabel: "较上月", description: "其中 8 个为紧急岗位", trend: [18, 19, 21, 20, 22, 24, 23, 25, 24, 26, 25, 27] },
];

export const PIPELINES: Record<string, FunnelStage[]> = {
  all: [
    { label: "投递简历", value: 2840 },
    { label: "简历筛选", value: 924 },
    { label: "初面", value: 386 },
    { label: "复面", value: 142 },
    { label: "发放 Offer", value: 58 },
    { label: "入职", value: 42 },
  ],
  rd: [
    { label: "投递简历", value: 1460 },
    { label: "简历筛选", value: 412 },
    { label: "初面", value: 168 },
    { label: "复面", value: 61 },
    { label: "发放 Offer", value: 24 },
    { label: "入职", value: 17 },
  ],
  product: [
    { label: "投递简历", value: 520 },
    { label: "简历筛选", value: 186 },
    { label: "初面", value: 82 },
    { label: "复面", value: 34 },
    { label: "发放 Offer", value: 13 },
    { label: "入职", value: 10 },
  ],
  sales: [
    { label: "投递简历", value: 860 },
    { label: "简历筛选", value: 326 },
    { label: "初面", value: 136 },
    { label: "复面", value: 47 },
    { label: "发放 Offer", value: 21 },
    { label: "入职", value: 15 },
  ],
};

export const PIPELINE_SUMMARY: Record<string, { value: string; delta: number }> = {
  all: { value: "26 天", delta: -0.13 },
  rd: { value: "34 天", delta: -0.08 },
  product: { value: "24 天", delta: -0.17 },
  sales: { value: "18 天", delta: 0.05 },
};

export const TEAMS: ChartSlice[] = [
  { label: "研发", value: 198 },
  { label: "销售", value: 92 },
  { label: "产品与设计", value: 64 },
  { label: "客户成功", value: 51 },
  { label: "市场", value: 38 },
  { label: "职能支持", value: 43 },
];

export const ENGAGEMENT = [
  { topic: "使命认同", current: 86, previous: 82 },
  { topic: "成长机会", current: 71, previous: 64 },
  { topic: "管理支持", current: 78, previous: 75 },
  { topic: "薪酬福利", current: 66, previous: 63 },
  { topic: "工作负荷", current: 62, previous: 58 },
  { topic: "团队协作", current: 84, previous: 83 },
];

/** Monthly hires vs exits over the last 12 months (net +55). */
export const FLOW_TREND = ["12月", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月"].map((month, i) => ({
  month,
  hires: [8, 13, 9, 14, 12, 10, 13, 9, 15, 13, 16, 13][i]!,
  exits: [5, 8, 10, 7, 6, 6, 8, 6, 8, 8, 10, 6][i]!,
}));

export const NEW_HIRES = [
  { id: "h1", name: "顾言之", role: "高级前端工程师", team: "研发 · 平台组", start: "11 月 3 日", onboarding: 72 },
  { id: "h2", name: "叶知秋", role: "产品经理", team: "产品与设计", start: "11 月 10 日", onboarding: 45 },
  { id: "h3", name: "方若琳", role: "大客户销售", team: "销售 · 华南", start: "11 月 10 日", onboarding: 38 },
  { id: "h4", name: "孟川", role: "数据分析师", team: "研发 · 数据组", start: "11 月 17 日", onboarding: 10 },
  { id: "h5", name: "白露", role: "品牌设计师", team: "市场", start: "11 月 24 日", onboarding: 0 },
];

export type EmployeeStatus = "active" | "probation" | "leave" | "notice";
export const EMPLOYEE_STATUS: Record<EmployeeStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "在职", tone: "success" },
  probation: { label: "试用期", tone: "info" },
  leave: { label: "休假中", tone: "warning" },
  notice: { label: "离职交接", tone: "neutral" },
};

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  level: string;
  manager: string;
  joined: string;
  status: EmployeeStatus;
  rating: "S" | "A" | "B" | "C" | "—";
}

export const DEPARTMENTS = ["全部部门", "研发", "产品与设计", "销售", "客户成功", "市场", "职能支持"];

export const EMPLOYEES: Employee[] = [
  { id: "E1024", name: "周以安", email: "yian.zhou@orra.studio", department: "市场", title: "增长负责人", level: "P8", manager: "林依然", joined: "2021-03-15", status: "active", rating: "S" },
  { id: "E1187", name: "唐语桐", email: "yutong.tang@orra.studio", department: "产品与设计", title: "设计主管", level: "P7", manager: "林依然", joined: "2022-06-01", status: "active", rating: "A" },
  { id: "E1302", name: "韩知远", email: "zhiyuan.han@orra.studio", department: "研发", title: "后端架构师", level: "P8", manager: "陈默", joined: "2020-11-09", status: "leave", rating: "A" },
  { id: "E1415", name: "宋嘉言", email: "jiayan.song@orra.studio", department: "客户成功", title: "客户成功经理", level: "P6", manager: "周以安", joined: "2023-02-20", status: "active", rating: "B" },
  { id: "E1533", name: "陈默", email: "mo.chen@orra.studio", department: "研发", title: "研发总监", level: "M3", manager: "林依然", joined: "2019-08-12", status: "active", rating: "A" },
  { id: "E1620", name: "顾言之", email: "yanzhi.gu@orra.studio", department: "研发", title: "高级前端工程师", level: "P7", manager: "陈默", joined: "2026-11-03", status: "probation", rating: "—" },
  { id: "E1588", name: "沈星河", email: "xinghe.shen@orra.studio", department: "销售", title: "华东区销售经理", level: "M1", manager: "许安然", joined: "2022-09-05", status: "active", rating: "S" },
  { id: "E1442", name: "江晚吟", email: "wanyin.jiang@orra.studio", department: "职能支持", title: "HRBP", level: "P6", manager: "林依然", joined: "2023-05-08", status: "notice", rating: "B" },
  { id: "E1599", name: "许安然", email: "anran.xu@orra.studio", department: "销售", title: "销售副总裁", level: "M4", manager: "林依然", joined: "2021-01-04", status: "active", rating: "A" },
  { id: "E1611", name: "叶知秋", email: "zhiqiu.ye@orra.studio", department: "产品与设计", title: "产品经理", level: "P6", manager: "唐语桐", joined: "2026-11-10", status: "probation", rating: "—" },
  { id: "E1356", name: "程一诺", email: "yinuo.cheng@orra.studio", department: "研发", title: "测试开发工程师", level: "P5", manager: "陈默", joined: "2024-07-15", status: "active", rating: "C" },
  { id: "E1499", name: "陆星遥", email: "xingyao.lu@orra.studio", department: "市场", title: "内容运营", level: "P5", manager: "周以安", joined: "2024-03-11", status: "active", rating: "B" },
];
