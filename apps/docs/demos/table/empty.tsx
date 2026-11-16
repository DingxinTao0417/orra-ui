"use client";

import { RiAddLine, RiFileList3Line } from "@remixicon/react";
import { Button, Table, TableBody, TableColumn, TableEmptyState, TableHeader } from "@orra-ui/react";

export default function TableEmpty() {
  return (
    <div className="w-full max-w-2xl">
      <Table aria-label="发票">
        <TableHeader>
          <TableColumn isRowHeader>发票号</TableColumn>
          <TableColumn>客户</TableColumn>
          <TableColumn align="end">金额</TableColumn>
          <TableColumn align="end">开具日期</TableColumn>
        </TableHeader>
        <TableBody
          renderEmptyState={() => (
            <TableEmptyState
              icon={<RiFileList3Line />}
              title="还没有发票"
              description="完成第一笔订单后，系统会自动生成发票并显示在这里。"
              action={
                <Button size="sm" variant="outline" tone="neutral" startIcon={<RiAddLine />}>
                  手动开票
                </Button>
              }
            />
          )}
        >
          {[]}
        </TableBody>
      </Table>
    </div>
  );
}
