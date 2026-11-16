"use client";

import { Button, type ButtonTone, type ButtonVariant } from "@orra-ui/react";

const VARIANTS: ButtonVariant[] = ["solid", "outline", "soft", "plain"];
const TONES: { tone: ButtonTone; label: string }[] = [
  { tone: "accent", label: "强调" },
  { tone: "neutral", label: "中性" },
  { tone: "danger", label: "危险" },
];

export default function ButtonVariants() {
  return (
    <div className="grid grid-cols-[auto_repeat(4,auto)] items-center gap-x-3 gap-y-3">
      <span />
      {VARIANTS.map((v) => (
        <span key={v} className="text-center font-mono text-caption text-fg-subtle">
          {v}
        </span>
      ))}
      {TONES.map(({ tone, label }) => (
        <div key={tone} className="contents">
          <span className="font-mono text-caption text-fg-subtle">{tone}</span>
          {VARIANTS.map((v) => (
            <Button key={v} variant={v} tone={tone}>
              {label}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
