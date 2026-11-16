"use client";

import { Sparkline } from "@orra-ui/react";

const ROWS = [
  { name: "专业版年付", sales: "¥286,400", trend: [42, 45, 44, 49, 52, 55, 58] },
  { name: "团队版月付", sales: "¥118,900", trend: [31, 30, 33, 32, 35, 34, 37] },
  { name: "基础版月付", sales: "¥64,250", trend: [28, 27, 25, 26, 24, 23, 21] },
  { name: "企业版定制", sales: "¥412,000", trend: [12, 18, 15, 22, 19, 26, 31] },
];

export default function SparklineTable() {
  return (
    <div className="mx-auto w-full max-w-lg overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <table className="w-full text-body-sm">
        <thead>
          <tr className="border-b border-line text-start text-caption text-fg-subtle">
            <th className="px-4 py-2.5 text-start font-medium">套餐</th>
            <th className="px-4 py-2.5 text-end font-medium">本周销售额</th>
            <th className="px-4 py-2.5 text-end font-medium">近 7 天</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.name} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5 text-fg">{r.name}</td>
              <td className="px-4 py-2.5 text-end tabular-nums text-fg">{r.sales}</td>
              <td className="px-4 py-2.5 text-end">
                <Sparkline data={r.trend} color="trend" width={80} height={24} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
