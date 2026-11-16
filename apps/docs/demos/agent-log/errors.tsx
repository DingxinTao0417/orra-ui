"use client";

import { AgentLog } from "@orra-ui/react";

export default function AgentLogErrors() {
  return (
    <div className="w-full max-w-lg">
      <AgentLog
        dense
        defaultExpandedKeys={["build"]}
        items={[
          { id: "install", kind: "command", title: "安装依赖", meta: "pnpm install · 18 秒" },
          {
            id: "build",
            kind: "command",
            title: "构建项目",
            meta: "退出码 1",
            status: "error",
            detail: (
              <pre className="font-mono text-caption leading-5 whitespace-pre text-danger">
                {`src/auth/LoginForm.tsx:42:7
Type 'string | undefined' is not assignable to type 'string'.`}
              </pre>
            ),
          },
          { id: "fix", kind: "edit", title: "修复类型错误", status: "pending" },
          { id: "retry", kind: "command", title: "重新构建", status: "pending" },
        ]}
      />
    </div>
  );
}
