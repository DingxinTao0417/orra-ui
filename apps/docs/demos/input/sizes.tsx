"use client";

import { RiUserLine } from "@remixicon/react";
import { Input } from "@orra-ui/react";

export default function InputSizes() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input size="sm" aria-label="小号" placeholder="小号 32px" startIcon={<RiUserLine />} />
      <Input size="md" aria-label="中号" placeholder="中号 36px（默认）" startIcon={<RiUserLine />} />
      <Input size="lg" aria-label="大号" placeholder="大号 44px" startIcon={<RiUserLine />} />
    </div>
  );
}
