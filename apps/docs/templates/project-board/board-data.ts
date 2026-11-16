/** Sample data for the project-board template. */

export type ColumnId = "todo" | "doing" | "review" | "done";
export type Priority = "urgent" | "high" | "medium" | "low";
export type LabelTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

export const COLUMNS: { id: ColumnId; title: string; tone: LabelTone; hint: string }[] = [
  { id: "todo", title: "待处理", tone: "neutral", hint: "已排期，尚未开始" },
  { id: "doing", title: "进行中", tone: "accent", hint: "建议每人不超过 2 项" },
  { id: "review", title: "评审中", tone: "warning", hint: "等待代码或设计评审" },
  { id: "done", title: "已完成", tone: "success", hint: "本迭代已交付" },
];

export const MEMBERS = [
  { id: "lyr", name: "林依然", role: "前端" },
  { id: "zya", name: "周以安", role: "产品" },
  { id: "cm", name: "陈默", role: "后端" },
  { id: "sxw", name: "沈晓雯", role: "设计" },
  { id: "plh", name: "朴立恒", role: "前端" },
  { id: "xjh", name: "许嘉禾", role: "测试" },
];

export const ME = "lyr";

export const LABELS: { id: string; label: string; tone: LabelTone }[] = [
  { id: "design", label: "设计", tone: "info" },
  { id: "frontend", label: "前端", tone: "accent" },
  { id: "backend", label: "后端", tone: "success" },
  { id: "bug", label: "缺陷", tone: "danger" },
  { id: "research", label: "调研", tone: "warning" },
  { id: "docs", label: "文档", tone: "neutral" },
];

export const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "urgent", label: "紧急" },
  { id: "high", label: "高" },
  { id: "medium", label: "中" },
  { id: "low", label: "低" },
];

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  labels: string[];
  assignees: string[];
  priority: Priority;
  due?: string;
  checklist: ChecklistItem[];
  comments: Comment[];
  attachments: number;
}

const list = (texts: string[], done: number): ChecklistItem[] => texts.map((text, i) => ({ id: `c${i}`, text, done: i < done }));

export const TASKS: Task[] = [
  {
    id: "t1",
    code: "ORR-231",
    title: "首页首屏改为三栏案例展示",
    description: "替换现有的大图轮播，改为三个客户案例卡片，移动端改为横向滑动。需要和品牌组确认案例授权。",
    labels: ["design", "frontend"],
    assignees: ["sxw", "plh"],
    priority: "high",
    due: "11月20日",
    checklist: list(["确认案例授权", "输出桌面与移动稿", "前端实现", "埋点"], 1),
    comments: [{ id: "m1", author: "周以安", text: "第三个案例换成星桥实验室吧，数据更好看。", time: "昨天 18:20" }],
    attachments: 3,
  },
  {
    id: "t2",
    code: "ORR-236",
    title: "价格页支持按年 / 按月切换",
    description: "切换后价格与节省比例同步更新，默认按年。",
    labels: ["frontend"],
    assignees: ["lyr"],
    priority: "medium",
    due: "11月24日",
    checklist: list(["切换组件", "价格计算", "单元测试"], 0),
    comments: [],
    attachments: 0,
  },
  {
    id: "t3",
    code: "ORR-240",
    title: "调研：站内搜索方案对比",
    description: "对比自建索引与托管搜索的成本、延迟和中文分词效果，给出建议。",
    labels: ["research", "backend"],
    assignees: ["cm"],
    priority: "low",
    checklist: [],
    comments: [],
    attachments: 1,
  },
  {
    id: "t4",
    code: "ORR-227",
    title: "博客列表分页在 Safari 下错位",
    description: "iOS 17 Safari 中分页按钮被底部安全区遮挡。复现：iPhone 15，横屏后再竖屏。",
    labels: ["bug", "frontend"],
    assignees: ["plh"],
    priority: "urgent",
    due: "11月17日",
    checklist: list(["复现", "修复", "回归测试"], 2),
    comments: [
      { id: "m1", author: "许嘉禾", text: "iPad 上也能复现，附了录屏。", time: "11月14日 10:05" },
      { id: "m2", author: "朴立恒", text: "是 env(safe-area-inset-bottom) 没生效，今天修。", time: "11月14日 11:30" },
    ],
    attachments: 2,
  },
  {
    id: "t5",
    code: "ORR-219",
    title: "联系表单接入新的线索 API",
    description: "表单提交改走 /v2/leads，增加防重复提交和失败重试，字段校验与后端保持一致。",
    labels: ["backend", "frontend"],
    assignees: ["cm", "lyr"],
    priority: "high",
    due: "11月19日",
    checklist: list(["接口联调", "错误提示文案", "防重复提交", "失败重试", "监控告警"], 3),
    comments: [{ id: "m1", author: "陈默", text: "测试环境已部署 v2 接口。", time: "今天 09:12" }],
    attachments: 0,
  },
  {
    id: "t6",
    code: "ORR-233",
    title: "整理组件库 3.0 迁移指南",
    description: "列出破坏性变更、替代方案和自动迁移脚本的用法。",
    labels: ["docs"],
    assignees: ["lyr"],
    priority: "medium",
    due: "11月26日",
    checklist: list(["破坏性变更清单", "示例代码", "评审"], 1),
    comments: [],
    attachments: 0,
  },
  {
    id: "t7",
    code: "ORR-214",
    title: "新版导航栏视觉稿",
    description: "导航栏加入产品下拉面板，滚动后吸顶并收起为紧凑模式。",
    labels: ["design"],
    assignees: ["sxw"],
    priority: "medium",
    due: "11月18日",
    checklist: list(["桌面稿", "移动稿", "交互说明"], 3),
    comments: [
      { id: "m1", author: "林依然", text: "下拉面板的动画时长建议 200ms 以内。", time: "昨天 16:48" },
      { id: "m2", author: "沈晓雯", text: "已调整，请再看一下。", time: "今天 10:02" },
    ],
    attachments: 5,
  },
  {
    id: "t8",
    code: "ORR-222",
    title: "图片懒加载与 AVIF 回退",
    description: "所有案例图片改为懒加载，优先 AVIF，旧浏览器回退 WebP。",
    labels: ["frontend"],
    assignees: ["plh"],
    priority: "low",
    checklist: list(["图片组件", "构建脚本"], 2),
    comments: [],
    attachments: 0,
  },
  {
    id: "t9",
    code: "ORR-205",
    title: "页脚多语言切换",
    description: "支持简体中文、English、日本語，记住用户选择。",
    labels: ["frontend"],
    assignees: ["lyr", "xjh"],
    priority: "medium",
    checklist: list(["切换器", "路由前缀", "测试"], 3),
    comments: [],
    attachments: 0,
  },
  {
    id: "t10",
    code: "ORR-198",
    title: "埋点方案评审",
    description: "统一事件命名，补齐转化漏斗的关键节点。",
    labels: ["research"],
    assignees: ["zya"],
    priority: "high",
    checklist: list(["事件字典", "评审会"], 2),
    comments: [{ id: "m1", author: "周以安", text: "评审通过，按字典 v3 执行。", time: "11月12日 15:00" }],
    attachments: 1,
  },
];

export const INITIAL_ORDER: Record<ColumnId, string[]> = {
  todo: ["t2", "t3", "t6"],
  doing: ["t1", "t4", "t5"],
  review: ["t7", "t8"],
  done: ["t9", "t10"],
};
