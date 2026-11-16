import type { AgentAvatarState, AgentLogItem, ModelOption, WebSearchQuery, WebSearchSource } from "@orra-ui/react";

export interface TeamAgent {
  id: string;
  name: string;
  role: string;
  seed: string;
  model: string;
  tools: string[];
  state: AgentAvatarState;
  /** What the agent is doing right now. */
  activity: string;
  paused?: boolean;
  /** Lead agent: receives the user's requests and hands off work. */
  lead?: boolean;
}

export const AGENT_MODELS: ModelOption[] = [
  { id: "cobalt-r2", name: "Cobalt R2", provider: "Cobalt", description: "规划与推理，适合统筹和分析", capabilities: ["reasoning", "code"], contextWindow: 256_000 },
  { id: "cobalt-mini", name: "Cobalt Mini", provider: "Cobalt", description: "轻量快速，适合简单的执行任务", capabilities: ["fast"], contextWindow: 128_000 },
  { id: "lumen-4-pro", name: "Lumen 4 Pro", provider: "Lumen", description: "长上下文，读得下整份报告", capabilities: ["reasoning", "vision", "long-context"], contextWindow: 400_000 },
  { id: "lumen-4-flash", name: "Lumen 4 Flash", provider: "Lumen", description: "文字流畅，适合写作与改写", capabilities: ["fast", "vision"], contextWindow: 200_000 },
  { id: "inkwell-2", name: "Inkwell 2", provider: "Inkwell", description: "插画与平面视觉", capabilities: ["vision"] },
];

export const modelName = (id: string) => AGENT_MODELS.find((m) => m.id === id)?.name ?? id;

export const TOOLS = [
  { id: "web", label: "联网搜索" },
  { id: "browse", label: "网页阅读" },
  { id: "code", label: "代码执行" },
  { id: "files", label: "文件读写" },
  { id: "image", label: "图像生成" },
  { id: "calendar", label: "日历" },
  { id: "mail", label: "邮件" },
  { id: "sheet", label: "表格" },
];

export const toolLabel = (id: string) => TOOLS.find((t) => t.id === id)?.label ?? id;

export const ROLES = [
  { id: "research", name: "市场调研", hint: "搜索、阅读并整理公开信息" },
  { id: "copy", name: "文案撰写", hint: "标题、正文与多渠道改写" },
  { id: "data", name: "数据分析", hint: "跑脚本、出图表、给结论" },
  { id: "design", name: "视觉设计", hint: "海报、头图与配图" },
  { id: "support", name: "客服答疑", hint: "按知识库回答用户问题" },
  { id: "review", name: "审核把关", hint: "检查事实、语气与合规" },
];

export const INITIAL_AGENTS: TeamAgent[] = [
  { id: "nav", name: "领航员", role: "统筹协调", seed: "navigator-07", model: "cobalt-r2", tools: ["calendar", "mail"], state: "idle", activity: "等待新的指令", lead: true },
  { id: "scout", name: "小探", role: "市场调研", seed: "scout-wren", model: "lumen-4-pro", tools: ["web", "browse"], state: "idle", activity: "已完成竞品定价调研" },
  { id: "abacus", name: "数衡", role: "数据分析", seed: "abacus-42", model: "cobalt-r2", tools: ["code", "sheet"], state: "idle", activity: "已完成价格弹性测算" },
  { id: "quill", name: "知言", role: "文案撰写", seed: "quill-ink", model: "lumen-4-flash", tools: ["files"], state: "idle", activity: "已交付发布会主文案" },
  { id: "iris", name: "青棠", role: "视觉设计", seed: "iris-bloom", model: "inkwell-2", tools: ["image"], state: "idle", activity: "待命" },
];

/* --------------------------------------------------------------- history */

export const PRICING_QUERIES: WebSearchQuery[] = [
  { id: "q1", query: "降噪耳机 2026 新品 首发价 900-1100 元", resultCount: 42 },
  { id: "q2", query: "真无线降噪耳机 首发 立减 活动", resultCount: 27 },
  { id: "q3", query: "云雀 S1 首发价 销量", resultCount: 9 },
];

