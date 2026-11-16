"use client";

import { useState } from "react";
import type { Key } from "react-aria-components";
import { RiAlignCenter, RiAlignLeft, RiAlignRight, RiBold, RiItalic, RiUnderline } from "@remixicon/react";
import { ButtonGroup, ButtonGroupItem } from "@orra-ui/react";

export default function ButtonGroupSelectable() {
  const [range, setRange] = useState<Set<Key>>(new Set(["7d"]));
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-3">
        <ButtonGroup aria-label="文字样式" selectionMode="multiple" defaultSelectedKeys={["bold"]}>
          <ButtonGroupItem id="bold" icon={<RiBold />} aria-label="加粗" />
          <ButtonGroupItem id="italic" icon={<RiItalic />} aria-label="斜体" />
          <ButtonGroupItem id="underline" icon={<RiUnderline />} aria-label="下划线" />
        </ButtonGroup>
        <ButtonGroup aria-label="对齐方式" selectionMode="single" disallowEmptySelection defaultSelectedKeys={["left"]}>
          <ButtonGroupItem id="left" icon={<RiAlignLeft />} aria-label="左对齐" />
          <ButtonGroupItem id="center" icon={<RiAlignCenter />} aria-label="居中" />
          <ButtonGroupItem id="right" icon={<RiAlignRight />} aria-label="右对齐" />
        </ButtonGroup>
      </div>
      <ButtonGroup aria-label="时间范围" size="sm" selectionMode="single" disallowEmptySelection selectedKeys={range} onSelectionChange={setRange}>
        <ButtonGroupItem id="24h">24 小时</ButtonGroupItem>
        <ButtonGroupItem id="7d">7 天</ButtonGroupItem>
        <ButtonGroupItem id="30d">30 天</ButtonGroupItem>
        <ButtonGroupItem id="90d">90 天</ButtonGroupItem>
      </ButtonGroup>
      <span className="text-caption text-fg-subtle">当前范围：{[...range].join("")}</span>
    </div>
  );
}
