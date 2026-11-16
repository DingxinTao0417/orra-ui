"use client";

import { Avatar, AvatarGroup } from "@orra-ui/react";

const REVIEWERS = ["Priya Nair", "王嘉禾", "Lucas Martin", "赵一鸣", "Hana Sato"];

export default function AvatarGroupDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      {[
        { title: "设计评审", people: REVIEWERS.slice(0, 3), total: undefined },
        { title: "增长实验周会", people: REVIEWERS, total: 18 },
      ].map((row) => (
        <div key={row.title} className="flex items-center justify-between rounded-control border border-line bg-surface px-4 py-3">
          <div className="flex flex-col">
            <span className="text-body-sm font-medium text-fg">{row.title}</span>
            <span className="text-caption text-fg-subtle">{row.total ?? row.people.length} 位参与者</span>
          </div>
          <AvatarGroup size="sm" max={3} total={row.total}>
            {row.people.map((name) => (
              <Avatar key={name} name={name} />
            ))}
          </AvatarGroup>
        </div>
      ))}
    </div>
  );
}
