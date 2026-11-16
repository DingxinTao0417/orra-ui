"use client";

import { RiBarChartLine, RiChat3Line, RiFileList3Line, RiSettings3Line } from "@remixicon/react";
import { Tab, TabList, TabPanel, Tabs } from "@orra-ui/react";

export default function TabsOverview() {
  return (
    <Tabs className="w-full max-w-xl" defaultSelectedKey="overview">
      <TabList aria-label="项目">
        <Tab id="overview" icon={<RiBarChartLine />}>
          概览
        </Tab>
        <Tab id="tasks" icon={<RiFileList3Line />} count={12}>
          任务
        </Tab>
        <Tab id="discussion" icon={<RiChat3Line />} count={3}>
          讨论
        </Tab>
        <Tab id="settings" icon={<RiSettings3Line />}>
          设置
        </Tab>
      </TabList>
      <TabPanel id="overview" className="text-fg-muted">
        本周完成 18 项任务，比上周提升 24%。距离里程碑「公测上线」还有 9 天。
      </TabPanel>
      <TabPanel id="tasks" className="text-fg-muted">
        12 项进行中，其中 3 项将在明天到期。
      </TabPanel>
      <TabPanel id="discussion" className="text-fg-muted">
        3 条新讨论：首页文案、定价页布局、埋点方案。
      </TabPanel>
      <TabPanel id="settings" className="text-fg-muted">
        项目可见范围：仅团队成员。
      </TabPanel>
    </Tabs>
  );
}
