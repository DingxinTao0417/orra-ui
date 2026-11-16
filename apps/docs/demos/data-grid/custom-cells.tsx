"use client";

import { useState } from "react";
import { Avatar, DataGrid, Meter, type DataGridColumn } from "@orra-ui/react";

type Project = { id: string; name: string; lead: string; status: string; budget: number; spent: number; due: string };

const COLUMNS: DataGridColumn<Project>[] = [
  { key: "name", header: "项目", width: 180 },
  {
    key: "lead",
    header: "负责人",
    width: 140,
    render: (v) => (
      <span className="flex min-w-0 items-center gap-2">
        <Avatar name={String(v)} size="xs" />
        <span className="truncate">{String(v)}</span>
      </span>
    ),
  },
  {
    key: "status",
    header: "状态",
    type: "select",
    width: 110,
    options: [
      { id: "plan", label: "规划中", tone: "neutral" },
      { id: "doing", label: "进行中", tone: "info" },
      { id: "risk", label: "有风险", tone: "warning" },
      { id: "done", label: "已完成", tone: "success" },
    ],
  },
  { key: "budget", header: "预算", type: "currency", currency: "CNY", width: 130, summary: "sum" },
  { key: "spent", header: "已花费", type: "currency", currency: "CNY", width: 130, summary: "sum" },
  {
    key: "id",
    header: "预算使用",
    width: 170,
    editable: false,
    sortable: false,
    filterable: false,
    render: (_, row) => (
      <Meter aria-label={`${row.name} 预算使用`} value={row.spent} maxValue={row.budget} showStatus={false} valueLabel=" " size="sm" className="w-full" />
    ),
  },
  { key: "due", header: "截止日期", type: "date", width: 130 },
];

const ROWS: Project[] = [
  { id: "p1", name: "官网改版", lead: "沈晓雯", status: "doing", budget: 180000, spent: 126000, due: "2026-12-15" },
  { id: "p2", name: "移动端 2.0", lead: "朴立恒", status: "risk", budget: 420000, spent: 398000, due: "2026-12-01" },
  { id: "p3", name: "会员体系升级", lead: "林依然", status: "plan", budget: 90000, spent: 8000, due: "2027-02-28" },
  { id: "p4", name: "数据中台迁移", lead: "金诺亚", status: "doing", budget: 650000, spent: 312000, due: "2027-03-31" },
  { id: "p5", name: "客服机器人", lead: "韩奥马", status: "done", budget: 120000, spent: 114500, due: "2026-10-20" },
  { id: "p6", name: "品牌视觉更新", lead: "阮安娜", status: "doing", budget: 75000, spent: 41000, due: "2026-11-30" },
];

export default function DataGridCustomCells() {
  const [rows, setRows] = useState(ROWS);
  return (
    <div className="h-[420px] w-full">
      <DataGrid columns={COLUMNS} rows={rows} onRowsChange={setRows} density="compact" defaultShowFilters selectable={false} title="项目预算" />
    </div>
  );
}
