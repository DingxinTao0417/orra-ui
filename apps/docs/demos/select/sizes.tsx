"use client";

import { RiGlobalLine } from "@remixicon/react";
import { Select, SelectItem, type Size } from "@orra-ui/react";

const SIZES: Size[] = ["sm", "md", "lg"];

export default function SelectSizes() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      {SIZES.map((size) => (
        <Select key={size} aria-label={`语言（${size}）`} size={size} startIcon={<RiGlobalLine />} defaultSelectedKey="zh">
          <SelectItem id="zh">简体中文</SelectItem>
          <SelectItem id="en">English</SelectItem>
          <SelectItem id="ja">日本語</SelectItem>
        </Select>
      ))}
      <Select aria-label="已禁用" isDisabled placeholder="已禁用">
        <SelectItem id="a">选项</SelectItem>
      </Select>
    </div>
  );
}
