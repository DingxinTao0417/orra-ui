"use client";

import { useState } from "react";
import { cx } from "@orra-ui/react/lib/cx";
import { CopyButton } from "@/components/site/copy-button";

const MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const;
type Manager = (typeof MANAGERS)[number];

function addCmd(pm: Manager, pkgs: string) {
  if (pm === "npm") return `npm install ${pkgs}`;
  if (pm === "yarn") return `yarn add ${pkgs}`;
  if (pm === "bun") return `bun add ${pkgs}`;
  return `pnpm add ${pkgs}`;
}

function dlxCmd(pm: Manager, cmd: string) {
  if (pm === "npm") return `npx ${cmd}`;
  if (pm === "yarn") return `yarn dlx ${cmd}`;
  if (pm === "bun") return `bunx ${cmd}`;
  return `pnpm dlx ${cmd}`;
}

/** Package-manager tabs. Give `packages` for an install, or `dlx` for a one-off CLI run. */
export function InstallTabs({ packages, dlx, className }: { packages?: string; dlx?: string; className?: string }) {
  const [pm, setPm] = useState<Manager>("pnpm");
  const command = dlx ? dlxCmd(pm, dlx) : addCmd(pm, packages ?? "");
  return (
    <div className={cx("overflow-hidden rounded-2xl border border-line bg-surface", className)}>
      <div className="flex h-10 items-center gap-1 border-b border-line ps-2 pe-1">
        {MANAGERS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setPm(m)}
            className={cx(
              "h-7 cursor-pointer rounded-lg px-2.5 font-mono text-caption font-medium transition-colors",
              pm === m ? "bg-surface-muted text-fg" : "text-fg-subtle hover:text-fg-muted",
            )}
          >
            {m}
          </button>
        ))}
        <div className="flex-1" />
        <CopyButton value={command} />
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-6 text-fg">
        <span className="select-none text-fg-subtle">$ </span>
        {command}
      </pre>
    </div>
  );
}
