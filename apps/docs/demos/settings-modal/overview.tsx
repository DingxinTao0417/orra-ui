"use client";

import { RiSettings3Line } from "@remixicon/react";
import { Button, SettingsModal } from "@orra-ui/react";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function SettingsModalOverview() {
  return (
    <SettingsModal
      trigger={
        <Button variant="outline" tone="neutral" startIcon={<RiSettings3Line />}>
          打开设置
        </Button>
      }
      onSave={() => wait(1000)}
      navFooter="Orra 控制台 · v2.4.1"
    />
  );
}
