"use client";

import { Select, SelectItem, SelectSection } from "@orra-ui/react";

export default function SelectSections() {
  return (
    <div className="w-full max-w-xs">
      <Select label="时区" placeholder="选择时区" defaultSelectedKey="shanghai">
        <SelectSection title="亚洲">
          <SelectItem id="shanghai" meta="UTC+8">上海</SelectItem>
          <SelectItem id="tokyo" meta="UTC+9">东京</SelectItem>
          <SelectItem id="singapore" meta="UTC+8">新加坡</SelectItem>
        </SelectSection>
        <SelectSection title="欧洲">
          <SelectItem id="london" meta="UTC+0">伦敦</SelectItem>
          <SelectItem id="berlin" meta="UTC+1">柏林</SelectItem>
        </SelectSection>
        <SelectSection title="美洲">
          <SelectItem id="newyork" meta="UTC−5">纽约</SelectItem>
          <SelectItem id="saopaulo" meta="UTC−3" isDisabled>
            圣保罗（暂不支持）
          </SelectItem>
        </SelectSection>
      </Select>
    </div>
  );
}
