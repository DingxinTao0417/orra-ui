"use client";

import { RiFilter3Line } from "@remixicon/react";
import { Button, Drawer, Input } from "@orra-ui/react";

export default function DrawerOverview() {
  return (
    <Drawer
      trigger={
        <Button variant="outline" tone="neutral" startIcon={<RiFilter3Line />}>
          筛选订单
        </Button>
      }
      title="筛选订单"
      description="组合多个条件，快速定位异常订单。"
      footer={({ close }) => (
        <>
          <Button variant="outline" tone="neutral" onPress={close}>
            重置
          </Button>
          <Button onPress={close}>查看 126 条结果</Button>
        </>
      )}
    >
      <div className="flex flex-col gap-5">
        <Input label="客户名称" placeholder="例如：杭州云杉科技" />
        <Input label="订单号" placeholder="以 SO- 开头" />
        <Input label="最低金额（元）" type="number" placeholder="0" />
        <Input label="负责人" placeholder="输入姓名或邮箱" />
        <p className="text-body-sm text-fg-subtle">提示：内容较多时正文区域会滚动，底部操作栏始终可见。</p>
      </div>
    </Drawer>
  );
}
