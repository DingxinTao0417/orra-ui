"use client";

import { Avatar, type AvatarSize } from "@orra-ui/react";

const SIZES: { size: AvatarSize; px: number }[] = [
  { size: "xs", px: 24 },
  { size: "sm", px: 32 },
  { size: "md", px: 40 },
  { size: "lg", px: 48 },
  { size: "xl", px: 64 },
];

export default function AvatarSizes() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-end gap-4">
        {SIZES.map(({ size, px }) => (
          <div key={size} className="flex flex-col items-center gap-2">
            <Avatar name="陈思远" size={size} status="online" />
            <span className="font-mono text-caption text-fg-subtle">{px}</span>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-4">
        {SIZES.map(({ size }) => (
          <Avatar key={size} name="设计组" initials="设" size={size} square />
        ))}
      </div>
    </div>
  );
}
