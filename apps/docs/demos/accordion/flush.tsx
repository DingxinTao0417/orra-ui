"use client";

import { Accordion, AccordionItem } from "@orra-ui/react";

export default function AccordionFlush() {
  return (
    <Accordion variant="flush" allowsMultipleExpanded className="max-w-xl">
      <AccordionItem id="shipping" title="配送说明" subtitle="下单后 48 小时内发货">
        支持顺丰与京东物流，偏远地区可能延迟 1–2 天。
      </AccordionItem>
      <AccordionItem id="returns" title="退换政策" subtitle="7 天无理由">
        商品未拆封可直接退货；已拆封但不影响二次销售的，也可申请退换。
      </AccordionItem>
      <AccordionItem id="invoice" title="发票" subtitle="支持电子普票 / 专票" isDisabled>
        当前订单暂不支持开具发票。
      </AccordionItem>
    </Accordion>
  );
}
