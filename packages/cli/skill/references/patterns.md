# Orra UI page patterns

Structural recipes for common pages. Exact props: `components.md`, the docs site, or the MCP `get_component` tool. Every page below is a `"use client"` module (state, handlers, tables).

Shared rules:

- Page ground `bg-canvas`; content on cards: `rounded-card border border-line bg-surface shadow-card p-5`.
- Card header: title `text-body font-medium text-fg`, subtitle `text-body-sm text-fg-subtle`, actions on the end side.
- Page title `text-title-lg font-semibold text-fg`; section headings `text-title-sm font-semibold`.
- Group cards with grid `gap-4` / `gap-5`; never per-card margins.

## Dashboard

```tsx
"use client";
import { useState } from "react";
import { AreaChart, ChartCard, Sidebar, SidebarTrigger, StatCards, type StatCardItem } from "@orra-ui/react";

const stats: StatCardItem[] = [
  { id: "revenue", label: "本月营收", value: 1286400, format: "currency", currency: "CNY", previous: 1104800 },
  { id: "orders", label: "订单数", value: 8932, previous: 8410 },
];

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="flex h-dvh bg-canvas">
      <Sidebar activeKey="home" mobileOpen={menuOpen} onMobileOpenChange={setMenuOpen} />
      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        <SidebarTrigger onPress={() => setMenuOpen(true)} className="lg:hidden" />
        <h1 className="text-title-lg font-semibold text-fg">概览</h1>
        <div className="mt-6 flex flex-col gap-5">
          <StatCards stats={stats} />
          <ChartCard title="营收趋势" value="¥128.6 万" delta={0.164}>
            <AreaChart height={260} />
          </ChartCard>
        </div>
      </main>
    </div>
  );
}
```

Charts are bare plots that fill their width; `ChartCard` adds the title, headline value, delta badge, legend and range selector. Give each chart a `height`.

## Table page

A toolbar row above the table: `SearchField` on the start side; filters (`Select`, `Dropdown`, `DateRangePicker`) and the primary `Button` on the end side, all in one `flex items-center justify-between gap-3` row. Use `Table` with `TableUser` / `TableStatus` cells and `Pagination` underneath. For editable, spreadsheet-like data use `DataGrid`.

## Auth page

```tsx
"use client";
import { AuthCard } from "@orra-ui/react";

export default function SignInPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas p-6">
      <AuthCard providers={["google", "github"]} onSubmit={async ({ email, password }) => { /* sign in */ }} />
    </main>
  );
}
```

`AuthCard` covers sign in, sign up, forgot password and the one-time-code step.

## AI chat page

```tsx
"use client";
import { AgentThinking, ComposerPanel } from "@orra-ui/react";

export default function ChatPage() {
  return (
    <div className="mx-auto flex h-dvh max-w-3xl flex-col bg-canvas">
      <div className="flex-1 overflow-y-auto py-6">
        {/* messages; an assistant turn can open with <AgentThinking /> and show <AgentProgress />, <TaskList />, <WebSearch /> */}
      </div>
      <div className="pb-6">
        <ComposerPanel onSubmit={({ text }) => { /* send */ }} />
      </div>
    </div>
  );
}
```

`ComposerPanel` includes attachments, model picker, mode selector and send/stop. Ask clarifying questions with `Questionnaire`; show plan limits with `AgentLimits`.

## Settings

In-app settings: `SettingsModal` with `SettingsGroup` / `SettingsRow`. A full settings page: `Tabs` + cards of `SettingsRow`-style rows using `Switch`, `Select`, `Input`, `RadioGroup`.

## When a template fits, use it

Templates install a complete page with its parts: `dashboard`, `finance`, `marketing`, `hr`, `medical-profile`, `ai-profile`, `calendar`, `project-board`, `ai-chat`, `ai-image-generation`, `multi-agent-chat`. If the user describes a page that matches one, `npx -y @orra-ui/cli add <template> --yes` and editing it beats composing from scratch.
