"use client";

import { RiDeleteBinLine, RiLogoutBoxRLine } from "@remixicon/react";
import { Button, ConfirmDialog } from "@orra-ui/react";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ModalConfirm() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ConfirmDialog
        tone="danger"
        trigger={
          <Button tone="danger" startIcon={<RiDeleteBinLine />}>
            删除项目
          </Button>
        }
        title="删除「2025 年度预算」？"
        description="项目中的 18 个文件和全部评论将被永久删除，此操作无法撤销。"
        confirmLabel="永久删除"
        onConfirm={() => wait(1400)}
      />
      <ConfirmDialog
        trigger={
          <Button variant="outline" tone="neutral" startIcon={<RiLogoutBoxRLine />}>
            退出登录
          </Button>
        }
        title="确定要退出登录吗？"
        description="未保存的草稿会保留在本机，下次登录后可继续编辑。"
        confirmLabel="退出"
      />
    </div>
  );
}
