"use client";

import { useState } from "react";
import { Button, Modal } from "@orra-ui/react";

export default function ModalControlled() {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="soft" onPress={() => setOpen(true)}>
        查看服务条款
      </Button>
      <p className="text-body-sm text-fg-subtle">{accepted ? "已同意，感谢！" : "尚未同意"}</p>
      <Modal
        isOpen={open}
        onOpenChange={setOpen}
        isDismissable={false}
        title="服务条款更新"
        description="请阅读后选择是否同意，点击遮罩不会关闭此窗口。"
        footer={
          <>
            <Button variant="outline" tone="neutral" onPress={() => setOpen(false)}>
              稍后再说
            </Button>
            <Button
              onPress={() => {
                setAccepted(true);
                setOpen(false);
              }}
            >
              同意并继续
            </Button>
          </>
        }
      >
        <p>
          我们更新了数据保留政策：自 2026 年 12 月起，操作日志默认保留 180 天，企业版可延长至 3 年。你的数据仍仅用于提供服务，不会出售给第三方。
        </p>
      </Modal>
    </div>
  );
}
