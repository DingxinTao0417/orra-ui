"use client";

import { AgentLog, type AgentLogItem } from "@orra-ui/react";

const T0 = new Date(2026, 10, 12, 14, 32, 5).getTime();

const ITEMS: AgentLogItem[] = [
  { id: "1", kind: "think", title: "分析登录页结构", meta: "6 个组件", time: T0 },
  { id: "2", kind: "read", title: "读取 LoginForm.tsx", meta: "src/auth/LoginForm.tsx", time: T0 + 4_000 },
  { id: "3", kind: "search", title: "搜索 useAuth 的引用", meta: "14 处匹配", time: T0 + 9_000 },
  {
    id: "4",
    kind: "edit",
    title: "抽出 useLoginSubmit",
    meta: "+48 −112",
    time: T0 + 21_000,
    detail: (
      <pre className="font-mono text-caption leading-5 whitespace-pre">
        {`+ export function useLoginSubmit() {
+   const [pending, setPending] = useState(false);
+   …
- const [loading, setLoading] = useState(false);
- const [error, setError] = useState<string | null>(null);`}
      </pre>
    ),
  },
  { id: "5", kind: "command", title: "运行 pnpm test auth", meta: "进行中", status: "running", time: T0 + 33_000 },
];

export default function AgentLogOverview() {
  return (
    <div className="w-full max-w-lg">
      <AgentLog items={ITEMS} defaultExpandedKeys={["4"]} />
    </div>
  );
}
