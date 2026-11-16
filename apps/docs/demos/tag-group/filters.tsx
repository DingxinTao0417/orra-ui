"use client";

import { useState } from "react";
import { Tag, TagGroup } from "@orra-ui/react";

const STATUS = [
  { id: "todo", label: "待处理", dot: "bg-fg-subtle" },
  { id: "doing", label: "进行中", dot: "bg-accent-500" },
  { id: "review", label: "待评审", dot: "bg-warning" },
  { id: "done", label: "已完成", dot: "bg-success" },
];

export default function TagGroupFilters() {
  const [selected, setSelected] = useState<Set<string | number> | "all">(new Set(["doing", "review"]));
  const [view, setView] = useState<Set<string | number> | "all">(new Set(["week"]));
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <TagGroup label="状态（多选）" selectionMode="multiple" selectedKeys={selected} onSelectionChange={setSelected}>
        {STATUS.map((s) => (
          <Tag key={s.id} id={s.id} icon={<span className={`size-1.5 rounded-full ${s.dot}`} />}>
            {s.label}
          </Tag>
        ))}
      </TagGroup>
      <TagGroup label="时间（单选）" size="sm" selectionMode="single" disallowEmptySelection selectedKeys={view} onSelectionChange={setView}>
        <Tag id="today">今天</Tag>
        <Tag id="week">本周</Tag>
        <Tag id="month">本月</Tag>
        <Tag id="quarter">本季度</Tag>
      </TagGroup>
    </div>
  );
}
