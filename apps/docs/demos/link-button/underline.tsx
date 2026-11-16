"use client";

import { LinkButton } from "@orra-ui/react";

export default function LinkButtonUnderline() {
  return (
    <div className="grid grid-cols-[auto_auto] items-center gap-x-6 gap-y-4">
      <span className="font-mono text-caption text-fg-subtle">hover</span>
      <LinkButton href="#privacy" size="md">
        隐私政策
      </LinkButton>
      <span className="font-mono text-caption text-fg-subtle">always</span>
      <LinkButton href="#terms" size="md" underline="always">
        服务条款
      </LinkButton>
      <span className="font-mono text-caption text-fg-subtle">none</span>
      <LinkButton href="#help" size="md" underline="none" tone="neutral">
        帮助中心
      </LinkButton>
      <span className="font-mono text-caption text-fg-subtle">disabled</span>
      <LinkButton size="md" isDisabled>
        已发送（60 秒后可重试）
      </LinkButton>
    </div>
  );
}
