"use client";

import { RiArrowRightLine, RiDownloadLine } from "@remixicon/react";
import { LinkButton } from "@orra-ui/react";

export default function LinkButtonOverview() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-6">
        <LinkButton href="#billing" size="md" endIcon={<RiArrowRightLine />}>
          查看计费说明
        </LinkButton>
        <LinkButton size="md" tone="neutral" startIcon={<RiDownloadLine />}>
          导出 CSV
        </LinkButton>
        <LinkButton href="https://example.com/status" external size="md" tone="muted">
          服务状态
        </LinkButton>
        <LinkButton size="md" tone="danger">
          撤销邀请
        </LinkButton>
      </div>
      <p className="max-w-sm text-center text-body-sm text-fg-muted">
        没有收到验证码？请检查垃圾邮件，或 <LinkButton onPress={() => {}}>重新发送</LinkButton>。
      </p>
    </div>
  );
}
