"use client";

import { Divider, SocialButton } from "@orra-ui/react";

export default function SocialButtonOverview() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <SocialButton provider="google" fullWidth />
      <SocialButton provider="github" fullWidth />
      <SocialButton provider="apple" fullWidth />
      <Divider>或</Divider>
      <SocialButton provider="wechat" variant="filled" fullWidth />
    </div>
  );
}
