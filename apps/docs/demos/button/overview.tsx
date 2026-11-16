"use client";

import { RiAddLine, RiArrowRightLine, RiDeleteBinLine } from "@remixicon/react";
import { Button } from "@orra-ui/react";

export default function ButtonOverview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button startIcon={<RiAddLine />}>新建项目</Button>
      <Button variant="outline" tone="neutral" endIcon={<RiArrowRightLine />}>
        继续
      </Button>
      <Button variant="soft">稍后提醒</Button>
      <Button variant="solid" tone="danger" startIcon={<RiDeleteBinLine />}>
        删除
      </Button>
    </div>
  );
}
