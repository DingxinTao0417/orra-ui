import type { ModelOption } from "@orra-ui/react";

export const CODE_MODELS: ModelOption[] = [
  { id: "cobalt-r2", name: "Cobalt R2", provider: "Cobalt", description: "严谨的规划者，擅长代码审查与重构", capabilities: ["reasoning", "code"], contextWindow: 256_000, isNew: true },
  { id: "cobalt-mini", name: "Cobalt Mini", provider: "Cobalt", description: "轻量快速，适合补全和小改动", capabilities: ["fast", "code"], contextWindow: 128_000 },
  { id: "lumen-4-pro", name: "Lumen 4 Pro", provider: "Lumen", description: "长上下文，能读完整个仓库", capabilities: ["reasoning", "vision", "long-context"], contextWindow: 400_000 },
  { id: "lumen-4-flash", name: "Lumen 4 Flash", provider: "Lumen", description: "日常问答与草稿", capabilities: ["fast", "vision"], contextWindow: 200_000 },
  { id: "fathom-coder", name: "Fathom Coder 34B", provider: "Fathom", description: "开源权重，可私有化部署", capabilities: ["code"], contextWindow: 128_000 },
];

/* ------------------------------------------------------------------ diff */

export type DiffStatus = "added" | "modified";

export interface DiffFile {
  id: string;
  path: string;
  status: DiffStatus;
  /** Unified diff body: lines start with " ", "+", "-" or "@@". */
  diff: string;
}

const GUARD_SRC = `@@ -0,0 +1,34 @@
+import { useCallback, useRef, useState } from "react";
+
+/**
+ * 同步提交锁：在第一次调用的同一个调用栈里上锁，
+ * 不依赖下一次渲染，能挡住同一帧内的重复 submit。
+ */
+export function useSubmitGuard<T extends unknown[], R>(
+  action: (...args: T) => Promise<R>,
+  { cooldown = 500 }: { cooldown?: number } = {},
+) {
+  const locked = useRef(false);
+  const [pending, setPending] = useState(false);
+
+  const run = useCallback(
+    async (...args: T): Promise<R | undefined> => {
+      if (locked.current) return undefined;
+      locked.current = true;
+      setPending(true);
+      try {
+        return await action(...args);
+      } finally {
+        setPending(false);
+        // 冷却期内的点击直接丢弃，防止抖动的双击
+        window.setTimeout(() => {
+          locked.current = false;
+        }, cooldown);
+      }
+    },
+    [action, cooldown],
+  );
+
+  return { run, pending };
+}`;

export const GUARD_SNIPPET = GUARD_SRC.split("\n")
  .slice(1)
  .map((l) => l.slice(1))
  .slice(13, 30)
  .join("\n");

const FORM_DIFF = `@@ -1,6 +1,7 @@
 import { useState } from "react";
 import { useRouter } from "next/navigation";
 import { Button } from "@/components/ui/button";
+import { useSubmitGuard } from "@/hooks/use-submit-guard";
 import { createOrder } from "./api";
 import { useCart } from "./cart-context";

@@ -41,17 +42,20 @@ export function CheckoutForm() {
   const router = useRouter();
   const { cart, clear } = useCart();
-  const [isPending, setPending] = useState(false);
   const [error, setError] = useState<string | null>(null);

-  async function handleSubmit(event: React.FormEvent) {
-    event.preventDefault();
-    setPending(true);
-    const result = await createOrder(cart);
-    setPending(false);
+  const { run: submitOrder, pending } = useSubmitGuard(async () => {
+    const result = await createOrder(cart, { idempotencyKey: cart.checkoutId });
     if (!result.ok) return setError(result.message);
     clear();
     router.push(\`/orders/\${result.id}\`);
+  });
+
+  function handleSubmit(event: React.FormEvent) {
+    event.preventDefault();
+    void submitOrder();
   }

   return (
@@ -88,7 +92,7 @@ export function CheckoutForm() {
       <OrderSummary cart={cart} />
       {error ? <p role="alert">{error}</p> : null}
-      <Button type="submit" disabled={isPending}>
+      <Button type="submit" disabled={pending} aria-busy={pending}>
         确认下单
       </Button>
     </form>`;

const API_DIFF = `@@ -12,14 +12,20 @@ export type CreateOrderResult =
   | { ok: true; id: string }
   | { ok: false; message: string };

-export async function createOrder(cart: Cart): Promise<CreateOrderResult> {
+export async function createOrder(
+  cart: Cart,
+  { idempotencyKey }: { idempotencyKey: string },
+): Promise<CreateOrderResult> {
   const res = await fetch("/api/orders", {
     method: "POST",
-    headers: { "Content-Type": "application/json" },
+    headers: {
+      "Content-Type": "application/json",
+      "Idempotency-Key": idempotencyKey,
+    },
     body: JSON.stringify({ items: cart.items, coupon: cart.coupon }),
   });
+  if (res.status === 409) return { ok: false, message: "订单已提交，请勿重复操作" };
   if (!res.ok) return { ok: false, message: "下单失败，请稍后重试" };
   const data = await res.json();
   return { ok: true, id: data.id };`;

