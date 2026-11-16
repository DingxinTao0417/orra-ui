"use client";

import { Combobox, ComboboxItem } from "@orra-ui/react";

const PEOPLE = [
  { id: "ly", name: "林悦", email: "lin.yue@northwind.cn", team: "产品" },
  { id: "zmx", name: "周明轩", email: "zhou.mx@northwind.cn", team: "前端" },
  { id: "srx", name: "沈若溪", email: "shen.rx@northwind.cn", team: "设计" },
  { id: "gzh", name: "高子航", email: "gao.zh@northwind.cn", team: "数据" },
  { id: "xjh", name: "许嘉禾", email: "xu.jh@northwind.cn", team: "后端" },
];

function Initial({ name }: { name: string }) {
  return <span className="flex size-4 items-center justify-center rounded-full bg-accent-100 text-micro font-semibold text-fg-accent">{name.slice(-1)}</span>;
}

export default function ComboboxRich() {
  return (
    <div className="w-full max-w-xs">
      <Combobox label="指派给" placeholder="搜索成员" startIcon defaultItems={PEOPLE} emptyState="没有找到这位成员">
        {(p) => (
          <ComboboxItem id={p.id} textValue={p.name} icon={<Initial name={p.name} />} description={p.email} meta={p.team}>
            {p.name}
          </ComboboxItem>
        )}
      </Combobox>
    </div>
  );
}
