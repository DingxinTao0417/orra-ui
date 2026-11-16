/** Sample data for the medical-profile template (fictional patient). */

export type VitalTone = "success" | "warning" | "danger" | "info";

export interface Vital {
  id: string;
  label: string;
  value: string;
  unit: string;
  status: string;
  tone: VitalTone;
  range: string;
  /** 7-day and 30-day series for the sparkline. */
  week: number[];
  month: number[];
}

export const PATIENT = {
  name: "沈知夏",
  id: "HP-2026-08417",
  gender: "女",
  age: 34,
  birthday: "1992-03-18",
  blood: "A 型 Rh+",
  height: 165,
  weight: 56.4,
  doctor: "唐明远",
  department: "心血管内科",
  insurance: "城镇职工医保",
  contact: "沈知远（兄长）",
  allergies: ["青霉素", "花粉"],
  conditions: ["1 级高血压", "维生素 D 不足"],
};

export const VITALS: Vital[] = [
  {
    id: "hr",
    label: "静息心率",
    value: "68",
    unit: "次/分",
    status: "正常",
    tone: "success",
    range: "60–100",
    week: [71, 69, 72, 70, 67, 69, 68],
    month: [74, 73, 72, 74, 71, 72, 70, 73, 71, 70, 72, 69, 71, 70, 68, 70, 69, 71, 70, 68, 69, 70, 67, 69, 71, 69, 68, 70, 69, 68],
  },
  {
    id: "bp",
    label: "血压",
    value: "134/86",
    unit: "mmHg",
    status: "偏高",
    tone: "warning",
    range: "< 130/85",
    week: [126, 129, 131, 128, 133, 135, 134],
    month: [124, 126, 125, 127, 129, 126, 124, 128, 127, 125, 129, 130, 127, 126, 128, 129, 131, 128, 127, 130, 129, 126, 129, 131, 128, 133, 135, 132, 135, 134],
  },
  {
    id: "spo2",
    label: "血氧饱和度",
    value: "98",
    unit: "%",
    status: "正常",
    tone: "success",
    range: "95–100",
    week: [97, 98, 98, 97, 99, 98, 98],
    month: [98, 97, 98, 98, 97, 98, 99, 98, 97, 98, 98, 99, 97, 98, 98, 97, 98, 99, 98, 98, 97, 98, 98, 97, 99, 98, 98, 97, 98, 98],
  },
  {
    id: "glucose",
    label: "空腹血糖",
    value: "5.2",
    unit: "mmol/L",
    status: "正常",
    tone: "success",
    range: "3.9–6.1",
    week: [5.4, 5.1, 5.3, 5.0, 5.2, 5.3, 5.2],
    month: [5.5, 5.3, 5.6, 5.4, 5.2, 5.5, 5.3, 5.4, 5.1, 5.3, 5.2, 5.4, 5.3, 5.1, 5.2, 5.4, 5.3, 5.0, 5.2, 5.3, 5.1, 5.2, 5.4, 5.1, 5.3, 5.0, 5.2, 5.3, 5.1, 5.2],
  },
  {
    id: "temp",
    label: "体温",
    value: "36.6",
    unit: "°C",
    status: "正常",
    tone: "success",
    range: "36.0–37.2",
    week: [36.5, 36.7, 36.6, 36.4, 36.6, 36.8, 36.6],
    month: [36.6, 36.5, 36.7, 36.6, 36.4, 36.5, 36.7, 36.8, 36.6, 36.5, 36.6, 36.7, 36.5, 36.4, 36.6, 36.5, 36.7, 36.6, 36.5, 36.6, 36.7, 36.5, 36.6, 36.4, 36.6, 36.7, 36.6, 36.8, 36.5, 36.6],
  },
  {
    id: "weight",
    label: "体重",
    value: "56.4",
    unit: "kg",
    status: "BMI 20.7",
    tone: "info",
    range: "BMI 18.5–24",
    week: [56.9, 56.8, 56.7, 56.8, 56.6, 56.5, 56.4],
    month: [57.8, 57.7, 57.7, 57.6, 57.5, 57.6, 57.4, 57.3, 57.3, 57.2, 57.2, 57.1, 57.0, 57.1, 56.9, 57.0, 56.9, 56.8, 56.9, 56.8, 56.7, 56.8, 56.9, 56.8, 56.7, 56.8, 56.6, 56.5, 56.5, 56.4],
  },
];

export const RINGS = [
  { key: "move", label: "活动消耗", value: 412, goal: 480, unit: "千卡" },
  { key: "exercise", label: "锻炼时长", value: 34, goal: 30, unit: "分钟" },
  { key: "stand", label: "站立小时", value: 9, goal: 12, unit: "小时" },
];

export const STEPS = [
  { label: "周一", 本周: 8_420, 上周: 7_210 },
  { label: "周二", 本周: 10_380, 上周: 9_050 },
  { label: "周三", 本周: 6_940, 上周: 8_330 },
  { label: "周四", 本周: 11_620, 上周: 7_980 },
  { label: "周五", 本周: 9_150, 上周: 10_420 },
  { label: "周六", 本周: 13_870, 上周: 12_160 },
  { label: "周日", 本周: 7_260, 上周: 6_480 },
];

export const SLEEP = {
  score: 82,
  bedtime: "23:42",
  wake: "07:08",
  total: "7 小时 26 分",
  stages: [
    { label: "深睡", minutes: 104, color: "var(--color-chart-1)" },
    { label: "浅睡", minutes: 236, color: "var(--color-chart-2)" },
    { label: "快速眼动", minutes: 92, color: "var(--color-chart-3)" },
    { label: "清醒", minutes: 14, color: "var(--color-chart-6)" },
  ],
};

