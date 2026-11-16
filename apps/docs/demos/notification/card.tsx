"use client";

import { useState } from "react";
import { RiShieldCheckLine } from "@remixicon/react";
import { Button, NotificationCard } from "@orra-ui/react";

const INITIAL = [
  { id: 1, name: "林晓雨", title: <><b>林晓雨</b> 评论了 <b>首页改版方案</b></>, quote: "导航栏的层级可以再简化一点，移动端会更清爽。", time: "3 分钟前", unread: true },
  { id: 2, name: "顾一鸣", title: <><b>顾一鸣</b> 邀请你加入 <b>增长实验室</b></>, time: "1 小时前", unread: true, invite: true },
  { id: 3, name: "陈默", title: <><b>陈默</b> 完成了任务 <b>整理 Q4 预算表</b></>, time: "昨天", unread: false },
];

export default function NotificationCards() {
  const [items, setItems] = useState(INITIAL);
  return (
    <div className="flex w-full max-w-md flex-col gap-1 rounded-card border border-line bg-surface p-2 shadow-card">
      {items.map((n) => (
        <NotificationCard
          key={n.id}
          actor={{ name: n.name }}
          title={n.title}
          description={n.quote}
          time={n.time}
          unread={n.unread}
          dismissible
          onDismiss={() => setItems((list) => list.filter((x) => x.id !== n.id))}
          actions={
            n.invite ? (
              <>
                <Button size="sm">接受</Button>
                <Button size="sm" variant="outline" tone="neutral">
                  忽略
                </Button>
              </>
            ) : undefined
          }
        />
      ))}
      <NotificationCard
        media={
          <span className="grid size-9 place-items-center rounded-full bg-success-soft text-success">
            <RiShieldCheckLine className="size-[18px]" />
          </span>
        }
        title="新设备登录：MacBook Pro · 上海"
        time="周一"
      />
    </div>
  );
}
