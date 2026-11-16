"use client";

import { useState } from "react";
import type { Selection } from "react-aria-components";
import { RiArrowDownSLine, RiLayoutColumnLine } from "@remixicon/react";
import { Button, Dropdown, DropdownItem, DropdownSection, DropdownSeparator } from "@orra-ui/react";

export default function DropdownSelection() {
  const [columns, setColumns] = useState<Selection>(new Set(["owner", "status", "amount"]));
  const [density, setDensity] = useState<Selection>(new Set(["comfortable"]));
  return (
    <Dropdown
      aria-label="表格视图"
      trigger={
        <Button variant="outline" tone="neutral" startIcon={<RiLayoutColumnLine />} endIcon={<RiArrowDownSLine />}>
          视图
        </Button>
      }
    >
      <DropdownSection title="显示列" selectionMode="multiple" selectedKeys={columns} onSelectionChange={setColumns}>
        <DropdownItem id="owner">负责人</DropdownItem>
        <DropdownItem id="status">状态</DropdownItem>
        <DropdownItem id="amount">金额</DropdownItem>
        <DropdownItem id="updated">更新时间</DropdownItem>
      </DropdownSection>
      <DropdownSeparator />
      <DropdownSection title="行高" selectionMode="single" selectedKeys={density} onSelectionChange={setDensity} disallowEmptySelection>
        <DropdownItem id="compact">紧凑</DropdownItem>
        <DropdownItem id="comfortable">舒适</DropdownItem>
        <DropdownItem id="spacious">宽松</DropdownItem>
      </DropdownSection>
    </Dropdown>
  );
}
