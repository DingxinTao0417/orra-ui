"use client";

import { RiAddLine } from "@remixicon/react";
import { Button } from "@orra-ui/react";
import { cx } from "@orra-ui/react/lib/cx";
import { ACCENT_PRESETS, DEFAULT_ACCENT, useAccent, type AccentPreset } from "@orra-ui/react/lib/theme";

export function AccentPlayground() {
  const { accent, setAccent } = useAccent();
  const active: AccentPreset | null = accent ? ("preset" in accent ? accent.preset : null) : DEFAULT_ACCENT;
  return (
    <div className="flex flex-col items-center gap-6 rounded-card border border-line bg-surface p-6 shadow-card sm:flex-row sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(ACCENT_PRESETS) as AccentPreset[]).map((p) => (
          <button
            key={p}
            type="button"
            aria-label={p}
            aria-pressed={active === p}
            onClick={() => setAccent({ preset: p })}
            className={cx("size-8 rounded-full ring-offset-2 ring-offset-surface transition-shadow", active === p ? "ring-2 ring-fg" : "hover:ring-2 hover:ring-line-strong")}
            style={{ background: ACCENT_PRESETS[p] }}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button startIcon={<RiAddLine />}>主要按钮</Button>
        <Button variant="soft">柔和按钮</Button>
      </div>
    </div>
  );
}