export const PRICING_SOURCES: WebSearchSource[] = [
  { id: "s1", title: "2026 秋季降噪耳机横评：九款机型价格与续航", url: "https://audio-lab.example.com/2026-autumn-anc", citation: 1 },
  { id: "s2", title: "主流品牌新品首发价汇总（11 月更新）", url: "https://price-watch.example.cn/earbuds-nov", citation: 2 },
  { id: "s3", title: "双十一后耳机品类促销力度观察", url: "https://retail-notes.example.org/post-1111", citation: 3 },
  { id: "s4", title: "云雀 S1 上市回顾", url: "https://news.example.com/skylark-s1-review" },
  { id: "s5", title: "降噪耳机用户购买动机调查", url: "https://survey.example.net/anc-2026" },
  { id: "s6", title: "电商平台耳机类目价格带分布", url: "https://data.example.cn/category/earbuds" },
];

export const ANALYSIS_LOG: AgentLogItem[] = [
  { id: "a1", kind: "read", title: "读取 S1 销量明细.xlsx", meta: "18,420 行" },
  { id: "a2", kind: "command", title: "python elasticity.py --product s1", meta: "弹性 −1.32", detail: "以 30 天为窗口拟合对数需求曲线，R² = 0.87。价格每上调 1%，销量下降约 1.32%。" },
  { id: "a3", kind: "tool", title: "模拟三个价位的首月销量", meta: "3 个方案" },
  { id: "a4", kind: "edit", title: "写入 定价测算.md", meta: "+64 行" },
];

export const PRICE_SCENARIOS = [
  { price: "999 元", units: 32_400, revenue: "3,237 万", note: "与 S1 持平" },
  { price: "1,049 元", units: 29_800, revenue: "3,126 万", note: "推荐", recommended: true },
  { price: "1,099 元", units: 26_900, revenue: "2,956 万", note: "利润率最高" },
];

export const LAUNCH_COPY = {
  title: "云雀 S2：把世界调成静音模式",
  body: "通勤的地铁、开放式办公室、凌晨的航班——S2 的第三代自适应降噪，会在 0.2 秒内识别你所处的环境，把嘈杂留在耳朵外面。单次续航 9 小时，配合充电盒 36 小时，一周只需充一次电。",
};

/* ------------------------------------------------------------ live run */

export const DEFAULT_PROMPT = "@领航员 再把发布会邀请函准备一下，周三前发给 40 位媒体，记得核对一下名单";

export const RUN_TASKS = [
  { id: "r1", agent: "scout", label: "核对媒体名单与联系人" },
  { id: "r2", agent: "quill", label: "撰写邀请函正文" },
  { id: "r3", agent: "iris", label: "设计邀请函头图" },
];

export const MEDIA_QUERIES: WebSearchQuery[] = [
  { id: "m1", query: "科技媒体 数码频道 主编 2026 变动", resultCount: 18 },
  { id: "m2", query: "消费电子 测评博主 商务合作 邮箱", resultCount: 31 },
];

export const MEDIA_SOURCES: WebSearchSource[] = [
  { id: "ms1", title: "数码频道编辑部人员调整公告", url: "https://tech-daily.example.com/notice/2026-11", citation: 1 },
  { id: "ms2", title: "2026 消费电子创作者名录", url: "https://creators.example.cn/electronics", citation: 2 },
  { id: "ms3", title: "发布会媒体邀约礼仪与时间建议", url: "https://pr-handbook.example.org/invites" },
];

export const SCOUT_REPLY =
  "名单核对完了：原表 46 条，去掉 6 条重复后剩 **40 位有效联系人**。其中 2 位编辑本月换了岗位，已按公告更新为新的对接人；另有 1 个邮箱格式有误，已在表里标黄。";

export const INVITE_TEXT = `尊敬的媒体朋友：

诚邀您出席「云雀 S2 新品发布会」。我们会在现场首次展示第三代自适应降噪，并安排 20 分钟的一对一试听。

时间：11 月 26 日（周三）14:00
地点：上海西岸艺术中心 B 馆

请于 11 月 22 日前回复是否出席，我们将为您预留席位与试听时段。`;

export const FINAL_REPLY =
  "邀请函已就绪：正文、头图和 40 位收件人都准备好了。需要我现在发送，还是先发一封给你预览？";
