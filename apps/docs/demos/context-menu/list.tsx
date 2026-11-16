"use client";

import { useState } from "react";
import type { Selection } from "react-aria-components";
import { RiCheckDoubleLine, RiMailLine, RiPushpinLine } from "@remixicon/react";
import { Avatar, ContextMenu, ContextMenuItem, ContextMenuSection, ContextMenuSeparator } from "@orra-ui/react";

const PEOPLE = [
  { name: "顾一鸣", note: "周报已提交，请查收" },
  { name: "林晓雨", note: "设计稿第二版已更新" },
  { name: "陈默", note: "明天的评审改到下午三点" },
];

export default function ContextMenuList() {
  const [sort, setSort] = useState<Selection>(new Set(["time"]));
  return (
    <div className="flex w-full max-w-sm flex-col gap-1">
      {PEOPLE.map((p) => (
        <ContextMenu
          key={p.name}
          aria-label={`${p.name} 的消息`}
          className="flex items-center gap-3 rounded-control px-3 py-2.5 hover:bg-surface-hover data-[open]:bg-surface-hover"
          menu={
            <>
              <ContextMenuItem id="read" icon={<RiCheckDoubleLine />}>
                标为已读
              </ContextMenuItem>
              <ContextMenuItem id="pin" icon={<RiPushpinLine />}>
                置顶会话
              </ContextMenuItem>
              <ContextMenuItem id="mail" icon={<RiMailLine />}>
                通过邮件回复
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuSection title="排序方式" selectionMode="single" selectedKeys={sort} onSelectionChange={setSort}>
                <ContextMenuItem id="time">按时间</ContextMenuItem>
                <ContextMenuItem id="unread">未读优先</ContextMenuItem>
              </ContextMenuSection>
            </>
          }
        >
          <Avatar name={p.name} size="sm" />
          <div className="min-w-0">
            <p className="text-body font-medium text-fg">{p.name}</p>
            <p className="truncate text-body-sm text-fg-subtle">{p.note}</p>
          </div>
        </ContextMenu>
      ))}
    </div>
  );
}
