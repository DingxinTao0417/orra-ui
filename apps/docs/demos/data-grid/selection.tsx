"use client";

import { useState } from "react";
import { RiDeleteBinLine } from "@remixicon/react";
import { Button, DataGrid, type DataGridColumn } from "@orra-ui/react";

type Employee = { id: string; name: string; dept: string; title: string; level: number; joined: string };

const COLUMNS: DataGridColumn<Employee>[] = [
  { key: "name", header: "姓名", width: 120 },
  {
    key: "dept",
    header: "部门",
    type: "select",
    width: 120,
    options: [
      { id: "eng", label: "研发", tone: "info" },
      { id: "design", label: "设计", tone: "accent" },
      { id: "sales", label: "销售", tone: "warning" },
      { id: "ops", label: "运营", tone: "success" },
    ],
  },
  { key: "title", header: "职位", width: 160 },
  { key: "level", header: "职级", type: "number", width: 90, summary: "avg" },
  { key: "joined", header: "入职日期", type: "date", width: 130, summary: "count" },
];

const ROWS: Employee[] = [
  { id: "e1", name: "林依然", dept: "eng", title: "前端工程师", level: 6, joined: "2022-03-14" },
  { id: "e2", name: "沈晓雯", dept: "design", title: "交互设计师", level: 5, joined: "2023-07-03" },
  { id: "e3", name: "朴立恒", dept: "eng", title: "后端工程师", level: 7, joined: "2021-09-01" },
  { id: "e4", name: "王思远", dept: "sales", title: "大客户经理", level: 6, joined: "2024-02-19" },
  { id: "e5", name: "阮安娜", dept: "ops", title: "内容运营", level: 4, joined: "2025-05-12" },
  { id: "e6", name: "金诺亚", dept: "eng", title: "数据工程师", level: 6, joined: "2022-11-28" },
  { id: "e7", name: "韩奥马", dept: "sales", title: "销售总监", level: 9, joined: "2019-04-08" },
];

export default function DataGridSelection() {
  const [rows, setRows] = useState(ROWS);
  const [selected, setSelected] = useState<Set<string>>(new Set(["e2", "e5"]));
  return (
    <div className="h-[440px] w-full">
      <DataGrid
        columns={COLUMNS}
        rows={rows}
        onRowsChange={setRows}
        selectedKeys={selected}
        onSelectionChange={setSelected}
        stickyFirstColumn={false}
        toolbarActions={
          <Button
            size="sm"
            variant="outline"
            tone="danger"
            startIcon={<RiDeleteBinLine />}
            isDisabled={selected.size === 0}
            onPress={() => {
              setRows((list) => list.filter((r) => !selected.has(r.id)));
              setSelected(new Set());
            }}
          >
            删除所选
          </Button>
        }
      />
    </div>
  );
}
