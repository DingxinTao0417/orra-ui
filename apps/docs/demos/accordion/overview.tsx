"use client";

import { Accordion, AccordionItem } from "@orra-ui/react";

const FAQ = [
  { id: "trial", title: "免费试用包含哪些功能？", body: "14 天内可使用团队版的全部功能，包括无限看板、自动化规则和 PDF 导出，无需绑定银行卡。" },
  { id: "seats", title: "如何按席位计费？", body: "按每月活跃成员计费。仅查看报表的访客不占用席位，可随时在「账单」中增减。" },
  { id: "export", title: "可以导出我的数据吗？", body: "可以。在设置 → 数据中一键导出 CSV 或 JSON，大型工作区会在后台打包后发送下载链接。" },
  { id: "security", title: "数据存放在哪里？", body: "默认存放在华东地区的数据中心，企业版可选择其他区域，并支持私有化部署。" },
];

export default function AccordionOverview() {
  return (
    <Accordion className="max-w-xl" defaultExpandedKeys={["trial"]}>
      {FAQ.map((item) => (
        <AccordionItem key={item.id} id={item.id} title={item.title}>
          {item.body}
        </AccordionItem>
      ))}
    </Accordion>
  );
}
