"use client";

import { Tab, TabList, Tabs, type TabsVariant } from "@orra-ui/react";

const VARIANTS: { variant: TabsVariant; label: string }[] = [
  { variant: "underline", label: "underline" },
  { variant: "pill", label: "pill" },
  { variant: "segment", label: "segment" },
];

export default function TabsVariants() {
  return (
    <div className="flex flex-col items-start gap-6">
      {VARIANTS.map(({ variant, label }) => (
        <div key={variant} className="flex flex-col gap-2">
          <span className="font-mono text-caption text-fg-subtle">{label}</span>
          <Tabs variant={variant} defaultSelectedKey="week">
            <TabList aria-label={`时间范围（${label}）`}>
              <Tab id="day">今日</Tab>
              <Tab id="week">本周</Tab>
              <Tab id="month" count={4}>
                本月
              </Tab>
              <Tab id="year" isDisabled>
                全年
              </Tab>
            </TabList>
          </Tabs>
        </div>
      ))}
    </div>
  );
}
