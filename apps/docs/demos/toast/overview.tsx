"use client";

import { Button, Toaster, toast } from "@orra-ui/react";

export default function ToastOverview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Toaster />
      <Button variant="outline" tone="neutral" onPress={() => toast("草稿已自动保存")}>
        普通
      </Button>
      <Button variant="outline" tone="neutral" onPress={() => toast.success("邀请已发送", { description: "顾一鸣会收到一封加入工作区的邮件。" })}>
        成功
      </Button>
      <Button variant="outline" tone="neutral" onPress={() => toast.warning("存储空间即将用尽", { description: "已使用 92%，建议清理回收站。" })}>
        警告
      </Button>
      <Button
        variant="outline"
        tone="neutral"
        onPress={() => toast.error("付款失败", { description: "银行卡余额不足，请更换付款方式。", duration: 8000 })}
      >
        错误
      </Button>
      <Button
        variant="outline"
        tone="neutral"
        onPress={() =>
          toast.info("已将 3 个文件移到回收站", {
            action: { label: "撤销", onPress: () => toast.success("已恢复 3 个文件") },
          })
        }
      >
        带操作
      </Button>
    </div>
  );
}
