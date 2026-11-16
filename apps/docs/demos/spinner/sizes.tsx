"use client";

import { Spinner, type SpinnerSize, type SpinnerTone } from "@orra-ui/react";

const SIZES: SpinnerSize[] = ["xs", "sm", "md", "lg", "xl"];
const TONES: SpinnerTone[] = ["accent", "neutral"];

export default function SpinnerSizes() {
  return (
    <div className="flex flex-col items-center gap-5">
      {TONES.map((tone) => (
        <div key={tone} className="flex items-center gap-6">
          {SIZES.map((size) => (
            <Spinner key={size} size={size} tone={tone} />
          ))}
        </div>
      ))}
      <div className="flex items-center gap-2 rounded-control bg-surface-inverse px-4 py-2 text-body-sm text-fg-inverse">
        <Spinner size="sm" tone="inverse" />
        正在部署到生产环境
      </div>
    </div>
  );
}
