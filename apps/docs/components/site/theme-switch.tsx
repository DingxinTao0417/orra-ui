"use client";

import { RiComputerLine, RiMoonLine, RiSunLine } from "@remixicon/react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
import { cx } from "@orra-ui/react/lib/cx";
import { useThemeMode, type ThemeMode } from "@orra-ui/react/lib/theme";

const OPTIONS: { id: ThemeMode; label: string; icon: typeof RiSunLine }[] = [
  { id: "light", label: "浅色", icon: RiSunLine },
  { id: "system", label: "跟随系统", icon: RiComputerLine },
  { id: "dark", label: "深色", icon: RiMoonLine },
];

/** Docs-site theme switch (light / system / dark). */
export function ThemeSwitch({ className }: { className?: string }) {
  const { mode, setMode } = useThemeMode();
  return (
    <ToggleButtonGroup
      aria-label="主题"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[mode]}
      onSelectionChange={(keys) => {
        const next = [...keys][0] as ThemeMode | undefined;
        if (next) setMode(next);
      }}
      className={cx("flex items-center gap-0.5 rounded-full bg-surface-muted p-0.5", className)}
    >
      {OPTIONS.map((o) => (
        <ToggleButton
          key={o.id}
          id={o.id}
          aria-label={o.label}
          className="grid size-7 cursor-default place-items-center rounded-full text-fg-subtle outline-none transition-colors data-[hovered]:text-fg data-[selected]:bg-surface data-[selected]:text-fg data-[selected]:shadow-xs data-[focus-visible]:focus-ring"
        >
          <o.icon className="size-3.5" />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
