"use client";

import { RiAddLine, RiDeleteBinLine, RiHeart3Line, RiMoreLine, RiShareLine } from "@remixicon/react";
import { IconButton } from "@orra-ui/react";

export default function IconButtonOverview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <IconButton icon={<RiMoreLine />} aria-label="更多操作" />
      <IconButton icon={<RiShareLine />} aria-label="分享" variant="outline" />
      <IconButton icon={<RiHeart3Line />} aria-label="收藏" variant="soft" tone="accent" />
      <IconButton icon={<RiAddLine />} aria-label="新建" variant="solid" tone="accent" round />
      <IconButton icon={<RiDeleteBinLine />} aria-label="删除" variant="plain" tone="danger" />
    </div>
  );
}