export const INITIAL_FILES: DiffFile[] = [
  { id: "guard", path: "src/hooks/use-submit-guard.ts", status: "added", diff: GUARD_SRC },
  { id: "form", path: "src/features/checkout/checkout-form.tsx", status: "modified", diff: FORM_DIFF },
  { id: "api", path: "src/features/checkout/api.ts", status: "modified", diff: API_DIFF },
];

/* The test file is written one case at a time while the agent works. */
// (`${FROM}` keeps these sample imports from being read as real dependencies of the template.)
const FROM = "from";
const TEST_HEAD = `import { act, renderHook } ${FROM} "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } ${FROM} "vitest";
import { useSubmitGuard } from "./use-submit-guard";

describe("useSubmitGuard", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());`;

const TEST_CASES = [
  `
  it("首次调用会执行 action 并返回结果", async () => {
    const action = vi.fn().mockResolvedValue("order_42");
    const { result } = renderHook(() => useSubmitGuard(action));
    await act(async () => {
      expect(await result.current.run()).toBe("order_42");
    });
    expect(action).toHaveBeenCalledTimes(1);
  });`,
  `
  it("同一帧内的重复调用只执行一次", async () => {
    const action = vi.fn().mockResolvedValue("ok");
    const { result } = renderHook(() => useSubmitGuard(action));
    await act(async () => {
      await Promise.all([result.current.run(), result.current.run()]);
    });
    expect(action).toHaveBeenCalledTimes(1);
  });`,
  `
  it("冷却时间内再次提交会被忽略", async () => {
    const action = vi.fn().mockResolvedValue("ok");
    const { result } = renderHook(() => useSubmitGuard(action, { cooldown: 500 }));
    await act(() => result.current.run());
    vi.advanceTimersByTime(499);
    await act(() => result.current.run());
    expect(action).toHaveBeenCalledTimes(1);
  });`,
  `
  it("请求失败后，冷却结束即可重试", async () => {
    const action = vi.fn().mockRejectedValueOnce(new Error("502")).mockResolvedValue("ok");
    const { result } = renderHook(() => useSubmitGuard(action));
    await act(() => expect(result.current.run()).rejects.toThrow("502"));
    vi.advanceTimersByTime(500);
    await act(() => result.current.run());
    expect(action).toHaveBeenCalledTimes(2);
  });
});`,
];

/** The test file after `n` cases have been written. */
export function testFile(n: number): DiffFile {
  const body = [TEST_HEAD, ...TEST_CASES.slice(0, n)].join("\n").split("\n");
  return {
    id: "test",
    path: "src/hooks/use-submit-guard.test.ts",
    status: "added",
    diff: [`@@ -0,0 +1,${body.length} @@`, ...body.map((l) => `+${l}`)].join("\n"),
  };
}

export const CI_FILE: DiffFile = {
  id: "ci",
  path: ".github/workflows/ci.yml",
  status: "modified",
  diff: `@@ -18,9 +18,12 @@ jobs:
       - uses: pnpm/action-setup@v4
       - run: pnpm install --frozen-lockfile
       - run: pnpm lint
-      - run: pnpm test --filter "./src/features/**"
+      - name: 单元测试
+        run: pnpm vitest run --coverage
+        env:
+          TZ: Asia/Shanghai
       - run: pnpm build`,
};

export const TEST_TASKS = [
  { id: "t1", label: "首次调用会执行 action 并返回结果" },
  { id: "t2", label: "同一帧内的重复调用只执行一次", detail: "对应 Safari 的双重 submit" },
  { id: "t3", label: "冷却时间内再次提交会被忽略" },
  { id: "t4", label: "请求失败后，冷却结束即可重试" },
];

export const TEST_OUTPUT = `$ pnpm vitest run src/hooks/use-submit-guard.test.ts

 ✓ src/hooks/use-submit-guard.test.ts (4 tests) 412ms
   ✓ useSubmitGuard > 首次调用会执行 action 并返回结果
   ✓ useSubmitGuard > 同一帧内的重复调用只执行一次
   ✓ useSubmitGuard > 冷却时间内再次提交会被忽略
   ✓ useSubmitGuard > 请求失败后，冷却结束即可重试

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Duration  1.38s`;

/* ------------------------------------------------------------ messages */

export const HISTORY_REASONING = `用户反馈 Safari 上偶发重复下单，日志显示同一购物车 300ms 内两次 POST /orders。
先看 CheckoutForm：onSubmit 里直接调用 createOrder()，按钮的 disabled 依赖 isPending。
问题在于 setPending(true) 要等下一次渲染才生效。
Safari 在「回车提交 + 点击按钮」时会在同一帧派发两次 submit，第二次进来时按钮还没禁用。
所以锁不能放在 state 里，要用 ref 做同步锁；后端也该支持幂等键兜底。`;

