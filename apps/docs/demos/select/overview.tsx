"use client";

import { RiShieldUserLine, RiUserLine, RiUserSettingsLine, RiEyeLine } from "@remixicon/react";
import { Select, SelectItem } from "@orra-ui/react";

export default function SelectOverview() {
  return (
    <div className="w-full max-w-xs">
      <Select label="成员角色" placeholder="选择角色" defaultSelectedKey="editor" description="角色决定成员在工作区内能做什么。">
        <SelectItem id="owner" icon={<RiShieldUserLine />} description="管理账单、成员与所有设置">
          所有者
        </SelectItem>
        <SelectItem id="admin" icon={<RiUserSettingsLine />} description="管理成员和项目，不含账单">
          管理员
        </SelectItem>
        <SelectItem id="editor" icon={<RiUserLine />} description="创建和编辑项目内容">
          编辑者
        </SelectItem>
        <SelectItem id="viewer" icon={<RiEyeLine />} description="只能查看和评论">
          访客
        </SelectItem>
      </Select>
    </div>
  );
}
