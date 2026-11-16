"use client";

import { useState } from "react";
import { RiExternalLinkLine } from "@remixicon/react";
import { Badge, Button, Drawer, IconButton } from "@orra-ui/react";

const ROWS = [
  ["客户", "上海禾木咨询有限公司"],
  ["金额", "¥ 48,600.00"],
  ["付款方式", "对公转账"],
  ["创建时间", "2026-11-03 14:22"],
  ["负责人", "周以安"],
];

export default function DrawerDetail() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="soft" onPress={() => setOpen(true)}>
        查看订单 SO-20931
      </Button>
      <Drawer
        isOpen={open}
        onOpenChange={setOpen}
        size="md"
        title="订单 SO-20931"
        description="由受控的 isOpen 打开"
        headerActions={<IconButton icon={<RiExternalLinkLine />} aria-label="在新页面打开" size="sm" />}
        footer={
          <>
            <Button variant="outline" tone="danger" onPress={() => setOpen(false)}>
              取消订单
            </Button>
            <Button onPress={() => setOpen(false)}>标记为已收款</Button>
          </>
        }
      >
        <div className="mb-4">
          <Badge tone="warning">待收款</Badge>
        </div>
        <dl className="divide-y divide-line">
          {ROWS.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-fg-subtle">{k}</dt>
              <dd className="text-fg">{v}</dd>
            </div>
          ))}
        </dl>
      </Drawer>
    </>
  );
}
