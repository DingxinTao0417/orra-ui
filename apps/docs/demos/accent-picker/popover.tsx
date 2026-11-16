"use client";

import { AccentPicker } from "@orra-ui/react";

export default function AccentPickerPopover() {
  return (
    <div className="flex items-center gap-3">
      <span className="text-body-sm text-fg-muted">界面主题色</span>
      <AccentPicker variant="popover" size="sm" />
    </div>
  );
}
