"use client";

import { useState } from "react";
import { RiFileExcel2Line } from "@remixicon/react";
import { NotificationCenterPopover, SearchField, type NotificationCenterItem } from "@orra-ui/react";

const now = Date.now();
const INBOX: NotificationCenterItem[] = [
  {
    id: "p1",
    actor: { name: "韩奥马" },
    title: (
      <>
        <b>韩奥马</b> 请你评审 <b>结算页改版 PR #482</b>
      </>
    ),
    time: now - 12 * 60_000,
    actions: [
      { id: "review", label: "去评审", tone: "accent" },
      { id: "later", label: "稍后" },
    ],
  },
  {
    id: "p2",
    actor: { name: "金诺亚" },
    title: (
      <>
        <b>金诺亚</b> 在 <b>发布清单</b> 中提到了你
      </>
    ),
    description: "@林依然 灰度比例先调到 20%？",
    time: now - 3 * 3_600_000,
    mention: true,
  },
  {
    id: "p3",
    icon: <RiFileExcel2Line />,
    tone: "success",
    title: (
      <>
        报表 <b>10 月营收明细</b> 已生成
      </>
    ),
    time: now - 30 * 3_600_000,
    read: true,
  },
];

export default function NotificationCenterInPopover() {
  const [items, setItems] = useState(INBOX);
  return (
    <div className="flex w-full max-w-xl items-center gap-3 rounded-card border border-line bg-surface px-4 py-2.5 shadow-card">
      <span className="text-body font-semibold text-fg">项目看板</span>
      <div className="flex-1" />
      <SearchField size="sm" aria-label="搜索" className="w-48" />
      <NotificationCenterPopover items={items} onItemsChange={setItems} onAction={(item, action) => console.log(item.id, action)} />
    </div>
  );
}
