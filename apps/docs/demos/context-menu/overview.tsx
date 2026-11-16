"use client";

import { useState } from "react";
import { RiDeleteBinLine, RiDownloadLine, RiFileCopyLine, RiImageLine, RiPencilLine, RiPriceTag3Line } from "@remixicon/react";
import { ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuSubmenu } from "@orra-ui/react";

export default function ContextMenuOverview() {
  const [last, setLast] = useState("右键、长按或 Shift+F10 打开菜单");
  return (
    <ContextMenu
      aria-label="文件操作"
      onAction={(key) => setLast(`已执行：${String(key)}`)}
      className="flex h-44 w-full max-w-md flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line-strong bg-surface text-center"
      menu={
        <>
          <ContextMenuItem id="rename" icon={<RiPencilLine />} shortcut="f2">
            重命名
          </ContextMenuItem>
          <ContextMenuItem id="copy" icon={<RiFileCopyLine />} shortcut="mod+c">
            复制
          </ContextMenuItem>
          <ContextMenuItem id="download" icon={<RiDownloadLine />}>
            下载原图
          </ContextMenuItem>
          <ContextMenuSubmenu label="添加标签" icon={<RiPriceTag3Line />}>
            <ContextMenuItem id="tag-banner">活动横幅</ContextMenuItem>
            <ContextMenuItem id="tag-social">社交媒体</ContextMenuItem>
            <ContextMenuItem id="tag-print">印刷物料</ContextMenuItem>
          </ContextMenuSubmenu>
          <ContextMenuSeparator />
          <ContextMenuItem id="delete" icon={<RiDeleteBinLine />} tone="danger" shortcut="delete">
            移到回收站
          </ContextMenuItem>
        </>
      }
    >
      <RiImageLine className="size-8 text-fg-subtle" />
      <p className="text-body font-medium text-fg">双十一主视觉.png</p>
      <p className="text-body-sm text-fg-subtle">{last}</p>
    </ContextMenu>
  );
}
