"use client";

import { RiLinkM, RiShareLine } from "@remixicon/react";
import { Button, Input, Popover } from "@orra-ui/react";

export default function PopoverOverview() {
  return (
    <Popover
      trigger={
        <Button variant="outline" tone="neutral" startIcon={<RiShareLine />}>
          分享
        </Button>
      }
      title="分享「Q4 渠道复盘」"
      footer={({ close }) => (
        <>
          <Button size="sm" variant="plain" tone="neutral" onPress={close}>
            取消
          </Button>
          <Button size="sm" startIcon={<RiLinkM />} onPress={close}>
            复制链接
          </Button>
        </>
      )}
    >
      <p className="mb-3">拥有链接的同事可以查看，邀请后可评论。</p>
      <Input aria-label="邀请邮箱" size="sm" placeholder="输入邮箱，按回车添加" />
    </Popover>
  );
}
