"use client";

import { useState } from "react";
import { RiAddLine, RiSparkling2Line } from "@remixicon/react";
import { Button, SegmentedControl, SegmentedControlItem, Slider, Switch } from "@orra-ui/react";
import AgentProgressOverview from "@/demos/agent-progress/overview";
import AreaChartOverview from "@/demos/area-chart/overview";
import BarListOverview from "@/demos/bar-list/overview";
import ComposerPanelOverview from "@/demos/composer-panel/overview";
import DonutChartOverview from "@/demos/donut-chart/overview";
import StatCardsOverview from "@/demos/stat-cards/overview";

function ControlsCard() {
  const [notify, setNotify] = useState(true);
  return (
    <div className="flex h-full flex-col gap-5 rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span className="text-body font-medium text-fg">偏好设置</span>
        <SegmentedControl aria-label="时间范围" defaultValue="week" size="sm">
          <SegmentedControlItem id="week">周</SegmentedControlItem>
          <SegmentedControlItem id="month">月</SegmentedControlItem>
          <SegmentedControlItem id="year">年</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <Switch isSelected={notify} onChange={setNotify}>
        任务完成时通知我
      </Switch>
      <Slider label="创造力" defaultValue={60} />
      <div className="mt-auto flex flex-wrap gap-2">
        <Button startIcon={<RiAddLine />}>新建</Button>
        <Button variant="outline" tone="neutral" startIcon={<RiSparkling2Line />}>
          让 AI 生成
        </Button>
      </div>
    </div>
  );
}

/** Live component showcase on the home page — built from the components' own demos. */
export function LandingShowcase() {
  return (
    <div className="flex flex-col gap-4">
      <StatCardsOverview />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2 [&>*]:max-w-none">
          <AreaChartOverview />
        </div>
        <div className="min-w-0 [&>*]:max-w-none">
          <DonutChartOverview />
        </div>
        <div className="min-w-0">
          <ControlsCard />
        </div>
        <div className="min-w-0 [&>*]:max-w-none">
          <AgentProgressOverview />
        </div>
        <div className="min-w-0 [&>*]:max-w-none">
          <BarListOverview />
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl">
        <ComposerPanelOverview />
      </div>
    </div>
  );
}
