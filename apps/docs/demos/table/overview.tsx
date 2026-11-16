"use client";

import { useMemo, useState } from "react";
import type { Selection, SortDescriptor } from "react-aria-components";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, TableStatus, TableUser, type BadgeTone } from "@orra-ui/react";

type Member = { id: string; name: string; email: string; role: string; status: "active" | "invited" | "suspended"; seats: number; lastSeen: string };

const MEMBERS: Member[] = [
  { id: "1", name: "林晓雨", email: "xiaoyu.lin@lumen.cn", role: "管理员", status: "active", seats: 12, lastSeen: "刚刚" },
  { id: "2", name: "Marta Kowalski", email: "marta@lumen.cn", role: "编辑", status: "active", seats: 4, lastSeen: "2 小时前" },
  { id: "3", name: "周子航", email: "zihang.zhou@lumen.cn", role: "编辑", status: "invited", seats: 0, lastSeen: "—" },
  { id: "4", name: "Priya Nair", email: "priya@lumen.cn", role: "访客", status: "active", seats: 1, lastSeen: "昨天" },
  { id: "5", name: "王嘉禾", email: "jiahe.wang@lumen.cn", role: "财务", status: "suspended", seats: 2, lastSeen: "3 周前" },
];

const STATUS: Record<Member["status"], { label: string; tone: BadgeTone }> = {
  active: { label: "已激活", tone: "success" },
  invited: { label: "待接受", tone: "warning" },
  suspended: { label: "已停用", tone: "neutral" },
};

export default function TableOverview() {
  const [sort, setSort] = useState<SortDescriptor>({ column: "name", direction: "ascending" });
  const [selected, setSelected] = useState<Selection>(new Set(["2"]));
  const rows = useMemo(() => {
    const key = sort.column as keyof Member;
    const sorted = [...MEMBERS].sort((a, b) => String(a[key]).localeCompare(String(b[key]), "zh", { numeric: true }));
    return sort.direction === "descending" ? sorted.reverse() : sorted;
  }, [sort]);

  return (
    <div className="w-full max-w-3xl">
      <Table aria-label="团队成员" selectionMode="multiple" selectedKeys={selected} onSelectionChange={setSelected} sortDescriptor={sort} onSortChange={setSort}>
        <TableHeader>
          <TableColumn id="name" isRowHeader allowsSorting>
            成员
          </TableColumn>
          <TableColumn id="role" allowsSorting>
            角色
          </TableColumn>
          <TableColumn id="status">状态</TableColumn>
          <TableColumn id="seats" align="end" allowsSorting>
            席位
          </TableColumn>
          <TableColumn id="lastSeen" align="end">
            最近活跃
          </TableColumn>
        </TableHeader>
        <TableBody items={rows}>
          {(m) => (
            <TableRow id={m.id}>
              <TableCell>
                <TableUser name={m.name} description={m.email} />
              </TableCell>
              <TableCell muted>{m.role}</TableCell>
              <TableCell>
                <TableStatus tone={STATUS[m.status].tone}>{STATUS[m.status].label}</TableStatus>
              </TableCell>
              <TableCell align="end" numeric>
                {m.seats}
              </TableCell>
              <TableCell align="end" muted>
                {m.lastSeen}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
