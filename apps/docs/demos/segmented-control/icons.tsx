"use client";

import { RiCalendarLine, RiKanbanView, RiListUnordered, RiMoonLine, RiComputerLine, RiSunLine } from "@remixicon/react";
import { SegmentedControl, SegmentedControlItem } from "@orra-ui/react";

export default function SegmentedControlIcons() {
  return (
    <div className="flex flex-col items-center gap-4">
      <SegmentedControl aria-label="视图" defaultValue="board">
        <SegmentedControlItem id="list" icon={<RiListUnordered />}>
          列表
        </SegmentedControlItem>
        <SegmentedControlItem id="board" icon={<RiKanbanView />}>
          看板
        </SegmentedControlItem>
        <SegmentedControlItem id="calendar" icon={<RiCalendarLine />}>
          日历
        </SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl
        aria-label="外观"
        size="sm"
        defaultValue="system"
        options={[
          { id: "light", icon: <RiSunLine />, "aria-label": "浅色" },
          { id: "dark", icon: <RiMoonLine />, "aria-label": "深色" },
          { id: "system", icon: <RiComputerLine />, "aria-label": "跟随系统" },
        ]}
      />
    </div>
  );
}
