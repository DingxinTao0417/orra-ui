"use client";

import { useState } from "react";
import { SearchField } from "@orra-ui/react";

const MEMBERS = [
  { name: "林悦", role: "产品经理" },
  { name: "周明轩", role: "前端工程师" },
  { name: "沈若溪", role: "设计师" },
  { name: "高子航", role: "数据分析师" },
  { name: "许嘉禾", role: "后端工程师" },
  { name: "程一诺", role: "客户成功" },
];

export default function SearchFieldFilter() {
  const [query, setQuery] = useState("");
  const results = MEMBERS.filter((m) => `${m.name}${m.role}`.includes(query.trim()));
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <SearchField label="成员" placeholder="按姓名或岗位筛选" value={query} onChange={setQuery} size="sm" description="按 Esc 清空" />
      <ul className="flex flex-col divide-y divide-line rounded-control border border-line bg-surface">
        {results.map((m) => (
          <li key={m.name} className="flex items-center justify-between px-3 py-2 text-body-sm">
            <span className="text-fg">{m.name}</span>
            <span className="text-fg-subtle">{m.role}</span>
          </li>
        ))}
        {results.length === 0 ? <li className="px-3 py-4 text-center text-body-sm text-fg-subtle">没有找到“{query}”</li> : null}
      </ul>
    </div>
  );
}
