"use client";

import { RiAddLine, RiFullscreenLine, RiSubtractLine } from "@remixicon/react";
import { ButtonGroup, IconButton } from "@orra-ui/react";

export default function ButtonGroupVertical() {
  return (
    <div className="flex items-center gap-8">
      <ButtonGroup aria-label="地图缩放" orientation="vertical" size="sm">
        <IconButton icon={<RiAddLine />} aria-label="放大" />
        <IconButton icon={<RiSubtractLine />} aria-label="缩小" />
        <IconButton icon={<RiFullscreenLine />} aria-label="全屏" />
      </ButtonGroup>
      <div className="h-40 w-56 rounded-card border border-dashed border-line-strong bg-surface-muted" />
    </div>
  );
}
