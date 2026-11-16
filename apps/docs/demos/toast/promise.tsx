"use client";

import { Button, Toaster, toast } from "@orra-ui/react";

const publish = () =>
  new Promise<number>((resolve, reject) => setTimeout(() => (Math.random() > 0.25 ? resolve(128) : reject(new Error("timeout"))), 1800));

export default function ToastPromise() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Toaster />
      <Button
        onPress={() =>
          toast
            .promise(publish, {
              loading: "正在发布报表…",
              success: (n) => `已发布，${n} 位订阅者将收到通知`,
              error: "发布失败，请稍后重试",
            })
            .catch(() => {})
        }
      >
        发布报表
      </Button>
      <Button
        variant="outline"
        tone="neutral"
        onPress={() => {
          const id = toast.loading("正在导入 2,400 行数据…", { description: "0%" });
          let pct = 0;
          const timer = setInterval(() => {
            pct += 20;
            if (pct < 100) toast.update(id, { description: `${pct}%` });
            else {
              clearInterval(timer);
              toast.update(id, { tone: "success", title: "导入完成", description: "2,400 行，0 个错误" });
            }
          }, 500);
        }}
      >
        原地更新进度
      </Button>
    </div>
  );
}
