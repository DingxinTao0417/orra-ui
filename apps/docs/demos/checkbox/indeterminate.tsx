"use client";

import { useState } from "react";
import { Checkbox } from "@orra-ui/react";

const PERMISSIONS = [
  { id: "read", label: "查看项目" },
  { id: "comment", label: "评论与 @ 成员" },
  { id: "edit", label: "编辑内容" },
  { id: "export", label: "导出数据" },
];

export default function CheckboxIndeterminate() {
  const [selected, setSelected] = useState<string[]>(["read", "comment"]);
  const all = selected.length === PERMISSIONS.length;
  const some = selected.length > 0 && !all;
  return (
    <div className="flex w-full max-w-xs flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <Checkbox isSelected={all} isIndeterminate={some} onChange={(on) => setSelected(on ? PERMISSIONS.map((p) => p.id) : [])}>
        <span className="font-medium">全部权限</span>
      </Checkbox>
      <div className="flex flex-col gap-2.5 border-t border-line ps-7 pt-3">
        {PERMISSIONS.map((p) => (
          <Checkbox
            key={p.id}
            size="sm"
            isSelected={selected.includes(p.id)}
            onChange={(on) => setSelected((cur) => (on ? [...cur, p.id] : cur.filter((x) => x !== p.id)))}
          >
            {p.label}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}
