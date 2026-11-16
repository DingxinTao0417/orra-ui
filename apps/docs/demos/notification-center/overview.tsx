"use client";

import { useState } from "react";
import { RiDownload2Line, RiGitBranchLine } from "@remixicon/react";
import { LinkButton, NotificationCenter, type NotificationCenterItem } from "@orra-ui/react";

const MIN = 60_000;
const HOUR = 60 * MIN;

/** Times are relative to when the page loads. */
function demoInbox(now = Date.now()): NotificationCenterItem[] {
  return [
    {
      id: "m1",
      actor: { name: "沈晓雯" },
      title: (
        <>
          <b>沈晓雯</b> 在 <b>Q4 增长复盘</b> 中提到了你
        </>
      ),
      description: "@林依然 渠道拆分的数据能在周五前补上吗？",
      time: now - 6 * MIN,
      mention: true,
    },
    {
      id: "m2",
      actor: { name: "朴立恒" },
      title: (
        <>
          <b>朴立恒</b> 邀请你加入项目 <b>移动端 2.0</b>
        </>
      ),
      time: now - 47 * MIN,
      actions: [
        { id: "accept", label: "接受", tone: "accent" },
        { id: "decline", label: "拒绝" },
      ],
    },
    {
      id: "m3",
      icon: <RiGitBranchLine />,
      tone: "danger",
      title: (
        <>
          流水线 <b>web-main #2381</b> 构建失败
        </>
      ),
      time: now - 2 * HOUR,
    },
    {
      id: "m4",
      actor: { name: "王思远" },
      title: (
        <>
          <b>王思远</b> 将任务 <b>OPS-118 迁移日志服务</b> 指派给了你
        </>
      ),
      time: now - 25 * HOUR,
      read: true,
    },
    {
      id: "m5",
      actor: { name: "阮安娜" },
      title: (
        <>
          <b>阮安娜</b> 回复了你的评论
        </>
      ),
      description: "同意，第二步直接去掉，转化应该会更好。",
      time: now - 28 * HOUR,
      read: true,
      mention: true,
    },
    {
      id: "m6",
      icon: <RiDownload2Line />,
      tone: "success",
      title: (
        <>
          导出文件 <b>11 月客户名单.csv</b> 已就绪
        </>
      ),
      time: now - 4 * 24 * HOUR,
      read: true,
    },
  ];
}

export default function NotificationCenterOverview() {
  const [items, setItems] = useState(() => demoInbox());
  return (
    <div className="w-full max-w-[420px]">
      <NotificationCenter
        items={items}
        onItemsChange={setItems}
        onSettings={() => {}}
        footer={
          <LinkButton href="#" tone="muted" size="sm">
            查看全部通知
          </LinkButton>
        }
      />
    </div>
  );
}
