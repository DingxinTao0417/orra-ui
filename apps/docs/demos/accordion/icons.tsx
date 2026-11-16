"use client";

import { RiBankCardLine, RiNotification3Line, RiShieldKeyholeLine } from "@remixicon/react";
import { Accordion, AccordionItem, Badge } from "@orra-ui/react";

export default function AccordionIcons() {
  return (
    <Accordion variant="separated" allowsMultipleExpanded className="max-w-xl" defaultExpandedKeys={["security"]}>
      <AccordionItem id="security" icon={<RiShieldKeyholeLine />} title="账号安全" subtitle="两步验证、登录设备" end={<Badge tone="success">已开启</Badge>}>
        已在 2 台设备上登录：MacBook Pro（上海）和 iPhone 16（杭州）。如发现陌生设备，请立即移除并修改密码。
      </AccordionItem>
      <AccordionItem id="notify" icon={<RiNotification3Line />} title="通知偏好" subtitle="邮件、短信与站内信">
        任务分配和评论提及会实时提醒；每周一上午 9 点发送项目周报。
      </AccordionItem>
      <AccordionItem id="billing" icon={<RiBankCardLine />} title="付款方式" subtitle="尾号 4021 · 下次扣款 12 月 1 日">
        团队版 · 12 个席位，每月 ¥ 1,188。可随时切换为年付以节省 17%。
      </AccordionItem>
    </Accordion>
  );
}
