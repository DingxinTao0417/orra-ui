"use client";

import { RiArrowDownSLine, RiDownloadLine, RiFileCopyLine, RiShareLine } from "@remixicon/react";
import { Button, ButtonGroup, IconButton } from "@orra-ui/react";

export default function ButtonGroupOverview() {
  return (
    <div className="flex flex-col items-center gap-5">
      <ButtonGroup aria-label="文档操作">
        <Button startIcon={<RiFileCopyLine />}>复制</Button>
        <Button startIcon={<RiShareLine />}>分享</Button>
        <Button startIcon={<RiDownloadLine />}>下载</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="发布" variant="solid" tone="accent">
        <Button>立即发布</Button>
        <IconButton icon={<RiArrowDownSLine />} aria-label="更多发布选项" className="border-s border-fg-on-accent/25" />
      </ButtonGroup>
      <ButtonGroup aria-label="分页" size="sm">
        <Button>上一页</Button>
        <Button>下一页</Button>
      </ButtonGroup>
    </div>
  );
}
