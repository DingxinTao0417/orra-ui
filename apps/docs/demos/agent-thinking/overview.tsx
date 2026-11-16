"use client";

import { useEffect, useState } from "react";
import { AgentThinking } from "@orra-ui/react";

const REASONING = `用户希望重构登录页，先看看现有实现。
LoginForm.tsx 里表单校验和请求逻辑混在一起，约 380 行，状态用了 6 个 useState。
可以拆成三块：表单 UI、校验规则、提交 hook。
第三方登录按钮目前写死在组件里，应该改成配置驱动。
还要保留"记住我"的行为，避免影响现有用户的登录态。
方案确定：先抽出 useLoginSubmit，再迁移校验，最后整理样式。`;

export default function AgentThinkingOverview() {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= REASONING.length) return;
    const id = window.setTimeout(() => setShown((n) => Math.min(REASONING.length, n + 2)), 45);
    return () => window.clearTimeout(id);
  }, [shown]);
  const active = shown < REASONING.length;

  return (
    <div className="w-full max-w-lg">
      <AgentThinking active={active} defaultExpanded>
        {REASONING.slice(0, shown)}
      </AgentThinking>
    </div>
  );
}
