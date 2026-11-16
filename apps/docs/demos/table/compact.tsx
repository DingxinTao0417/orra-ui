"use client";

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@orra-ui/react";

const CITIES = ["上海", "北京", "深圳", "杭州", "成都", "武汉", "南京", "西安", "苏州", "重庆", "长沙", "青岛"];
const ROWS = CITIES.map((city, i) => ({
  id: city,
  city,
  orders: 1840 - i * 117,
  revenue: 286000 - i * 18350,
  conversion: (4.6 - i * 0.21).toFixed(1),
}));

const money = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 });

export default function TableCompact() {
  return (
    <div className="w-full max-w-xl">
      <Table aria-label="城市销售明细" density="compact" stickyHeader maxHeight={280} striped>
        <TableHeader>
          <TableColumn isRowHeader>城市</TableColumn>
          <TableColumn align="end">订单数</TableColumn>
          <TableColumn align="end">销售额</TableColumn>
          <TableColumn align="end">转化率</TableColumn>
        </TableHeader>
        <TableBody items={ROWS}>
          {(r) => (
            <TableRow id={r.id}>
              <TableCell className="font-medium">{r.city}</TableCell>
              <TableCell align="end" numeric>
                {r.orders.toLocaleString("zh-CN")}
              </TableCell>
              <TableCell align="end" numeric>
                {money.format(r.revenue)}
              </TableCell>
              <TableCell align="end" numeric muted>
                {r.conversion}%
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
