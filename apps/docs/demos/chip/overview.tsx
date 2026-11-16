"use client";

import { useState } from "react";
import type { Selection } from "react-aria-components";
import { RiFireLine, RiStarLine, RiTimeLine } from "@remixicon/react";
import { Chip, ChipGroup } from "@orra-ui/react";

export default function ChipOverview() {
  const [selected, setSelected] = useState<Selection>(new Set(["hot"]));
  const count = selected === "all" ? 4 : selected.size;
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ChipGroup label="筛选模板" selectionMode="multiple" selectedKeys={selected} onSelectionChange={setSelected}>
        <Chip id="hot" icon={<RiFireLine />}>
          热门
        </Chip>
        <Chip id="new" icon={<RiTimeLine />}>
          最新上架
        </Chip>
        <Chip id="starred" icon={<RiStarLine />}>
          我的收藏
        </Chip>
        <Chip id="free">免费</Chip>
      </ChipGroup>
      <span className="text-caption text-fg-subtle">已选 {count} 个条件</span>
    </div>
  );
}
