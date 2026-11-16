"use client";

import { RiSettings3Line } from "@remixicon/react";
import { IconButton } from "@orra-ui/react";

export default function IconButtonSizes() {
  return (
    <div className="flex items-center gap-3">
      <IconButton size="sm" variant="outline" icon={<RiSettings3Line />} aria-label="设置" />
      <IconButton size="md" variant="outline" icon={<RiSettings3Line />} aria-label="设置" />
      <IconButton size="lg" variant="outline" icon={<RiSettings3Line />} aria-label="设置" />
      <IconButton size="md" variant="outline" icon={<RiSettings3Line />} aria-label="设置" loading />
    </div>
  );
}
