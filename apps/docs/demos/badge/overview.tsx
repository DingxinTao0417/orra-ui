"use client";

import { RiCheckLine, RiSparklingLine } from "@remixicon/react";
import { Badge } from "@orra-ui/react";

export default function BadgeOverview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Badge tone="success" dot>
        运行中
      </Badge>
      <Badge tone="warning" dot>
        待审核
      </Badge>
      <Badge tone="danger" dot>
        构建失败
      </Badge>
      <Badge tone="accent" icon={<RiSparklingLine />}>
        AI 生成
      </Badge>
      <Badge tone="info" icon={<RiCheckLine />} variant="outline">
        已验证
      </Badge>
      <Badge variant="solid" tone="accent">
        新
      </Badge>
      <Badge>草稿</Badge>
    </div>
  );
}
