"use client";

import { Chip, ChipGroup } from "@orra-ui/react";

const SIZES = ["sm", "md", "lg"] as const;

export default function ChipSizes() {
  return (
    <div className="flex flex-col items-start gap-4">
      {SIZES.map((size) => (
        <ChipGroup key={size} aria-label={`城市（${size}）`} size={size} variant={size === "lg" ? "soft" : "outline"} selectionMode="single" defaultSelectedKeys={["sh"]}>
          <Chip id="sh">上海</Chip>
          <Chip id="sz">深圳</Chip>
          <Chip id="cd">成都</Chip>
          <Chip id="hz" isDisabled>
            杭州（已满）
          </Chip>
        </ChipGroup>
      ))}
    </div>
  );
}
