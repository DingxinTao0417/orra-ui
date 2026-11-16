"use client";

import { useState } from "react";
import { RiDownload2Line } from "@remixicon/react";
import { Button, DataGrid, dataGridSampleColumns, dataGridSampleRows } from "@orra-ui/react";

// 240 rows of sample sales data; only the visible rows are rendered.
const COLUMNS = dataGridSampleColumns("zh");

export default function DataGridOverview() {
  const [rows, setRows] = useState(() => dataGridSampleRows("zh"));
  return (
    <div className="h-[560px] w-full">
      <DataGrid
        title="Q4 销售明细"
        columns={COLUMNS}
        rows={rows}
        onRowsChange={setRows}
        defaultSort={{ key: "revenue", direction: "desc" }}
        toolbarActions={
          <Button size="sm" variant="outline" tone="neutral" startIcon={<RiDownload2Line />}>
            导出
          </Button>
        }
      />
    </div>
  );
}
