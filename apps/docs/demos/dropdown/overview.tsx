"use client";

import {
  RiArchiveLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiFolderTransferLine,
  RiMoreLine,
  RiPencilLine,
  RiShareForwardLine,
  RiStarLine,
} from "@remixicon/react";
import { Dropdown, DropdownItem, DropdownSection, DropdownSeparator, DropdownSubmenu, IconButton } from "@orra-ui/react";

export default function DropdownOverview() {
  return (
    <Dropdown aria-label="文档操作" trigger={<IconButton icon={<RiMoreLine />} aria-label="更多操作" variant="outline" />}>
      <DropdownSection title="文档">
        <DropdownItem id="rename" icon={<RiPencilLine />} shortcut="mod+r">
          重命名
        </DropdownItem>
        <DropdownItem id="duplicate" icon={<RiFileCopyLine />} shortcut="mod+d">
          创建副本
        </DropdownItem>
        <DropdownItem id="star" icon={<RiStarLine />}>
          加入收藏
        </DropdownItem>
        <DropdownSubmenu label="移动到" icon={<RiFolderTransferLine />}>
          <DropdownItem id="move-design">设计规范</DropdownItem>
          <DropdownItem id="move-research">用户研究</DropdownItem>
          <DropdownItem id="move-archive">2025 归档</DropdownItem>
        </DropdownSubmenu>
      </DropdownSection>
      <DropdownSeparator />
      <DropdownItem id="share" icon={<RiShareForwardLine />} description="生成只读链接，7 天后失效">
        分享给外部
      </DropdownItem>
      <DropdownItem id="archive" icon={<RiArchiveLine />}>
        归档
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem id="delete" icon={<RiDeleteBinLine />} tone="danger" shortcut="mod+backspace">
        删除
      </DropdownItem>
    </Dropdown>
  );
}