export interface Medication {
  id: string;
  name: string;
  dose: string;
  schedule: string;
  time: string;
  remaining: number;
  total: number;
  note?: string;
}

export const MEDICATIONS: Medication[] = [
  { id: "m1", name: "苯磺酸氨氯地平片", dose: "5 mg × 1 片", schedule: "每日一次 · 早餐后", time: "08:00", remaining: 18, total: 28 },
  { id: "m2", name: "维生素 D3 软胶囊", dose: "2000 IU × 1 粒", schedule: "每日一次 · 随餐", time: "12:30", remaining: 41, total: 60 },
  { id: "m3", name: "辅酶 Q10", dose: "100 mg × 1 粒", schedule: "每日一次 · 晚餐后", time: "19:00", remaining: 6, total: 30, note: "余量不足一周" },
];

export interface Appointment {
  id: string;
  month: string;
  day: string;
  weekday: string;
  time: string;
  title: string;
  doctor: string;
  place: string;
  kind: "复诊" | "检查" | "线上";
}

export const APPOINTMENTS: Appointment[] = [
  { id: "a1", month: "11月", day: "20", weekday: "周五", time: "09:30", title: "高血压复诊", doctor: "唐明远 主任医师", place: "市第一医院 · 门诊楼 4F", kind: "复诊" },
  { id: "a2", month: "11月", day: "27", weekday: "周五", time: "08:00", title: "24 小时动态血压监测", doctor: "功能检查科", place: "市第一医院 · 医技楼 2F", kind: "检查" },
  { id: "a3", month: "12月", day: "04", weekday: "周五", time: "20:00", title: "营养师线上随访", doctor: "顾清 营养师", place: "视频问诊", kind: "线上" },
];

export interface LabResult {
  id: string;
  name: string;
  code: string;
  value: number;
  unit: string;
  low: number;
  high: number;
  history: number[];
}

export const LAB_PANELS: { id: string; label: string; date: string; results: LabResult[] }[] = [
  {
    id: "2026-11-02",
    label: "生化全项",
    date: "2026-11-02",
    results: [
      { id: "tc", name: "总胆固醇", code: "TC", value: 5.48, unit: "mmol/L", low: 2.8, high: 5.2, history: [4.9, 5.0, 5.1, 5.3, 5.48] },
      { id: "ldl", name: "低密度脂蛋白", code: "LDL-C", value: 3.21, unit: "mmol/L", low: 0, high: 3.4, history: [2.9, 3.0, 3.1, 3.3, 3.21] },
      { id: "hdl", name: "高密度脂蛋白", code: "HDL-C", value: 1.46, unit: "mmol/L", low: 1.04, high: 2.0, history: [1.38, 1.41, 1.4, 1.44, 1.46] },
      { id: "tg", name: "甘油三酯", code: "TG", value: 1.12, unit: "mmol/L", low: 0.45, high: 1.7, history: [1.3, 1.25, 1.18, 1.2, 1.12] },
      { id: "cr", name: "肌酐", code: "Cr", value: 61, unit: "μmol/L", low: 41, high: 81, history: [63, 60, 62, 64, 61] },
      { id: "vd", name: "25-羟基维生素 D", code: "25(OH)D", value: 18.6, unit: "ng/mL", low: 30, high: 100, history: [15.2, 16.1, 17.4, 17.9, 18.6] },
      { id: "ua", name: "尿酸", code: "UA", value: 302, unit: "μmol/L", low: 155, high: 357, history: [318, 310, 296, 305, 302] },
    ],
  },
  {
    id: "2026-10-08",
    label: "血常规",
    date: "2026-10-08",
    results: [
      { id: "wbc", name: "白细胞计数", code: "WBC", value: 6.2, unit: "10⁹/L", low: 3.5, high: 9.5, history: [5.8, 6.4, 5.9, 6.1, 6.2] },
      { id: "rbc", name: "红细胞计数", code: "RBC", value: 4.36, unit: "10¹²/L", low: 3.8, high: 5.1, history: [4.2, 4.3, 4.28, 4.31, 4.36] },
      { id: "hgb", name: "血红蛋白", code: "HGB", value: 128, unit: "g/L", low: 115, high: 150, history: [122, 125, 124, 127, 128] },
      { id: "plt", name: "血小板计数", code: "PLT", value: 236, unit: "10⁹/L", low: 125, high: 350, history: [228, 241, 233, 239, 236] },
      { id: "fer", name: "血清铁蛋白", code: "SF", value: 11.4, unit: "ng/mL", low: 13, high: 150, history: [16.2, 14.8, 13.5, 12.1, 11.4] },
    ],
  },
];

export interface HealthAlert {
  id: string;
  tone: "danger" | "warning" | "info" | "success";
  title: string;
  detail: string;
  time: string;
  action?: string;
}

export const ALERTS: HealthAlert[] = [
  { id: "al1", tone: "danger", title: "血压连续 3 天高于目标", detail: "近 3 天早晨收缩压平均 134 mmHg，建议记录症状并在复诊时说明。", time: "今天 07:40", action: "记录症状" },
  { id: "al2", tone: "warning", title: "辅酶 Q10 余量不足", detail: "剩余 6 粒，按当前用量约 6 天后用完。", time: "昨天 19:05", action: "加入购药清单" },
  { id: "al4", tone: "success", title: "连续 12 天达成步数目标", detail: "保持每天 8,000 步，有助于平稳血压。", time: "11月14日" },
];
