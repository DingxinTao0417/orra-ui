"use client";

import { useState } from "react";
import { RiInformationLine } from "@remixicon/react";
import { Button, IconButton, Popover } from "@orra-ui/react";

export default function PopoverNonModal() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex items-center gap-4">
      <Popover
        isNonModal
        showCloseButton
        placement="bottom start"
        title="什么是活跃用户？"
        trigger={<IconButton icon={<RiInformationLine />} aria-label="指标说明" variant="soft" />}
      >
        过去 28 天内至少登录 3 次并完成一次核心操作的账号。非模态弹层打开时，页面其他部分仍可交互。
      </Popover>
      <Button variant="outline" tone="neutral" onPress={() => setCount((c) => c + 1)}>
        仍然可以点我（{count}）
      </Button>
    </div>
  );
}