export const HISTORY_ANSWER = `找到原因了：**提交锁依赖的是 React state**。\`setPending(true)\` 要等下一次渲染才生效，而 Safari 在「回车提交 + 点击按钮」时会在同一帧内派发两次 \`submit\`，第二次进来时按钮还没被禁用。

我做了两层防护：
- 新增 \`useSubmitGuard\`，用 \`useRef\` 做同步锁，第一次提交时就在同一个调用栈里上锁
- 下单请求带上 \`Idempotency-Key\`（取购物车的 \`checkoutId\`），即使前端失守，后端也会把相同的键视为同一笔订单，并返回 409

核心实现如下：`;

export const HISTORY_OUTRO = "本地 13 个用例全部通过。要我再给 `useSubmitGuard` 补上单元测试，并放进 CI 吗？";

export const RUN_REASONING = [
  "用户要给 useSubmitGuard 补测试，重点是快速双击和请求失败两种情况。",
  "项目用的是 vitest + @testing-library/react，可以用 renderHook 直接测 hook。",
  "冷却逻辑依赖 setTimeout，测试里要用假定时器，避免真的等待 500ms。",
  "CI 现在按目录过滤测试，src/hooks 不在范围内，需要一起改掉。",
];

export const RUN_STEPS = [
  { id: "s1", title: "阅读 useSubmitGuard 与测试配置", description: "确认 vitest 环境与已有的 setup 文件" },
  { id: "s2", title: "编写单元测试", description: "4 个用例，覆盖双击、冷却与失败重试" },
  { id: "s3", title: "本地运行测试", description: "pnpm vitest run" },
  { id: "s4", title: "把测试加入 CI 工作流", description: ".github/workflows/ci.yml" },
  { id: "s5", title: "汇总结果" },
];

export const RUN_ANSWER = `测试补好了，**4 个用例全部通过**（412ms）：

- 首次调用正常执行，并返回订单号
- 同一帧内的两次调用只触发一次请求，对应 Safari 的双重 \`submit\`
- 冷却时间（默认 500ms）内的再次点击会被忽略
- 请求失败后锁会按时释放，用户可以重试

CI 里把按目录过滤的 \`pnpm test\` 换成了 \`pnpm vitest run --coverage\`，并固定了 \`TZ\`，避免和订单时间相关的快照在不同时区跑出不同结果。右侧可以逐个查看改动，确认没问题就点「接受全部」。`;

export const DEFAULT_PROMPT = "好，给 useSubmitGuard 补上单元测试，覆盖快速双击和请求失败的情况，然后在 CI 里也跑一遍";

export const FOLLOW_UP_ANSWER =
  "收到。这个模板里的脚本只演示了上一个任务的完整流程；点击消息下方的「重新演示」可以再看一遍思考、计划、写测试和汇总的全过程。";

export const WELCOME_SUGGESTIONS = [
  {
    id: "review",
    title: "审查这次提交",
    description: "找出潜在的 bug 和可读性问题",
    prompt: "帮我审查最近一次提交，重点看边界条件和错误处理",
    answer:
      "我看了最近一次提交（`feat: 优惠券叠加规则`），有两处值得注意：\n\n- `applyCoupons` 在优惠后金额为负时没有兜底，建议用 `Math.max(0, total)`\n- `couponRules` 每次渲染都会重新创建，放进 `useMemo` 能减少下游组件的重渲染\n\n其余改动逻辑清晰，测试覆盖也到位。需要我直接提一个修复补丁吗？",
  },
  {
    id: "explain",
    title: "解释一段代码",
    description: "逐行讲清楚它在做什么",
    prompt: "解释一下 src/lib/retry.ts 里的指数退避是怎么实现的",
    answer:
      "`retry.ts` 的核心是 `withRetry(fn, { retries, base })`：\n\n1. 第 n 次失败后等待 `base * 2^n` 毫秒，再叠加最多 30% 的随机抖动，避免大量客户端同时重试\n2. 只有 `isRetryable(error)` 为真时才会重试，4xx 错误会立刻抛出\n3. 超过 `retries` 次后抛出最后一次的错误，并附上每次尝试的耗时\n\n整体是标准的「指数退避 + 抖动」写法，没有明显问题。",
  },
  {
    id: "test",
    title: "补充单元测试",
    description: "为没有覆盖的分支写测试",
    prompt: "给 src/lib/format-price.ts 补上单元测试",
    answer:
      "已为 `formatPrice` 规划了 5 个用例：整数、两位小数、负数、超过一亿的紧凑写法，以及非法输入返回 `—`。\n\n这是演示模板，回复是预先写好的；点击左侧「结账页重复提交排查」可以看到完整的编码工作流程。",
  },
  {
    id: "migrate",
    title: "规划一次迁移",
    description: "拆分步骤，评估风险",
    prompt: "我们想把状态管理从 Redux 迁到 Zustand，帮我规划一下步骤",
    answer:
      "建议分三步渐进迁移：\n\n1. 新功能一律用 Zustand，旧的 slice 保持不动\n2. 按页面迁移只读的 slice，用适配层同时暴露两种 API\n3. 最后迁移有中间件依赖的 slice（如持久化、日志），再移除 Redux\n\n每一步都能单独上线和回滚，风险最低。",
  },
];
