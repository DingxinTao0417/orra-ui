"use client";

import { useState } from "react";
import type { Key } from "react-aria-components";
import { RiBellLine, RiLockLine, RiPaletteLine, RiUserLine } from "@remixicon/react";
import { Tab, TabList, TabPanel, Tabs, type TabsVariant } from "@orra-ui/react";

const SECTIONS = [
  { id: "profile", label: "个人资料", icon: <RiUserLine />, text: "修改头像、昵称和个人简介。" },
  { id: "notify", label: "通知", icon: <RiBellLine />, text: "选择通过邮件、短信或站内信接收提醒。" },
  { id: "appearance", label: "外观", icon: <RiPaletteLine />, text: "切换浅色 / 深色模式以及强调色。" },
  { id: "security", label: "安全", icon: <RiLockLine />, text: "管理两步验证与已登录的设备。" },
];

export default function TabsVertical() {
  const [selected, setSelected] = useState<Key>("notify");
  return (
    <div className="grid w-full max-w-2xl gap-8 sm:grid-cols-2">
      {(["underline", "pill"] as TabsVariant[]).map((variant) => (
        <Tabs key={variant} variant={variant} orientation="vertical" selectedKey={selected} onSelectionChange={setSelected}>
          <TabList aria-label="设置" className="w-36 shrink-0">
            {SECTIONS.map((s) => (
              <Tab key={s.id} id={s.id} icon={s.icon}>
                {s.label}
              </Tab>
            ))}
          </TabList>
          {SECTIONS.map((s) => (
            <TabPanel key={s.id} id={s.id} className="pt-2 text-body-sm text-fg-muted">
              {s.text}
            </TabPanel>
          ))}
        </Tabs>
      ))}
    </div>
  );
}
