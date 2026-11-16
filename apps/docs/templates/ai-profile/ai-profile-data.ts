/** Sample data for the ai-profile template. Model and project names are fictional. */

/** Small deterministic PRNG so server and client render identical numbers. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const pad = (n: number) => String(n).padStart(2, "0");
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Daily sessions for 53 weeks ending at `end`; values only depend on the distance from `end`. */
export function buildHeatmap(end: Date) {
  const rand = seeded(20261115);
  const days: { date: string; value: number }[] = [];
  const total = 53 * 7;
  for (let back = total - 1; back >= 0; back--) {
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - back);
    const weekday = d.getDay();
    const weekend = weekday === 0 || weekday === 6;
    // Busier towards the present, quieter on weekends, with a two-week holiday gap.
    const ramp = 0.45 + 0.55 * (1 - back / total);
    const r = rand();
    const holiday = back > 228 && back < 242;
    let value = 0;
    if (!holiday && r > (weekend ? 0.62 : 0.12)) value = Math.round((weekend ? 3 : 9) * ramp * (0.4 + rand() * 1.4));
    days.push({ date: isoDate(d), value });
  }
  return days;
}

export type TokenRange = "30d" | "12w" | "12m";

export function buildTokens(end: Date, range: TokenRange) {
  const rand = seeded(range === "30d" ? 7 : range === "12w" ? 11 : 13);
  const rows: { label: string; 输入: number; 输出: number; 缓存命中: number }[] = [];
  const count = range === "30d" ? 30 : 12;
  for (let i = count - 1; i >= 0; i--) {
    let label: string;
    let scale: number;
    if (range === "30d") {
      const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
      label = `${d.getMonth() + 1}/${d.getDate()}`;
      const weekend = d.getDay() === 0 || d.getDay() === 6;
      scale = weekend ? 0.35 : 1;
    } else if (range === "12w") {
      const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i * 7);
      label = `${d.getMonth() + 1}/${d.getDate()}`;
      scale = 6.2;
    } else {
      const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
      label = `${d.getMonth() + 1}月`;
      scale = 26;
    }
    const growth = 0.55 + 0.45 * (1 - i / count);
    const base = 1_250_000 * scale * growth * (0.75 + rand() * 0.5);
    rows.push({
      label,
      输入: Math.round(base * 0.58),
      输出: Math.round(base * 0.17),
      缓存命中: Math.round(base * (0.18 + rand() * 0.12)),
    });
  }
  return rows;
}

export const MODELS = [
  { key: "aurora-pro", label: "Aurora 4 Pro", value: 18_420_000, color: "var(--color-chart-1)" },
  { key: "aurora-lite", label: "Aurora 4 Lite", value: 9_860_000, color: "var(--color-chart-2)" },
  { key: "nimbus", label: "Nimbus Code", value: 6_310_000, color: "var(--color-chart-3)" },
  { key: "ember", label: "Ember Mini", value: 2_740_000, color: "var(--color-chart-4)" },
  { key: "local", label: "本地模型", value: 1_270_000, color: "var(--color-chart-5)" },
];

export const PROJECTS = [
  { key: "orra-ui", label: "orra-ui / 组件库", value: 12_860_000, lang: "TypeScript" },
  { key: "billing", label: "billing-service / 计费服务", value: 8_140_000, lang: "Go" },
  { key: "mobile", label: "atlas-mobile / 移动端", value: 6_920_000, lang: "Kotlin" },
  { key: "pipeline", label: "data-pipeline / 数据管道", value: 5_380_000, lang: "Python" },
  { key: "infra", label: "infra-terraform / 基础设施", value: 2_960_000, lang: "HCL" },
  { key: "docs", label: "handbook / 团队手册", value: 1_410_000, lang: "Markdown" },
];

export const LANGS = [
  { label: "TypeScript", share: 0.41 },
  { label: "Go", share: 0.22 },
  { label: "Python", share: 0.16 },
  { label: "Kotlin", share: 0.13 },
  { label: "其他", share: 0.08 },
];

export type SessionResult = "merged" | "running" | "review" | "dropped";

export interface SessionRow {
  id: string;
  title: string;
  project: string;
  model: string;
  tokens: number;
  duration: string;
  files: number;
  result: SessionResult;
  when: string;
}

export const SESSIONS: SessionRow[] = [
  { id: "s-4821", title: "为 DataGrid 增加列冻结与拖拽排序", project: "orra-ui", model: "Aurora 4 Pro", tokens: 486_200, duration: "1 时 12 分", files: 9, result: "running", when: "进行中" },
  { id: "s-4817", title: "修复账单导出时区偏移", project: "billing-service", model: "Aurora 4 Lite", tokens: 92_400, duration: "18 分", files: 3, result: "merged", when: "2 小时前" },
  { id: "s-4809", title: "重构离线同步队列，补充重试测试", project: "atlas-mobile", model: "Nimbus Code", tokens: 318_700, duration: "54 分", files: 14, result: "review", when: "昨天 21:40" },
  { id: "s-4802", title: "把 ETL 作业迁移到增量快照", project: "data-pipeline", model: "Aurora 4 Pro", tokens: 241_900, duration: "47 分", files: 6, result: "merged", when: "昨天 15:12" },
  { id: "s-4796", title: "生成 VPC 对等连接模块", project: "infra-terraform", model: "Ember Mini", tokens: 38_600, duration: "9 分", files: 2, result: "dropped", when: "11月13日" },
  { id: "s-4790", title: "整理新人入职指南的目录结构", project: "handbook", model: "Aurora 4 Lite", tokens: 27_300, duration: "12 分", files: 5, result: "merged", when: "11月12日" },
];

export const ACHIEVEMENTS = [
  { id: "streak", label: "连续 46 天", detail: "最长连续使用" },
  { id: "review", label: "评审达人", detail: "120 次 AI 辅助评审" },
  { id: "tests", label: "测试守护者", detail: "生成 860 个用例" },
];
