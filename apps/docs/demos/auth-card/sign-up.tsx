"use client";

import { AuthCard } from "@orra-ui/react";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function AuthCardSignUp() {
  return (
    <AuthCard
      defaultMode="signUp"
      title="加入拾光实验室"
      description="创建账号，14 天内免费体验全部功能。"
      providers={["wechat", "alipay", "apple", "github"]}
      socialLayout="grid"
      socialPosition="bottom"
      termsHref="/legal/terms"
      privacyHref="/legal/privacy"
      onSubmit={async () => {
        await wait(900);
        return "verify";
      }}
      onVerify={async (code) => {
        await wait(700);
        if (code !== "246810") throw new Error("验证码不正确，演示验证码为 246810");
      }}
      onResend={() => wait(600)}
    />
  );
}
