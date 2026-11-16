"use client";

import { useEffect, useState } from "react";
import { Progress } from "@orra-ui/react";

export default function ProgressOverview() {
  const [value, setValue] = useState(18);
  useEffect(() => {
    const id = setInterval(() => setValue((v) => (v >= 100 ? 8 : Math.min(100, v + 7))), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Progress label="上传 季度复盘.mp4" value={value} description={value >= 100 ? "上传完成" : "剩余约 1 分钟"} tone={value >= 100 ? "success" : "accent"} />
      <Progress label="正在索引知识库" isIndeterminate size="sm" />
    </div>
  );
}
