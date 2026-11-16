"use client";

import { useState } from "react";
import { RiCheckboxCircleFill } from "@remixicon/react";
import { AuthCard, Button } from "@orra-ui/react";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function AuthCardPasswordless() {
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <RiCheckboxCircleFill className="size-10 text-success" />
        <p className="text-body font-medium text-fg">登录成功，正在进入工作区…</p>
        <Button size="sm" variant="outline" tone="neutral" onPress={() => setDone(false)}>
          重新演示
        </Button>
      </div>
    );
  }
  return (
    <AuthCard
      method="code"
      providers={[]}
      allowModeSwitch={false}
      defaultEmail="lin.yiran@northwind.cn"
      description="输入工作邮箱，我们会发送一次性登录码。演示验证码：135790"
      resendCooldown={20}
      onSubmit={() => wait(800)}
      onVerify={async (code) => {
        await wait(700);
        if (code !== "135790") throw new Error("验证码不正确或已过期");
        setDone(true);
      }}
    />
  );
}
