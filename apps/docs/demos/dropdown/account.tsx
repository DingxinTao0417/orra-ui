"use client";

import { useState } from "react";
import { RiBankCardLine, RiLogoutBoxRLine, RiQuestionLine, RiSettings3Line, RiUserLine } from "@remixicon/react";
import { Avatar, Button, Dropdown, DropdownItem, DropdownSection, DropdownSeparator } from "@orra-ui/react";

export default function DropdownAccount() {
  const [last, setLast] = useState<string>("—");
  return (
    <div className="flex flex-col items-center gap-3">
      <Dropdown
        aria-label="账户菜单"
        placement="bottom end"
        onAction={(key) => setLast(String(key))}
        className="w-60"
        trigger={
          <Button variant="plain" tone="neutral" className="h-11 gap-2.5 ps-1.5">
            <Avatar name="许嘉宁" size="sm" />
            <span className="text-body font-medium">许嘉宁</span>
          </Button>
        }
      >
        <DropdownSection title="jianing.xu@orbit.cn">
          <DropdownItem id="profile" icon={<RiUserLine />}>
            个人资料
          </DropdownItem>
          <DropdownItem id="billing" icon={<RiBankCardLine />}>
            账单与套餐
          </DropdownItem>
          <DropdownItem id="settings" icon={<RiSettings3Line />} shortcut="mod+,">
            偏好设置
          </DropdownItem>
        </DropdownSection>
        <DropdownSeparator />
        <DropdownItem id="help" icon={<RiQuestionLine />} href="#">
          帮助中心
        </DropdownItem>
        <DropdownItem id="logout" icon={<RiLogoutBoxRLine />} tone="danger">
          退出登录
        </DropdownItem>
      </Dropdown>
      <p className="text-body-sm text-fg-subtle">上次选择：{last}</p>
    </div>
  );
}
